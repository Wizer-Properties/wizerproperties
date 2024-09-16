from django.contrib import admin
from schedule.models import VisitingSchedule
from core.admin import custom_admin_site


@admin.register(VisitingSchedule, site=custom_admin_site)
class VisitingScheduleAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "visiting_time",
        "status",
        "prospect",
        "created_at",
    ]
