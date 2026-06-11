from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from apps.common.cache import CATEGORY_TREE_KEY, TOP_SELLERS_KEY, invalidate

from .models import Category, Product


@receiver([post_save, post_delete], sender=Category)
def invalidate_category_cache(sender, **kwargs) -> None:
    invalidate(CATEGORY_TREE_KEY)


@receiver([post_save, post_delete], sender=Product)
def invalidate_product_cache(sender, **kwargs) -> None:
    invalidate(TOP_SELLERS_KEY)
