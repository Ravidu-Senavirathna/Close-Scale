#!/usr/bin/env bash
# Exit on error
set -e

echo "Running migrations..."
python manage.py migrate --no-input

echo "Collecting static files..."
python manage.py collectstatic --no-input

echo "Starting Celery Worker in the background..."
celery -A backend worker -l info --concurrency=2 &

echo "Starting Daphne Web Server..."
daphne -b 0.0.0.0 -p ${PORT:-8000} backend.asgi:application
