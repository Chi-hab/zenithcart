from django.core.cache import cache
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.common.cache import DEFAULT_TIMEOUT, TOP_SELLERS_KEY
from apps.common.permissions import IsVendorOrReadOnly

from .filters import ProductFilter
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsVendorOrReadOnly]
    lookup_field = "slug"
    search_fields = ["name", "slug"]
    filterset_fields = ["parent", "is_active"]

    def get_permissions(self):
        if self.action in {"list", "retrieve", "tree"}:
            return [AllowAny()]
        return super().get_permissions()

    @action(detail=False, methods=["get"], permission_classes=[AllowAny])
    def tree(self, request):
        roots = (
            Category.objects.filter(parent__isnull=True, is_active=True)
            .prefetch_related("children")
        )
        return Response(CategorySerializer(roots, many=True).data)


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsVendorOrReadOnly]
    lookup_field = "slug"
    filterset_class = ProductFilter
    search_fields = ["name", "description", "sku"]
    ordering_fields = ["price", "created_at", "sales_count", "name"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return Product.objects.with_relations()

    def get_permissions(self):
        if self.action in {"list", "retrieve", "top_sellers"}:
            return [AllowAny()]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(vendor=self.request.user)

    @action(detail=False, methods=["get"], permission_classes=[AllowAny])
    def top_sellers(self, request):
        data = cache.get(TOP_SELLERS_KEY)
        if data is None:
            products = Product.objects.top_sellers()
            data = ProductSerializer(products, many=True).data
            cache.set(TOP_SELLERS_KEY, data, DEFAULT_TIMEOUT)
        return Response(data)

    @action(
        detail=True,
        methods=["get"],
        permission_classes=[IsAuthenticated],
    )
    def mine(self, request, slug=None):  # pragma: no cover - convenience endpoint
        product = self.get_object()
        return Response(ProductSerializer(product).data)
