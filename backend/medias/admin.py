from django.contrib import admin
from .models import Midia


@admin.register(Midia)
class MidiaAdmin(admin.ModelAdmin):
    list_display = ('cod_documento', 'num_fita', 'titulo')
    search_fields = ('titulo',)
    # list_filter = ('data',)