from django.contrib import admin
from user.models.auth import User, ConfirmationCode

admin.site.register([User, ConfirmationCode])
