from django.contrib import admin
from user.models.auth import User, ConfirmationCode, DeveloperProfile, AgentProfile, ProspectProfile

admin.site.register([User, ConfirmationCode, DeveloperProfile, AgentProfile, ProspectProfile])
