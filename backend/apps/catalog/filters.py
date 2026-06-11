import django_filters as filters

from .models import Product


class ProductFilter(filters.FilterSet):
    min_price = filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = filters.NumberFilter(field_name="price", lookup_expr="lte")
    category = filters.CharFilter(field_name="category__slug", lookup_expr="iexact")
    vendor = filters.UUIDFilter(field_name="vendor__id")

    class Meta:
        model = Product
        fields = ["category", "vendor", "is_active", "currency"]
