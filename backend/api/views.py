# pyrefly: ignore [missing-import]
from django.http import JsonResponse


def home(request) -> JsonResponse:
    """Root API endpoint."""
    return JsonResponse({"message": "Close-Scale API is running."})


def health_check(request) -> JsonResponse:
    """
    Health check endpoint polled by Render to verify the service is alive.
    Returns HTTP 200 when Django and the database are reachable.
    """
    # pyrefly: ignore [missing-import]
    from django.db import connection

    try:
        connection.ensure_connection()
        db_status = "ok"
    except Exception:
        db_status = "unavailable"

    return JsonResponse(
        {
            "status": "ok" if db_status == "ok" else "degraded",
            "database": db_status,
        },
        status=200 if db_status == "ok" else 503,
    )
