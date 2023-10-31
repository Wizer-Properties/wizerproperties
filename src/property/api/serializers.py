from django.db import transaction
from django.db.models import OuterRef, Subquery, Value, F, CharField
from django.db.models.functions import Concat
from rest_framework import serializers
from property.models import Property, PropertyMedia, CompareProperty
from building.models import Building, BuildingMedia
from building.api.serializers import BuildingSerializer
from utils.general_func import show_custom_error_message


class PropertyMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyMedia
        fields = ["id", "file", "type"]


class PropertySerializer(serializers.ModelSerializer):
    building_info = serializers.SerializerMethodField()
    images = serializers.ImageField(allow_empty_file=False, write_only=True)
    videos = serializers.FileField(allow_empty_file=False, write_only=True)
    default_image = serializers.URLField(source="default_image_url", read_only=True)

    class Meta:
        model = Property
        fields = [
            "id",
            "building",
            "unit_id",
            "title",
            "default_image",
            "description",
            "price",
            "price_per_sqm",
            "floor_number",
            "unit_area",
            "number_of_bedroom",
            "number_of_bathroom",
            "number_of_balcony",
            "number_of_car_parking",
            "is_active",
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
            if self.instance is not None and field_name in ["images", "videos"]:
                field.required = False
            else:
                field.required = True
                field.allow_null = False
                field.allow_blank = False

        show_custom_error_message(self.fields)

    def get_fields(self):
        fields = super().get_fields()
        if self.request and self.request.method in ["POST", "PUT", "PATCH"]:  # Check request method and view
            fields.pop("default_image", None)  # Remove default_image field during create and update
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
                    )
                )
                .first()
            )
            return BuildingSerializer(building).data
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
        skip_attributes = ["is_active", "images", "videos"]
        for attr in skip_attributes:
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
                        if media_type == "video":
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

    def get_property_info(self, obj):
        if obj.property:
            property = (
                Property.objects.filter(id=obj.property.id)
                .annotate(
                    default_image_url=Subquery(
                        PropertyMedia.objects.filter(property=OuterRef("pk"), type="image")
                        .annotate(full_file_url=Concat(Value("/media/"), F("file"), output_field=CharField()))
                        .values("full_file_url")[:1]
                    )
                )
                .first()
            )
            return PropertySerializer(property).data
        else:
            return None


class PropertyAvailableUnitsSerializer(serializers.ModelSerializer):
    default_image = serializers.URLField(source="default_image_url", read_only=True)

    class Meta:
        model = Property
        fields = [
            "id",
            "building",
            "unit_id",
            "title",
            "default_image",
            "description",
            "price",
            "price_per_sqm",
            "floor_number",
            "unit_area",
            "number_of_bedroom",
            "number_of_bathroom",
            "number_of_balcony",
            "number_of_car_parking",
            "is_active",
        ]
