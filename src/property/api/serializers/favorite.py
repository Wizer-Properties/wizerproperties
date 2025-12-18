from django.db.models import OuterRef, Subquery, Value, F, CharField, When, Case, BooleanField
from django.db.models.functions import Concat
from rest_framework import serializers
from typing import Any, Dict, List, Optional, cast, TYPE_CHECKING
from property.models import Property, PropertyMedia, ProspectFavoriteProperty
from .favorite_list import PropertyFavoriteListSerializer

if TYPE_CHECKING:
    _Base = serializers.ModelSerializer[ProspectFavoriteProperty]
else:
    _Base = serializers.ModelSerializer


class ProspectFavoritePropertySerializer(_Base):
    property_info = serializers.SerializerMethodField()

    class Meta:
        model = ProspectFavoriteProperty
        fields = ["id", "prospect", "property", "property_info"]
        extra_kwargs = {"property": {"required": False, "allow_null": False, "write_only": True}}

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        instance = ProspectFavoriteProperty(**attrs)
        request = self.context.get("request")
        prospect = request.user.prospectprofile if request and hasattr(request.user, "prospectprofile") else None

        instance.prospect = prospect
        instance.full_clean()  # Perform full validation before saving

        return attrs

    def create(self, validated_data: Dict[str, Any]) -> ProspectFavoriteProperty:
        instance = super().create(validated_data)
        request = self.context.get("request")
        if request and hasattr(request.user, "prospectprofile"):
            instance.prospect = request.user.prospectprofile
            instance.save()
        return instance

    def get_property_info(self, obj: ProspectFavoriteProperty) -> Any:
        request = self.context.get("request")
        if request and request.method == "GET" and obj.property:
            property_obj = (
                Property.objects.filter(id=cast(Any, obj.property).id)
                .annotate(
                    default_image_url=Subquery(
                        PropertyMedia.objects.filter(property=OuterRef("pk"), type="image")
                        .annotate(full_file_url=Concat(Value("/media/"), F("file"), output_field=CharField()))
                        .values("full_file_url")[:1]
                    ),
                    is_compared=Case(
                        When(compares__user__prospectprofile=obj.prospect, then=Value(True)),
                        default=Value(False),
                        output_field=BooleanField(),
                    ),
                    is_favorited=Case(
                        When(favorites__prospect=obj.prospect, then=Value(True)),
                        default=Value(False),
                        output_field=BooleanField(),
                    ),
                )
                .first()
            )
            return PropertyFavoriteListSerializer(property_obj).data
        else:
            return obj.property.title if obj.property else ""
