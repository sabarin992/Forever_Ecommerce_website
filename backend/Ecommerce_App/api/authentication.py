from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import AccessToken
from .models import CustomUser

class JWTCookieAuthentication(BaseAuthentication):
    def authenticate(self, request):
        access_token = request.COOKIES.get('access_token')
        
        if not access_token:
            return None  # No token, proceed without authentication

        try:
            token = AccessToken(access_token)
            user_id = token['user_id']
            user = CustomUser.objects.get(id=user_id)
            return (user, token)
        except Exception as e:
            raise AuthenticationFailed('Invalid or expired access token')

        return None