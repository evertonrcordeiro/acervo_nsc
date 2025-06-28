from rest_framework import serializers
from .models import Midia, Local, Fonte, Programa, Resumo


class LocalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Local
        fields = ['id', 'nome']


class FonteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fonte
        fields = '__all__'


class ProgramaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Programa
        fields = '__all__'


class ResumoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resumo
        fields = ['resumo']


class MidiaSerializer(serializers.ModelSerializer):
    # Campos para escrita (recebem os IDs no POST/PUT)
    id_local = serializers.PrimaryKeyRelatedField(queryset=Local.objects.all(), write_only=True)
    id_programa = serializers.PrimaryKeyRelatedField(queryset=Programa.objects.all(), write_only=True)
    id_fonte = serializers.PrimaryKeyRelatedField(queryset=Fonte.objects.all(), write_only=True)

    # Campos para leitura (dados aninhados)
    local = LocalSerializer(source='id_local', read_only=True)
    programa = ProgramaSerializer(source='id_programa', read_only=True)
    fonte = FonteSerializer(source='id_fonte', read_only=True)

    faz_parte_do_AND = serializers.BooleanField(read_only=True)  # Campo extra vindo do queryset

    class Meta:
        model = Midia
        fields = [
            'cod_documento', 'num_fita', 'titulo', 'tipo_midia', 'arquivo', 'data_inclusao',
            'duracao', 'timecode', 'armazenamento', 'observacoes',
            'id_local', 'local',
            'id_programa', 'programa',
            'id_fonte', 'fonte',
            'faz_parte_do_AND',
        ]


# class MidiaSerializer(serializers.ModelSerializer):
#     id_local = LocalSerializer(read_only=True)
#     id_programa = ProgramaSerializer(read_only=True)
#     id_fonte = FonteSerializer(read_only=True)
#     # resumo = serializers.SerializerMethodField()
#     faz_parte_do_AND = serializers.BooleanField(read_only=True)  # Campo esperado no queryset

#     class Meta:
#         model = Midia
#         fields = '__all__'  # Ou especifique os campos explicitamente, incluindo 'faz_parte_do_AND'

    # def get_resumo(self, obj):
    #     try:
    #         if hasattr(obj, 'resumo') and obj.resumo:
    #             return obj.resumo.resumo
    #         resumo_obj = Resumo.objects.filter(id_midia=obj).first()
    #         if resumo_obj:
    #             return resumo_obj.resumo
    #         return None
    #     except Exception:
    #         return None
