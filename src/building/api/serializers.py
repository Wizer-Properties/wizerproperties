from urllib.parse import urlsplit
from django.db import transaction
from rest_framework import serializers
from building.models import Building, BuildingMedia, BuildingReview
from utils.general_func import show_custom_error_message
from user.api.serializers import DeveloperProfileSerializer, AgentProfileSerializer


class BuildingMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuildingMedia
        fields = ["id", "file", "type"]

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        # Use urlsplit to get the path component
        file_path = representation.get("file", "")
        url_parts = urlsplit(file_path)
        modified_file_path = url_parts.path

        representation["file"] = modified_file_path

        return representation


class BuildingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Building
        fields = [
            "id",
            "title",
            "description",
            "type",
            "total_units_for_sale",
            "address",
            "project_total_area",
            "total_floors",
            "facility_view",
            "location_view",
        ]


class BuildingDetailsSerializer(BuildingSerializer):
    default_images = serializers.SerializerMethodField()

    class Meta(BuildingSerializer.Meta):
        fields = BuildingSerializer.Meta.fields + [
            "lowest_price",
            "highest_price",
            "latitude",
            "longitude",
            "construction_year",
            "default_images",
        ]

    def get_default_images(self, obj):
        images = obj.media_files.filter(type="image")
        return BuildingMediaSerializer(images, many=True).data


# Serializer for handling popular buildings.
# This serializer is designed to retrieve a list of buildings with various attributes.
class BuildingVariousFeatureSerializer(BuildingSerializer):
    default_image = serializers.URLField(source="default_image_url", read_only=True)

    class Meta(BuildingSerializer.Meta):
        fields = BuildingSerializer.Meta.fields + [
            "default_image",
            "have_access_to_BTS_or_MRT",
            "have_access_to_ARL",
            "view",
            "have_freehold",
            "have_leasehold",
            "have_infinity_pool",
            "have_pets_allowed",
            "have_guard_house",
            "have_sauna",
            "have_sky_lounge",
            "have_grocery",
            "have_fitness_area",
        ]


class BuildingListSerializer(BuildingSerializer):
    created_by = serializers.CharField(source="created_by.username", read_only=True)

    class Meta(BuildingSerializer.Meta):
        fields = BuildingSerializer.Meta.fields + [
            "lowest_price",
            "highest_price",
            "latitude",
            "longitude",
            "province",
            "district",
            "sub_district",
            "construction_year",
            "quota",
            "furnishing",
            "have_access_to_BTS_or_MRT",
            "have_access_to_ARL",
            "view",
            "have_freehold",
            "have_leasehold",
            "have_infinity_pool",
            "have_pets_allowed",
            "have_guard_house",
            "have_sauna",
            "have_sky_lounge",
            "have_grocery",
            "have_fitness_area",
            "is_active",
            "created_by",
        ]


class BuildingCreateAndUpdateSerializer(BuildingListSerializer):
    images = serializers.ImageField(allow_empty_file=False, write_only=True)
    floor_plans = serializers.ImageField(allow_empty_file=False, write_only=True)
    unit_floor_plans = serializers.ImageField(allow_empty_file=False, write_only=True)
    master_plans = serializers.ImageField(allow_empty_file=False, write_only=True)
    videos = serializers.FileField(allow_empty_file=False, write_only=True)
    aerial_drone_videos = serializers.FileField(allow_empty_file=False, write_only=True)

    class Meta(BuildingListSerializer.Meta):
        fields = BuildingListSerializer.Meta.fields + [
            "images",
            "floor_plans",
            "unit_floor_plans",
            "master_plans",
            "videos",
            "aerial_drone_videos",
        ]

    # Validate that all fields are required and not blank
    def __init__(self, *args, **kwargs):
        super(BuildingCreateAndUpdateSerializer, self).__init__(*args, **kwargs)
        self.request = self.context.get("request")

        self.skip_attributes = [
            "is_active",
            "images",
            "floor_plans",
            "unit_floor_plans",
            "master_plans",
            "videos",
            "aerial_drone_videos",
        ]

        for field_name, field in self.fields.items():
            # These fields are not required while update
            if self.instance is not None and field_name in [
                "sub_district",
                "images",
                "floor_plans",
                "unit_floor_plans",
                "master_plans",
                "videos",
                "aerial_drone_videos",
            ]:
                field.required = False
            else:
                # These fields are not required while create
                if field_name not in [
                    "sub_district",
                ]:
                    field.required = True
                    field.allow_null = False
                    field.allow_blank = False

        show_custom_error_message(self.fields)

    def validate(self, data):
        error_messages = {}

        if self.request.method == "PATCH" and data.get("is_active") is None:
            error_messages.update({"is_active": "This field is required."})

        if self.request.method in ["POST", "PUT"]:
            # Remove unwanted attributes from data for 'Building' instance
            for attr in self.skip_attributes:
                data.pop(attr, None)

            instance = Building(**data)
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
            "image": request.FILES.getlist("images"),
            "floor_plan": request.FILES.getlist("floor_plans"),
            "unit_floor_plan": request.FILES.getlist("unit_floor_plans"),
            "master_plan": request.FILES.getlist("master_plans"),
            "video": request.FILES.getlist("videos"),
            "aerial_drone_video": request.FILES.getlist("aerial_drone_videos"),
        }

    def create(self, validated_data):
        media_files_data = self.get_media_files(self.request)
        # Create BuildingMedia objects for different media types
        media_files = []
        for media_type, files in media_files_data.items():
            for file in files:
                media_file = BuildingMedia(type=media_type, file=file)
                media_file.save()
                media_files.append(media_file)

        building = Building.objects.create(**validated_data, created_by=self.request.user)
        building.media_files.set(media_files)

        return building

    def update(self, instance, validated_data):
        media_files_data = self.get_media_files(self.request)
        deleted_images = self.request.data.getlist("deleted_images")

        # Reverting any changes made to the instance media files field, If no exception occurs the changes will be committed when the block exits
        with transaction.atomic():
            try:
                # Update BuildingMedia objects for different media types
                for media_type, files in media_files_data.items():
                    for file in files:
                        if media_type in [
                            "video",
                            "aerial_drone_video",
                        ]:
                            instance.media_files.filter(type=media_type).update(file=file)
                        else:
                            media_file = BuildingMedia(type=media_type, file=file)
                            media_file.save()
                            instance.media_files.add(media_file)

                # Check if all deleted_images are deletable
                remaining_file_types = instance.media_files.exclude(id__in=deleted_images).values_list(
                    "type", flat=True
                )

                if (
                    "image" not in remaining_file_types
                    or "floor_plan" not in remaining_file_types
                    or "unit_floor_plan" not in remaining_file_types
                    or "master_plan" not in remaining_file_types
                    or "video" not in remaining_file_types
                    or "aerial_drone_video" not in remaining_file_types
                ):
                    raise serializers.ValidationError(
                        {
                            "media_files": [
                                "At least one image of every type of media file must remain with the building."
                            ]
                        }
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


class BuildingReviewSerializer(serializers.ModelSerializer):
    reviewer_details = serializers.SerializerMethodField()

    class Meta:
        model = BuildingReview
        fields = ["id", "building", "rating", "review_text", "reviewer_details", "created_at"]
        extra_kwargs = {
            "rating": {"required": True, "allow_null": False},
            "review_text": {"required": True, "allow_null": False},
            "building": {"write_only": True, "required": True, "allow_null": False},
        }

    def validate(self, attrs):
        instance = BuildingReview(**attrs)
        user = self.context["request"].user

        instance.user = user
        instance.full_clean()  # Perform full validation before saving

        return attrs

    def create(self, request, *args, **kwargs):
        instance = super().create(request, *args, **kwargs)
        instance.user = self.context["request"].user
        instance.save()
        return instance

    def get_reviewer_details(self, instance):
        if instance.user:
            user_details = {}
            if instance.user.prospectprofile:
                prospect = instance.user.prospectprofile
                user_details["fullname"] = f"{prospect.first_name} {prospect.last_name}"

            return {"id": instance.user.id, "user_type": instance.user.user_type, **user_details}
        return {}
