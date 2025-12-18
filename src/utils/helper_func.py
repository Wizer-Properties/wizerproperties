from django.utils import timezone
from django.core.exceptions import ValidationError


def validate_max_current_year(value: int) -> None:
    current_year = timezone.now().year
    if value > current_year:
        raise ValidationError(
            ("Ensure this value is less than or equal to %(current_year)s."),
            params={"current_year": current_year},
        )
