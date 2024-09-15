from django.contrib import admin
from schedule.models import VisitingSchedule


@admin.register(VisitingSchedule)
class VisitingScheduleAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "visiting_time",
        "status",
        "prospect",
        "created_at",
    ]
