from django.contrib import admin

from .models import InventoryRecord, StockMovement, Warehouse


@admin.register(Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    list_display = ["name", "code", "location"]
    search_fields = ["name", "code"]


@admin.register(InventoryRecord)
class InventoryRecordAdmin(admin.ModelAdmin):
    list_display = ["product", "warehouse", "quantity", "reserved", "reorder_level"]
    list_filter = ["warehouse"]
    search_fields = ["product__name", "product__sku"]
    autocomplete_fields = ["product"]


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = ["inventory", "change", "reason", "order", "created_at"]
    list_filter = ["reason"]
    date_hierarchy = "created_at"
