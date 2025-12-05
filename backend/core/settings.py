import os
from pathlib import Path
from datetime import timedelta
import environ

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# --- Initialize environment variables ---
env = environ.Env(
    # set casting and default values
    DEBUG=(bool, True),
    # Use 0 for default Redis port
    REDIS_PORT=(int, 6379) 
)
# Read the .env file located one directory up (in the project root)
environ.Env.read_env(os.path.join(BASE_DIR.parent, '.env'))


# --- Core Settings ---
SECRET_KEY = env('SECRET_KEY')
DEBUG = env('DEBUG')
ALLOWED_HOSTS = env.list('DJANGO_ALLOWED_HOSTS', default=['127.0.0.1', 'localhost'])

# Use the custom User model
AUTH_USER_MODEL = 'accounts.User'

# Application definition
INSTALLED_APPS = [
    # 1. CUSTOM USER APP MUST BE FIRST!
    'accounts.apps.AccountsConfig', 

    # 2. DJANGO CORE APPS
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
# 3. LOCAL APPS (Ordered by dependency: Master Data before Transactional)
    'customers.apps.CustomersConfig', # Master Data
    'locations.apps.LocationsConfig',   # Master Data
    'trucks.apps.TrucksConfig',       # Master Data
    'employees.apps.EmployeesConfig',   # Master Data
    'trips.apps.TripsConfig',         # Transactional (depends on above)
    'analytics.apps.AnalyticsConfig', # Utility/Reporting
    
    # 4. THIRD-PARTY APPS
    'rest_framework',
    'rest_framework_simplejwt',
    'channels',
    'corsheaders'
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware', # CORS middleware
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

# --- Database Configuration ---
# [cite_start]Uses DATABASE_URL from .env file for Supabase/PostgreSQL [cite: 21]
DATABASES = {
    'default': env.db_url(
        'DATABASE_URL',
        default='sqlite:///db.sqlite3'
    )
}


# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Define the directory where static files will be collected for deployment/serving.
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/' # Correct URL prefix

STATICFILES_DIRS = [
    # This points to your custom SOURCE files (create this folder locally!)
    os.path.join(BASE_DIR, 'static'), 
]

STATICFILES_FINDERS = [
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder', 
]

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# --- Channels / Realtime Configuration ---
ASGI_APPLICATION = 'core.asgi.application'
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.pubsub.RedisPubSubChannelLayer',
        'CONFIG': {
            # [cite_start]Reads REDIS_HOST and REDIS_PORT from .env [cite: 20]
            "hosts": [(env('REDIS_HOST', default='127.0.0.1'), env('REDIS_PORT'))], 
        },
    },
}

# --- CORS Headers Configuration ---
# Allow the React development server to access the backend API
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000", # Default React dev server port
    "http://127.0.0.1:3000",
]

# --- Django REST Framework Settings ---
# Set JWT as the default authentication class
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    # We will add permission settings later
}

# --- djangorestframework-simplejwt Settings ---
from datetime import timedelta

SIMPLE_JWT = {
    # 5 minutes is standard for access tokens
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=5),
    # 1 day is common for refresh tokens
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    
    # We want to rotate refresh tokens for better security
    "ROTATE_REFRESH_TOKENS": True,
    
    # Standard algorithm
    "ALGORITHM": "HS256",
}