from django.contrib import admin
from .models import Property, PropertyMedia, CompareProperty, ProspectFavoriteProperty

admin.site.register(Property)
admin.site.register(PropertyMedia)
admin.site.register(CompareProperty)
admin.site.register(ProspectFavoriteProperty)
