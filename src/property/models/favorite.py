from django.db import models
from django.core.exceptions import ValidationError

from core.models import TimestampedModel
from user.models import ProspectProfile
from property.models import Property


class ProspectFavoriteProperty(TimestampedModel):
    prospect = models.ForeignKey(ProspectProfile, null=True, blank=True, on_delete=models.CASCADE)
    property = models.ForeignKey(Property, null=True, on_delete=models.CASCADE)

    def clean(self, *args, **kwargs):
        super().clean()
        
        # Duplication check
        is_exists = ProspectFavoriteProperty.objects.filter(
            prospect=self.prospect,
            property=self.property,
        ).exists()
        print(is_exists)
        if is_exists:
            raise ValidationError("This Item Is Already in the System")

        