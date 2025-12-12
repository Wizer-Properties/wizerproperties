import logging
import openai
import os
import requests
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings

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
    

def search_properties_api(params, request_obj):
    """
    Search properties using the property API endpoint.
    Returns a list of properties matching the search criteria.
    """
    try:
        base_url = request_obj.build_absolute_uri('/').rstrip('/')
        api_url = f"{base_url}/property/api/list/"
        
        # Map common terms to actual database values
        sub_type_mapping = {
            "condo": "apartment_condo_service_residence",
            "apartment": "apartment_condo_service_residence",
            "villa": "bungalow_villa",
            "bungalow": "bungalow_villa",
            "townhouse": "terrace_link_house",
            "house": "semi_detached_house",
            "land": "residential_land",
        }
        
        building_sub_type = params.get("building_sub_type")
        if building_sub_type and building_sub_type.lower() in sub_type_mapping:
            building_sub_type = sub_type_mapping[building_sub_type.lower()]
        
        # Build query parameters
        query_params = {
            "search": params.get("search_query", ""),
            "min_price": params.get("min_price"),
            "max_price": params.get("max_price"),
            "min_number_of_bedroom": params.get("min_bedrooms"),
            "max_number_of_bedroom": params.get("max_bedrooms"),
            "building__type": params.get("building_type"),
            "building__sub_type": building_sub_type,
            "ordering": params.get("ordering", "-created_at"),
            "page_size": params.get("limit", 5),  # Limit to 5 results for chatbot
        }
        
        # Remove None values and empty strings
        query_params = {k: v for k, v in query_params.items() if v is not None and v != ""}
        
        logger.info(f"Searching properties with params: {query_params}")
        
        # Use Django's internal request mechanism instead of external HTTP call
        # This avoids network issues and handles authentication properly
        from django.test import RequestFactory
        from property.api.views import PropertyViewSet
        
        # Create a request factory and make internal call
        factory = RequestFactory()
        internal_request = factory.get('/property/api/list/', query_params)
        
        # Copy important attributes from original request
        internal_request.user = request_obj.user
        if hasattr(request_obj, 'session'):
            internal_request.session = request_obj.session
        internal_request.META.update({
            'HTTP_HOST': request_obj.META.get('HTTP_HOST', 'localhost'),
            'SERVER_NAME': request_obj.META.get('SERVER_NAME', 'localhost'),
        })
        
        # Call the view directly
        view = PropertyViewSet.as_view({'get': 'list'})
        response = view(internal_request)
        
        if response.status_code != 200:
            logger.error(f"Property API returned status {response.status_code}: {response.data if hasattr(response, 'data') else 'No data'}")
            return {"error": f"Property API returned error status {response.status_code}", "properties": []}
        
        # Handle paginated response
        result = response.data if hasattr(response, 'data') else {}
        if isinstance(result, dict) and 'results' in result:
            properties = result.get("results", [])
            count = result.get("count", len(properties))
        else:
            # Non-paginated response
            properties = result if isinstance(result, list) else []
            count = len(properties)
        
        logger.info(f"Found {len(properties)} properties (total count: {count})")
        
        # Format properties for AI consumption - clean and concise format
        formatted_properties = []
        for prop in properties[:5]:  # Limit to 5 properties
            title = prop.get("title", "Untitled Property")
            price = prop.get("price", 0)
            bedrooms = prop.get("number_of_bedroom", 0)
            bathrooms = prop.get("number_of_bathroom", 0)
            unit_area = prop.get("unit_area", 0)
            building = prop.get("building", {})
            location = building.get("address", "") if building else ""
            building_name = building.get("title", "") if building else ""
            property_id = prop.get("id")
            url = f"{base_url}/property/details/{property_id}/"
            
            # Create clean, concise property summary
            formatted_properties.append({
                "id": property_id,
                "title": title,
                "price": price,
                "price_formatted": f"฿{price:,.0f}" if price else "Price on request",
                "bedrooms": bedrooms,
                "bathrooms": bathrooms,
                "area": unit_area,
                "location": location or "Location not specified",
                "building_name": building_name,
                "summary": f"{title} • {f'฿{price:,.0f}' if price else 'Price on request'} • {bedrooms}BR{' • ' + str(unit_area) + ' sqm' if unit_area else ''} • {location or building_name or 'Bangkok'}",
                "url": url,
            })
        
        return {
            "count": count,
            "properties": formatted_properties
        }
    except requests.exceptions.RequestException as e:
        logger.exception(f"Network error searching properties: {e}")
        return {"error": f"Network error: {str(e)}", "properties": []}
    except Exception as e:
        logger.exception(f"Error searching properties: {e}")
        return {"error": f"Unable to search properties: {str(e)}", "properties": []}
    

@api_view(['POST'])
def chatbot_gpt_api_view(request):
    data = {}
    status = 200
    
    content = request.POST.get("content") or request.data.get("content")
    conversation_history = request.POST.getlist("history[]") or request.data.get("history", [])  # Optional: for conversation context
    
    # Validate content
    if not content or not content.strip():
        return Response({"error": "Content is required"}, status=400)
        
    try:
        # Get OpenRouter API key from admin settings
        api_key = get_openai_api_key()
        
        # Strip whitespace and validate
        if api_key:
            api_key = api_key.strip()
        
        if not api_key:
            # Debug: Check if AdminSettings exists
            from core.models import AdminSettings
            try:
                settings = AdminSettings.objects.first()
                if settings:
                    logger.warning(f"AdminSettings found but API key is empty or None. API key length: {len(settings.openai_api_key or '')}")
                else:
                    logger.warning("No AdminSettings record found")
            except Exception as e:
                logger.exception(f"Error checking AdminSettings: {e}")
            
            return Response({"error": "OpenRouter API key not configured. Please configure it in Admin Settings."}, status=500)
        
        # Initialize OpenAI client configured for OpenRouter
        # OpenRouter is compatible with OpenAI's API format
        client = openai.OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
            default_headers={
                "HTTP-Referer": request.build_absolute_uri('/'),  # Optional: for analytics
                "X-Title": "Wizer Properties AI Assistant",  # Optional: for analytics
            }
        )
        
        # Define function/tool for property search
        tools = [
            {
                "type": "function",
                "function": {
                    "name": "search_properties",
                    "description": "Search for properties in Bangkok based on user criteria. ALWAYS use this function when users ask to 'show me', 'find', 'search for', 'list', 'see', or ask about properties matching criteria (like price, bedrooms, location, condo, villa). Examples: 'Show me condos under 5 million', 'Find 2-bedroom properties', 'Search for villas in Sukhumvit'. This function returns actual property listings from the database.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "search_query": {
                                "type": "string",
                                "description": "Text search query for property title, location, or address (e.g., 'Sukhumvit', 'near BTS', 'river view')"
                            },
                            "min_price": {
                                "type": "number",
                                "description": "Minimum price in Thai Baht"
                            },
                            "max_price": {
                                "type": "number",
                                "description": "Maximum price in Thai Baht"
                            },
                            "min_bedrooms": {
                                "type": "integer",
                                "description": "Minimum number of bedrooms"
                            },
                            "max_bedrooms": {
                                "type": "integer",
                                "description": "Maximum number of bedrooms"
                            },
                            "building_type": {
                                "type": "string",
                                "enum": ["residence", "commercial"],
                                "description": "Type of building: 'residence' for condos/villas, 'commercial' for commercial properties"
                            },
                            "building_sub_type": {
                                "type": "string",
                                "enum": ["apartment_condo_service_residence", "bungalow_villa", "semi_detached_house", "terrace_link_house", "residential_land", "commercial", "industrial", "agricultural_land", "other"],
                                "description": "Sub-type of property. For condos/apartments use 'apartment_condo_service_residence'. For villas use 'bungalow_villa'. For townhouses use 'terrace_link_house'. For houses use 'semi_detached_house'. For land use 'residential_land' or 'agricultural_land'."
                            },
                            "ordering": {
                                "type": "string",
                                "enum": ["-created_at", "-price", "price", "-visit_count"],
                                "description": "Sort order: '-created_at' for newest, '-price' for highest price, 'price' for lowest price, '-visit_count' for most popular"
                            },
                            "limit": {
                                "type": "integer",
                                "description": "Maximum number of properties to return (default: 5)",
                                "default": 5
                            }
                        }
                    }
                }
            }
        ]
        
        # Build messages with conversation history
        messages = [
            {"role": "system", "content": "You are a knowledgeable Bangkok property expert for the website wizerproperties.com helping international buyers understand property ownership, payment plans, and regulations in Thailand. You can also search for properties when users ask about finding listings. Be clear, accurate, and helpful."},
            {"role": "assistant", "content": "Provide answers specific to Thailand property regulations. Keep responses concise (10-50 words) and focus on what buyers need to know to make confident decisions. IMPORTANT: When users ask to 'show me', 'find', 'search for', 'list', 'see', or ask about properties matching criteria (like price, bedrooms, location, condo, villa), you MUST use the search_properties function. Do not provide generic answers about searching elsewhere. Always use the function to get actual property listings."},
            {"role": "assistant", "content": "When presenting property search results, format them cleanly:\n- Start with: 'Here are [X] properties matching your criteria:'\n- List each property as: **Title** • ฿Price • XBR • Location [View Property](url)\n- Use bullet points (•) to separate info, no verbose labels\n- Example: '**2-BR Condo, 94 sqm** • ฿39,000,000 • 2BR • Sukhumvit [View Property](url)'\n- Keep descriptions brief—just essential details\n- End with: 'Click any link for more details!'"},
            {"role": "assistant", "content": "You represent Wizer Properties—a trusted platform that verifies all listings and provides transparent information to help buyers avoid scams and hidden fees."},
        ]
        
        # Add conversation history if provided
        if conversation_history:
            import json
            allowed_roles = {"user", "assistant", "system"}
            for hist in conversation_history:
                try:
                    hist_data = json.loads(hist) if isinstance(hist, str) else hist
                    
                    # Validate that both "role" and "content" exist
                    role = hist_data.get("role")
                    content = hist_data.get("content")
                    
                    # Validate that both are non-empty strings
                    if not isinstance(role, str) or not role.strip():
                        continue
                    if not isinstance(content, str) or not content.strip():
                        continue
                    
                    # Optionally validate that role is one of allowed roles
                    if role not in allowed_roles:
                        continue
                    
                    # All validations passed, append the message
                    messages.append({"role": role, "content": content})
                except (json.JSONDecodeError, TypeError, AttributeError, KeyError):
                    # Skip invalid conversation history entries
                    pass
        
        # Add current user message
        messages.append({"role": "user", "content": content})
        
        # Detect if user is asking for property search
        # Keywords that indicate property search intent
        search_keywords = ["show me", "find", "search", "list", "see", "condo", "villa", "property", "properties", "bedroom", "bathroom", "million", "baht", "price", "under", "below", "above", "over"]
        content_lower = content.lower()
        is_search_query = any(keyword in content_lower for keyword in search_keywords)
        
        # Use "required" tool_choice if we detect search intent, otherwise "auto"
        tool_choice_setting = "required" if is_search_query else "auto"
        if is_search_query:
            logger.info(f"Detected property search intent in query: '{content[:100]}'. Forcing function call.")
        
        # First API call - check if AI wants to search properties
        # Note: openrouter/auto doesn't support function calling, so we use a specific model
        # Using openai/gpt-4o-mini which supports function calling and is cost-effective
        # Alternative models: openai/gpt-3.5-turbo, anthropic/claude-3-haiku, google/gemini-pro
        response = client.chat.completions.create(
            model="openai/gpt-4o-mini",  # Supports function calling, cost-effective
            messages=messages,
            tools=tools,
            tool_choice={"type": "function", "function": {"name": "search_properties"}} if is_search_query else "auto",  # Force function call for search queries
        )
        
        message = response.choices[0].message
        messages.append(message)
        
        # Log whether function calling was triggered
        logger.debug(f"AI response - tool_calls: {message.tool_calls}, content: {message.content[:100] if message.content else None}")
        
        # If AI wants to call a function, execute it
        if message.tool_calls:
            logger.info(f"Function calling triggered! Tool calls: {len(message.tool_calls)}")
            for tool_call in message.tool_calls:
                function_name = tool_call.function.name
                import json
                try:
                    function_args = json.loads(tool_call.function.arguments) if isinstance(tool_call.function.arguments, str) else tool_call.function.arguments
                    logger.info(f"Calling function: {function_name} with args: {function_args}")
                except Exception as e:
                    logger.error(f"Error parsing function arguments: {e}")
                    function_args = {}
                
                if function_name == "search_properties":
                    # Call the property search function
                    try:
                        function_response = search_properties_api(function_args, request)
                        logger.info(f"Property search returned {function_response.get('count', 0)} properties")
                    except Exception as e:
                        logger.exception(f"Error in search_properties_api: {e}")
                        function_response = {"error": "Unable to search properties at this time", "properties": []}
                    
                    # Format function response as JSON string for AI
                    import json
                    function_response_str = json.dumps(function_response, ensure_ascii=False, indent=2)
                    logger.debug(f"Function response (first 500 chars): {function_response_str[:500]}")
                    
                    # Add function result to messages
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "name": function_name,
                        "content": function_response_str
                    })
                else:
                    logger.warning(f"Unknown function called: {function_name}")
            
            # Get final response from AI with property search results
            # Using same model for consistency (can also use openrouter/auto here for cost optimization)
            final_response = client.chat.completions.create(
                model="openai/gpt-4o-mini",  # Same model for consistency
                messages=messages,
            )
            
            ai_message = final_response.choices[0].message.content
            model_used = final_response.model if hasattr(final_response, 'model') else None
        else:
            # No function call needed, use direct response
            logger.warning(f"No function call triggered for query: '{content[:100]}'. AI responded directly without using search_properties function.")
            ai_message = message.content
            model_used = response.model if hasattr(response, 'model') else None
        
        # Convert OpenRouter response to dict format expected by frontend
        # Using "openai/gpt-4o-mini" which supports function calling and is cost-effective
        # The response.model field will show which model was actually used
        # Note: openrouter/auto doesn't support function calling, so we use a specific model
        data["data"] = {
            "choices": [{
                "message": {
                    "content": ai_message
                }
            }],
            "model_used": model_used  # Track which model was automatically selected
        }
    except Exception as e:
        logger.exception(f"OpenRouter API Error: {e}")
        data["data"] = {"error": 'Unable to connect to our property expert right now. Please try again in a moment—we want to give you the right answer.'}
        status = 500
        
    return Response(data, status=status)


