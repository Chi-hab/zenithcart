"""Atomic inventory operations shared by views and Celery tasks."""
from __future__ import annotations

from django.db import transaction
from rest_framework.exceptions import ValidationError

from .models import InventoryRecord, StockMovement


class InsufficientStockError(ValidationError):
    pass


@transaction.atomic
def reserve_stock(product_id, quantity: int, order=None) -> InventoryRecord:
    """Reserve stock for a product, locking the row to avoid oversell."""
    record = (
        InventoryRecord.objects.select_for_update()
        .select_related("product")
        .get(product_id=product_id)
    )
    if record.available < quantity:
        raise InsufficientStockError(
            f"Insufficient stock for {record.product.name}: "
            f"requested {quantity}, available {record.available}."
        )
    record.reserved += quantity
    record.save(update_fields=["reserved", "updated_at"])
    StockMovement.objects.create(
        inventory=record,
        change=-quantity,
        reason=StockMovement.Reason.RESERVE,
        order=order,
    )
    return record


@transaction.atomic
def commit_reservation(product_id, quantity: int, order=None) -> InventoryRecord:
    """Convert a reservation into a sale, deducting from on-hand quantity."""
    record = InventoryRecord.objects.select_for_update().get(product_id=product_id)
    record.reserved = max(record.reserved - quantity, 0)
    record.quantity = max(record.quantity - quantity, 0)
    record.save(update_fields=["reserved", "quantity", "updated_at"])
    StockMovement.objects.create(
        inventory=record,
        change=-quantity,
        reason=StockMovement.Reason.SALE,
        order=order,
    )
    return record


@transaction.atomic
def release_reservation(product_id, quantity: int, order=None) -> InventoryRecord:
    """Release a previously held reservation (e.g. on cancellation)."""
    record = InventoryRecord.objects.select_for_update().get(product_id=product_id)
    record.reserved = max(record.reserved - quantity, 0)
    record.save(update_fields=["reserved", "updated_at"])
    StockMovement.objects.create(
        inventory=record,
        change=quantity,
        reason=StockMovement.Reason.RELEASE,
        order=order,
    )
    return record
