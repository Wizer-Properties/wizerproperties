import secrets
from django.contrib.auth import login
from django.shortcuts import render
from django.views import View
from django.contrib import messages

from user.forms.auth import SignupForm
from user.models.auth import ConfirmationCode


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
                ConfirmationCode.objects.create(
                    user=user, code_type="account_verification",
                    code=secrets.secrets.token_hex(3))
                
                messages.success(request, 'You have successfully registered.')
            except:
                system_error = "Something went wrong"
            
        return render(request, self.template_name, {'signup_form': form, "system_error": system_error})
