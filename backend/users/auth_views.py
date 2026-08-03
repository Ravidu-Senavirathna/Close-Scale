from django.conf import settings
from rest_framework.response import Response
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView,
)

class CookieTokenObtainPairView(TokenObtainPairView):
    """
    Obtain a JWT token pair and store them in HttpOnly cookies.
    """
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            access_token = response.data.get("access")
            refresh_token = response.data.get("refresh")
            
            response.set_cookie(
                "access_token",
                access_token,
                max_age=settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds(),
                httponly=True,
                samesite="Lax",
                secure=not settings.DEBUG,
            )
            
            response.set_cookie(
                "refresh_token",
                refresh_token,
                max_age=settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds(),
                httponly=True,
                samesite="Lax",
                secure=not settings.DEBUG,
            )
            
            # Optionally, you can remove the tokens from the JSON body to strictly force cookie usage
            # del response.data["access"]
            # del response.data["refresh"]
            
        return response

class CookieTokenRefreshView(TokenRefreshView):
    """
    Refresh the JWT access token using the refresh_token from the HttpOnly cookie.
    """
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh_token")
        
        # Inject the refresh token from the cookie into the request data
        if refresh_token and "refresh" not in request.data:
            if isinstance(request.data, dict):
                request.data["refresh"] = refresh_token
            elif hasattr(request.data, "_mutable"):
                request.data._mutable = True
                request.data["refresh"] = refresh_token
                request.data._mutable = False
                
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            access_token = response.data.get("access")
            refresh_token_new = response.data.get("refresh")
            
            response.set_cookie(
                "access_token",
                access_token,
                max_age=settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds(),
                httponly=True,
                samesite="Lax",
                secure=not settings.DEBUG,
            )
            
            if refresh_token_new:
                response.set_cookie(
                    "refresh_token",
                    refresh_token_new,
                    max_age=settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds(),
                    httponly=True,
                    samesite="Lax",
                    secure=not settings.DEBUG,
                )
                
        return response

class CookieTokenBlacklistView(TokenBlacklistView):
    """
    Blacklist the refresh token and delete the HttpOnly cookies.
    """
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh_token")
        
        if refresh_token and "refresh" not in request.data:
            if isinstance(request.data, dict):
                request.data["refresh"] = refresh_token
            elif hasattr(request.data, "_mutable"):
                request.data._mutable = True
                request.data["refresh"] = refresh_token
                request.data._mutable = False
                
        response = super().post(request, *args, **kwargs)
        
        # Always delete the cookies regardless of the blacklist success
        response.delete_cookie("access_token", samesite="Lax")
        response.delete_cookie("refresh_token", samesite="Lax")
        
        return response
