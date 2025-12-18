from django.contrib import admin

from .models import Post, Category, PostInteraction
from core.admin import custom_admin_site
from django.contrib.auth import get_user_model


custom_admin_site.register(PostInteraction)


@admin.register(Post, site=custom_admin_site)
class PostAdmin(admin.ModelAdmin):  # type: ignore[type-arg]
    list_display = (
        'title', 'status', 'estimated_read_time', 'total_read_count',
        'categories_list', '_created_at',
    )
    list_filter = ('status', 'categories__name')
    search_fields = ('title', 'description',)
    ordering = ('-created_at',)
    list_editable = ('status',)

    def categories_list(self, obj: Post) -> str:
        return ", ".join([category.name for category in obj.categories.all() if category.name])

    def _created_at(self, obj: Post) -> str:
        return obj.created_at.strftime("%d-%m-%Y %H:%M%p")
    
@admin.register(Category, site=custom_admin_site)
class CategoryAdmin(admin.ModelAdmin):  # type: ignore[type-arg]
    list_display = ('name', 'is_active')
    search_fields = ('name',)
    ordering = ('name',)

