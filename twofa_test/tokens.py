from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils import six
from .models import Profile


class ConfirmationTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        # profile = User.objects.get(user=user)
        return (
            six.text_type(user.pk) + six.text_type(timestamp) +
            six.text_type(user.profile.email_cofirmed)
        )

confirmation_token = ConfirmationTokenGenerator()