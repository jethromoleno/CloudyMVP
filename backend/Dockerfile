# Use a Python base image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED 1
ENV DJANGO_SETTINGS_MODULE core.settings

# Set work directory
WORKDIR /app

# Install dependencies
COPY requirements.txt /app/
# Install system dependencies needed for psycopg2 (PostgreSQL adapter)
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy the rest of the application code
COPY . /app/

# Expose the port Django will run on (e.g., 8000)
EXPOSE 8000