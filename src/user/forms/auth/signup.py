from django.contrib.auth.forms import UserCreationForm
from user.models.auth import User


class SignupForm(UserCreationForm):
    class Meta:
        model = User
        fields = ('email', 'password1', 'password2')
