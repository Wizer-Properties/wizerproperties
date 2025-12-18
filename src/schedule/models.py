from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db.models import Q
from django.core.exceptions import ValidationError
from django.contrib.contenttypes.fields import GenericRelation
from django.conf import settings
from django.urls import reverse
from core.models import TimestampedModel
from utils.general_func import send_email


class VisitingSchedule(TimestampedModel):
	STATUS_CHOICES = (
	    ("pending", "Pending"),
	    ("accepted", "Accepted"),
	    ("canceled", "Canceled"),
	)

	visiting_time = models.DateTimeField(null=True)
	status = models.CharField(choices=STATUS_CHOICES, null=True, default="pending")
	prospect = models.ForeignKey("user.ProspectProfile", on_delete=models.SET_NULL, null=True)

	# Fields for GenericForeignKey
	content_type = models.ForeignKey(
		ContentType,
		on_delete=models.SET_NULL,
		null=True,
		limit_choices_to=Q(
            Q(app_label='building', model='building') |
            Q(app_label='property', model='property')
        )
    )
	object_id = models.PositiveIntegerField(null=True)
	content_object = GenericForeignKey('content_type', 'object_id')

	def accept_schedule(self) -> bool:
		self.status = "accepted"
		self.save()

		if not self.content_type or not self.visiting_time or not self.prospect or not self.prospect.user:
			return True

		# detail page
		if self.content_type.model == "property":
			detail_page = f"{settings.SITE_HOST}{reverse('property:get', kwargs={'id': self.object_id})}"
		else:
			detail_page = f"{settings.SITE_HOST}{reverse('building:get', kwargs={'id': self.object_id})}"
  
		context = {
			"visiting_time": self.visiting_time.strftime("%d/%m/%Y %I:%M %p"),
			"details_page": detail_page
		}
		send_email(
		    subject="Builder has Approved Your Schedule Request",
		    to_email=str(self.prospect.user.email),
		    html_content="email/schedule_accept.html",
		    context=context
		)
		return True

	def cancel_schedule(self) -> bool:
		self.status = "cancelled"
		self.save()
  
		if not self.content_type or not self.visiting_time or not self.prospect or not self.prospect.user:
			return True

  		# detail page
		if self.content_type.model == "property":
			detail_page = f"{settings.SITE_HOST}{reverse('property:get', kwargs={'id': self.object_id})}"
		else:
			detail_page = f"{settings.SITE_HOST}{reverse('building:get', kwargs={'id': self.object_id})}"
   
		context = {
			"visiting_time": self.visiting_time.strftime("%d/%m/%Y %I:%M %p"),
			"details_page": detail_page
		}
		send_email(
		    subject="Builder has Canceled Your Schedule Request",
		    to_email=str(self.prospect.user.email),
		    html_content="email/schedule_cancel.html",
		    context=context
		)
		return True
