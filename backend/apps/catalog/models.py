from django.conf import settings
from django.db import models

from apps.common.models import TimeStampedModel

from .managers import ProductManager


class Category(TimeStampedModel):
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=140, unique=True, db_index=True)
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="children",
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "categories"
        constraints = [
            models.UniqueConstraint(
                fields=["parent", "slug"], name="uniq_category_parent_slug"
            )
        ]

    def __str__(self) -> str:
        return self.name


class Product(TimeStampedModel):
    vendor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="products",
    )
    category = models.ForeignKey(
        Category, on_delete=models.PROTECT, related_name="products"
    )
    name = models.CharField(max_length=255, db_index=True)
    slug = models.SlugField(max_length=275, unique=True, db_index=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default="USD")
    sku = models.CharField(max_length=64, unique=True)
    is_active = models.BooleanField(default=True, db_index=True)
    sales_count = models.PositiveIntegerField(default=0)

    objects = ProductManager()

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["category", "is_active"]),
            models.Index(fields=["-sales_count"]),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(price__gte=0), name="product_price_non_negative"
            )
        ]

    def __str__(self) -> str:
        return self.name


class ProductImage(TimeStampedModel):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="images"
    )
    image = models.ImageField(upload_to="products/")
    alt_text = models.CharField(max_length=255, blank=True)
    is_primary = models.BooleanField(default=False)
    position = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["position", "-is_primary"]

    def __str__(self) -> str:
        return f"Image of {self.product.name}"
