from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from core.api.serializers import ContactSerializer
from core.models import Contact
import openai

client = openai.OpenAI()

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
    except:
        data["data"] = {"error": 'Something Went Wrong!'}
        status = 500
        
    return Response(data, status=status)


