import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient

User = get_user_model()


@pytest.fixture
def client() -> APIClient:
    return APIClient()


@pytest.mark.django_db
def test_register_creates_user(client):
    resp = client.post(
        reverse("v1:register"),
        {"email": "a@b.com", "full_name": "Ann", "password": "supersecret1"},
        format="json",
    )
    assert resp.status_code == 201
    assert User.objects.filter(email="a@b.com").exists()


@pytest.mark.django_db
def test_cannot_register_as_admin(client):
    resp = client.post(
        reverse("v1:register"),
        {
            "email": "x@b.com",
            "full_name": "X",
            "password": "supersecret1",
            "role": "ADMIN",
        },
        format="json",
    )
    assert resp.status_code == 400


@pytest.mark.django_db
def test_login_and_logout_blacklists_token(client):
    User.objects.create_user(email="a@b.com", password="supersecret1", full_name="A")
    login = client.post(
        reverse("v1:login"),
        {"email": "a@b.com", "password": "supersecret1"},
        format="json",
    )
    assert login.status_code == 200
    access = login.data["access"]
    refresh = login.data["refresh"]

    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
    logout = client.post(reverse("v1:logout"), {"refresh": refresh}, format="json")
    assert logout.status_code == 205

    # Blacklisted refresh token can no longer be used.
    refresh_resp = client.post(
        reverse("v1:token-refresh"), {"refresh": refresh}, format="json"
    )
    assert refresh_resp.status_code == 401
