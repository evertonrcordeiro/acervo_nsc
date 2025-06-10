# medias/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MidiaViewSet, LocalViewSet, FonteViewSet, ProgramaViewSet, ResumoViewSet, MidiaListView, login_view, CustomAuthToken, ResumoDetail

router = DefaultRouter()
# router.register(r'midias', MidiaViewSet)
router.register(r'locais', LocalViewSet)
router.register(r'fontes', FonteViewSet)
router.register(r'programas', ProgramaViewSet)
router.register(r'resumos', ResumoViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', login_view),    
    path('token-auth/', CustomAuthToken.as_view()),
    # path('api/midias/', MidiaListView.as_view(), name='midia-list'),
    path('midias/', MidiaListView.as_view()),
    path('api/resumo/', ResumoDetail.as_view(), name='resumo-detail'),
    # path('api/midias/', MidiaListView.as_view(), name='midia-list'),
]
