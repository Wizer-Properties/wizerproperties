# Zoho CRM Integration Documentation

This document describes the Zoho CRM integration implemented in the Wizer Properties platform.

## Features

1. **Zoho SalesIQ Widget**: Live chat widget integrated on all pages
2. **Zoho CRM Sync**: Automatically syncs leads, contacts, and deals to Zoho CRM
3. **PostHog Tracking**: Tracks CRM sync events in PostHog for analytics

## Components

### 1. Zoho SalesIQ Widget

The SalesIQ widget is automatically loaded on all pages via `base.html`. The widget code is:
```javascript
siq2fd15ec878c972695203786423fd2bfe16724f6a241f02927b924a0534d7edf1
```

The widget provides live chat functionality and visitor tracking.

### 2. Zoho CRM Integration Module

Located at `src/utils/zoho_crm.py`, this module provides:

- **Lead Creation**: Creates leads from contact form submissions with real estate-specific fields
- **Contact Management**: Creates/updates contacts with property preferences and demographics
- **Deal Creation**: Creates deals with comprehensive property details (bedrooms, bathrooms, location, building info, etc.)
- **Record Search**: Searches for existing records to avoid duplicates
- **Record Updates**: Updates existing leads/contacts with new information and preferences
- **Notes/Activities**: Creates notes to track inquiries and property views

### 3. Integration Points

#### Contact Form (`/core/api/contact/`)
- Automatically syncs contact form submissions to Zoho CRM as Leads
- **Smart Duplicate Handling**: If a Lead/Contact already exists, adds a note instead of creating duplicates
- **Fields Synced:**
  - Basic: email, name, phone, company
  - Real Estate Preferences: property type, preferred location, budget range, bedrooms, bathrooms
  - Demographics: gender, address
  - Inquiry: subject, message body

#### Schedule Creation (`/schedule/api/`)
- **Contact Management:**
  - Searches for existing Contact by email
  - Updates existing Contact with property preferences (bedrooms, bathrooms, location)
  - Creates new Contact with comprehensive real estate data if not exists
- **Deal Creation:**
  - Creates Deal for each property viewing schedule
  - **Property Details Included:**
    - Property title, ID, and URL
    - Building name, type, status, completion year
    - Location/address
    - Bedrooms, bathrooms, size (sqm), floor number
    - Property price (deal amount)
    - Visiting time
    - Asset type (property/building)
  - **Real Estate Custom Fields:**
    - `Property_Type`, `Property_URL`, `Building_Name`
    - `Location`, `Bedrooms`, `Bathrooms`, `Property_Size`
    - `Floor_Number`, `Building_Status`, `Completion_Year`, `Property_ID`

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Enable/disable Zoho CRM integration
ZOHO_CRM_ENABLED=True

# OAuth2 Credentials (get from https://api-console.zoho.com)
ZOHO_CRM_CLIENT_ID=your_client_id_here
ZOHO_CRM_CLIENT_SECRET=your_client_secret_here
ZOHO_CRM_REFRESH_TOKEN=your_refresh_token_here

# API Domain (use appropriate domain for your region)
# US: https://www.zohoapis.com
# EU: https://www.zohoapis.eu
# IN: https://www.zohoapis.in
# CN: https://www.zohoapis.com.cn
ZOHO_CRM_API_DOMAIN=https://www.zohoapis.com
```

### Getting OAuth2 Credentials

1. Go to [Zoho API Console](https://api-console.zoho.com)
2. Click "Add Client"
3. Choose "Server-based Applications"
4. Configure:
   - **Client Name**: Wizer Properties CRM Integration
   - **Redirect URI**: Your website URL (e.g., `https://wizerproperties.com/zoho/callback`)
   - **Scopes**: Select `ZohoCRM.modules.ALL`, `ZohoCRM.settings.ALL`
5. Save and copy:
   - Client ID
   - Client Secret
6. Generate Refresh Token:
   - Use Zoho's OAuth Playground or generate manually
   - See: https://www.zoho.com/crm/developer/docs/api/v2/oauth-overview.html

## API Methods

### `sync_contact_to_crm(email, subject, body, phone, **kwargs)`

Syncs contact form submission to Zoho CRM as a Lead.

**Parameters:**
- `email` (str): Contact email (required)
- `subject` (str): Contact subject
- `body` (str): Contact message body
- `phone` (str): Phone number (optional)
- `**kwargs`: Additional fields including real estate preferences:
  - `first_name`, `last_name`, `company` - Basic info
  - `property_type` - Type of property interested in
  - `preferred_location` - Preferred location/district
  - `budget_range` - Budget range
  - `bedrooms`, `bathrooms` - Property preferences
  - `gender`, `address` - Demographics

**Returns:** `bool` - True if successful, False otherwise

**Example:**
```python
from utils.zoho_crm import sync_contact_to_crm

success = sync_contact_to_crm(
    email="john@example.com",
    subject="Property Inquiry",
    body="I'm interested in property #123",
    phone="+66123456789",
    first_name="John",
    last_name="Doe"
)
```

### `sync_schedule_to_crm(email, property_title, property_id, visiting_time, asset_type, phone, **kwargs)`

Syncs property viewing schedule to Zoho CRM as a Contact and Deal.

**Parameters:**
- `email` (str): User email (required)
- `property_title` (str): Property/building title
- `property_id` (str): Property/building ID
- `visiting_time` (str): Scheduled visiting time
- `asset_type` (str): 'property' or 'building'
- `phone` (str): User phone number
- `property_url` (str): Link to property detail page
- `**kwargs`: Additional fields including comprehensive property details:
  - `first_name`, `last_name`, `gender`, `address` - User info
  - `property_price` - Deal amount
  - `property_bedrooms`, `property_bathrooms`, `property_size`, `property_floor` - Property specs
  - `building_name`, `building_type`, `building_status`, `completion_year` - Building info
  - `property_location` - Property address/location

**Returns:** `bool` - True if successful, False otherwise

**Example:**
```python
from utils.zoho_crm import sync_schedule_to_crm

success = sync_schedule_to_crm(
    email="jane@example.com",
    property_title="Luxury Condo in Sukhumvit",
    property_id="123",
    visiting_time="2024-12-25 14:00:00",
    asset_type="property",
    phone="+66123456789",
    property_price=5000000
)
```

### Direct CRM Client Usage

```python
from utils.zoho_crm import ZohoCRM

crm = ZohoCRM()

# Create a lead
result = crm.create_lead(
    email="lead@example.com",
    first_name="John",
    last_name="Doe",
    phone="+66123456789",
    company="ABC Corp",
    source="Website"
)

# Create a contact
result = crm.create_contact(
    email="contact@example.com",
    first_name="Jane",
    last_name="Smith",
    phone="+66123456789"
)

# Create a deal with real estate details
result = crm.create_deal(
    deal_name="Property Purchase",
    contact_email="contact@example.com",
    stage="Qualification",
    amount=5000000,
    Property_Type="Condo",
    Property_URL="https://wizerproperties.com/property/123",
    Building_Name="Luxury Condo Sukhumvit",
    Location="Sukhumvit Road, Bangkok",
    Bedrooms="2",
    Bathrooms="2",
    Property_Size="80",
    Floor_Number="15",
    Building_Status="Completed",
    Completion_Year="2023"
)

# Search for existing record
existing = crm.search_record('Leads', email="lead@example.com")

# Update existing record
crm.update_record('Leads', record_id='12345', data={
    'Preferred_Location': 'Sukhumvit',
    'Bedrooms': '2'
})

# Create a note/activity
crm.create_note('Leads', record_id='12345', 
                note_title='Property View', 
                note_content='Viewed luxury condo #789')
```

## PostHog Integration

CRM sync events are automatically tracked in PostHog with the `crm_sync` event. The event includes:

- `crm_type`: "zoho"
- `event_type`: "lead_created", "contact_created", "deal_created"
- `entity_type`: "lead", "contact", "deal", "schedule"
- `entity_id`: ID of the synced entity
- `success`: Boolean indicating if sync was successful

Track CRM events in frontend:
```javascript
if (typeof Analytics !== 'undefined') {
    Analytics.trackCrmSync('lead_created', 'lead', leadId, true);
}
```

## Error Handling

All CRM operations include error handling and logging:
- Failed syncs are logged but don't fail the main request
- Errors are logged to Django's logging system
- Check logs for troubleshooting: `logger.error()` calls

## Testing

1. Enable CRM in `.env`: `ZOHO_CRM_ENABLED=True`
2. Submit a contact form
3. Check Zoho CRM for new Lead
4. Create a viewing schedule
5. Check Zoho CRM for new Contact and Deal

## Troubleshooting

### Common Issues

1. **"Zoho CRM credentials not configured"**
   - Check that all required environment variables are set
   - Verify `ZOHO_CRM_ENABLED=True`

2. **"Failed to get Zoho CRM access token"**
   - Verify refresh token is valid
   - Check client ID and secret are correct
   - Ensure refresh token hasn't expired

3. **"Zoho CRM API request failed"**
   - Check API domain matches your region
   - Verify OAuth scopes include required permissions
   - Check network connectivity

4. **Records not appearing in Zoho CRM**
   - Check Django logs for errors
   - Verify CRM is enabled
   - Check API response in logs

### Debug Mode

Enable debug logging in Django settings:
```python
LOGGING = {
    'version': 1,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'utils.zoho_crm': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}
```

## Real Estate-Specific Features

The integration is optimized for real estate CRM workflows:

### Supported Custom Fields
When creating Leads, Contacts, or Deals, you can include real estate-specific fields:

**Lead/Contact Fields:**
- `Property_Type` - Type of property (condo, villa, land, etc.)
- `Preferred_Location` - Preferred location/district
- `Budget_Range` - Budget range
- `Bedrooms` - Number of bedrooms preferred
- `Bathrooms` - Number of bathrooms preferred
- `Investment_Purpose` - Purpose (residential, investment, etc.)
- `Move_In_Timeline` - Expected move-in timeline
- `Gender` - For demographics
- `Address` - Physical address

**Deal Fields:**
- `Property_Type` - Building type
- `Property_URL` - Link to property detail page
- `Building_Name` - Project/building name
- `Location` - Property address
- `Bedrooms`, `Bathrooms` - Property specifications
- `Property_Size` - Size in square meters
- `Floor_Number` - Floor number
- `Building_Status` - Construction status
- `Completion_Year` - Expected/actual completion year
- `Property_ID` - Internal property ID

**Note:** These field names match common Zoho CRM real estate custom field names. If your Zoho CRM uses different field names, you can customize the field mapping in `src/utils/zoho_crm.py`.

## Future Enhancements

Potential improvements:
- ✅ Update existing records instead of creating duplicates (Implemented)
- ✅ Real estate-specific custom fields support (Implemented)
- Sync property listings as Products
- Track property views as CRM activities/notes (for high-intent prospects)
- Sync search preferences as lead preferences
- Webhook support for two-way sync
- Custom field mapping configuration
- Bulk sync operations
- Error notification system
- Lead scoring integration
- Territory/round-robin assignment

## References

- [Zoho CRM API Documentation](https://www.zoho.com/crm/developer/docs/api/v2/overview.html)
- [Zoho OAuth Setup](https://www.zoho.com/crm/developer/docs/api/v2/oauth-overview.html)
- [Zoho JavaScript SDK](https://www.zoho.com/crm/developer/docs/javascript-sdk/v2/overview.html)
- [Zoho SalesIQ Documentation](https://www.zoho.com/salesiq/help/)

