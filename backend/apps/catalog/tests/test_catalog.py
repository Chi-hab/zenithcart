import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient

from apps.catalog.models import Category, Product

User = get_user_model()


@pytest.fixture
def vendor(db):
    return User.objects.create_user(
        email="v@b.com", password="supersecret1", full_name="V", role="VENDOR"
    )


@pytest.fixture
def category(db):
    return Category.objects.create(name="Electronics", slug="electronics")


@pytest.mark.django_db
def test_products_list_is_public():
    client = APIClient()
    resp = client.get(reverse("v1:product-list"))
    assert resp.status_code == 200


@pytest.mark.django_db
def test_vendor_can_create_product(vendor, category):
    client = APIClient()
    client.force_authenticate(vendor)
    resp = client.post(
        reverse("v1:product-list"),
        {
            "category": str(category.id),
            "name": "Phone",
            "slug": "phone",
            "price": "199.99",
            "sku": "SKU-1",
        },
        format="json",
    )
    assert resp.status_code == 201, resp.data
    product = Product.objects.get(slug="phone")
    assert product.vendor == vendor


@pytest.mark.django_db
def test_customer_cannot_create_product(category):
    customer = User.objects.create_user(
        email="c@b.com", password="supersecret1", full_name="C"
    )
    client = APIClient()
    client.force_authenticate(customer)
    resp = client.post(
        reverse("v1:product-list"),
        {"category": str(category.id), "name": "x", "slug": "x", "price": "1", "sku": "s"},
        format="json",
    )
    assert resp.status_code == 403
