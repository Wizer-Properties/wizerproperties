from django.contrib import admin
from advertise.models import Reel, Advertisement, AdDemography, AdvertisementLog

@admin.register(Advertisement)
class AdvertisementAdmin(admin.ModelAdmin):
    list_display = ["id", "property", "ad_location", "position", "ad_run_duration", "number_of_clicked", "view_time", "created_at"]
    list_editable = ["ad_location", "position"]


@admin.register(Reel)
class ReelAdmin(admin.ModelAdmin):
    list_display = ["id", "property", "url", "social_media", "category", "status", "created_by"]

# @admin.register(AdDemography)
# class AdDemographyAdmin(admin.ModelAdmin):
#     list_display = ["id", "advertisement", "male_visitors", "female_visitors", "created_at"]

# @admin.register(AdvertisementLog)
# class AdvertisementLogAdmin(admin.ModelAdmin):
#     list_display = ["id", "property", "advertisement", "user_obj", "location", "created_at"]
