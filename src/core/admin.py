from django.contrib import admin
from core.models import Contact


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ["email", "subject", "created_at"]
