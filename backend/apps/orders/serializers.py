from decimal import Decimal

from django.db import transaction
from rest_framework import serializers

from apps.accounts.models import Address
from apps.catalog.models import Product
from apps.catalog.serializers import ProductSerializer
from apps.inventory.services import reserve_stock

from .models import Cart, CartItem, Invoice, Order, OrderItem, Payment
from .utils import generate_order_number


class CartItemSerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source="product", read_only=True)
    line_total = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )

    class Meta:
        model = CartItem
        fields = ["id", "product", "product_detail", "quantity", "line_total"]


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    subtotal = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )

    class Meta:
        model = Cart
        fields = ["id", "items", "subtotal", "updated_at"]


class OrderItemSerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source="product", read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product",
            "product_detail",
            "quantity",
            "unit_price",
            "line_total",
        ]
        read_only_fields = ["id", "unit_price", "line_total"]


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ["id", "provider", "provider_ref", "amount", "status"]
        read_only_fields = ["id", "provider_ref", "status"]


class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = ["id", "pdf_file", "generated_at"]
        read_only_fields = fields


class OrderSerializer(serializers.ModelSerializer):
    """Writable nested serializer for Orders and their OrderItems."""

    items = OrderItemSerializer(many=True)
    payment = PaymentSerializer(read_only=True)
    invoice = InvoiceSerializer(read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "status",
            "shipping_address",
            "items",
            "subtotal",
            "tax",
            "total",
            "payment",
            "invoice",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "order_number",
            "status",
            "subtotal",
            "tax",
            "total",
            "created_at",
        ]

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("An order must contain at least one item.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop("items")
        user = self.context["request"].user
        order = Order.objects.create(
            user=user,
            order_number=generate_order_number(),
            **validated_data,
        )
        self._sync_items(order, items_data, reserve=True)
        order.recalculate_totals()
        order.save(update_fields=["subtotal", "tax", "total", "updated_at"])
        Payment.objects.create(order=order, amount=order.total)
        return order

    @transaction.atomic
    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", None)
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()
        if items_data is not None:
            instance.items.all().delete()
            self._sync_items(instance, items_data, reserve=False)
            instance.recalculate_totals()
            instance.save(update_fields=["subtotal", "tax", "total", "updated_at"])
        return instance

    def _sync_items(self, order, items_data, *, reserve: bool) -> None:
        product_ids = [item["product"].id for item in items_data]
        products = Product.objects.in_bulk(product_ids)
        for item in items_data:
            product = products[item["product"].id]
            quantity = item["quantity"]
            unit_price = product.price
            if reserve:
                reserve_stock(product.id, quantity, order=order)
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                unit_price=unit_price,
                line_total=unit_price * quantity,
            )


class CheckoutSerializer(serializers.Serializer):
    """Converts the authenticated user's cart into an Order."""

    shipping_address = serializers.PrimaryKeyRelatedField(
        queryset=Address.objects.all()
    )
    tax_rate = serializers.DecimalField(
        max_digits=4, decimal_places=2, default=Decimal("0.00"), required=False
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if request is not None:
            self.fields["shipping_address"].queryset = Address.objects.filter(
                user=request.user
            )

    @transaction.atomic
    def create(self, validated_data):
        user = self.context["request"].user
        cart = (
            Cart.objects.prefetch_related("items__product")
            .filter(user=user)
            .first()
        )
        if cart is None or not cart.items.exists():
            raise serializers.ValidationError("Your cart is empty.")

        order = Order.objects.create(
            user=user,
            order_number=generate_order_number(),
            shipping_address=validated_data["shipping_address"],
        )
        for item in cart.items.all():
            reserve_stock(item.product_id, item.quantity, order=order)
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                unit_price=item.product.price,
                line_total=item.product.price * item.quantity,
            )
        order.recalculate_totals(tax_rate=validated_data.get("tax_rate", Decimal("0.00")))
        order.save(update_fields=["subtotal", "tax", "total", "updated_at"])
        Payment.objects.create(order=order, amount=order.total)
        cart.items.all().delete()
        return order

    def to_representation(self, instance):
        return OrderSerializer(instance, context=self.context).data
