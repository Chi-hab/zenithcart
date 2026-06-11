from django.db.models import F
from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.catalog.models import Product

from .models import OrderItem


@receiver(post_save, sender=OrderItem)
def bump_product_sales_count(sender, instance, created, **kwargs) -> None:
    """Keep the denormalized sales_count in sync for top-seller ranking."""
    if created:
        Product.objects.filter(pk=instance.product_id).update(
            sales_count=F("sales_count") + instance.quantity
        )
