"""
Zoho CRM Integration Utility
Handles syncing leads, contacts, and deals to Zoho CRM
"""
import requests
import logging
from typing import Dict, Optional, Any, cast
from django.conf import settings
from decouple import config

logger = logging.getLogger(__name__)


class ZohoCRM:
    """
    Zoho CRM API client for creating and updating records
    """
    client_id: str
    client_secret: str
    refresh_token: str
    api_domain: str
    enabled: bool
    access_token: Optional[str]
    _base_url: str
    
    def __init__(self) -> None:
        self.client_id = str(config('ZOHO_CRM_CLIENT_ID', default=''))
        self.client_secret = str(config('ZOHO_CRM_CLIENT_SECRET', default=''))
        self.refresh_token = str(config('ZOHO_CRM_REFRESH_TOKEN', default=''))
        self.api_domain = str(config('ZOHO_CRM_API_DOMAIN', default='https://www.zohoapis.com'))
        self.enabled = bool(config('ZOHO_CRM_ENABLED', default=False, cast=bool))
        
        self.access_token = None
        self._base_url = f"{self.api_domain}/crm/v2"
    
    def _get_access_token(self) -> Optional[str]:
        """
        Get or refresh access token using refresh token
        """
        if not self.refresh_token or not self.client_id or not self.client_secret:
            logger.warning("Zoho CRM credentials not configured")
            return None
        
        try:
            token_url = f"{self.api_domain}/oauth/v2/token"
            params = {
                'refresh_token': self.refresh_token,
                'client_id': self.client_id,
                'client_secret': self.client_secret,
                'grant_type': 'refresh_token'
            }
            
            response = requests.post(token_url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            self.access_token = data.get('access_token')
            return self.access_token
        except Exception as e:
            logger.exception(f"Failed to get Zoho CRM access token: {e}")
            return None
    
    def _make_request(self, method: str, endpoint: str, data: Optional[dict[str, Any]] = None) -> Optional[dict[str, Any]]:
        """
        Make authenticated request to Zoho CRM API
        """
        if not self.enabled:
            return None
        
        access_token = self._get_access_token()
        if not access_token:
            return None
        
        url = f"{self._base_url}/{endpoint}"
        headers = {
            'Authorization': f'Zoho-oauthtoken {access_token}',
            'Content-Type': 'application/json'
        }
        
        try:
            if method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            else:
                logger.error(f"Unsupported HTTP method: {method}")
                return None
            
            response.raise_for_status()
            return cast(dict[str, Any], response.json())
        except requests.exceptions.RequestException as e:
            logger.exception(f"Zoho CRM API request failed: {e}")
            if e.response is not None and hasattr(e.response, 'text'):
                logger.error(f"Response: {e.response.text}")
            return None
    
    def create_lead(self, email: str, first_name: str = '', last_name: str = '', 
                   phone: str = '', company: str = '', description: str = '',
                   source: str = 'Website', **kwargs: Any) -> Optional[dict[str, Any]]:
        """
        Create a lead in Zoho CRM with real estate-specific fields support
        
        Args:
            email: Lead email (required)
            first_name: First name
            last_name: Last name
            phone: Phone number
            company: Company name
            description: Lead description/notes
            source: Lead source (default: Website)
            **kwargs: Additional custom fields including real estate fields:
                - Property_Type: Type of property interested in
                - Preferred_Location: Preferred location/district
                - Budget_Range: Budget range
                - Bedrooms: Number of bedrooms preferred
                - Bathrooms: Number of bathrooms preferred
                - Investment_Purpose: Purpose (residential, investment, etc.)
                - Move_In_Timeline: Expected move-in timeline
                - Gender: Gender (for demographics)
                - Address: Physical address
        
        Returns:
            API response dict or None
        """
        if not email:
            logger.warning("Cannot create Zoho CRM lead: email is required")
            return None
        
        # Split name if only full name provided
        if not first_name and not last_name and 'name' in kwargs:
            name_parts = str(kwargs.pop('name')).split(' ', 1)
            first_name = name_parts[0]
            last_name = name_parts[1] if len(name_parts) > 1 else ''
        
        data = {
            "data": [{
                "Email": email,
                "First_Name": first_name,
                "Last_Name": last_name,
                "Phone": phone,
                "Company": company,
                "Description": description,
                "Lead_Source": source,
                **kwargs
            }]
        }
        
        result = self._make_request('POST', 'Leads', data)
        if result:
            logger.info(f"Created Zoho CRM lead for {email}")
        return result
    
    def update_record(self, module: str, record_id: str, data: dict[str, Any]) -> Optional[dict[str, Any]]:
        """
        Update an existing record in Zoho CRM
        
        Args:
            module: Module name (Leads, Contacts, Deals, etc.)
            record_id: Record ID to update
            data: Dictionary of fields to update
        
        Returns:
            API response dict or None
        """
        if not record_id:
            logger.warning(f"Cannot update {module} record: record_id is required")
            return None
        
        update_data = {
            "data": [{
                "id": record_id,
                **data
            }]
        }
        
        result = self._make_request('PUT', f"{module}/{record_id}", update_data)
        if result:
            logger.info(f"Updated {module} record {record_id}")
        return result
    
    def create_note(self, module: str, record_id: str, note_title: str, note_content: str) -> Optional[dict[str, Any]]:
        """
        Create a note/activity for a record in Zoho CRM
        
        Args:
            module: Module name (Leads, Contacts, Deals, etc.)
            record_id: Record ID to attach note to
            note_title: Note title
            note_content: Note content
        
        Returns:
            API response dict or None
        """
        if not record_id:
            return None
        
        data = {
            "data": [{
                "Note_Title": note_title,
                "Note_Content": note_content,
                "Parent_Id": record_id,
                "se_module": module
            }]
        }
        
        result = self._make_request('POST', 'Notes', data)
        if result:
            logger.info(f"Created note for {module} record {record_id}")
        return result
    
    def create_contact(self, email: str, first_name: str = '', last_name: str = '',
                      phone: str = '', description: str = '', **kwargs: Any) -> Optional[dict[str, Any]]:
        """
        Create a contact in Zoho CRM
        
        Args:
            email: Contact email (required)
            first_name: First name
            last_name: Last name
            phone: Phone number
            description: Contact description/notes
            **kwargs: Additional custom fields
        
        Returns:
            API response dict or None
        """
        if not email:
            logger.warning("Cannot create Zoho CRM contact: email is required")
            return None
        
        data = {
            "data": [{
                "Email": email,
                "First_Name": first_name,
                "Last_Name": last_name,
                "Phone": phone,
                "Description": description,
                **kwargs
            }]
        }
        
        result = self._make_request('POST', 'Contacts', data)
        if result:
            logger.info(f"Created Zoho CRM contact for {email}")
        return result
    
    def create_deal(self, deal_name: str, contact_email: str = '', stage: str = 'Qualification',
                   amount: float = 0, description: str = '', **kwargs: Any) -> Optional[dict[str, Any]]:
        """
        Create a deal in Zoho CRM with real estate-specific fields
        
        Args:
            deal_name: Deal name (required)
            contact_email: Associated contact email
            stage: Deal stage (default: Qualification)
            amount: Deal amount
            description: Deal description
            **kwargs: Additional custom fields including real estate fields:
                - Property_Type: Type of property
                - Property_URL: Link to property detail page
                - Building_Name: Building/project name
                - Location: Property address/location
                - Bedrooms: Number of bedrooms
                - Bathrooms: Number of bathrooms
                - Property_Size: Property size in sqm
                - Floor_Number: Floor number
                - Building_Status: Construction status
                - Completion_Year: Expected/actual completion year
                - Property_ID: Internal property ID
                - Building_Type: Building type (condo, villa, etc.)
        
        Returns:
            API response dict or None
        """
        if not deal_name:
            logger.warning("Cannot create Zoho CRM deal: deal_name is required")
            return None
        
        data = {
            "data": [{
                "Deal_Name": deal_name,
                "Contact_Email": contact_email,
                "Stage": stage,
                "Amount": amount,
                "Description": description,
                **kwargs
            }]
        }
        
        result = self._make_request('POST', 'Deals', data)
        if result:
            logger.info(f"Created Zoho CRM deal: {deal_name}")
        return result
    
    def search_record(self, module: str, email: Optional[str] = None, phone: Optional[str] = None) -> Optional[dict[str, Any]]:
        """
        Search for existing record by email or phone
        
        Args:
            module: Module name (Leads, Contacts, etc.)
            email: Email to search
            phone: Phone to search
        
        Returns:
            Search results or None
        """
        if not email and not phone:
            return None
        
        search_criteria = f"(Email:equals:{email})" if email else f"(Phone:equals:{phone})"
        endpoint = f"{module}/search?criteria={search_criteria}"
        
        return self._make_request('GET', endpoint)


def sync_contact_to_crm(email: str, subject: str = '', body: str = '', 
                       phone: str = '', **kwargs: Any) -> bool:
    """
    Helper function to sync contact form submission to Zoho CRM
    
    Returns:
        True if synced successfully, False otherwise
    """
    try:
        crm = ZohoCRM()
        if not crm.enabled:
            return False
        
        # Extract name from subject or body if available
        first_name = kwargs.get('first_name', '')
        last_name = kwargs.get('last_name', '')
        company = kwargs.get('company', '')
        
        # Try to find existing lead/contact first
        existing_lead = crm.search_record('Leads', email=email)
        existing_contact = crm.search_record('Contacts', email=email)
        
        description = f"Subject: {subject}\n\n{body}" if subject and body else (subject or body or '')
        
        if existing_lead:
            # Update existing lead with new inquiry
            lead_id = existing_lead.get('data', [{}])[0].get('id') if existing_lead.get('data') else None
            if lead_id:
                # Add note about new inquiry
                crm.create_note('Leads', lead_id, f'New Inquiry: {subject}', description)
                logger.info(f"Updated existing Zoho CRM lead {lead_id} with new inquiry")
                return True
        
        if existing_contact:
            # Convert contact to lead or add note
            contact_id = existing_contact.get('data', [{}])[0].get('id') if existing_contact.get('data') else None
            if contact_id:
                crm.create_note('Contacts', contact_id, f'New Inquiry: {subject}', description)
                logger.info(f"Added note to existing Zoho CRM contact {contact_id}")
                return True
        
        # Create new lead with real estate context
        result = crm.create_lead(
            email=email,
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            company=company,
            description=description,
            source='Contact Form',
            # Real estate-specific fields from kwargs
            Property_Type=kwargs.get('property_type', ''),
            Preferred_Location=kwargs.get('preferred_location', ''),
            Budget_Range=kwargs.get('budget_range', ''),
            Bedrooms=kwargs.get('bedrooms', ''),
            Bathrooms=kwargs.get('bathrooms', ''),
            Gender=kwargs.get('gender', ''),
            Address=kwargs.get('address', ''),
            **{k: v for k, v in kwargs.items() if k not in ['first_name', 'last_name', 'company', 'property_type', 'preferred_location', 'budget_range', 'bedrooms', 'bathrooms', 'gender', 'address']}
        )
        
        return result is not None
    except Exception as e:
        logger.exception(f"Failed to sync contact to Zoho CRM: {e}")
        return False


def sync_schedule_to_crm(email: str, property_title: str = '', property_id: str = '',
                        visiting_time: str = '', asset_type: str = 'property',
                        phone: str = '', property_url: str = '', **kwargs: Any) -> bool:
    """
    Helper function to sync schedule/booking to Zoho CRM with real estate-specific details
    
    Returns:
        True if synced successfully, False otherwise
    """
    try:
        crm = ZohoCRM()
        if not crm.enabled:
            return False
        
        if not email:
            return False
        
        # Get user info if available
        first_name = kwargs.get('first_name', '')
        last_name = kwargs.get('last_name', '')
        gender = kwargs.get('gender', '')
        address = kwargs.get('address', '')
        
        # Get property details for real estate-specific fields
        bedrooms = kwargs.get('property_bedrooms', kwargs.get('bedrooms', ''))
        bathrooms = kwargs.get('property_bathrooms', kwargs.get('bathrooms', ''))
        property_size = kwargs.get('property_size', kwargs.get('unit_area', ''))
        floor_number = kwargs.get('property_floor', kwargs.get('floor_number', ''))
        building_name = kwargs.get('building_name', kwargs.get('building_title', ''))
        building_type = kwargs.get('building_type', '')
        building_status = kwargs.get('building_status', '')
        location = kwargs.get('property_location', kwargs.get('address', ''))
        completion_year = kwargs.get('completion_year', kwargs.get('construction_year', ''))
        
        # Check if contact exists
        existing_contact = crm.search_record('Contacts', email=email)
        
        # Create or update contact with real estate information
        contact_description = f"Property viewing scheduled for {property_title}\n\n"
        contact_description += f"Property: {property_title}\n"
        if building_name:
            contact_description += f"Building: {building_name}\n"
        if location:
            contact_description += f"Location: {location}\n"
        if bedrooms:
            contact_description += f"Bedrooms: {bedrooms}\n"
        if bathrooms:
            contact_description += f"Bathrooms: {bathrooms}\n"
        
        if existing_contact:
            # Update existing contact with property preferences
            contact_id = existing_contact.get('data', [{}])[0].get('id') if existing_contact.get('data') else None
            if contact_id and (bedrooms or bathrooms or location):
                # Update contact with preferences if available
                update_data = {}
                if bedrooms:
                    update_data['Bedrooms'] = str(bedrooms)
                if bathrooms:
                    update_data['Bathrooms'] = str(bathrooms)
                if location:
                    update_data['Preferred_Location'] = location
                if update_data:
                    crm.update_record('Contacts', contact_id, update_data)
        else:
            # Create new contact with real estate fields
            crm.create_contact(
                email=email,
                first_name=first_name,
                last_name=last_name,
                phone=phone,
                description=contact_description.strip(),
                Gender=gender,
                Address=address,
                Preferred_Location=location,
                Bedrooms=str(bedrooms) if bedrooms else '',
                Bathrooms=str(bathrooms) if bathrooms else '',
                **{k: v for k, v in kwargs.items() if k not in ['first_name', 'last_name', 'phone', 'gender', 'address', 'property_bedrooms', 'bedrooms', 'property_bathrooms', 'bathrooms', 'property_size', 'unit_area', 'property_floor', 'floor_number', 'building_name', 'building_title', 'building_type', 'building_status', 'property_location', 'completion_year', 'construction_year', 'property_price', 'property_url']}
            )
        
        # Create deal for the property viewing with comprehensive property details
        deal_name = f"{property_title} - Viewing Schedule" if property_title else "Property Viewing Schedule"
        description = f"""
Property Viewing Scheduled

Property Details:
- Property: {property_title}
- Property ID: {property_id}
- Asset Type: {asset_type}
- Visiting Time: {visiting_time}
        """.strip()
        
        if building_name:
            description += f"\n- Building: {building_name}"
        if location:
            description += f"\n- Location: {location}"
        if bedrooms:
            description += f"\n- Bedrooms: {bedrooms}"
        if bathrooms:
            description += f"\n- Bathrooms: {bathrooms}"
        if property_size:
            description += f"\n- Size: {property_size} sqm"
        if property_url:
            description += f"\n- Property URL: {property_url}"
        
        # Estimate deal amount based on property (if available in kwargs)
        amount = kwargs.get('property_price', 0)
        stage = 'Qualification'  # Initial stage for viewing schedule
        
        result = crm.create_deal(
            deal_name=deal_name,
            contact_email=email,
            stage=stage,
            amount=amount,
            description=description,
            # Real estate-specific deal fields
            Property_Type=building_type or asset_type,
            Property_URL=property_url,
            Building_Name=building_name,
            Location=location,
            Bedrooms=str(bedrooms) if bedrooms else '',
            Bathrooms=str(bathrooms) if bathrooms else '',
            Property_Size=str(property_size) if property_size else '',
            Floor_Number=str(floor_number) if floor_number else '',
            Building_Status=building_status,
            Completion_Year=str(completion_year) if completion_year else '',
            Property_ID=property_id,
            **{k: v for k, v in kwargs.items() if k not in ['first_name', 'last_name', 'phone', 'gender', 'address', 'property_bedrooms', 'bedrooms', 'property_bathrooms', 'bathrooms', 'property_size', 'unit_area', 'property_floor', 'floor_number', 'building_name', 'building_title', 'building_type', 'building_status', 'property_location', 'completion_year', 'construction_year', 'property_price', 'property_url']}
        )
        
        return result is not None
    except Exception as e:
        logger.exception(f"Failed to sync schedule to Zoho CRM: {e}")
        return False

