import os
from backend.acervo.celery import Celery

# Ajuste para o nome real do módulo onde está settings.py
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'acervo.settings')

app = Celery('acervo')

app.config_from_object('django.conf:settings', namespace='CELERY')

app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
