from django.shortcuts import get_object_or_404
from rest_framework import generics, mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.inventory.tasks import deduct_inventory_for_order

from .filters import OrderFilter
from .models import Cart, CartItem, Order, Payment
from .serializers import (
    CartItemSerializer,
    CartSerializer,
    CheckoutSerializer,
    OrderSerializer,
    PaymentSerializer,
)
from .tasks import generate_invoice_pdf, send_order_confirmation_email
from .throttles import CheckoutRateThrottle, PaymentRateThrottle


class CartView(generics.RetrieveAPIView):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        cart, _ = Cart.objects.prefetch_related("items__product").get_or_create(
            user=self.request.user
        )
        return cart


class CartItemViewSet(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CartItem.objects.filter(cart__user=self.request.user).select_related(
            "product"
        )

    def perform_create(self, serializer):
        cart, _ = Cart.objects.get_or_create(user=self.request.user)
        product = serializer.validated_data["product"]
        quantity = serializer.validated_data["quantity"]
        existing = cart.items.filter(product=product).first()
        if existing:
            existing.quantity += quantity
            existing.save(update_fields=["quantity", "updated_at"])
            serializer.instance = existing
            return
        serializer.save(cart=cart)


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    filterset_class = OrderFilter
    search_fields = ["order_number"]
    ordering_fields = ["created_at", "total", "status"]

    def get_queryset(self):
        qs = Order.objects.select_related(
            "user", "shipping_address", "payment", "invoice"
        ).prefetch_related("items__product")
        user = self.request.user
        if not (user.is_staff or user.role == "ADMIN"):
            qs = qs.filter(user=user)
        return qs

    @action(detail=True, methods=["post"], throttle_classes=[PaymentRateThrottle])
    def pay(self, request, pk=None):
        """Mock payment confirmation; on success offloads async fulfilment."""
        order = self.get_object()
        payment = get_object_or_404(Payment, order=order)
        if payment.status == Payment.Status.SUCCEEDED:
            return Response(
                {"detail": "Order already paid."}, status=status.HTTP_400_BAD_REQUEST
            )
        payment.status = Payment.Status.SUCCEEDED
        payment.provider_ref = f"mock_{order.order_number}"
        payment.save(update_fields=["status", "provider_ref", "updated_at"])

        order.status = Order.Status.PAID
        order.save(update_fields=["status", "updated_at"])

        # Offload heavy work to Celery.
        deduct_inventory_for_order.delay(str(order.id))
        generate_invoice_pdf.delay(str(order.id))
        send_order_confirmation_email.delay(str(order.id))

        return Response(PaymentSerializer(payment).data, status=status.HTTP_200_OK)


class CheckoutView(generics.CreateAPIView):
    """Custom workflow: convert the user's cart into an order (Generic View)."""

    serializer_class = CheckoutSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [CheckoutRateThrottle]
