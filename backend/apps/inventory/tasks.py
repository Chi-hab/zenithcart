from celery import shared_task


@shared_task
def deduct_inventory_for_order(order_id: str) -> int:
    """Commit reservations into sales for every item in a paid order."""
    from apps.orders.models import Order

    from .services import commit_reservation

    order = (
        Order.objects.prefetch_related("items").get(id=order_id)
    )
    processed = 0
    for item in order.items.all():
        commit_reservation(item.product_id, item.quantity, order=order)
        processed += 1
    return processed
