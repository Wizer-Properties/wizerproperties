from rest_framework import serializers
from django.core.exceptions import ValidationError
from django.contrib.contenttypes.models import ContentType
from schedule.models import VisitingSchedule
from utils.general_func import rename_dict_key

class VisitingScheduleSerializer(serializers.ModelSerializer):
    content_type = serializers.CharField(source="content_type.model", read_only=True)
    status = serializers.CharField(source="get_status_display", read_only=True)
    content_type_name = serializers.CharField(write_only=True, required=False)
    title = serializers.SerializerMethodField()
    address = serializers.SerializerMethodField()

    class Meta:
        model = VisitingSchedule
        fields = (
            "id",
            "visiting_time",
            "status",
            "content_type",
            "content_type_name",
            "object_id",
            "title",
            "address",
        )

    def validate(self, attrs):
        """Since we are using GenericForeingKey field 'content_type' to store content type value.
        This field takes 'pk' value, store that object but wants to provide model name as value.
        That's why we we are setting content_type value manually"""
        error_messages = {} # Error messages will append here
        content_type_name = attrs.pop('content_type_name', None)
        content_type = ContentType.objects.filter(model=content_type_name).first()

        if self.context["request"].method == "PATCH":
            instance = self.instance
            if instance.status != "pending":
                raise serializers.ValidationError("Can not update visiting schedule")

            instance_order_dict = (
                instance.__dict__
            )  # VisitingSchedule instance OrderDict
            attrs = instance_order_dict | attrs  # Updating 'instance' OrderDict value with new value

            """'attrs' will contains only those key, which are update able"""
            attrs = {field: attrs[field] for field in ["visiting_time", "content_type_id", "object_id"]}

        if content_type:
            attrs["content_type"] = content_type

        object_id = attrs.get("object_id", None)
        if content_type and object_id:
            try:
                content_type.model_class().objects.get(id=object_id)
            except:
                error_messages.update({"object_id": "Invalid object_id"})

        """We are assigning requested user as prospect"""
        attrs["prospect"] = self.context["request"].user.prospectprofile
        instance = VisitingSchedule(**attrs)
        try:
            instance.full_clean()
        except ValidationError as e:
            error_messages.update(e.message_dict)

        if error_messages:
            error_messages = rename_dict_key(
                data_dict=error_messages, key_list=[["content_type", "content_type_name"]]
            )  # Custom function to rename dictionary key
            raise serializers.ValidationError(error_messages)

        return attrs


    def get_title(self, obj):
        return obj.content_object.title

    def get_address(self, obj):
        return obj.content_object.address
