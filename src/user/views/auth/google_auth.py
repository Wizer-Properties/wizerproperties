from django.contrib import auth
from django.shortcuts import render, redirect
from django.views import View
from user.models.auth.user import User
from django.urls import reverse


def google_auth_success(request):
    user = request.user
    try:
        get_user = User.objects.get(id=user.id)
        
        if get_user.auth_type == 'google':
            if get_user.is_complete_profile:
                return redirect('/')
            else:
                return redirect(reverse('user:complete_profile'))
        
        get_user.auth_type = 'google' # check the options form model
        get_user.email_verification_status = True
        get_user.save()
        

    except User.DoesNotExist:
        print("=========== error")
        pass

    return redirect('/')