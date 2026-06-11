from decimal import Decimal

from django.conf import settings
from django.db import models

from apps.accounts.models import Address
from apps.catalog.models import Product
from apps.common.models import TimeStampedModel


class Cart(TimeStampedModel):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="cart"
    )

    @property
    def subtotal(self) -> Decimal:
        return sum(
            (item.line_total for item in self.items.all()), Decimal("0.00")
        )

    def __str__(self) -> str:
        return f"Cart({self.user.email})"


class CartItem(TimeStampedModel):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["cart", "product"], name="uniq_cart_product"),
            models.CheckConstraint(
                check=models.Q(quantity__gte=1), name="cartitem_quantity_min"
            ),
        ]

    @property
    def line_total(self) -> Decimal:
        return self.product.price * self.quantity


class Order(TimeStampedModel):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        PAID = "PAID", "Paid"
        PROCESSING = "PROCESSING", "Processing"
        SHIPPED = "SHIPPED", "Shipped"
        DELIVERED = "DELIVERED", "Delivered"
        CANCELLED = "CANCELLED", "Cancelled"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="orders"
    )
    order_number = models.CharField(max_length=20, unique=True, db_index=True)
    status = models.CharField(
        max_length=12, choices=Status.choices, default=Status.PENDING, db_index=True
    )
    shipping_address = models.ForeignKey(
        Address, on_delete=models.PROTECT, related_name="orders"
    )
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self) -> str:
        return self.order_number

    def recalculate_totals(self, tax_rate: Decimal = Decimal("0.00")) -> None:
        self.subtotal = sum(
            (item.line_total for item in self.items.all()), Decimal("0.00")
        )
        self.tax = (self.subtotal * tax_rate).quantize(Decimal("0.01"))
        self.total = self.subtotal + self.tax


class OrderItem(TimeStampedModel):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    line_total = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["order", "product"], name="uniq_order_product"),
            models.CheckConstraint(
                check=models.Q(quantity__gte=1), name="orderitem_quantity_min"
            ),
        ]


class Payment(TimeStampedModel):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        SUCCEEDED = "SUCCEEDED", "Succeeded"
        FAILED = "FAILED", "Failed"
        REFUNDED = "REFUNDED", "Refunded"

    order = models.OneToOneField(
        Order, on_delete=models.CASCADE, related_name="payment"
    )
    provider = models.CharField(max_length=32, default="mock")
    provider_ref = models.CharField(max_length=128, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=12, choices=Status.choices, default=Status.PENDING
    )

    def __str__(self) -> str:
        return f"Payment({self.order.order_number}, {self.status})"


class Invoice(TimeStampedModel):
    order = models.OneToOneField(
        Order, on_delete=models.CASCADE, related_name="invoice"
    )
    pdf_file = models.FileField(upload_to="invoices/", blank=True)
    generated_at = models.DateTimeField(null=True, blank=True)

    def __str__(self) -> str:
        return f"Invoice({self.order.order_number})"
