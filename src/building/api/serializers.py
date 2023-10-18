from rest_framework import serializers
from building.models import Building, BuildingMedia
from utils.general_func import show_custom_error_message


class BuildingMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuildingMedia
        fields = ["id", "type", "file"]


class BuildingSerializer(serializers.ModelSerializer):
    media_files = BuildingMediaSerializer(many=True, read_only=True)
    images = serializers.ImageField(allow_empty_file=False, write_only=True)
    floor_plans = serializers.ImageField(allow_empty_file=False, write_only=True)
    unit_floor_plans = serializers.ImageField(allow_empty_file=False, write_only=True)
    master_plans = serializers.ImageField(allow_empty_file=False, write_only=True)
    videos = serializers.FileField(allow_empty_file=False, write_only=True)

    class Meta:
        model = Building
        fields = [
            "id",
            "title",
            "description",
            "price",
            "type",
            "total_units_for_sale",
            "media_files",
            "address",
            "project_total_area",
            "total_floors",
            "construction_year",
            "have_lake_or_river_view",
            "have_guard_house",
            "have_sauna",
            "have_sky_lounge",
            "have_grocery",
            "have_fitness_area",
            "is_active",
            "images",
            "floor_plans",
            "unit_floor_plans",
            "master_plans",
            "videos",
        ]

    # Validate that all fields are required and not blank
    def __init__(self, *args, **kwargs):
        super(BuildingSerializer, self).__init__(*args, **kwargs)
        self.request = self.context.get("request")

        self.media_files_data = {
            "image": self.request.FILES.getlist("images"),
            "floor_plan": self.request.FILES.getlist("floor_plans"),
            "unit_floor_plan": self.request.FILES.getlist("unit_floor_plans"),
            "master_plan": self.request.FILES.getlist("master_plans"),
            "video": self.request.FILES.getlist("videos"),
        }

        for field_name, field in self.fields.items():
            # These fields are not required while update
            if self.instance is not None and field_name in [
                "images",
                "floor_plans",
                "unit_floor_plans",
                "master_plans",
                "videos",
            ]:
                field.required = False
            else:
                # All fields are required while create
                field.required = True
                field.allow_null = False
                field.allow_blank = False

        show_custom_error_message(self.fields)

    def create(self, validated_data):
        # Create BuildingMedia objects for different media types
        media_files = []
        for media_type, files in self.media_files_data.items():
            for file in files:
                media_file = BuildingMedia(type=media_type, file=file)
                media_file.save()
                media_files.append(media_file)

        # Remove unwanted attributes from validated_data for 'Building' instance
        skip_attributes = ["is_active", "images", "floor_plans", "unit_floor_plans", "master_plans", "videos"]
        for attr in skip_attributes:
            validated_data.pop(attr, None)

        building = Building.objects.create(**validated_data, created_by=self.request.user)
        building.media_files.set(media_files)

        return building

    def update(self, instance, validated_data):
        deleted_images = self.request.data.getlist("deleted_images")

        # Check if all deleted_images are deletable
        remaining_file_types = instance.media_files.exclude(id__in=deleted_images).values_list("type", flat=True)

        if (
            "image" not in remaining_file_types
            or "floor_plan" not in remaining_file_types
            or "unit_floor_plan" not in remaining_file_types
            or "master_plan" not in remaining_file_types
            or "video" not in remaining_file_types
        ):
            raise serializers.ValidationError(
                {"media_files": ["At least one image every type of media file must remain with the building."]}
            )
        else:
            # Delete the deletable images
            instance.media_files.filter(id__in=deleted_images).delete()

        # Update BuildingMedia objects for different media types
        for media_type, files in self.media_files_data.items():
            for file in files:
                media_file = BuildingMedia(type=media_type, file=file)
                media_file.save()
                instance.media_files.add(media_file)

        return super().update(instance, validated_data)
