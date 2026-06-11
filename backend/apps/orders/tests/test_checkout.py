from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient

from apps.accounts.models import Address
from apps.catalog.models import Category, Product
from apps.inventory.models import InventoryRecord, Warehouse
from apps.orders.models import Order, Payment

User = get_user_model()


@pytest.fixture
def setup(db):
    vendor = User.objects.create_user(
        email="v@b.com", password="supersecret1", full_name="V", role="VENDOR"
    )
    customer = User.objects.create_user(
        email="c@b.com", password="supersecret1", full_name="C"
    )
    category = Category.objects.create(name="Cat", slug="cat")
    product = Product.objects.create(
        vendor=vendor,
        category=category,
        name="Widget",
        slug="widget",
        price="10.00",
        sku="W1",
    )
    warehouse = Warehouse.objects.create(name="Main", code="MAIN")
    InventoryRecord.objects.create(
        product=product, warehouse=warehouse, quantity=5, reserved=0
    )
    address = Address.objects.create(
        user=customer,
        line1="1 St",
        city="Town",
        postal_code="00000",
        country="US",
    )
    return {"customer": customer, "product": product, "address": address}


@pytest.mark.django_db
def test_full_checkout_flow(setup):
    client = APIClient()
    client.force_authenticate(setup["customer"])

    # Add to cart.
    add = client.post(
        reverse("v1:cart-item-list"),
        {"product": str(setup["product"].id), "quantity": 2},
        format="json",
    )
    assert add.status_code == 201, add.data

    # Checkout.
    checkout = client.post(
        reverse("v1:checkout"),
        {"shipping_address": str(setup["address"].id)},
        format="json",
    )
    assert checkout.status_code == 201, checkout.data
    order = Order.objects.get(order_number=checkout.data["order_number"])
    assert order.total == 2 * Decimal(setup["product"].price)
    assert order.status == Order.Status.PENDING

    # Stock reserved.
    inv = setup["product"].inventory
    inv.refresh_from_db()
    assert inv.reserved == 2

    # Pay (mock) -> triggers eager celery tasks: deduct inventory, invoice, email.
    pay = client.post(reverse("v1:order-pay", args=[order.id]), format="json")
    assert pay.status_code == 200, pay.data
    order.refresh_from_db()
    assert order.status == Order.Status.PAID
    assert order.payment.status == Payment.Status.SUCCEEDED

    inv.refresh_from_db()
    assert inv.quantity == 3
    assert inv.reserved == 0
    assert hasattr(order, "invoice")


@pytest.mark.django_db
def test_checkout_empty_cart_fails(setup):
    client = APIClient()
    client.force_authenticate(setup["customer"])
    resp = client.post(
        reverse("v1:checkout"),
        {"shipping_address": str(setup["address"].id)},
        format="json",
    )
    assert resp.status_code == 400


@pytest.mark.django_db
def test_oversell_is_prevented(setup):
    client = APIClient()
    client.force_authenticate(setup["customer"])
    client.post(
        reverse("v1:cart-item-list"),
        {"product": str(setup["product"].id), "quantity": 99},
        format="json",
    )
    resp = client.post(
        reverse("v1:checkout"),
        {"shipping_address": str(setup["address"].id)},
        format="json",
    )
    assert resp.status_code == 400
