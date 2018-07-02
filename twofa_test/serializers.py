from django.contrib.auth import authenticate
from rest_framework import serializers, exceptions
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User

from twofa_test import models


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    password = serializers.CharField(source='user.password')

    class Meta:
        model = models.Profile
        fields = ('id','name', 'photo', 'username', 'two_fa_check', 'password', 'email', 'SECKRET_KEY', 'email_cofirmed','need_comfirm')


class TokenSerializer(serializers.ModelSerializer):

    class Meta:
        model = Token
        exclude = ()
