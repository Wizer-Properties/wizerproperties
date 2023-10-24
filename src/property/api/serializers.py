from rest_framework import serializers
from property.models import Property, PropertyMedia, CompareProperty
from building.api.serializers import BuildingMediaSerializer
from utils.general_func import show_custom_error_message


class PropertyMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyMedia
        fields = ["id", "type", "file"]


class PropertySerializer(serializers.ModelSerializer):
    images = serializers.ImageField(allow_empty_file=False, write_only=True)
    unit_plans = serializers.ImageField(allow_empty_file=False, write_only=True)
    videos = serializers.FileField(allow_empty_file=False, write_only=True)
    media_files = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = [
            "id",
            "building",
            "unit_id",
            "title",
            "description",
            "price",
            "floor_number",
            "unit_area",
            "number_of_bedroom",
            "number_of_bathroom",
            "number_of_balcony",
            "number_of_car_parking",
            "is_active",
            "media_files",
            "images",
            "unit_plans",
            "videos",
        ]

    # Validate that all fields are required and not blank
    def __init__(self, *args, **kwargs):
        super(PropertySerializer, self).__init__(*args, **kwargs)
        self.request = self.context.get("request")

        # To check the view action (list or retrieve)
        self.view_action = self.context.get("view").action

        # If the action is not 'retrieve', remove media_files field
        if self.view_action != "retrieve":
            self.fields.pop("media_files")

        self.media_files_data = {
            "image": self.request.FILES.getlist("images"),
            "unit_plan": self.request.FILES.getlist("unit_plans"),
            "video": self.request.FILES.getlist("videos"),
        }

        for field_name, field in self.fields.items():
            if self.instance is not None and field_name in ["images", "unit_plans", "videos"]:
                field.required = False
            else:
                field.required = True
                field.allow_null = False
                field.allow_blank = False

        show_custom_error_message(self.fields)

    def create(self, validated_data):
        # Create PropertyMedia objects for different media types
        media_files = []
        for media_type, files in self.media_files_data.items():
            for file in files:
                media_file = PropertyMedia(type=media_type, file=file)
                media_file.save()
                media_files.append(media_file)

        # Remove unwanted attributes from validated_data for 'Property' instance
        skip_attributes = ["is_active", "images", "unit_plans", "videos"]
        for attr in skip_attributes:
            validated_data.pop(attr, None)

        property = Property.objects.create(**validated_data, created_by=self.request.user)
        property.media_files.set(media_files)

        return property

    def update(self, instance, validated_data):
        deleted_images = self.request.data.getlist("deleted_images")

        # Check if all deleted_images are deletable
        remaining_file_types = instance.media_files.exclude(id__in=deleted_images).values_list("type", flat=True)

        if (
            "image" not in remaining_file_types
            or "unit_plan" not in remaining_file_types
            or "video" not in remaining_file_types
        ):
            raise serializers.ValidationError(
                {"media_files": ["At least one image every type of media file must remain with the property."]}
            )
        else:
            # Delete the deletable images
            instance.media_files.filter(id__in=deleted_images).delete()

        # Update PropertyMedia objects for different media types
        for media_type, files in self.media_files_data.items():
            for file in files:
                media_file = PropertyMedia(type=media_type, file=file)
                media_file.save()
                instance.media_files.add(media_file)

        return super().update(instance, validated_data)

    def get_media_files(self, obj):
        # We represent media files only the property details to avoid nested serialization
        if self.view_action == "retrieve":
            # Get building media files excluding "image" and "video" types
            building_media_files = obj.building.media_files.exclude(type__in=["image", "video"])
            building_media_serializer = BuildingMediaSerializer(building_media_files, many=True)

            # Get property media files including all types
            property_media_files = obj.media_files.all()
            property_media_serializer = PropertyMediaSerializer(property_media_files, many=True)

            # Combine and return the media files from building and property
            return building_media_serializer.data + property_media_serializer.data
        else:
            return None


class ComparePropertySerializer(serializers.ModelSerializer):
    class Meta:
        model = CompareProperty
        fields = ["user", "property"]
