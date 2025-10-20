import openai
import os
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from core.api.serializers import ContactSerializer
from core.models import Contact
from utils.admin_settings import get_openai_api_key

class ContactViewSet(viewsets.ModelViewSet):
    serializer_class = ContactSerializer
    serializer_method_fields = ["POST"]

    def get_queryset(self):
        return Contact.objects.all()
    

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
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "assistant", "content": "The Overall data response will be according to Thailand and response length will be within 10-50 words depending on the question."},
                {"role": "assistant", "content": "You are acting like a property agent"},
                {"role": "user", "content": content}
            ]
        )
        
        data["data"] = response.json()
        print(response.json())
    except Exception as e:
        print(f"OpenAI API Error: {e}")
        data["data"] = {"error": 'OpenAI API connection failed. Please check your API key and try again.'}
        status = 500
        
    return Response(data, status=status)


