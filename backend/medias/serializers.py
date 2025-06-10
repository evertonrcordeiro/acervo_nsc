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

    class Meta:
        model = Midia
        fields = ['cod_documento', 'num_fita', 'titulo', 'resumo']

    def get_resumo(self, obj):
        try:
            return obj.resumo.resumo
        except Resumo.DoesNotExist:
            return None



