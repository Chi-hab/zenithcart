import django_filters as filters

from .models import Order


class OrderFilter(filters.FilterSet):
    created_after = filters.DateTimeFilter(field_name="created_at", lookup_expr="gte")
    created_before = filters.DateTimeFilter(field_name="created_at", lookup_expr="lte")
    min_total = filters.NumberFilter(field_name="total", lookup_expr="gte")

    class Meta:
        model = Order
        fields = ["status"]
