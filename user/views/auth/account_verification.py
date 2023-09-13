from django.contrib import messages
from django.shortcuts import redirect
from django.views import View
from django.contrib.auth import get_user_model
from user.models.auth import ConfirmationCode 

User = get_user_model()

class AccountVerificationView(View):
    def get(self, request):
        try:
            token = request.GET.get('token')
            verification_code = ConfirmationCode.objects.get(code=token, code_type='account_verification')
            user = verification_code.user
            user.email_verification_status = True
            user.save()
            
            # Deactivate previous verification code
            ConfirmationCode.objects.filter(user=user, code_type='account_verification').update(is_valid=False)

            # Optionally, mark the verification code as used
            verification_code.is_valid = False
            verification_code.save()

            messages.success(request, 'Your account has been verified!')
        except ConfirmationCode.DoesNotExist:
            messages.error(request, 'Invalid or expired verification code.')
        
        return redirect('/')
