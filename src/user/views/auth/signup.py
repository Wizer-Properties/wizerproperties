from django.contrib import auth
from django.shortcuts import render, redirect
from django.views import View

from user.forms.auth import SignupForm


class SignupView(View):
    form_class = SignupForm
    template_name = "auth/signup.html"

    def get(self, request):
        form = self.form_class()
        return render(request, self.template_name, {"signup_form": form})

    def post(self, request):
        form = self.form_class(request.POST)
        system_error = ""

        if form.is_valid():
            try:
                user = form.save()
                auth.login(request, user)
                return redirect("user:email_verify")
            except Exception as e:
                print("e=======", e)
                system_error = "Something went wrong"

        return render(request, self.template_name, {"signup_form": form, "system_error": system_error})
