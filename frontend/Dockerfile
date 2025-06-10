FROM node:24-alpine

WORKDIR /app

COPY package*.json ./


RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]




# # Imagem base com Node.js
# FROM node:18-alpine

# # Diretório de trabalho
# WORKDIR /app

# # Copiar os arquivos para o container
# COPY . .

# # Instalar dependências
# RUN npm install

# # Construir o frontend
# RUN npm run build

# # Expor a porta (caso use dev server)
# EXPOSE 5173

# # Comando padrão
# CMD ["npm", "run", "dev"]
