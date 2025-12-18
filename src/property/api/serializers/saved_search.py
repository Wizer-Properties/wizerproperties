from rest_framework import serializers
from typing import Any, Dict, cast
from property.models import SavedSearch


class SavedSearchSerializer(serializers.ModelSerializer): # type: ignore[type-arg]
    """
    Serializer for SavedSearch model.
    Handles creation, update, and retrieval of saved property searches.
    """
    
    class Meta:
        model = SavedSearch
        fields = [
            "id",
            "name",
            "search_params",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_name(self, value: str) -> str:
        """Validate that the search name is not empty."""
        if not value or not value.strip():
            raise serializers.ValidationError("Search name cannot be empty.")
        return value.strip()

    def validate_search_params(self, value: Dict[str, Any]) -> Dict[str, Any]:
        """Validate that search_params is a dictionary."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("search_params must be a dictionary.")
        return value

    def create(self, validated_data: Dict[str, Any]) -> SavedSearch:
        """Create a new saved search for the authenticated user's prospect profile."""
        user = self.context["request"].user
        if not hasattr(user, "prospectprofile"):
            raise serializers.ValidationError("Only prospects can save searches.")
        
        validated_data["prospect"] = user.prospectprofile
        return cast(SavedSearch, super().create(validated_data))

