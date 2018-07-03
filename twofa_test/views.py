import io
import hashlib

import jwt
from rest_framework_jwt.views import ObtainJSONWebToken, jwt_response_payload_handler
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from rest_framework_jwt.authentication import JSONWebTokenAuthentication
from django.utils.encoding import force_bytes, force_text
from rest_framework.permissions import IsAuthenticated
from django.template.loader import render_to_string
from django.shortcuts import redirect, render
from django.views.generic import TemplateView
from rest_framework.response import Response
from rest_framework import viewsets, status
from django.core.mail import EmailMessage
from rest_framework.views import APIView
import pyqrcode
import pyotp
import base64
import png
from twofa_test.serializers import ProfileSerializer, TokenSerializer
from .tokens import confirmation_token
from .models import *
from first_task.settings import SECRET_KEY


class Index(TemplateView):
    template_name = "index.html"


class UserViewSet(viewsets.ModelViewSet):

    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    authentication_classes = [JSONWebTokenAuthentication]
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        query_set = Profile.objects.get(user=request.user)
        return Response(ProfileSerializer(query_set).data)


class TokenViewSet(viewsets.ModelViewSet):
    queryset = Token.objects.all()
    serializer_class = TokenSerializer


class CheckTwoFactor(ObtainJSONWebToken):

    def post(self, request, *args, **kwargs):
        if request.data['encoded_payload']:
            encoded_payload = request.data['encoded_payload']
            code = request.data['code']

            key = hashlib.sha512(str("2fa-key-" + SECRET_KEY).encode('utf-8')).hexdigest()
            decoded = jwt.decode(encoded_payload, key, algorithm='HS256')
            profile = Profile.objects.get(user__username=decoded['username'])

            topt = pyotp.TOTP(profile.SECKRET_KEY)
            current_code = topt.now()

            if str(current_code) == str(code):
                context = {
                    'token': decoded['token'],
                    'refresh_token': decoded['reflesh_token']
                }
            else:
                context = {
                    'non_field_errors': "Unable to login with provided credentials."
                }
            return Response(context)
        else:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                user = serializer.object.get('user') or request.user
                token = serializer.object.get('token')

                current_user = Profile.objects.get(user__username=user)
                refresh_token = serializer.object.get('refresh_token')
                if refresh_token is None:
                    response_data = jwt_response_payload_handler(token, user, request)
                else:
                    if current_user.two_fa_check:

                        key = hashlib.sha512(str("2fa-key-" + SECRET_KEY).encode('utf-8')).hexdigest()
                        payload = {
                            'username': current_user.user.username,
                            'token': token,
                            'reflesh_token': refresh_token
                        }
                        encoded_payload = jwt.encode(payload, key, algorithm='HS256')
                        context = {
                            'two_factor': True,
                            'encoded_payload': encoded_payload,
                            }

                        return Response(context)
                    else:
                        context = {
                            'two_factor': False,
                            'refresh_token': refresh_token,
                            'token': token
                        }
                        return Response(context)
                return Response(response_data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def secret_key_generator(size=6, chars=string.ascii_uppercase):
    return ''.join(random.choice(chars) for _ in range(size))


class AddTwoFactorAuth(APIView):
    def get(self, request):
        user = request.user
        profile = user.profile
        profile.SECKRET_KEY = pyotp.random_base32()
        profile.save()
        auth_url = pyotp.totp.TOTP(profile.SECKRET_KEY).provisioning_uri(profile.user.username, issuer_name="Datawiz.io")
        qr = pyqrcode.create(auth_url)
        s = io.BytesIO()
        qr.png(s, scale=6)
        encoded_qr = base64.b64encode(s.getvalue()).decode("ascii")

        context = {
            'encoded_qr': encoded_qr,
            'secret_key': profile.SECKRET_KEY
        }

        return Response(context)


class ConfirmTwoFactor(APIView):
    def post(self, request):
        current_code = pyotp.TOTP(request.user.profile.SECKRET_KEY).now()
        entered_code = request.data['code']
        if str(current_code) == str(entered_code):
            mail_subject = 'Confirm adding Two-factors Authentications.'
            current_site = request.META["HTTP_HOST"]

            message = render_to_string('account_activation_email.html', {
                'user': request.user,
                'domain': current_site,
                'uid': urlsafe_base64_encode(force_bytes(request.user.pk)).decode("utf-8"),
                'token': str(confirmation_token.make_token(request.user))
            })

            profile = request.user.profile
            email = EmailMessage(mail_subject, message, to=[profile.email])
            email.send()
            profile.need_comfirm = True
            profile.save()

            context = {
                'email': 'need confirm'
            }

        else:

            context = {
                'code': 'wrong code'
            }

        return Response(context)


def activate(request, uidb64, token1):
    try:
        uid = force_text(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
        print(user)

    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None
    if user is not None and confirmation_token.check_token(user, token1):
        profile = Profile.objects.get(user=user)
        if profile.two_fa_check:
            profile.two_fa_check = False
        else:
            profile.two_fa_check = True
        profile.need_comfirm = False
        profile.email_cofirmed = True
        profile.save()

        response = redirect('http://localhost:8000/#/ownroom')
        return response
    else:
        return render(request, 'account_activation_invalid.html')


class AuthentificateUser(APIView):

    def post(self, request):
        encoded_payload = request.data['encoded_payload']
        code = request.data['code']

        key = hashlib.sha512(str("2fa-key-" + SECRET_KEY).encode('utf-8')).hexdigest()
        decoded = jwt.decode(encoded_payload, key, algorithm='HS256')
        profile = Profile.objects.get(user__username=decoded['username'])

        topt = pyotp.TOTP(profile.SECKRET_KEY)
        current_code = topt.now()

        if str(current_code) == str(code):
            context = {
                'token': decoded['token'],
                'refresh_token': decoded['reflesh_token']
            }
        else:
            context = {
                'non_field_errors': "Unable to login with provided credentials."
            }
        return Response(context)



