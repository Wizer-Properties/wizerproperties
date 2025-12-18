from django.apps import AppConfig

class AdvertiseConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'advertise'
    verbose_name = 'Advertisement'  # Display name in Django admin

    def ready(self) -> None:
        import advertise.signals
