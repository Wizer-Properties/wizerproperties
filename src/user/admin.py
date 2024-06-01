from django.contrib import admin
from user.models.auth import User, ConfirmationCode, DeveloperProfile, AgentProfile, ProspectProfile


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "username",
        "email",
        "user_type",
        "email_verification_status",
        "is_complete_profile",
        "created_at",
        "updated_at",
    ]


@admin.register(ConfirmationCode)
class ConfirmationCodeAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "user",
        "code",
        "confirmation_type",
        "is_used",
        "expiration_date",
        "created_at",
        "updated_at",
    ]


@admin.register(DeveloperProfile)
class DeveloperProfileAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "user",
        "company_name",
        "address",
        "company_details",
        "created_at",
        "updated_at",
    ]


@admin.register(AgentProfile)
class AgentProfileAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "user",
        "company_name",
        "address",
        "company_details",
        "created_at",
        "updated_at",
    ]


@admin.register(ProspectProfile)
class ProspectProfileAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "user",
        "first_name",
        "last_name",
        "gender",
        "address",
        "created_at",
        "updated_at",
    ]
