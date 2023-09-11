# WIZERPROPERTIES

## Installations Process
> Note: You should have installed docker to your machine for running successfully.

```
Create a .env file in project root directory following demo.env file.
```

```
cd <project-directory>
```

### Docker Basic Command
#### Build
```sh
sudo docker-compose build --no-cache
```
##### Migrate
```sh
sudo docker-compose run --rm web python manage.py migrate
```
##### Up
```sh
sudo docker-compose up
```

### Install Packages Via Poetry
##### Package installation
```bash
poetry add <package name>@<version>
```
