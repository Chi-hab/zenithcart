from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser, IsAuthenticated

from apps.common.permissions import IsVendorOrReadOnly

from .models import InventoryRecord, StockMovement, Warehouse
from .serializers import (
    InventoryRecordSerializer,
    StockMovementSerializer,
    WarehouseSerializer,
)


class WarehouseViewSet(viewsets.ModelViewSet):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer
    permission_classes = [IsAdminUser]
    search_fields = ["name", "code", "location"]


class InventoryRecordViewSet(viewsets.ModelViewSet):
    serializer_class = InventoryRecordSerializer
    permission_classes = [IsVendorOrReadOnly]
    filterset_fields = ["warehouse", "product"]
    search_fields = ["product__name", "product__sku"]
    ordering_fields = ["quantity", "reserved", "updated_at"]

    def get_queryset(self):
        qs = InventoryRecord.objects.select_related("product", "warehouse")
        user = self.request.user
        if user.is_authenticated and not (user.is_staff or user.role == "ADMIN"):
            qs = qs.filter(product__vendor=user)
        return qs


class StockMovementViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = StockMovementSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["inventory", "reason"]
    ordering_fields = ["created_at"]

    def get_queryset(self):
        qs = StockMovement.objects.select_related("inventory", "inventory__product")
        user = self.request.user
        if not (user.is_staff or user.role == "ADMIN"):
            qs = qs.filter(inventory__product__vendor=user)
        return qs
