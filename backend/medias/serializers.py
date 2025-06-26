# medias/serializers.py
from rest_framework import serializers
from .models import Midia, Local, Fonte, Programa, Resumo


class LocalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Local
        fields = '__all__'

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
    resumo = serializers.SerializerMethodField()
    id_local = LocalSerializer()  # aninha o local completo

    class Meta:
        model = Midia
        # fields = ['cod_documento', 'num_fita', 'titulo', 'resumo', 
        # 'data_cadastro', 'data_inclusao', 'id_fonte', 'id_programa', 'id_local']
        fields = '__all__'        

    def get_resumo(self, obj):
        try:
            return obj.resumo.resumo
        except Resumo.DoesNotExist:
            return None



