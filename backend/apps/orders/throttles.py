from rest_framework.throttling import ScopedRateThrottle


class CheckoutRateThrottle(ScopedRateThrottle):
    scope = "checkout"


class PaymentRateThrottle(ScopedRateThrottle):
    scope = "payment"
