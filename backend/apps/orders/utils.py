import secrets
from datetime import UTC, datetime


def generate_order_number() -> str:
    """Human-friendly, collision-resistant order number."""
    stamp = datetime.now(UTC).strftime("%Y%m%d")
    suffix = secrets.token_hex(4).upper()
    return f"ZC-{stamp}-{suffix}"
