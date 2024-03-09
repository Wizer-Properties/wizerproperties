from urllib.parse import urlsplit
from django.db import transaction
from django.db.models import OuterRef, Subquery, Value, F, CharField, When, Case, BooleanField, Avg, Count
from django.db.models.functions import Concat
from rest_framework import serializers
from property.models import Property, PropertyMedia, CompareProperty, ProspectFavoriteProperty
from building.models import Building, BuildingMedia
from building.api.serializers import BuildingVariousFeatureSerializer
from utils.general_func import show_custom_error_message


class PropertyMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyMedia
        fields = ["id", "file", "type"]


class PropertySerializer(serializers.ModelSerializer):

    class Meta:
        model = Property
        fields = [
            "id",
            "title",
            "description",
            "price",
            "price_per_sqm",
            "floor_number",
            "unit_area",
            "number_of_bedroom",
            "number_of_bathroom",
        ]


class PropertyListSerializer(PropertySerializer):
    building_type = serializers.CharField(source="building.type", read_only=True)
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
    developer_phone_number = serializers.SerializerMethodField()
    developer_image = serializers.SerializerMethodField()
    is_compared = serializers.BooleanField(read_only=True)
    is_favorited = serializers.BooleanField(read_only=True)
    ariel_video = serializers.URLField(source="ariel_video_url")
    total_default_images = serializers.SerializerMethodField()
    default_images = serializers.SerializerMethodField()

    class Meta(PropertySerializer.Meta):
        fields = PropertySerializer.Meta.fields + [
            "interior_view",
            "building_id",
            "building_type",
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
            "is_compared",
            "is_favorited",
            "ariel_video",
            "total_default_images",
            "default_images",
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


class PropertyDetailsSerializer(PropertySerializer):
    building_type = serializers.CharField(source="building.type", read_only=True)
    address = serializers.CharField(source="building.address", read_only=True)
    latitude = serializers.CharField(source="building.latitude", read_only=True)
    longitude = serializers.CharField(source="building.longitude", read_only=True)
    facility_view = serializers.URLField(source="building.facility_view", read_only=True)
    location_view = serializers.URLField(source="building.location_view", read_only=True)
    is_compared = serializers.BooleanField(read_only=True)
    is_favorited = serializers.BooleanField(read_only=True)
    default_images = serializers.SerializerMethodField()

    class Meta(PropertySerializer.Meta):
        fields = PropertySerializer.Meta.fields + [
            "unit_id",
            "interior_view",
            "number_of_balcony",
            "number_of_car_parking",
            "balcony_direction",
            "main_door_direction",
            "unit_position",
            "tenant_occupied_validity",
            "is_active",
            "building_id",
            "building_type",
            "address",
            "latitude",
            "longitude",
            "facility_view",
            "location_view",
            "is_compared",
            "is_favorited",
            "default_images",
        ]

    def get_default_images(self, obj):
        request = self.context.get("request")
        images = obj.media_files.filter(type="image")

        # Determine the number of default_images to return in the list based on the provided default_images_number parameter.
        default_images_number = request.GET.get("default_images_number")
        if default_images_number:
            images = images[: int(default_images_number)]

        return PropertyMediaSerializer(images, many=True).data


class PropertyCreateAndUpdateSerializer(PropertySerializer):
    created_by = serializers.CharField(source="created_by.username", read_only=True)
    images = serializers.ImageField(allow_empty_file=False, write_only=True)
    videos = serializers.FileField(allow_empty_file=False, write_only=True)

    class Meta(PropertySerializer.Meta):
        fields = PropertySerializer.Meta.fields + [
            "building",
            "unit_id",
            "interior_view",
            "number_of_balcony",
            "number_of_car_parking",
            "balcony_direction",
            "main_door_direction",
            "unit_position",
            "have_tenant_occupied",
            "tenant_occupied_validity",
            "have_vacant",
            "have_owner_occupied",
            "have_bathtub",
            "have_duplex",
            "is_active",
            "created_by",
            "images",
            "videos",
        ]

    # Validate that all fields are required and not blank
    def __init__(self, *args, **kwargs):
        super(PropertySerializer, self).__init__(*args, **kwargs)
        self.request = self.context.get("request")

        for field_name, field in self.fields.items():
            if field_name not in ["tenant_occupied_validity"]:
                if self.instance is not None and field_name in ["images", "videos"]:
                    field.required = False
                else:
                    field.required = True
                    field.allow_null = False
                    field.allow_blank = False

        show_custom_error_message(self.fields)

    def validate(self, data):
        """
        Validate the serializer fields.
        """
        error_messages = {}

        have_tenant_occupied = data.get("have_tenant_occupied", False)
        tenant_occupied_validity = data.get("tenant_occupied_validity", None)

        if have_tenant_occupied and not tenant_occupied_validity:
            error_messages.update({"tenant_occupied_validity": ["Tenant Occupied Validity is required."]})

        if self.request.method in ["POST", "PUT"]:
            # Remove unwanted attributes from data for 'Property' instance
            for attr in ["is_active", "images", "videos"]:
                data.pop(attr, None)

            instance = Property(**data)
            instance.created_by = self.request.user
            try:
                instance.full_clean()  # Perform full validation before saving
            except serializers.ValidationError as e:
                error_messages.update(e.message_dict)

        if error_messages:
            raise serializers.ValidationError(error_messages)

        return data

    def get_media_files(self, request):
        return {
            "image": self.request.FILES.getlist("images"),
            "video": self.request.FILES.getlist("videos"),
        }

    def create(self, validated_data):
        media_files_data = self.get_media_files(self.request)

        # Create PropertyMedia objects for different media types
        media_files = []
        for media_type, files in media_files_data.items():
            for file in files:
                media_file = PropertyMedia(type=media_type, file=file)
                media_file.save()
                media_files.append(media_file)

        property = Property.objects.create(**validated_data, created_by=self.request.user)
        property.media_files.set(media_files)

        return property

    def update(self, instance, validated_data):
        media_files_data = self.get_media_files(self.request)
        deleted_images = self.request.data.getlist("deleted_images")

        # Reverting any changes made to the instance media files field, If no exception occurs the changes will be committed when the block exits
        with transaction.atomic():
            try:
                # Update PropertyMedia objects for different media types
                for media_type, files in media_files_data.items():
                    for file in files:
                        if media_type in ["video"]:
                            instance.media_files.filter(type=media_type).update(file=file)
                        else:
                            media_file = PropertyMedia(type=media_type, file=file)
                            media_file.save()
                            instance.media_files.add(media_file)

                # Check if all deleted_images are deletable
                remaining_file_types = instance.media_files.exclude(id__in=deleted_images).values_list(
                    "type", flat=True
                )

                if "image" not in remaining_file_types or "video" not in remaining_file_types:
                    raise serializers.ValidationError(
                        {"media_files": ["At least one image every type of media file must remain with the property."]}
                    )

                # Delete the deletable images
                instance.media_files.filter(id__in=deleted_images).delete()

            except Exception as e:
                # Handle the exception if needed
                raise e

        # To remain unchange active status while Edit
        if self.request.method == "PUT":
            validated_data.pop("is_active", None)

        return super().update(instance, validated_data)


class ComparePropertySerializer(serializers.ModelSerializer):
    property_info = serializers.SerializerMethodField()

    class Meta:
        model = CompareProperty
        fields = ["id", "user", "property", "property_info"]
        extra_kwargs = {
            "property": {"write_only": True},  # Exclude the property field from the response
        }

    def validate(self, attrs):
        instance = CompareProperty(**attrs)
        user = self.context["request"].user

        instance.user = user
        instance.full_clean()  # Perform full validation before saving

        return attrs

    def get_property_info(self, obj):
        if obj.property:
            property = (
                Property.objects.filter(id=obj.property.id)
                .annotate(
                    default_image_url=Subquery(
                        PropertyMedia.objects.filter(property=OuterRef("pk"), type="image")
                        .annotate(full_file_url=Concat(Value("/media/"), F("file"), output_field=CharField()))
                        .values("full_file_url")[:1]
                    ),
                    is_compared=Case(
                        When(compareproperty__user=obj.user, then=Value(True)),
                        default=Value(False),
                        output_field=BooleanField(),
                    ),
                    is_favorited=Case(
                        When(prospectfavoriteproperty__prospect=obj.user.prospectprofile, then=Value(True)),
                        default=Value(False),
                        output_field=BooleanField(),
                    ),
                )
                .first()
            )
            return PropertySerializer(property).data
        else:
            return None


class PropertyAvailableUnitsSerializer(PropertySerializer):
    default_image = serializers.URLField(source="default_image_url", read_only=True)

    class Meta(PropertySerializer.Meta):
        fields = PropertySerializer.Meta.fields + ["default_image"]


class ProspectFavoritePropertySerializer(serializers.ModelSerializer):
    property_info = serializers.SerializerMethodField()

    class Meta:
        model = ProspectFavoriteProperty
        fields = ["id", "prospect", "property", "property_info"]
        extra_kwargs = {"property": {"required": False, "allow_null": False, "write_only": True}}

    def validate(self, attrs):
        instance = ProspectFavoriteProperty(**attrs)
        prospect = self.context["request"].user.prospectprofile

        instance.prospect = prospect
        instance.full_clean()  # Perform full validation before saving

        return attrs

    def create(self, request, *args, **kwargs):
        instance = super().create(request, *args, **kwargs)
        instance.prospect = self.context["request"].user.prospectprofile
        instance.save()
        return instance

    def get_property_info(self, obj):
        if obj.property:
            property = (
                Property.objects.filter(id=obj.property.id)
                .annotate(
                    default_image_url=Subquery(
                        PropertyMedia.objects.filter(property=OuterRef("pk"), type="image")
                        .annotate(full_file_url=Concat(Value("/media/"), F("file"), output_field=CharField()))
                        .values("full_file_url")[:1]
                    ),
                    is_compared=Case(
                        When(compareproperty__user__prospectprofile=obj.prospect, then=Value(True)),
                        default=Value(False),
                        output_field=BooleanField(),
                    ),
                    is_favorited=Case(
                        When(prospectfavoriteproperty__prospect=obj.prospect, then=Value(True)),
                        default=Value(False),
                        output_field=BooleanField(),
                    ),
                )
                .first()
            )
            return PropertySerializer(property).data
        else:
            return None


# Serializer for handling popular, newly added, and discounted properties.
# This serializer is designed to retrieve a list of properties with various attributes.
class PropertyVariousFeatureSerializer(PropertySerializer):
    building_type = serializers.CharField(source="building.type", read_only=True)
    building_address = serializers.CharField(source="building.address", read_only=True)
    default_image = serializers.URLField(source="default_image_url", read_only=True)
    is_compared = serializers.BooleanField(read_only=True)
    is_favorited = serializers.BooleanField(read_only=True)

    class Meta(PropertySerializer.Meta):
        fields = PropertySerializer.Meta.fields + [
            "building_type",
            "building_address",
            "is_compared",
            "is_favorited",
            "default_image",
        ]

    def __init__(self, *args, **kwargs):
        include_discount_period = kwargs.pop("include_discount_period", False)
        super().__init__(*args, **kwargs)

        if include_discount_period:
            self.fields["discount_period"] = serializers.DateField(source="discounts.first.period", read_only=True)
