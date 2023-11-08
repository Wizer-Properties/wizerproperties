from django.contrib import admin
from schedule.models import VisitingSchedule


@admin.register(VisitingSchedule)
class VisitingScheduleAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "visiting_time",
        "status",
        "prospect",
        "content_type",
        "object_id",
        "content_object",
        "created_at",
        "updated_at",
    ]
