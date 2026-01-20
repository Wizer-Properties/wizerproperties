# Use an official Python runtime as a parent image
# Build context: src/ (e.g. docker compose -f src/docker-compose.yml from project root)
FROM python:3.12

# Set environment variables for Django
ENV DJANGO_SETTINGS_MODULE=wizerproperties.settings
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Set the working directory in the container
WORKDIR /app

# Install GDAL dependencies and Node.js
RUN apt-get update && apt-get install -y --no-install-recommends \
    gdal-bin \
    libgdal-dev \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g typescript

ENV GDAL_LIBRARY_PATH=/usr/lib/libgdal.so

# Copy the poetry.lock and pyproject.toml files and install dependencies without root
# package-mode = false in pyproject.toml file
# To avoid this error: The current project could not be installed: Readme path `/app/README.md` does not exist.
COPY poetry.lock pyproject.toml /app/
RUN pip install poetry && poetry config virtualenvs.create false && poetry install --no-root

# Copy entrypoint script and set permissions
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Copy the project files into the container
COPY . /app/

# Set entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]
