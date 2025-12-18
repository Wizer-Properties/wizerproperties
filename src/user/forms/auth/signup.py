from typing import TYPE_CHECKING
from django.contrib.auth.forms import UserCreationForm
from user.models.auth import User

if TYPE_CHECKING:
    _Base = UserCreationForm[User]
else:
    _Base = UserCreationForm


class SignupForm(_Base):
    class Meta:
        model = User
        fields = ('email', 'password1', 'password2')
