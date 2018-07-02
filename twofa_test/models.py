from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_save
from rest_framework.authtoken.models import Token
# Create your models here.
from django.dispatch import receiver
import string
import random


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.PROTECT, related_name="profile")
    photo = models.ImageField(upload_to='imgs')
    name = models.CharField(max_length=50)
    two_fa_check = models.BooleanField(default=False)
    SECKRET_KEY = models.CharField(max_length=30, default=None, blank=True, null=True)
    email_cofirmed = models.BooleanField(default=False)
    email = models.EmailField(max_length=70,blank=False)
    need_comfirm = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = "Користувач"
        verbose_name_plural = "Користувачі"

    def __repr__(self):
        return self.name

    __str__ = __repr__

def secret_key_generator(size=6, chars=string.ascii_uppercase):
    return ''.join(random.choice(chars) for _ in range(size))


@receiver(post_save, sender=User)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)
        secret_key = secret_key_generator(8)
        Profile.objects.create(user=instance,
                               name="{} {}".format(instance.first_name or "",
                                                   instance.last_name or ""))
    # else:
    #     instance.profile.name = "{} {}".format(instance.first_name or "",
    #                                            instance.last_name or "")
    #     instance.profile.save()
