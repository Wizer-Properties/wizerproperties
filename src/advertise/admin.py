from django.contrib import admin
from advertise.models import Reel, Advertisement, AdDemography, AdvertisementLog

admin.site.register([Reel])

@admin.register(Advertisement)
class AdvertisementAdmin(admin.ModelAdmin):
    list_display = ["id", "ad_location", "position", "property", "ad_run_duration", "number_of_clicked", "view_time", "created_at"]
    list_editable = ["ad_location", "position"]

@admin.register(AdDemography)
class AdDemographyAdmin(admin.ModelAdmin):
    list_display = ["id", "advertisement", "male_visitors", "female_visitors", "created_at"]

@admin.register(AdvertisementLog)
class AdvertisementLogAdmin(admin.ModelAdmin):
    list_display = ["id", "property", "advertisement", "user_obj", "location", "created_at"]
