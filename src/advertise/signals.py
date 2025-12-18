from typing import Any, Type
from django.db.models.signals import post_save
from django.dispatch import receiver
from advertise.models import Advertisement, AdDemography

@receiver(post_save, sender=Advertisement)
def create_demography_object_for_advertisement(sender: Type[Advertisement], instance: Advertisement, created: bool, **kwargs: Any) -> None:
    if created:
        AdDemography.objects.create(advertisement=instance)