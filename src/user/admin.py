from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html

from user.models.auth import User, ConfirmationCode, DeveloperProfile, AgentProfile, ProspectProfile
from core.admin import custom_admin_site


@admin.register(User, site=custom_admin_site)
class UserAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "username",
        "email",
        "user_type",
        "auth_type",
        "email_verification_status",
        "is_complete_profile",
        "created_at",
    ]
    
    def has_add_permission(self, request):
        return False
    
    def change_view(self, request, object_id, form_url='', extra_context=None):
        # Add extra context to disable the "Save and add another" button
        extra_context = extra_context or {}
        extra_context['show_save_and_continue'] = False
        extra_context['show_save_and_add_another'] = False
        extra_context['show_delete'] = False
        return super(UserAdmin, self).change_view(request, object_id, form_url, extra_context=extra_context)
    
    def add_view(self, request, form_url='', extra_context=None):
        extra_context = extra_context or {}
        extra_context['show_save_and_continue'] = False
        extra_context['show_save_and_add_another'] = False
        extra_context['show_delete'] = False
        return super(UserAdmin, self).add_view(request, form_url, extra_context=extra_context)


# @admin.register(ConfirmationCode)
# class ConfirmationCodeAdmin(admin.ModelAdmin):
#     list_display = [
#         "id",
#         "user",
#         "code",
#         "confirmation_type",
#         "is_used",
#         "expiration_date",
#         "created_at",
#         "updated_at",
#     ]


@admin.register(DeveloperProfile, site=custom_admin_site)
class DeveloperProfileAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "_user",
        "credit_balance",
        "company_name",
        "address",
        "company_details",
        "created_at",
    ]
    
    def _user(self, obj):
        if obj.user:
            link = reverse("admin:user_user_change", args=[obj.user.id])
            return format_html('<a href="{}" target="_blank">{}</a>', link, obj.user.username)
        return "--"
    
    # def has_add_permission(self, request):
    #     return False
    
    def change_view(self, request, object_id, form_url='', extra_context=None):
        # Add extra context to disable the "Save and add another" button
        extra_context = extra_context or {}
        extra_context['show_save_and_continue'] = False
        extra_context['show_save_and_add_another'] = False
        extra_context['show_delete'] = False
        return super(DeveloperProfileAdmin, self).change_view(request, object_id, form_url, extra_context=extra_context)
    
    def add_view(self, request, form_url='', extra_context=None):
        extra_context = extra_context or {}
        extra_context['show_save_and_continue'] = False
        extra_context['show_save_and_add_another'] = False
        extra_context['show_delete'] = False
        return super(DeveloperProfileAdmin, self).add_view(request, form_url, extra_context=extra_context)


@admin.register(AgentProfile, site=custom_admin_site)
class AgentProfileAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "_user",
        "credit_balance",
        "company_name",
        "address",
        "company_details",
        "created_at",
    ]
    
    def _user(self, obj):
        if obj.user:
            link = reverse("admin:user_user_change", args=[obj.user.id])
            return format_html('<a href="{}" target="_blank">{}</a>', link, obj.user.username)
        return "--"
    
    def has_add_permission(self, request):
        return False
    
    def change_view(self, request, object_id, form_url='', extra_context=None):
        # Add extra context to disable the "Save and add another" button
        extra_context = extra_context or {}
        extra_context['show_save_and_continue'] = False
        extra_context['show_save_and_add_another'] = False
        extra_context['show_delete'] = False
        return super(AgentProfileAdmin, self).change_view(request, object_id, form_url, extra_context=extra_context)
    
    def add_view(self, request, form_url='', extra_context=None):
        extra_context = extra_context or {}
        extra_context['show_save_and_continue'] = False
        extra_context['show_save_and_add_another'] = False
        extra_context['show_delete'] = False
        return super(AgentProfileAdmin, self).add_view(request, form_url, extra_context=extra_context)


@admin.register(ProspectProfile, site=custom_admin_site)
class ProspectProfileAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "_user",
        "first_name",
        "last_name",
        "gender",
        "address",
        "created_at",
    ]
    
    def _user(self, obj):
        if obj.user:
            link = reverse("admin:user_user_change", args=[obj.user.id])
            return format_html('<a href="{}" target="_blank">{}</a>', link, obj.user.username)
        return "--"
    
    def has_add_permission(self, request):
        return False
    
    def change_view(self, request, object_id, form_url='', extra_context=None):
        # Add extra context to disable the "Save and add another" button
        extra_context = extra_context or {}
        extra_context['show_save_and_continue'] = False
        extra_context['show_save_and_add_another'] = False
        extra_context['show_delete'] = False
        return super(ProspectProfileAdmin, self).change_view(request, object_id, form_url, extra_context=extra_context)
    
    def add_view(self, request, form_url='', extra_context=None):
        extra_context = extra_context or {}
        extra_context['show_save_and_continue'] = False
        extra_context['show_save_and_add_another'] = False
        extra_context['show_delete'] = False
        return super(ProspectProfileAdmin, self).add_view(request, form_url, extra_context=extra_context)

