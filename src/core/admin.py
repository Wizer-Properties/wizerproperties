from django.contrib import admin
from core.models import Contact
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator



class CustomAdminSite(admin.AdminSite):
    site_header = "WIP ADMIN"

    def each_context(self, request):
        # Get the default context from the super class
        context = super().each_context(request)
        
        context['contact_unread_count'] = Contact.objects.filter(status="unread").count()
        return context


# Replace the default admin site with the custom one
custom_admin_site = CustomAdminSite(name='admin')


@admin.register(Contact, site=custom_admin_site)
class ContactAdmin(admin.ModelAdmin):
    list_display = ["email", "status", "subject", "created_at"]
    list_editable = ("status",)
    
    def has_add_permission(self, request):
        return False
    
    def change_view(self, request, object_id, form_url='', extra_context=None):
        # Add extra context to disable the "Save and add another" button
        extra_context = extra_context or {}
        extra_context['show_save_and_continue'] = False
        extra_context['show_save_and_add_another'] = False
        extra_context['show_delete'] = False
        return super(ContactAdmin, self).change_view(request, object_id, form_url, extra_context=extra_context)
    
    def add_view(self, request, form_url='', extra_context=None):
        extra_context = extra_context or {}
        extra_context['show_save_and_continue'] = False
        extra_context['show_save_and_add_another'] = False
        extra_context['show_delete'] = False
        return super(ContactAdmin, self).add_view(request, form_url, extra_context=extra_context)
