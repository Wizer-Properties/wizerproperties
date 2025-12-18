from typing import Any, Optional, Union, TYPE_CHECKING
from django.contrib import admin
from django import forms
from django.http import HttpRequest, HttpResponse
from django.db.models import QuerySet
from django.utils.translation import gettext_lazy as _
from core.models import Contact, AdminSettings

if TYPE_CHECKING:
    _ContactAdminBase = admin.ModelAdmin[Contact]
    _AdminSettingsFormBase = forms.ModelForm[AdminSettings]
    _AdminSettingsAdminBase = admin.ModelAdmin[AdminSettings]
else:
    _ContactAdminBase = admin.ModelAdmin
    _AdminSettingsFormBase = forms.ModelForm
    _AdminSettingsAdminBase = admin.ModelAdmin


class CustomAdminSite(admin.AdminSite):
    site_header = "WIP ADMIN"

    def each_context(self, request: HttpRequest) -> dict[str, Any]:
        # Get the default context from the super class
        context = super().each_context(request)
        
        context['contact_unread_count'] = Contact.objects.filter(status="unread").count()
        return context


# Replace the default admin site with the custom one
custom_admin_site = CustomAdminSite(name='custom_admin')


@admin.register(Contact, site=custom_admin_site)
class ContactAdmin(_ContactAdminBase):
    list_display = ["email", "status", "subject", "created_at"]
    list_editable = ("status",)
    
    def has_add_permission(self, request: HttpRequest) -> bool:
        return False
    
    def change_view(self, request: HttpRequest, object_id: str, form_url: str = '', extra_context: Optional[dict[str, Any]] = None) -> HttpResponse:
        # Add extra context to disable the "Save and add another" button
        extra_context = extra_context or {}
        extra_context['show_save_and_continue'] = False
        extra_context['show_save_and_add_another'] = False
        extra_context['show_delete'] = False
        return super(ContactAdmin, self).change_view(request, object_id, form_url, extra_context=extra_context)
    
    def add_view(self, request: HttpRequest, form_url: str = '', extra_context: Optional[dict[str, Any]] = None) -> HttpResponse:
        extra_context = extra_context or {}
        extra_context['show_save_and_continue'] = False
        extra_context['show_save_and_add_another'] = False
        extra_context['show_delete'] = False
        return super(ContactAdmin, self).add_view(request, form_url, extra_context=extra_context)


class AdminSettingsForm(_AdminSettingsFormBase):
    """Custom form for AdminSettings to ensure API key is properly handled"""
    class Meta:
        model = AdminSettings
        fields = '__all__'
        widgets = {
            'openai_api_key': forms.TextInput(attrs={
                'type': 'text',  # Use text instead of password so user can see what they're typing
                'autocomplete': 'off',
                'placeholder': 'sk-or-v1-...',
                'class': 'vTextField',
                'style': 'font-family: monospace;'
            }),
        }
    
    def clean_openai_api_key(self) -> Optional[str]:
        """Clean and validate the API key"""
        api_key = self.cleaned_data.get('openai_api_key')
        if api_key:
            api_key = api_key.strip()
            # Don't validate format too strictly - OpenRouter keys can vary
            if len(api_key) < 10:
                raise forms.ValidationError("API key seems too short. Please check your OpenRouter API key.")
        return api_key


@admin.register(AdminSettings, site=custom_admin_site)
class AdminSettingsAdmin(_AdminSettingsAdminBase):
    form = AdminSettingsForm
    list_display = [
        "id", 
        "initial_credit_balance_for_agent", 
        "initial_credit_balance_for_developer",
        "discount_property_cost",
        "featured_property_cost",
        "has_openai_key"  # Show if API key is configured
    ]
    
    @admin.display(description="OpenRouter API Key")
    def has_openai_key(self, obj: AdminSettings) -> str:
        """Display if OpenRouter API key is configured"""
        if obj.openai_api_key:
            return "✅ Configured"
        return "❌ Not Set"
    
    def has_add_permission(self, request: HttpRequest) -> bool:
        # Only allow one AdminSettings record
        return not AdminSettings.objects.exists()
    
    def has_delete_permission(self, request: HttpRequest, obj: Optional[AdminSettings] = None) -> bool:
        # Allow deletion only if multiple records exist (for cleanup)
        return AdminSettings.objects.count() > 1
    
    def get_queryset(self, request: HttpRequest) -> QuerySet[AdminSettings]:
        """Show all records if multiple exist (for cleanup)"""
        qs = super().get_queryset(request)
        count = qs.count()
        if count > 1:
            # Show warning message
            from django.contrib import messages
            messages.warning(
                request,
                f"⚠️ Multiple AdminSettings records found ({count}). "
                "Please keep only one record (preferably the one with API key configured) and delete the others."
            )
        return qs
    
    fieldsets = (
        ('🤖 AI Chatbot Configuration', {
            'fields': ('openai_api_key',),
            'description': 'Configure OpenRouter API key for the AI chatbot. Get your key from https://openrouter.ai/. The chatbot uses automatic model selection (openrouter/auto) for optimal performance.',
            'classes': ('wide',)
        }),
        ('Initial Credit Settings', {
            'fields': ('initial_credit_balance_for_agent', 'initial_credit_balance_for_developer')
        }),
        ('Promotional Feature Pricing', {
            'fields': ('discount_property_cost', 'featured_property_cost'),
            'description': 'Set the credit cost for creating discount and featured properties'
        }),
    )
    
    def save_model(self, request: HttpRequest, obj: AdminSettings, form: Any, change: bool) -> None:
        """Ensure API key is properly saved"""
        # Strip whitespace from API key
        if obj.openai_api_key:
            obj.openai_api_key = obj.openai_api_key.strip()
        super().save_model(request, obj, form, change)
