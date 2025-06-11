# medias/tasks.py
from backend.acervo.celery import shared_task
import time

@shared_task
def process_file_async(file_path, cod_documento):
    # Simula um processamento longo
    print(f"Processando arquivo {file_path} para midia {cod_documento}")
    time.sleep(10)  # Simulação de demora
    # Aqui você colocaria a lógica real (ex: mover arquivo, extrair metadata)
    return f"Processamento de {file_path} concluído"
