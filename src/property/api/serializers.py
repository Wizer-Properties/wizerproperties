from rest_framework import serializers
from property.models import Property, PropertyMedia
from utils.general_func import show_custom_error_message


class PropertyMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyMedia
        fields = ["id", "type", "file"]


class PropertySerializer(serializers.ModelSerializer):
    media_files = PropertyMediaSerializer(many=True, read_only=True)
    images = serializers.ImageField(allow_empty_file=False, write_only=True)
    unit_floor_plans = serializers.ImageField(allow_empty_file=False, write_only=True)
    videos = serializers.FileField(allow_empty_file=False, write_only=True)

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
            "media_files",
            "images",
            "unit_floor_plans",
            "videos",
        ]

    # Validate that all fields are required and not blank
    def __init__(self, *args, **kwargs):
        super(PropertySerializer, self).__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            field.required = True
            field.allow_null = False
            field.allow_blank = False

        show_custom_error_message(self.fields)

    def create(self, validated_data):
        request = self.context.get("request")
        media_files_data = {
            "image": request.FILES.getlist("images"),
            "unit_floor_plan": request.FILES.getlist("unit_floor_plans"),
            "video": request.FILES.getlist("videos"),
        }

        # Create PropertyMedia objects for different media types
        media_files = []
        for media_type, files in media_files_data.items():
            for file in files:
                media_file = PropertyMedia(type=media_type, file=file)
                media_file.save()
                media_files.append(media_file)

        # Remove unwanted attributes from validated_data for 'Property' instance
        skip_attributes = ["images", "unit_floor_plans", "videos"]
        for attr in skip_attributes:
            validated_data.pop(attr, None)

        property = Property.objects.create(**validated_data, created_by=request.user)
        property.media_files.set(media_files)

        return property
