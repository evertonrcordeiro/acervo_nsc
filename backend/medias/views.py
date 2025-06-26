# medias/views.py

from rest_framework import viewsets, status, filters
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate


from django_filters.rest_framework import DjangoFilterBackend

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination


from rest_framework.decorators import action


from .models import Midia, Local, Fonte, Programa, Resumo
from .serializers import (
    MidiaSerializer,
    LocalSerializer,
    FonteSerializer,
    ProgramaSerializer,
    ResumoSerializer
)




class MidiaPagination(PageNumberPagination):
    page_size = 10  # ajuste conforme desejar

class MidiaListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        midias = Midia.objects.all()  # ou com o filtro se quiser
        print("Total de mídias:", midias.count())
        paginator = MidiaPagination()
        result_page = paginator.paginate_queryset(midias, request)
        serializer = MidiaSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)


class MidiaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Midia.objects.all().select_related('resumo', 'id_local')
    serializer_class = MidiaSerializer
    pagination_class = MidiaPagination
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['cod_documento', 'num_fita', 'titulo']


class LocalViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Local.objects.all()
    serializer_class = LocalSerializer

class FonteViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Fonte.objects.all()
    serializer_class = FonteSerializer

class ProgramaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Programa.objects.all()
    serializer_class = ProgramaSerializer



class ResumoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Resumo.objects.all().order_by('id')
    serializer_class = ResumoSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def por_documento(self, request):
        cod_documento = request.query_params.get('cod_documento')
        if not cod_documento:
            return Response({"erro": "Parâmetro 'cod_documento' é obrigatório"}, status=status.HTTP_400_BAD_REQUEST)
        
        resumo = Resumo.objects.filter(id_midia__cod_documento=cod_documento).first()
        if not resumo:
            return Response({"erro": "Resumo não encontrado"}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(resumo)
        return Response(serializer.data)


# class ResumoViewSet(viewsets.ReadOnlyModelViewSet):
#     queryset = Resumo.objects.all().order_by('id')  # <-- ordenação explícita
#     serializer_class = ResumoSerializer

#     def get_queryset(self):
#         cod_documento = self.request.query_params.get('cod_documento')
#         if cod_documento:
#             return Resumo.objects.filter(id_midia__cod_documento=cod_documento).order_by('id')
#         return Resumo.objects.all().order_by('id')

# class ResumoDetail(APIView):
#     def get(self, request):
#         cod_documento = request.query_params.get('id_midia')
#         if not cod_documento:
#             return Response({"error": "Parâmetro 'cod_documento' é obrigatório."}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             resumo = Resumo.objects.get(id_midia=cod_documento)
#         except Resumo.DoesNotExist:
#             return Response({"error": "Resumo não encontrado para este código de documento."}, status=status.HTTP_404_NOT_FOUND)

#         serializer = ResumoSerializer(resumo)
#         print("Resumo:", resumo)
#         return Response(serializer.data)


# Exemplo simples usando @api_view (opcional, pode usar só CustomAuthToken)
@api_view(['POST'])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('senha')  # conforme seu frontend

    user = authenticate(username=username, password=password)
    if user is not None:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'success': True,
            'token': token.key,
            'username': user.username,
        })
    else:
        return Response({'success': False, 'error': 'Usuário ou senha inválidos'}, status=status.HTTP_401_UNAUTHORIZED)


# Ou use a classe CustomAuthToken (melhor para DRF)


class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        token = Token.objects.get(key=response.data['token'])
        return Response({
            'token': token.key,
            'user_id': token.user_id,
            'email': token.user.email,
        })