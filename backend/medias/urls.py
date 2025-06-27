from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MidiaViewSet, LocalViewSet, FonteViewSet, ProgramaViewSet, ResumoViewSet,
    login_view, CustomAuthToken,
    LocalAdminViewSet, ProgramaAdminViewSet, FonteAdminViewSet
)

# Rotas públicas principais da API
router = DefaultRouter()
router.register(r'midias', MidiaViewSet)
router.register(r'locais', LocalViewSet)
router.register(r'fontes', FonteViewSet)
router.register(r'programas', ProgramaViewSet)
router.register(r'resumos', ResumoViewSet)

# Rotas administrativas de normalização
admin_router = DefaultRouter()
admin_router.register(r'locais-admin', LocalAdminViewSet, basename='locais-admin')
admin_router.register(r'programas-admin', ProgramaAdminViewSet, basename='programas-admin')
admin_router.register(r'fontes-admin', FonteAdminViewSet, basename='fontes-admin')

urlpatterns = [
    # API pública
    path('', include(router.urls)),
    path('admin/', include(admin_router.urls)),
    path('login/', login_view),
    path('token-auth/', CustomAuthToken.as_view()),
]
