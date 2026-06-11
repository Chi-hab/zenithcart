from django.db import models

from apps.catalog.models import Product
from apps.common.models import TimeStampedModel


class Warehouse(TimeStampedModel):
    name = models.CharField(max_length=120)
    code = models.CharField(max_length=32, unique=True)
    location = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return f"{self.name} ({self.code})"


class InventoryRecord(TimeStampedModel):
    product = models.OneToOneField(
        Product, on_delete=models.CASCADE, related_name="inventory"
    )
    warehouse = models.ForeignKey(
        Warehouse, on_delete=models.PROTECT, related_name="records"
    )
    quantity = models.PositiveIntegerField(default=0)
    reserved = models.PositiveIntegerField(default=0)
    reorder_level = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["-updated_at"]
        constraints = [
            models.CheckConstraint(
                check=models.Q(quantity__gte=0), name="inventory_quantity_non_negative"
            ),
            models.CheckConstraint(
                check=models.Q(reserved__gte=0), name="inventory_reserved_non_negative"
            ),
        ]

    @property
    def available(self) -> int:
        return self.quantity - self.reserved

    @property
    def needs_reorder(self) -> bool:
        return self.available <= self.reorder_level

    def __str__(self) -> str:
        return f"{self.product.name}: {self.available} available"


class StockMovement(TimeStampedModel):
    class Reason(models.TextChoices):
        PURCHASE = "PURCHASE", "Purchase"
        SALE = "SALE", "Sale"
        RESTOCK = "RESTOCK", "Restock"
        ADJUSTMENT = "ADJUSTMENT", "Adjustment"
        RESERVE = "RESERVE", "Reserve"
        RELEASE = "RELEASE", "Release"

    inventory = models.ForeignKey(
        InventoryRecord, on_delete=models.CASCADE, related_name="movements"
    )
    change = models.IntegerField()
    reason = models.CharField(max_length=12, choices=Reason.choices)
    order = models.ForeignKey(
        "orders.Order",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="stock_movements",
    )

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["inventory", "created_at"])]

    def __str__(self) -> str:
        return f"{self.get_reason_display()} {self.change:+d}"
