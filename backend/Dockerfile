# ─────────────────────────────────────────────────────────────────
#  Close-Scale — Dockerfile
#  Used by both docker-compose (local dev) and Render (production).
# ─────────────────────────────────────────────────────────────────

FROM python:3.13-slim

# Prevent Python from writing .pyc files and enable stdout/stderr logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies required by psycopg2 and Pillow
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    gcc \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first (cached layer)
COPY requirements.txt /requirements.txt
RUN pip install --no-cache-dir -r /requirements.txt

# Copy the Django project source
COPY . /app/

EXPOSE 8000
