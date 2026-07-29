"""
BookBridge Main URL Configuration
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from apps.books.views import StatisticsAPIView

urlpatterns = [
    path('admin/', admin.site.urls),

    # Direct Statistics API Endpoint requested by Frontend
    path('api/statistics/', StatisticsAPIView.as_view(), name='api-statistics'),
    path('api/v1/statistics/', StatisticsAPIView.as_view(), name='api-v1-statistics'),

    # JWT Authentication Endpoints
    path('api/v1/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # OpenAPI / Swagger Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # App API Endpoints
    path('api/v1/users/', include('apps.users.urls')),
    path('api/v1/books/', include('apps.books.urls')),
    path('api/v1/exchange/', include('apps.exchange.urls')),
    path('api/v1/donations/', include('apps.donations.urls')),
    path('api/v1/chat/', include('apps.chat.urls')),
    path('api/v1/ai/', include('apps.ai.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
