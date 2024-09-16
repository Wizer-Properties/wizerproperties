# WIZERPROPERTIES

## Installations Process

> Note: You should have installed docker to your machine for running successfully.

```sh
cd src
```

```
Create a .env file in project src directory following demo.env file.
```

### Docker Basic Command

#### Build

```sh
sudo docker compose -f docker-compose-dev.yml build
```

##### Case-Insensitive Field Configuration in Postgresql
> If you need to create case-insensitive fields in your models, follow these steps:

Create a new field in your model and set its `db_collation` attribute to ensure case-insensitivity. For example:
```python
email = models.EmailField(db_collation="case_insensitive", unique=True)
```

Before running the migration, make sure have/add `CreateCollation` before the first `CreateModel` operation in the initial migration. For example:
```python
from django.contrib.postgres.operations import CreateCollation

dependencies = [
    ... your dependency
]

operations = [
    CreateCollation(
        "case_insensitive",
        provider="icu",
        locale="und-u-ks-level2",
        deterministic=False,
    ),
    migrations.CreateModel(
        ... Your code
    ),
    
]
```
Reference:
https://docs.djangoproject.com/en/4.2/ref/contrib/postgres/fields/#citext-fields
https://docs.djangoproject.com/en/4.2/ref/contrib/postgres/operations/#managing-collations-using-migrations


##### Migrate

```sh
sudo docker compose -f docker-compose-dev.yml run --rm web python manage.py migrate
```

##### Up

```sh
sudo docker compose -f docker-compose-dev.yml up
```

### Install Packages Via Poetry

##### Package installation

```bash
poetry add <package name>@<version>
```

### Integrate CHATGPT-3.5
* For integrating ChatGPT API, first of all have to generate new API key from `platform.openai.com`.
* Then assign generated API key to `OPENAI_API_KEY` in `.env` file.


## For deployment in live server (production)
```
Create a default.conf in src/nginx/conf/ folder and write configuration step by step 
```
### Get new certificate
```
sudo docker compose run --rm certbot certonly --webroot --webroot-path /var/www/certbot/ -d wizerproperties.com -d www.wizerproperties.com
``` 
### For renew certificate
```
sudo docker compose run --rm certbot renew
```
## Admin Customization

In our project, we use a custom admin site. When registering models in the Django admin, follow these rules to ensure consistency and proper integration.

### Normal Model Registration

For models that do not require additional customization, use the following format to register them with the `custom_admin_site`:

```python
from core.admin import custom_admin_site

### Registering a model with the custom admin site
custom_admin_site.register(ModelName)
```
>Note: Replace ModelName with the actual model class being registered.

### Model Registration with Admin Customization
For models that require custom admin options (e.g., `list_display`, `search_fields`), use the `@admin.register` decorator with the `custom_admin_site`:
```python
from django.contrib import admin
from core.admin import custom_admin_site

@admin.register(ModelName, site=custom_admin_site)
class ModelNameAdmin(admin.ModelAdmin):
    pass  # Add your custom admin configurations here (optional)
```
>Note: Replace ModelName with the actual model class being registered.
