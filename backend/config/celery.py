import os

from celery import Celery
from celery.schedules import crontab

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.dev")

app = Celery("zenithcart")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

app.conf.beat_schedule = {
    "refresh-top-sellers-cache": {
        "task": "apps.catalog.tasks.refresh_top_sellers_cache",
        "schedule": crontab(minute="*/15"),
    },
}


@app.task(bind=True, ignore_result=True)
def debug_task(self) -> None:  # pragma: no cover
    print(f"Request: {self.request!r}")
