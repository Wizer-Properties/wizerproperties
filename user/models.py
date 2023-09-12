from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

from core.models import TimestampedModel


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        # Create and save a User with the given email and password.

        if not email:
            raise ValueError(_('The given email must be set'))
        email = self.normalize_email(email)
        
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        # Create and save a SuperUser with the given email and password.
        
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(email, password, **extra_fields)


    def get_by_natural_key(self, email):
        # for user id(email) case insensitive
        
        case_insensitive_username_field = '{}__iexact'.format(self.model.USERNAME_FIELD)
        return self.get(**{case_insensitive_username_field: email})	


class User(TimestampedModel, AbstractUser):
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    USER_TYPE = (
        ('developer', 'Developer'),
        ('agent', 'Agent'),
        ('prospect', 'Prospect')
    )
    
    username = models.CharField(max_length=50)
    email =  models.EmailField(db_collation="ci_ai", unique=True)
    user_type = models.CharField(max_length=50, choices=USER_TYPE)
    email_verification_status = models.BooleanField(default=False)
    objects = UserManager()
    
    def __str__(self):
        return self.get_username()
        
    def get_username(self):
        if self.username:
            return self.username
        return self.email.split('@')[0]
	


	# def upload_to(self, filename):
	# 	now_time = datetime.datetime.now()
	# 	return 'user_profile_pic/'+str(now_time.strftime("%Y-%m-%d"))+"/"+filename
