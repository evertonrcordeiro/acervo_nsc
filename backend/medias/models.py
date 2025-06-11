# Create your models here.
import os
import uuid
from django.db import models
from django.dispatch import receiver
from django.db.models.signals import pre_save, pre_delete
from django.contrib.auth import get_user_model

User = get_user_model()

class Local(models.Model):
    nome = models.CharField(max_length=100, unique=True)
    descricao = models.TextField(null=True, blank=True)
    data_criacao = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = True
        db_table = 'local'
        verbose_name_plural = 'locais'
        ordering = ['nome']

    def __str__(self):
        return self.local

class Fonte(models.Model):
    nome = models.CharField(max_length=100, unique=True)
    # descricao = models.TextField(null=True, blank=True)
    # data_criacao = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = True
        db_table = 'fonte'
        verbose_name_plural = 'fontes'
        ordering = ['nome']

    def __str__(self):
        return self.fonte

class Programa(models.Model):
    id = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=255, unique=True)  # Assumindo que existe esta coluna
    # Adicione outros campos conforme sua tabela programas

    class Meta:
        managed = True
        db_table = 'programa'
        ordering = ['nome']

    def __str__(self):
        return self.nome

class Midia(models.Model):
    class TipoMidia(models.TextChoices):
        VIVO = 'vivo', 'Vivo'
        BRUTA = 'bruta', 'Bruta'
        EDITADA = 'editada', 'Editada'

    class Armazenamento(models.TextChoices):
        DISCO = 'disco', 'Disco'
        LOCAL = 'local', 'Local'
        NUVEM = 'nuvem', 'Nuvem'

    # id = models.AutoField(primary_key=True)
    # cod_documento = models.CharField('Cód Doc.', max_length=50, null=True, blank=True)
    cod_documento = models.CharField('Cód Doc.', max_length=50, primary_key=True)
    num_fita = models.CharField(max_length=50, null=True, blank=True)
    # uuid = models.CharField(max_length=36, unique=True, null=True, blank=True)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    titulo = models.CharField(max_length=255)
    # nome_original = models.CharField(max_length=255)
    tipo_midia = models.CharField(
        max_length=10,
        choices=TipoMidia.choices,
        default=TipoMidia.BRUTA
    )
    
    arquivo = models.FileField(
        'Arquivo', 
        upload_to='medias/',
        blank=True,
        null=True
    )
    nome_original = models.CharField(
        'Nome Original do Arquivo', 
        max_length=255, 
        blank=True
    )
    data_cadastro = models.DateTimeField(auto_now_add=True)
    data_alteracao = models.DateTimeField(auto_now=True)
    duracao = models.CharField(max_length=20, null=True, blank=True)
    timecode = models.CharField(max_length=20, null=True, blank=True)
    data_inclusao = models.DateField(null=True, blank=True)
    id_local = models.ForeignKey(
        Local,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='id_local'
    )
    id_fonte = models.ForeignKey(
        Fonte,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='id_fonte'
    )
    id_programa = models.ForeignKey(
        Programa,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='id_programa'
    )
    observacoes = models.TextField(null=True, blank=True)
    
    armazenamento = models.CharField(
        max_length=10,
        choices=Armazenamento.choices,
        null=True,
        blank=True
    )
    id_usuario = models.ForeignKey(
        User,
        on_delete=models.RESTRICT,
        null=True,
        blank=True,
        db_column='id_usuario'
    )
    ativo = models.BooleanField(default=True)

    # class Meta:
    #     verbose_name = 'Mídia'
    #     verbose_name_plural = 'Mídias'
    #     ordering = ['-data_cadastro']

    # def __str__(self):
    #     return f"{self.titulo} ({self.get_tipo_midia_display()})"


    class Meta:
        managed = True
        ordering = ['-data_cadastro']
        db_table = 'midias'
        verbose_name_plural = 'mídias'
        

    def __str__(self):
        return f"{self.titulo} ({self.cod_documento})"

class Resumo(models.Model):
    id = models.AutoField(primary_key=True)
    id_midia = models.OneToOneField(
        Midia,
        on_delete=models.CASCADE,
        db_column='id_midia'
    )
    resumo = models.TextField()
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)

    class Meta:
        managed = True
        db_table = 'resumos'

    def __str__(self):
        return f"Resumo para {self.id_midia.cod_documento , self.id_midia.titulo}"



class Vocabulario(models.Model):
    cod_vocabulario = models.IntegerField(primary_key=True)
    termo = models.CharField(max_length=255)
    # data_inclusao = models.DateField()

    class Meta:
        db_table = 'vocabulario'
        # managed = False  # Não criar ou alterar a tabela no banco
        managed = True


class Sinonimo(models.Model):
    cod_vocabulario = models.ForeignKey(Vocabulario, on_delete=models.DO_NOTHING, related_name='sinonimos')
    cod_sinonimo = models.ForeignKey(Vocabulario, on_delete=models.DO_NOTHING, related_name='referenciado_como_sinonimo')
    tipo_use = models.CharField(max_length=50)

    class Meta:
        db_table = 'sinonimos'
        # managed = False
        managed = True



class MidiaVocabulario(models.Model):
    cod_midia = models.ForeignKey(Midia, on_delete=models.DO_NOTHING)
    cod_vocabulario = models.ForeignKey(Vocabulario, on_delete=models.DO_NOTHING)

    class Meta:
        db_table = 'midias_vocabulario'
        # managed = False
        managed = True
        unique_together = (('cod_midia', 'cod_vocabulario'),)




# Signals para tratamento de arquivos

@receiver(pre_save, sender=Midia)
def process_uploaded_file(sender, instance, **kwargs):
    """
    Processa o arquivo enviado antes de salvar:
    1. Armazena o nome original
    2. Renomeia o arquivo usando UUID
    3. Atualiza metadados automaticamente
    """
    if instance.arquivo:
        # Se é um novo arquivo ou está sendo atualizado
        if not instance.pk or instance.arquivo._file is not None:
            # Salva o nome original
            instance.nome_original = instance.arquivo.name
            
            # Renomeia o arquivo usando UUID
            ext = os.path.splitext(instance.arquivo.name)[1].lower()
            instance.arquivo.name = f"medias/{instance.uuid}{ext}"
            
            # Aqui você pode adicionar lógica para extrair outros metadados
            # Exemplo: duração, tipo de mídia, etc.
            # Isso dependerá do tipo de arquivo (áudio, vídeo, imagem)

@receiver(pre_delete, sender=Midia)
def delete_midia_files(sender, instance, **kwargs):
    """Deleta arquivos físicos quando a mídia é removida"""
    if hasattr(instance, 'arquivo') and instance.arquivo:
        if os.path.isfile(instance.arquivo.path):
            try:
                os.remove(instance.arquivo.path)
            except:
                pass

def extract_metadata(self):
    """Extrai metadados do arquivo (implementação básica)"""
    if self.arquivo:
        file_path = self.arquivo.path
        file_size = os.path.getsize(file_path)
        
        # Aqui você pode adicionar lógica específica para cada tipo de arquivo
        if self.tipo_midia == 'audio':
            # Usar biblioteca como mutagen para áudio
            pass
        elif self.tipo_midia == 'video':
            # Usar OpenCV ou similar para vídeo
            pass
        
        return {
            'size': file_size,
            'extension': os.path.splitext(self.arquivo.name)[1]
        }
    return None            


# import os
# import uuid
# from django.db import models
# from django.dispatch import receiver
# from django.db.models.signals import pre_delete
# from django.core.exceptions import ValidationError

# class Media(models.Model):
#     TIPO_CHOICES = [
#         ('imagem', 'Imagem'),
#         ('video', 'Vídeo'),
#         ('audio', 'Áudio'),
#         ('documento', 'Documento'),
#     ]

#     id = models.UUIDField(
#         primary_key=True,
#         default=uuid.uuid4,
#         editable=False,
#         unique=True
#     )
#     titulo = models.CharField(max_length=255)
#     arquivo = models.FileField(upload_to='medias/')
#     nome_original = models.CharField(max_length=255, blank=True)
#     tipo = models.CharField(max_length=50, choices=TIPO_CHOICES)
#     data_upload = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         verbose_name = 'Mídia'
#         verbose_name_plural = 'Mídias'
#         ordering = ['-data_upload']

#     def __str__(self):
#         return f"{self.titulo} ({self.id})"

#     def save(self, *args, **kwargs):
#         if not self.nome_original and self.arquivo:
#             self.nome_original = self.arquivo.name
        
#         if self.arquivo:
#             ext = os.path.splitext(self.arquivo.name)[1]
#             self.arquivo.name = f"{self.id}{ext}"
        
#         super().save(*args, **kwargs)

# @receiver(pre_delete, sender=Media)
# def delete_media_file(sender, instance, **kwargs):
#     if instance.arquivo and os.path.isfile(instance.arquivo.path):
#         try:
#             os.remove(instance.arquivo.path)
#         except:
#             pass