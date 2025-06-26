from rest_framework import viewsets, status
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth import authenticate

from django.db.models import Q, BooleanField, Case, When, Value
from django.utils.dateparse import parse_date

from .models import Midia, Local, Fonte, Programa, Resumo
from .serializers import (
    MidiaSerializer, LocalSerializer, FonteSerializer,
    ProgramaSerializer, ResumoSerializer
)


class MidiaPagination(PageNumberPagination):
    page_size = 10


class MidiaViewSet(viewsets.ModelViewSet):
    queryset = Midia.objects.select_related('id_local').all()
    serializer_class = MidiaSerializer
    pagination_class = MidiaPagination

    def list(self, request, *args, **kwargs):
        search = request.query_params.get('search', '').strip()
        tipo_resultado = request.query_params.get('tipo_resultado', '').lower()
        termos = [t for t in search.split('+') if t]

        campos = ['titulo', 'resumo__resumo', 'observacoes', 'num_fita', 'cod_documento']
        filtro_or = Q()
        filtro_and_list = []
        count_por_termo = {}

        for termo in termos:
            filtro_termo_or = Q()
            count_por_termo[termo] = {}

            for campo in campos:
                filtro_campo = Q(**{f"{campo}__icontains": termo})
                filtro_termo_or |= filtro_campo

                try:
                    count = Midia.objects.filter(filtro_campo).distinct().count()
                except Exception:
                    count = 0

                campo_nome = campo.split("__")[0]
                count_por_termo[termo][campo_nome] = count

            filtro_or |= filtro_termo_or
            filtro_and_list.append(filtro_termo_or)

        queryset_or = self.queryset.filter(filtro_or).distinct() if termos else self.queryset
        queryset_and = self.queryset
        for filtro in filtro_and_list:
            queryset_and = queryset_and.filter(filtro)
        queryset_and = queryset_and.distinct() if termos else self.queryset

        # Filtros adicionais
        data_after = request.query_params.get('data_inclusao_after')
        data_before = request.query_params.get('data_inclusao_before')
        id_local = request.query_params.get('id_local')
        id_programa = request.query_params.get('id_programa')
        id_fonte = request.query_params.get('id_fonte')

        def aplicar_filtros_extras(queryset):
            if data_after:
                queryset = queryset.filter(data_inclusao__gte=parse_date(data_after))
            if data_before:
                queryset = queryset.filter(data_inclusao__lte=parse_date(data_before))
            if id_local:
                queryset = queryset.filter(id_local_id=id_local)
            if id_programa:
                queryset = queryset.filter(id_programa_id=id_programa)
            if id_fonte:
                queryset = queryset.filter(id_fonte_id=id_fonte)
            return queryset

        queryset_or = aplicar_filtros_extras(queryset_or)
        queryset_and = aplicar_filtros_extras(queryset_and)

        if tipo_resultado == 'ou':
            queryset_final = queryset_or
        elif tipo_resultado == 'e':
            queryset_final = queryset_and
        else:
            queryset_final = queryset_or

        cod_documentos_and = set(queryset_and.values_list('cod_documento', flat=True))

        queryset_final = queryset_final.annotate(
            faz_parte_do_AND=Case(
                When(cod_documento__in=cod_documentos_and, then=Value(True)),
                default=Value(False),
                output_field=BooleanField()
            )
        )

        page = self.paginate_queryset(queryset_final)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            paginated_response = self.get_paginated_response(serializer.data)
            paginated_response.data['count_or'] = queryset_or.count()
            paginated_response.data['count_and'] = queryset_and.count()
            paginated_response.data['count_por_termo'] = count_por_termo
            return paginated_response

        serializer = self.get_serializer(queryset_final, many=True)
        return Response({
            "results": serializer.data,
            "count": queryset_final.count(),
            "count_or": queryset_or.count(),
            "count_and": queryset_and.count(),
            "count_por_termo": count_por_termo,
        })


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


@api_view(['POST'])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('senha')

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


class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        token = Token.objects.get(key=response.data['token'])
        return Response({
            'token': token.key,
            'user_id': token.user_id,
            'email': token.user.email,
        })
