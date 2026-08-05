from rest_framework_simplejwt.authentication import JWTAuthentication

class CookieJWTAuthentication(JWTAuthentication):
    """
    Custom JWT Authentication class that extracts the access token from
    an HttpOnly cookie instead of (or in addition to) the Authorization header.
    """
    def authenticate(self, request):
        header = self.get_header(request)
        if header is None:
            raw_token = request.COOKIES.get("access_token")
        else:
            raw_token = self.get_raw_token(header)
            
        if raw_token is None:
            return None

        validated_token = self.get_validated_token(raw_token)
        return self.get_user(validated_token), validated_token
