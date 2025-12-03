import logging
import openai
import os
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from core.api.serializers import ContactSerializer
from core.models import Contact
from utils.admin_settings import get_openai_api_key
from utils.zoho_crm import sync_contact_to_crm

logger = logging.getLogger(__name__)

class ContactViewSet(viewsets.ModelViewSet):
    serializer_class = ContactSerializer
    serializer_method_fields = ["POST"]

    def get_queryset(self):
        return Contact.objects.all()
    
    def create(self, request, *args, **kwargs):
        """
        Override create to sync with Zoho CRM after saving
        """
        response = super().create(request, *args, **kwargs)
        
        # Sync to Zoho CRM if enabled
        if response.status_code == 201:
            try:
                # Use response.data to get actual persisted values
                contact_data = response.data if hasattr(response, 'data') else request.data
                email = contact_data.get('email', '')
                subject = contact_data.get('subject', '')
                body = contact_data.get('body', '')
                
                if email:
                    # Sync to Zoho CRM
                    crm_synced = sync_contact_to_crm(
                        email=email,
                        subject=subject,
                        body=body
                    )
                    
                    # Track CRM sync event in PostHog if available
                    if crm_synced and hasattr(request, 'session'):
                        # This will be tracked via frontend Analytics if needed
                        pass
            except Exception:
                # Don't fail the request if CRM sync fails
                logger.exception("Failed to sync contact to Zoho CRM")
        
        return response
    

@api_view(['POST'])
def chatbot_gpt_api_view(request):
    data = {}
    status = 200
    
    content = request.POST.get("content")
        
    try:
        # Get OpenAI API key from admin settings
        api_key = get_openai_api_key()
        
        if not api_key:
            data["data"] = {"error": "OpenAI API key is not configured in admin settings."}
            status = 400
            return Response(data, status=status)
        
        # Set the API key in environment for this request
        os.environ["OPENAI_API_KEY"] = api_key
        
        # Initialize OpenAI client
        client = openai.OpenAI()
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a knowledgeable Bangkok property expert helping international buyers understand property ownership, payment plans, and regulations in Thailand. Be clear, accurate, and helpful."},
                {"role": "assistant", "content": "Provide answers specific to Thailand property regulations. Keep responses concise (10-50 words) and focus on what buyers need to know to make confident decisions."},
                {"role": "assistant", "content": "You represent Wizer Properties—a trusted platform that verifies all listings and provides transparent information to help buyers avoid scams and hidden fees."},
                {"role": "user", "content": content}
            ]
        )
        
        data["data"] = response.json()
        print(response.json())
    except Exception as e:
        print(f"OpenAI API Error: {e}")
        data["data"] = {"error": 'Unable to connect to our property expert right now. Please try again in a moment—we want to give you the right answer.'}
        status = 500
        
    return Response(data, status=status)


