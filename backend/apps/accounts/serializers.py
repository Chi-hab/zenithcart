from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Address

User = get_user_model()


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            "id",
            "line1",
            "line2",
            "city",
            "state",
            "postal_code",
            "country",
            "is_default",
        ]


class UserSerializer(serializers.ModelSerializer):
    addresses = AddressSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ["id", "email", "full_name", "role", "addresses", "created_at"]
        read_only_fields = ["id", "role", "created_at"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["id", "email", "full_name", "password", "role"]
        extra_kwargs = {"role": {"required": False}}

    def validate_role(self, value: str) -> str:
        # Prevent self-assigning ADMIN through public registration.
        if value == User.Role.ADMIN:
            raise serializers.ValidationError("Cannot self-register as ADMIN.")
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User.objects.create_user(password=password, **validated_data)
        return user
