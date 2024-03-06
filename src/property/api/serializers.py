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
    all_media_files = PropertyMediaSerializer(source="media_files", many=True, read_only=True)
    building_info = serializers.SerializerMethodField()
    images = serializers.ImageField(allow_empty_file=False, write_only=True)
    videos = serializers.FileField(allow_empty_file=False, write_only=True)
    default_image = serializers.URLField(source="default_image_url", read_only=True)
    is_compared = serializers.BooleanField(read_only=True)
    is_favorited = serializers.BooleanField(read_only=True)
    discount_period = serializers.DateField(source="discountproperty_set.first.period", read_only=True)

    class Meta:
        model = Property
        fields = [
            "id",
            "building",
            "unit_id",
            "title",
            "default_image",
            "all_media_files",
            "description",
            "price",
            "price_per_sqm",
            "floor_number",
            "unit_area",
            "interior_view",
            "number_of_bedroom",
            "number_of_bathroom",
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
            "discount_period",
            "is_active",
            "is_compared",
            "is_favorited",
            "images",
            "videos",
            "building_info",
        ]
        extra_kwargs = {
            "building": {"write_only": True},  # Exclude the building field from the response
        }

    # Validate that all fields are required and not blank
    def __init__(self, *args, **kwargs):
        super(PropertySerializer, self).__init__(*args, **kwargs)
        self.request = self.context.get("request")

        for field_name, field in self.fields.items():
            if field_name not in ["tenant_occupied_validity", "discount_period"]:
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

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Filter type 'image'
        if self.request and self.request.method == "GET":
            representation["all_media_files"] = [
                media for media in representation["all_media_files"] if media["type"] == "image"
            ]
            # Return only the 'file' field
            representation["all_media_files"] = [
                urlsplit(media["file"]).path for media in representation["all_media_files"]
            ]
        return representation

    def get_fields(self):
        fields = super().get_fields()
        if self.request and self.request.method in ["POST", "PUT", "PATCH"]:  # Check request method and view
            # Remove these fields during create and update
            fields.pop("all_media_files", None)
            fields.pop("default_image", None)
            fields.pop("is_compared", None)
            fields.pop("is_favorited", None)
        return fields

    def get_media_files(self, request):
        return {
            "image": self.request.FILES.getlist("images"),
            "video": self.request.FILES.getlist("videos"),
        }

    # 'ModelSerializer' does not directly allow you to modify the queryset while calling it
    def get_building_info(self, obj):
        if obj.building:
            building = (
                Building.objects.filter(id=obj.building.id)
                .annotate(
                    default_image_url=Subquery(
                        BuildingMedia.objects.filter(building=OuterRef("pk"), type="image")
                        .annotate(full_file_url=Concat(Value("/media/"), F("file"), output_field=CharField()))
                        .values("full_file_url")[:1]
                    ),
                    is_reviewed=(
                        Case(
                            When(buildingreview__user=self.request.user, then=True),
                            default=False,
                            output_field=BooleanField(),
                        )
                        if self.request
                        and self.request.user.is_authenticated
                        and hasattr(self.request.user, "prospectprofile")
                        else Value(None, output_field=CharField())
                    ),
                    average_rating=Avg("buildingreview__rating"),
                    total_reviews=Count("buildingreview"),
                )
                .first()
            )
            return BuildingVariousFeatureSerializer(building).data
        else:
            return None

    def create(self, validated_data):
        media_files_data = self.get_media_files(self.request)

        # Create PropertyMedia objects for different media types
        media_files = []
        for media_type, files in media_files_data.items():
            for file in files:
                media_file = PropertyMedia(type=media_type, file=file)
                media_file.save()
                media_files.append(media_file)

        # Remove unwanted attributes from validated_data for 'Property' instance
        for attr in ["is_active", "images", "videos"]:
            validated_data.pop(attr, None)

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


class PropertyAvailableUnitsForBuildingSerializer(serializers.ModelSerializer):
    default_image = serializers.URLField(source="default_image_url", read_only=True)

    class Meta:
        model = Property
        fields = [
            "id",
            "title",
            "default_image",
            "description",
            "price",
            "price_per_sqm",
            "floor_number",
            "unit_area",
            "number_of_bedroom",
            "number_of_bathroom",
        ]


class PropertyAvailableUnitsSerializer(PropertyAvailableUnitsForBuildingSerializer):
    discount_period = serializers.DateField(source="discountproperty_set.first.period", read_only=True)

    class Meta(PropertyAvailableUnitsForBuildingSerializer.Meta):
        fields = PropertyAvailableUnitsForBuildingSerializer.Meta.fields + [
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
            "discount_period",
            "is_active",
        ]


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
class GeneralPropertySerializer(serializers.ModelSerializer):
    building_type = serializers.CharField(source="building.type", read_only=True)
    building_address = serializers.CharField(source="building.address", read_only=True)
    default_image = serializers.URLField(source="default_image_url", read_only=True)
    is_compared = serializers.BooleanField(read_only=True)
    is_favorited = serializers.BooleanField(read_only=True)
    discount_period = serializers.DateField(source="discountproperty_set.first.period", read_only=True)

    class Meta:
        model = Property
        fields = [
            "id",
            "building_type",
            "building_address",
            "title",
            "default_image",
            "description",
            "floor_number",
            "unit_area",
            "interior_view",
            "number_of_bedroom",
            "number_of_bathroom",
            "discount_period",
            "is_compared",
            "is_favorited",
        ]
