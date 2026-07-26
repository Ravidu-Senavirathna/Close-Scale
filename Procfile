# ─────────────────────────────────────────────────────────────────
#  Close-Scale — Process definitions
#
#  Render uses render.yaml (startCommand) to launch processes.
#  This Procfile is kept as a reference and for local tooling.
#  The 'release' phase runs automatically before each Render deploy
#  via the preDeployCommand in render.yaml.

web: cd /app && daphne -b 0.0.0.0 -p $PORT backend.asgi:application
worker: cd /app && celery -A backend worker -l info --concurrency=2
release: cd /app && python manage.py migrate --no-input && python manage.py collectstatic --no-input
