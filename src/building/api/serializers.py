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
        images = request.FILES.getlist("images")
        floor_plans = request.FILES.getlist("floor_plans")
        unit_floor_plans = request.FILES.getlist("unit_floor_plans")
        master_plans = request.FILES.getlist("master_plans")
        videos = request.FILES.getlist("videos")

        # Create BuildingMedia objects for different media types
        media_files = []
        for image_file in images:
            media_file = BuildingMedia(type="image", file=image_file)
            media_file.save()
            media_files.append(media_file)

        for floor_plan_file in floor_plans:
            media_file = BuildingMedia(type="floor_plan", file=floor_plan_file)
            media_file.save()
            media_files.append(media_file)

        for unit_floor_plan_file in unit_floor_plans:
            media_file = BuildingMedia(type="unit_floor_plan", file=unit_floor_plan_file)
            media_file.save()
            media_files.append(media_file)

        for master_plan_file in master_plans:
            media_file = BuildingMedia(type="master_plan", file=master_plan_file)
            media_file.save()
            media_files.append(media_file)

        for video_file in videos:
            media_file = BuildingMedia(type="video", file=video_file)
            media_file.save()
            media_files.append(media_file)

        # Remove unwanted attributes from validated_data for 'Building' instance
        skip_attributes = ["images", "floor_plans", "unit_floor_plans", "master_plans", "videos"]
        for attr in skip_attributes:
            validated_data.pop(attr, None)

        building = Building.objects.create(**validated_data)
        building.media_files.set(media_files)

        return building
