from typing import List, TYPE_CHECKING, cast
from django.contrib import auth
from django.contrib.auth.password_validation import validate_password
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from user.models import User, ConfirmationCode

if TYPE_CHECKING:
    from django.http import HttpRequest, HttpResponse


def forgot_password(request: "HttpRequest") -> "HttpResponse":
	if request.user.is_authenticated:
		return redirect('dashboard')

	if request.method == 'POST':
		email = request.POST['email']
		if User.objects.filter(email=email).exists():
			user = User.objects.filter(email=email).first()
			if user:
				try:
					ConfirmationCode.objects.send_confirmation_code(request, user, "forgot_password")
				except Exception as e:
					return JsonResponse({'status': 'Error', 'message': 'something went wrong try again later'}, status=400)

				return JsonResponse({'status': 'success', 'message': 'We have sent a password reset link to your email'}, status=200)
		
		return JsonResponse({'status': 'Error', 'message': 'Invalid Email'}, status=400)

	return render(request, "auth/forgot_password.html")


@login_required
def update_password(request: "HttpRequest") -> "HttpResponse":
	if request.method=='POST':
		pass1 = request.POST['password1']
		pass2 = request.POST['password2']

		if pass1 != pass2:
			return JsonResponse({'status': 'Error', 'message': 'Password does not match'}, status=400)
		else:
			user = cast(User, request.user)
			try:
				validate_password(pass1, user=user)

				user.set_password(pass1)
				user.save()
				auth.login(request, user, backend= \
					'django.contrib.auth.backends.ModelBackend')
				return JsonResponse({'status': 'success', 'message': 'Successfully password has been updated.'}, status=200)
			except Exception as e:
				forgot_password_errors = []
				if isinstance(e, (list, tuple)):
					for error in e:
						forgot_password_errors.append(str(error))
				elif hasattr(e, 'messages'):
					forgot_password_errors.extend(e.messages)
				else:
					forgot_password_errors.append(str(e))
				return JsonResponse({'status': 'Error', 'message': forgot_password_errors}, status=400)


	return render(request, 'auth/update-password.html')


