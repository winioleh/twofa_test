from rest_framework.authtoken.models import Token
from requests import Response
# from rest_framework.authtoken import views as authtoken_views
# from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework_jwt.views import obtain_jwt_token, refresh_jwt_token

from rest_framework.routers import DefaultRouter
from django.urls import path, include
from django.conf.urls import url
from . import views


router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'tokens', views.TokenViewSet)

urlpatterns = [
    path("api/", include(router.urls)),
    path("", views.Index.as_view()),
    url(r'^api-token-auth/', views.CheckTwoFactor.as_view()), # need user credentials (username and password)
    # url(r'^api-two_factor-auth/', views.AuthentificateUser.as_view()), # need encoded data about user and code that entered by current user
    url(r'^api-token-refresh/', refresh_jwt_token), # need refresh_token
    url(r'^get-qr-for-adding/', views.AddTwoFactorAuth.as_view()), # need only JWT in header
    url(r'^confirm_factor_activation/', views.ConfirmTwoFactorActivation.as_view()), # need code (second factor)
    url(r'^confirm_factor_deactivation/', views.ConfirmTwoFactorDeactivation.as_view()), # need code (second factor)
    url(r'^activate/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token1>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/$', views.activate, name='activate'),
]