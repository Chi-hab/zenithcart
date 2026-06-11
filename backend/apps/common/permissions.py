from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsOwnerOrReadOnly(BasePermission):
    """Object-level permission: only owners may mutate; reads are open."""

    owner_field = "user"

    def has_object_permission(self, request, view, obj) -> bool:
        if request.method in SAFE_METHODS:
            return True
        owner_field = getattr(view, "owner_field", self.owner_field)
        return getattr(obj, owner_field, None) == request.user


class IsVendorOrReadOnly(BasePermission):
    """Write access restricted to vendor/admin users; reads are open."""

    def has_permission(self, request, view) -> bool:
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (user.role in {"VENDOR", "ADMIN"} or user.is_staff)
        )

    def has_object_permission(self, request, view, obj) -> bool:
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        if user.is_staff or user.role == "ADMIN":
            return True
        return getattr(obj, "vendor_id", None) == user.id
