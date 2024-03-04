from django.urls import path
from .views import ContactViewSet, chatbot_gpt_api_view


urlpatterns = [    
    path("contact/", ContactViewSet.as_view({"post": "create"}), name="contact"),
    path('chatbot-gpt-api/', chatbot_gpt_api_view, name='chatbot_gpt_api'),
]
