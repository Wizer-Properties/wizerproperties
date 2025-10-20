from django.db import models


class TimestampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True


class Contact(TimestampedModel):
    
    STATUS = (
        ('read', 'Read'),
        ('unread', 'Unread'),
    )
    
    email = models.EmailField(max_length=100, null=True)
    subject = models.CharField(max_length=500, null=True)
    body = models.TextField(null=True)
    status = models.CharField(max_length=20, default="unread", choices=STATUS)
    
    def __str__(self):
        return str(self.subject)
    
    
class AdminSettings(TimestampedModel):
    initial_credit_balance_for_agent = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Default starting credit for newly created agent profiles."
    )
    initial_credit_balance_for_developer = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Default starting credit for newly created developer profiles."
    )
    
    # Pricing for promotional features
    discount_property_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Credit cost to create a discount property."
    )
    featured_property_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Credit cost to create a featured property."
    )
    
    # API Keys
    openai_api_key = models.CharField(
        max_length=500,
        blank=True,
        null=True,
        help_text="OpenAI API key for ChatGPT integration."
    )

    class Meta:
        verbose_name = "Admin Setting"
        verbose_name_plural = "Admin Settings"

    def __str__(self):
        return "Admin Settings"


    
