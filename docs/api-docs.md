### Scheduel
- Create
  - URL [__POST__] `/schedule/`
- List
  - URL [__GET__] `/schedule/`
- Single Schedule
  - URL [__GET__] `/schedule/<schedule_id>/`
- Update
  - URL [__PATCH__] `/schedule/<schedule_id>/`
- Accept
  - URL [__PATCH__] `/schedule/<schedule_id>/accept/`
- Cancel
  - URL [__PATCH__] `/schedule/<schedule_id>/cancel/`

### Prospect Favorite Property
- Add
  - URL [__POST__] `/property/api/prospect-favorite/add/`
  - Body
    - property
  - Errors Property
    - `__all__` as a key for non fields errors
    - `{field name}` as a key for fields related errors.
  - Expect Status
    - 200

- List
  - URL [__GET__] `/property/api/prospect-favorite/list/`
  - Response 
    ```json
     {
		"count": 1,
		"page_size": 10,
		"next": null,
		"previous": null,
		"total_page": 1,
		"results": [
			{
				"id": 18,
				"property_details": {
					"id": 1,
					"title": "New-Property 01",
					"description": "In publishing and graphic design."
				}
			}
            ...
		]
	}
     ```
   - Expect Status
     - 201
- Remove
  - URL [__DELETE__] `/property/api/prospect-favorite/remove/<int:prospect_property_favorite_object_id>`
  - Expected Status
    - 204
	