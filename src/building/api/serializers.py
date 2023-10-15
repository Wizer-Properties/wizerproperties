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
            "images",
            "floor_plans",
            "unit_floor_plans",
            "master_plans",
            "videos",
        ]

    # Validate that all fields are required and not blank
    def __init__(self, *args, **kwargs):
        super(BuildingSerializer, self).__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            if field_name not in [
                "have_lake_or_river_view",
                "have_guard_house",
                "have_sauna",
                "have_sky_lounge",
                "have_grocery",
                "have_fitness_area",
            ]:
                field.required = True
                field.allow_null = False
                field.allow_blank = False

        show_custom_error_message(self.fields)

    def create(self, validated_data):
        request = self.context.get("request")
        media_files_data = {
            "image": request.FILES.getlist("images"),
            "floor_plan": request.FILES.getlist("floor_plans"),
            "unit_floor_plan": request.FILES.getlist("unit_floor_plans"),
            "master_plan": request.FILES.getlist("master_plans"),
            "video": request.FILES.getlist("videos"),
        }

        # Create BuildingMedia objects for different media types
        media_files = []
        for media_type, files in media_files_data.items():
            for file in files:
                media_file = BuildingMedia(type=media_type, file=file)
                media_file.save()
                media_files.append(media_file)

        # Remove unwanted attributes from validated_data for 'Building' instance
        skip_attributes = ["images", "floor_plans", "unit_floor_plans", "master_plans", "videos"]
        for attr in skip_attributes:
            validated_data.pop(attr, None)

        building = Building.objects.create(**validated_data, created_by=request.user)
        building.media_files.set(media_files)

        return building
