from rest_framework.throttling import ScopedRateThrottle


class AuthRateThrottle(ScopedRateThrottle):
    """Scoped throttle applied to authentication endpoints."""

    scope = "auth"
