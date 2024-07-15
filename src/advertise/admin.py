from django.contrib import admin
from advertise.models import Reel, Advertisement

admin.site.register([Reel])

@admin.register(Advertisement)
class AdvertisementAdmin(admin.ModelAdmin):
    list_display = ["id", "type", "position", "property", "run_time", "number_of_clicked", "view_time", "created_at"]
    list_editable = ["type", "position"]
