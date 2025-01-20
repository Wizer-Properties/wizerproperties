# Use an official Python runtime as a parent image
FROM python:3.11

# Set environment variables for Django (customize as needed)
ENV DJANGO_SETTINGS_MODULE=wizerproperties.settings
ENV PYTHONUNBUFFERED 1

# Set the working directory in the container
WORKDIR /app

# Install GDAL dependencies
RUN apt-get update && apt-get install -y \
    gdal-bin \
    libgdal-dev \
    && rm -rf /var/lib/apt/lists/*

ENV GDAL_LIBRARY_PATH /usr/lib/libgdal.so

# Copy the poetry.lock and pyproject.toml files and install dependencies
COPY poetry.lock pyproject.toml /app/
RUN pip install poetry && poetry config virtualenvs.create false && poetry install --no-root

# Copy the project files into the container
COPY . /app/
