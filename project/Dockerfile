# Estágio 1: Build da aplicação React
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Estágio 2: Servir os arquivos estáticos
FROM node:18-alpine

WORKDIR /app

# Instala o 'serve', um servidor estático simples
RUN npm install -g serve

# Copia os arquivos do build do estágio anterior
COPY --from=build /app/dist .

# Expõe a porta 10050
EXPOSE 10050

# Comando para iniciar o servidor estático
CMD ["serve", "-s", "/app", "-l", "10050", "--no-clipboard", "--single"]