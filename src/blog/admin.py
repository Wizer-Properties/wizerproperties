from django.contrib import admin

from .models import Post, Category
from core.admin import custom_admin_site


@admin.register(Post, site=custom_admin_site)
class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'created_at', 'updated_at')
    list_filter = ('status', 'categories')
    search_fields = ('title', 'description',)
    ordering = ('-created_at',)
    list_editable = ('status',)
    
@admin.register(Category, site=custom_admin_site)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active')
    search_fields = ('name',)
    ordering = ('name',)

