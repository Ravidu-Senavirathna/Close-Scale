"""
Celery application configuration for Close-Scale (Altrium CRM).

All background tasks (emails, notifications, imports, meeting sync)
are registered here and auto-discovered from each Django app.
"""

import os

from celery import Celery

# Set the default Django settings module for the celery CLI.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

app = Celery("backend")

# Load Celery config from Django's settings (keys prefixed with CELERY_).
app.config_from_object("django.conf:settings", namespace="CELERY")

# Auto-discover tasks.py in every installed Django app.
app.autodiscover_tasks()


@app.task(bind=True, ignore_result=True)
def debug_task(self) -> None:
    """Diagnostic task — prints request info. Remove before production."""
    print(f"Request: {self.request!r}")
