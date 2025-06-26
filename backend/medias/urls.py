from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MidiaViewSet, LocalViewSet, FonteViewSet, ProgramaViewSet, ResumoViewSet, login_view, CustomAuthToken

router = DefaultRouter()
router.register(r'midias', MidiaViewSet)
router.register(r'locais', LocalViewSet)
router.register(r'fontes', FonteViewSet)
router.register(r'programas', ProgramaViewSet)
router.register(r'resumos', ResumoViewSet)

urlpatterns = [
    path('', include(router.urls)),        # inclui as rotas automáticas dos viewsets
    path('login/', login_view),             # rota de login customizada (se existir)
    path('token-auth/', CustomAuthToken.as_view()),  # rota para autenticação token DRF
]
