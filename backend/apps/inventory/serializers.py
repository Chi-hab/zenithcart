from rest_framework import serializers

from .models import InventoryRecord, StockMovement, Warehouse


class WarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Warehouse
        fields = ["id", "name", "code", "location"]


class StockMovementSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockMovement
        fields = ["id", "change", "reason", "order", "created_at"]
        read_only_fields = fields


class InventoryRecordSerializer(serializers.ModelSerializer):
    available = serializers.IntegerField(read_only=True)
    needs_reorder = serializers.BooleanField(read_only=True)
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = InventoryRecord
        fields = [
            "id",
            "product",
            "product_name",
            "warehouse",
            "quantity",
            "reserved",
            "reorder_level",
            "available",
            "needs_reorder",
        ]
