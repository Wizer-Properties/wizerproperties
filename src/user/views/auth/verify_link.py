from typing import TYPE_CHECKING
from django.contrib import auth
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.utils import timezone
from django.contrib.auth.password_validation import validate_password
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from user.models import User, ConfirmationCode

if TYPE_CHECKING:
    from django.http import HttpRequest, HttpResponse


def verify_link(request: "HttpRequest") -> "HttpResponse":
	verification_type = request.GET.get('verification_type', None)
	token = request.GET.get('token', None)
	if not verification_type or not token:
		# If token is messing then redirect
		return redirect('/')
	
	try:
		confirmation_code_obj = get_object_or_404(
									ConfirmationCode,
									code=token,
									confirmation_type=verification_type,
									is_used=False,
									expiration_date__gte=timezone.now()
								)
	except Exception:
		return redirect('/')
	
	confirmation_code_obj.verify_confirmation_code()

	if verification_type == "account_verification":
		messages.success(request, 'Your account has been verified!')
		return redirect('/')
	if verification_type == "forgot_password":
		if confirmation_code_obj.user:
			if not request.user.is_authenticated:
				try:
					auth.login(request, confirmation_code_obj.user, backend= \
						'django.contrib.auth.backends.ModelBackend')
					return HttpResponseRedirect(reverse('user:password_reset_confirm'))
				except Exception as e:
					import logging
					logger = logging.getLogger(__name__)
					logger.exception(f"User cannot log in after register: {e}")
			else:
				return redirect('/')

	return redirect('/')
