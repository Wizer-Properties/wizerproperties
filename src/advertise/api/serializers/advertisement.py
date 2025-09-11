from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType
from advertise.models import Advertisement


class AdvertisementSerializer(serializers.ModelSerializer):
    # Generic target title (works for Property or Building assuming they expose a `title` or `name` attr)
    content_title = serializers.SerializerMethodField()
    end_at = serializers.SerializerMethodField()
    content_type_id = serializers.PrimaryKeyRelatedField(
        source="content_type",
        queryset=ContentType.objects.filter(model__in=["property", "building"]),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Advertisement
        fields = [
            "id",
            "content_type_id",  # PK of ContentType
            "object_id",        # ID of the related object
            "content_title",
            "ad_location",
            "created_at",
            "end_at",
        ]
        read_only_fields = ["created_at", "end_at", "content_title"]

    def get_end_at(self, obj):
        return obj.end_at()

    def get_content_title(self, obj):
        target = getattr(obj, "content_object", None)
        if not target:
            return None
        # Prefer common title-like attributes
        for attr in ("title", "name", "__str__"):
            if hasattr(target, attr):
                try:
                    value = getattr(target, attr)
                    return value() if callable(value) else value
                except Exception:  # Fallback gracefully
                    continue
        return str(target)


class AdvertisementSuggestionSerializer(serializers.ModelSerializer):
    banner_image = serializers.SerializerMethodField()
    object_id = serializers.IntegerField(read_only=True)
    target_type = serializers.SerializerMethodField()
    target_title = serializers.SerializerMethodField()

    class Meta:
        model = Advertisement
        fields = [
            "id",
            "banner_image",
            "object_id",
            "target_type",
            "target_title",
        ]

    def get_banner_image(self, obj):
        if obj.banner:
            return obj.banner.url
        return None

    def get_target_type(self, obj):
        if obj.content_type:
            return obj.content_type.model  # 'property' or 'building'
        return None

    def get_target_title(self, obj):
        target = getattr(obj, "content_object", None)
        if not target:
            return None
        for attr in ("title", "name", "__str__"):
            if hasattr(target, attr):
                try:
                    val = getattr(target, attr)
                    return val() if callable(val) else val
                except Exception:
                    continue
        return str(target)
