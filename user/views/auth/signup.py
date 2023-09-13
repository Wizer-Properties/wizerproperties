import secrets
from django.contrib.auth import login
from django.shortcuts import render
from django.views import View
from django.contrib import messages

from user.forms.auth import SignupForm
from user.models.auth import ConfirmationCode
from utils.general_func import send_email
from django.conf import settings


class SignupView(View):
    form_class = SignupForm
    template_name = 'auth/signup.html'

    def get(self, request):
        form = self.form_class()
        return render(request, self.template_name, {'signup_form': form})

    def post(self, request):
        form = self.form_class(request.POST)
        system_error = ""
        
        if form.is_valid():
            
            try:
                user = form.save()
                # login(request, user)
                
                # Create account verification code and send email for verification
                code = ConfirmationCode.objects.create(
                    user=user, code_type="account_verification",
                    code=secrets.token_hex(3))
                
                send_email(
                    subject="Verify Your Account",
                    to_email=user.email,
                    html_content = "email/account_verification.html",
                    context={
                        "site_host": settings.SITE_HOST,
                        "token": code.code
                    }
                )
                
                messages.success(request, 'You have successfully registered. Please check your email for verification and confirm your account. Thank you for your cooperation!')
            except Exception as e:
                print("e=======", e)
                system_error = "Something went wrong"
            
        return render(request, self.template_name, {'signup_form': form, "system_error": system_error})
