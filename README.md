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
sudo docker compose build --no-cache
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
sudo docker compose run --rm web python manage.py migrate
```

##### Up

```sh
sudo docker compose up
```

### Install Packages Via Poetry

##### Package installation

```bash
poetry add <package name>@<version>
```

### Integrate CHATGPT-3.5
* For integrating ChatGPT API, first of all have to generate new API key from `platform.openai.com`.
* Then assign generated API key to `OPENAI_API_KEY` in `.env` file.


## For deployment in production
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
