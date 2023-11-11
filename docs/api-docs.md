### Scheduel
- Create
  - URL [__POST__] `/schedule/api/`
  ```json
    {
      "visiting_time": "2023-10-19T10:46:00Z",
      "content_type_name": "property/building",
      "object_id": 1
    }
  ```
  - Response 
    ```json
    {
      "id": 14,
      "visiting_time": "2023-10-19T10:46:00Z",
      "status": "Pending",
      "content_type": "building",
      "object_id": 1,
      "title": "string",
      "address": "string"
    }
    ```
   - Expected Status
   - 201
- List
  - URL [__GET__] `/schedule/api/`
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
              "id": 14,
              "visiting_time": "2023-10-19T10:46:00Z",
              "status": "Pending",
              "content_type": "building",
              "object_id": 1,
              "title": "string",
              "address": "string"
             }
            ...
    ]
  }
     ```
- Single Schedule
  - URL [__GET__] `/schedule/api/<schedule_id>/`
- Update
  - URL [__PATCH__] `/schedule/api/<schedule_id>/`
  ```json
    {
      "visiting_time": "2023-10-19T10:46:00Z",
      "content_type_name": "property/building",
      "object_id": 1
    }
  ```
  - Response 
    ```json
    {
      "id": 14,
      "visiting_time": "2023-10-19T10:46:00Z",
      "status": "Pending",
      "content_type": "building",
      "object_id": 1,
      "title": "string",
      "address": "string"
    }
    ```
   - Expected Status
   - 200
- Accept
  - URL [__PATCH__] `/schedule/api/<schedule_id>/accept/`
- Cancel
  - URL [__PATCH__] `/schedule/api/<schedule_id>/cancel/`

### Prospect Favorite Property
- Add
  - URL [__POST__] `/property/api/prospect-favorite/add/`
  - Body
    - property
  - Errors Property
    - `__all__` as a key for non fields errors
    - `{field name}` as a key for fields related errors.
  - Expected Status
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
   - Expected Status
     - 201
- Remove
  - URL [__DELETE__] `/property/api/prospect-favorite/remove/<int:prospect_property_favorite_object_id>`
  - Expected Status
    - 204
  
### Building Reviews
- List
  - URL [__GET__] `/building/api/review/list/`
  - Params
    ```json
    params: {
      building_id: 1
    }
    ```
  - Response
    ```json
    [
    {
        "count": 1,
        "page_size": 10,
        "next": null,
        "previous": null,
        "total_page": 1,
        "results": [
            {
                "id": 4,
                "rating": 4,
                "review_text": "Hi",
                "reviewer_details": {
                    "id": 2,
                    "user_type": "prospect",
                    "fullname": "Mahmud Sajib",
                    "profile_image": "prospect_profile_picture/Screenshot_from_2023-11-06_19-22-23.png"
                }
            }
        ]
    },
    ...
    ]
    ```
  - Expected Status
    - 200

 - Create
   - URL [__POST__] `/building/api/review/create/`
   - Body
     ```json
     {
       building: 1,
       rating: 4 # Range from 1 - 5,
       review_text: "Wonderful window scenario"
     }
     ```
   - Expected Status
     - 201 