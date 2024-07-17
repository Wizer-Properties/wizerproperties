from django.contrib import admin
from ipdata.models import IPData


@admin.register(IPData)
class IPDataAdmin(admin.ModelAdmin):
    list_display = ["id", "ip", "address", "last_time_checked_by_proxycheck"]
