from pathlib import Path
import os
import ldap
import logging
from django_auth_ldap.config import LDAPSearch, GroupOfNamesType
from datetime import timedelta

# === BASE ===
BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = 'django-insecure-$lfvg*3$^k_2n$^_xx=p3dw0%x7%5(pq3i%#9yl*vg(has_-10'
DEBUG = True
ALLOWED_HOSTS = []

# === APPS ===
INSTALLED_APPS = [
    'corsheaders',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'django_filters',
    'medias',
]

# === MIDDLEWARE ===
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

CORS_ALLOW_ALL_ORIGINS = True

# === STATIC & MEDIA ===
STATIC_URL = 'static/'
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# === TEMPLATES ===
ROOT_URLCONF = 'acervo.urls'
TEMPLATES = [{
    'BACKEND': 'django.template.backends.django.DjangoTemplates',
    'DIRS': [],
    'APP_DIRS': True,
    'OPTIONS': {
        'context_processors': [
            'django.template.context_processors.request',
            'django.contrib.auth.context_processors.auth',
            'django.contrib.messages.context_processors.messages',
        ],
    },
}]

WSGI_APPLICATION = 'acervo.wsgi.application'

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django.db.backends': {
            'level': 'INFO',  # Mostra os SQLs executados
            'handlers': ['console'],
        },
    },
    
}

# Nível	Recomendação de uso
# DEBUG	Desenvolvimento (log de queries, variáveis internas)
# INFO	Produção (logs de ações importantes)
# WARNING	Produção (avisos de problemas não críticos)
# ERROR	Produção (erros que devem ser monitorados)
# CRITICAL	Emergências (problemas graves que exigem ação imediata)
# 'django.db.backends': {
#     'level': 'WARNING',  # Quase não emite logs (só avisos/erros graves)
#     # ou
#     'level': 'ERROR',   # Apenas erros
#     # ou desabilitar totalmente:
#     'handlers': ['null'],  # Se configurado no handlers
# }



# === DB ===
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get("POSTGRES_DB"),
        'USER': os.environ.get("POSTGRES_USER"),
        'PASSWORD': os.environ.get("POSTGRES_PASSWORD"),
        'HOST': 'postgres',
        'PORT': '5432',
    }
}
print("DB PASS:", os.environ.get("POSTGRES_PASSWORD"))

# === AUTH ===
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    # 'PAGE_SIZE': 1,
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
    ]    
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Sao_Paulo'
USE_I18N = True
USE_TZ = True
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# === LDAP ===
ldap.set_option(ldap.OPT_REFERRALS, 0)
ldap.set_option(ldap.OPT_NETWORK_TIMEOUT, 5)

AUTH_LDAP_SERVER_URI = "ldap://172.17.48.28"  # usando IP diretamente

AUTH_LDAP_BIND_DN = "svr_ldap@somosnsc.com.br"
AUTH_LDAP_BIND_PASSWORD = "Hot2trot1!"

AUTH_LDAP_USER_SEARCH = LDAPSearch(
    "DC=somosnsc,DC=com,DC=br",
    ldap.SCOPE_SUBTREE,
    "(sAMAccountName=%(user)s)"
)

AUTH_LDAP_GROUP_SEARCH = LDAPSearch(
    "OU=Users comuns,DC=nscflp,DC=com",
    ldap.SCOPE_SUBTREE,
    "(objectClass=group)"
)

AUTH_LDAP_GROUP_TYPE = GroupOfNamesType()
AUTH_LDAP_REQUIRE_GROUP = "CN=G-ACERVO,OU=GRUPOS,OU=Users comuns,DC=nscflp,DC=com"

AUTH_LDAP_USER_ATTR_MAP = {
    "first_name": "givenName",
    "last_name": "sn",
    "email": "mail",
}

AUTH_LDAP_BIND_AS_AUTHENTICATING_USER = False

# ⚠️ Temporariamente desabilitado para melhorar desempenho
AUTH_LDAP_MIRROR_GROUPS = False
AUTH_LDAP_ALWAYS_UPDATE_USER = False

AUTH_LDAP_GLOBAL_OPTIONS = {
    ldap.OPT_REFERRALS: 0,
}

# Ordem correta: tenta local primeiro
AUTHENTICATION_BACKENDS = [
    # 'django_auth_ldap.backend.LDAPBackend',
    'django.contrib.auth.backends.ModelBackend',
]

# === Logging LDAP para debug ===
logger = logging.getLogger('django_auth_ldap')
logger.addHandler(logging.StreamHandler())
logger.setLevel(logging.DEBUG)
