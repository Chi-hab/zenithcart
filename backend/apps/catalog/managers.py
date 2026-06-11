from django.db import models


class ProductQuerySet(models.QuerySet):
    def active(self) -> "ProductQuerySet":
        return self.filter(is_active=True)

    def with_relations(self) -> "ProductQuerySet":
        """Eager-load relations to eliminate N+1 queries."""
        return self.select_related("category", "vendor", "inventory").prefetch_related(
            "images"
        )

    def top_sellers(self, limit: int = 10) -> "ProductQuerySet":
        return self.active().with_relations().order_by("-sales_count")[:limit]


class ProductManager(models.Manager.from_queryset(ProductQuerySet)):
    pass
