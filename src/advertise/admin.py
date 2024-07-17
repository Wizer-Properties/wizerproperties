from django.contrib import admin
from advertise.models import Reel, Advertisement, AdDemography

admin.site.register([Reel])

@admin.register(Advertisement)
class AdvertisementAdmin(admin.ModelAdmin):
    list_display = ["id", "type", "position", "property", "run_time", "number_of_clicked", "view_time", "created_at"]
    list_editable = ["type", "position"]

@admin.register(AdDemography)
class AdDemographyAdmin(admin.ModelAdmin):
    list_display = ["id", "advertisement", "male_visitors", "female_visitors", "created_at"]
