from django.contrib.auth.decorators import login_required
from django.contrib import auth
from django.conf import settings
from django.shortcuts import redirect


@login_required
def logout(request):
    auth.logout(request)
    return redirect(settings.LOGIN_URL)
