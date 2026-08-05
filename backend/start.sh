#!/usr/bin/env bash
# Exit on error
set -e

echo "Running migrations..."
python manage.py migrate --no-input

echo "Collecting static files..."
python manage.py collectstatic --no-input


echo "Starting Daphne Web Server..."
daphne -b 0.0.0.0 -p ${PORT:-8000} backend.asgi:application
