from django.db import transaction
from rest_framework import serializers
from property.models import Property, PropertyMedia
from utils.general_func import show_custom_error_message
from .default import PropertySerializer


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
