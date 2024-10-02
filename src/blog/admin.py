from django.contrib import admin

from .models import Post, Category, PostInteraction
from core.admin import custom_admin_site


# custom_admin_site.register(PostInteraction)


# @admin.register(Post, site=custom_admin_site)
# class PostAdmin(admin.ModelAdmin):
#     list_display = (
#         'title', 'subtitle', 'status',  
#         'total_likes', 'total_dislikes', 'total_read_count', 'estimated_read_time', 
#         'categories_list', 'creator', 'created_at', 'updated_at',
#     )
#     list_filter = ('status', 'categories__name')
#     search_fields = ('title', 'description',)
#     ordering = ('-created_at',)
#     list_editable = ('status',)
    
#     def categories_list(self, obj):
#         return ", ".join([category.name for category in obj.categories.all()])
    
# @admin.register(Category, site=custom_admin_site)
# class CategoryAdmin(admin.ModelAdmin):
#     list_display = ('name', 'is_active')
#     search_fields = ('name',)
#     ordering = ('name',)

