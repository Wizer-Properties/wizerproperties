from django.db.models import OuterRef, Subquery, Value, F, CharField, When, Case, BooleanField
from django.db.models.functions import Concat
from rest_framework import serializers
from property.models import Property, PropertyMedia, ProspectFavoriteProperty
from .default import PropertySerializer


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
