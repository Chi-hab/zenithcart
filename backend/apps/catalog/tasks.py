from celery import shared_task
from django.core.cache import cache

from apps.common.cache import DEFAULT_TIMEOUT, TOP_SELLERS_KEY


@shared_task
def refresh_top_sellers_cache() -> int:
    """Recompute the top-sellers cache (scheduled via Celery beat)."""
    from .models import Product
    from .serializers import ProductSerializer

    products = Product.objects.top_sellers()
    data = ProductSerializer(products, many=True).data
    cache.set(TOP_SELLERS_KEY, data, DEFAULT_TIMEOUT)
    return len(data)
