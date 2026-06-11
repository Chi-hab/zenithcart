from rest_framework import serializers

from .models import Category, Product, ProductImage


class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "parent", "is_active", "children"]

    def get_children(self, obj) -> list:
        return CategorySerializer(obj.children.all(), many=True).data


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "image", "alt_text", "is_primary", "position"]


class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    category_detail = CategorySerializer(source="category", read_only=True)
    available_stock = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "vendor",
            "category",
            "category_detail",
            "name",
            "slug",
            "description",
            "price",
            "currency",
            "sku",
            "is_active",
            "sales_count",
            "images",
            "available_stock",
            "created_at",
        ]
        read_only_fields = ["id", "vendor", "sales_count", "created_at"]

    def get_available_stock(self, obj) -> int:
        inventory = getattr(obj, "inventory", None)
        return inventory.available if inventory else 0
