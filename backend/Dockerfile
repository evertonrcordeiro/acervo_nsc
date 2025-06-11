# Usa a imagem mais recente do Python
FROM python:3.12-slim

# Instala pacotes necessários do sistema
RUN apt-get update && apt-get install -y \
    gcc \
    libldap2-dev \
    libsasl2-dev \
    libssl-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos do projeto
COPY . /app/

# Instala dependências
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Expõe a porta do Django
EXPOSE 8000

# Comando padrão ao iniciar o container
CMD ["python", "backend/manage.py", "runserver", "0.0.0.0:8000"]

