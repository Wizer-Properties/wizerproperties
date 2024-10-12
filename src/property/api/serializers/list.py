from django.utils import timezone
from rest_framework import serializers
from .default import PropertySerializer
from .media import PropertyMediaSerializer


class PropertyListSerializer(PropertySerializer):
    building_title = serializers.CharField(source="building.title", read_only=True)
    building_type = serializers.CharField(source="building.type", read_only=True)
    building_sub_type = serializers.CharField(source="building.get_sub_type_display", read_only=True)
    building_status = serializers.CharField(source="building.get_status_display", read_only=True)
    address = serializers.CharField(source="building.address", read_only=True)
    have_freehold = serializers.BooleanField(source="building.have_freehold", read_only=True)
    have_leasehold = serializers.BooleanField(source="building.have_leasehold", read_only=True)
    have_infinity_pool = serializers.BooleanField(source="building.have_infinity_pool", read_only=True)
    have_pets_allowed = serializers.BooleanField(source="building.have_pets_allowed", read_only=True)
    have_guard_house = serializers.BooleanField(source="building.have_guard_house", read_only=True)
    have_sauna = serializers.BooleanField(source="building.address", read_only=True)
    have_sky_lounge = serializers.BooleanField(source="building.have_sky_lounge", read_only=True)
    have_grocery = serializers.BooleanField(source="building.have_grocery", read_only=True)
    have_fitness_area = serializers.BooleanField(source="building.have_fitness_area", read_only=True)
    developer_email = serializers.CharField(source="created_by.email", read_only=True)
    developer_image = serializers.SerializerMethodField()
    developer_phone_number = serializers.SerializerMethodField()
    developer_company_name = serializers.SerializerMethodField()
    is_compared = serializers.BooleanField(read_only=True)
    is_favorited = serializers.BooleanField(read_only=True)
    ariel_view = serializers.URLField(source="ariel_video_url", read_only=True)
    total_default_images = serializers.SerializerMethodField()
    default_images = serializers.SerializerMethodField()
    tag = serializers.SerializerMethodField()
    discount_period = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()

    class Meta(PropertySerializer.Meta):
        fields = PropertySerializer.Meta.fields + [
            "interior_view",
            "building_id",
            "building_title",
            "building_type",
            "building_sub_type",
            "building_status",
            "address",
            "have_freehold",
            "have_leasehold",
            "have_infinity_pool",
            "have_pets_allowed",
            "have_guard_house",
            "have_sauna",
            "have_sky_lounge",
            "have_grocery",
            "have_fitness_area",
            "developer_image",
            "developer_email",
            "developer_phone_number",
            "developer_company_name",
            "is_compared",
            "is_favorited",
            "ariel_view",
            "total_default_images",
            "tag",
            "discount_period",
            "default_images",
            "images",
        ]

    def get_default_images(self, obj):
        request = self.context.get("request")
        images = obj.media_files.filter(type="image")

        # Determine the number of default_images to return in the list based on the provided default_images_number parameter.
        default_images_number = request.GET.get("default_images_number")
        if default_images_number:
            images = images[: int(default_images_number)]

        return PropertyMediaSerializer(images, many=True).data

    def get_total_default_images(self, obj):
        total_images = obj.media_files.filter(type="image").count()
        return total_images

    def get_developer_image(self, obj):
        user = obj.created_by

        if hasattr(user, "developerprofile"):
            return user.developerprofile.company_logo.url
        elif hasattr(user, "agentprofile"):
            return user.agentprofile.company_logo.url

        return ""

    def get_developer_phone_number(self, obj):
        user = obj.created_by

        if hasattr(user, "developerprofile"):
            return str(user.developerprofile.phone_number)
        elif hasattr(user, "agentprofile"):
            return str(user.agentprofile.phone_number)

        return ""

    def get_developer_company_name(self, obj):
        user = obj.created_by

        if hasattr(user, "developerprofile"):
            return str(user.developerprofile.company_name)
        elif hasattr(user, "agentprofile"):
            return str(user.agentprofile.company_name)

        return ""

    def get_tag(self, obj):
        """The ordering of tag is important. Depending of tag value we are providing
        instance custom style
        """
        tag = ""
        if obj.discounted:
            tag = "spotlight"
        elif obj.featured:
            tag = "feature"
        elif obj.newly_createds.exists():
            tag = "newly_created"

        return tag

    def get_images(self, obj):
        request = self.context.get("request")
        platform = request.GET.get("platform")

        if obj.featured or obj.discounted:
            if platform == "web":
                images = obj.media_files.filter(type="image")[1:4]
                return PropertyMediaSerializer(images, many=True).data

        return []

    def get_discount_period(self, obj):
        if obj.discounted:
            first_discount = obj.discounts.first()
            return first_discount.period
        return None
