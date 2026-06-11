"""Centralized Redis cache key registry and helpers."""
from django.core.cache import cache

CATEGORY_TREE_KEY = "catalog:category_tree"
TOP_SELLERS_KEY = "catalog:top_sellers"

DEFAULT_TIMEOUT = 60 * 30  # 30 minutes


def invalidate(*keys: str) -> None:
    """Delete one or more cache keys, ignoring those not present."""
    for key in keys:
        cache.delete(key)
