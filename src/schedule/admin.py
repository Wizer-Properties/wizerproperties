from django.contrib import admin
from typing import Any, Dict, Optional
from schedule.models import VisitingSchedule
from core.admin import custom_admin_site


@admin.register(VisitingSchedule, site=custom_admin_site)
class VisitingScheduleAdmin(admin.ModelAdmin):  # type: ignore[type-arg]
    list_display = [
        "id",
        "visiting_time",
        "status",
        "prospect",
        "created_at",
    ]
    
    def has_add_permission(self, request: Any) -> bool:
        return False
    
    def change_view(self, request: Any, object_id: str, form_url: str = '', extra_context: Optional[Dict[str, Any]] = None) -> Any:
        # Add extra context to disable the "Save and add another" button
        extra_context = extra_context or {}
        extra_context['show_save_and_continue'] = False
        extra_context['show_save_and_add_another'] = False
        extra_context['show_delete'] = False
        return super(VisitingScheduleAdmin, self).change_view(request, object_id, form_url, extra_context=extra_context)
    
    def add_view(self, request: Any, form_url: str = '', extra_context: Optional[Dict[str, Any]] = None) -> Any:
        extra_context = extra_context or {}
        extra_context['show_save_and_continue'] = False
        extra_context['show_save_and_add_another'] = False
        extra_context['show_delete'] = False
        return super(VisitingScheduleAdmin, self).add_view(request, form_url, extra_context=extra_context)
