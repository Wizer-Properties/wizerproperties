from django.contrib import admin
from .models import Building, BuildingMedia, BuildingReview

admin.site.register([Building, BuildingMedia, BuildingReview])
