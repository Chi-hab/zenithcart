import io
from datetime import UTC, datetime

from celery import shared_task
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.mail import send_mail


@shared_task
def generate_invoice_pdf(order_id: str) -> str:
    """Render a PDF invoice for an order and attach it to an Invoice record."""
    from reportlab.lib.pagesizes import A4
    from reportlab.pdfgen import canvas

    from .models import Invoice, Order

    order = Order.objects.select_related("user").prefetch_related(
        "items__product"
    ).get(id=order_id)

    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    y = height - 60

    pdf.setFont("Helvetica-Bold", 18)
    pdf.drawString(50, y, "ZenithCart Invoice")
    pdf.setFont("Helvetica", 10)
    y -= 30
    pdf.drawString(50, y, f"Order: {order.order_number}")
    y -= 15
    pdf.drawString(50, y, f"Customer: {order.user.email}")
    y -= 30

    pdf.setFont("Helvetica-Bold", 10)
    pdf.drawString(50, y, "Product")
    pdf.drawString(300, y, "Qty")
    pdf.drawString(360, y, "Unit")
    pdf.drawString(440, y, "Total")
    pdf.setFont("Helvetica", 10)
    y -= 18
    for item in order.items.all():
        pdf.drawString(50, y, item.product.name[:40])
        pdf.drawString(300, y, str(item.quantity))
        pdf.drawString(360, y, f"{item.unit_price}")
        pdf.drawString(440, y, f"{item.line_total}")
        y -= 16

    y -= 10
    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawString(360, y, "Subtotal:")
    pdf.drawString(440, y, f"{order.subtotal}")
    y -= 16
    pdf.drawString(360, y, "Tax:")
    pdf.drawString(440, y, f"{order.tax}")
    y -= 16
    pdf.drawString(360, y, "Total:")
    pdf.drawString(440, y, f"{order.total}")

    pdf.showPage()
    pdf.save()
    buffer.seek(0)

    invoice, _ = Invoice.objects.get_or_create(order=order)
    invoice.pdf_file.save(
        f"{order.order_number}.pdf", ContentFile(buffer.read()), save=False
    )
    invoice.generated_at = datetime.now(UTC)
    invoice.save()
    return invoice.pdf_file.name


@shared_task
def send_order_confirmation_email(order_id: str) -> str:
    """Dispatch a transactional order-confirmation email."""
    from .models import Order

    order = Order.objects.select_related("user").prefetch_related("items").get(
        id=order_id
    )
    first_item = order.items.first()
    currency = first_item.product.currency if first_item else "USD"
    send_mail(
        subject=f"Your ZenithCart order {order.order_number}",
        message=(
            f"Thank you for your order {order.order_number}.\n"
            f"Total: {order.total} {currency}"
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[order.user.email],
        fail_silently=True,
    )
    return order.user.email
