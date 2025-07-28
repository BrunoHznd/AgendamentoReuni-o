# Estágio 1: Build da aplicação React
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

# O Traefik vai cuidar do roteamento para a API, então não precisamos
# da variável de ambiente VITE_API_BASE_URL no build.
# O frontend fará chamadas para /api/..., e o Traefik redirecionará.
RUN npm run build

# Estágio 2: Servir os arquivos estáticos
FROM node:18-alpine

WORKDIR /app

# Instala o 'serve', um servidor estático simples
RUN npm install -g serve

# Copia os arquivos do build do estágio anterior
COPY --from=build /app/dist .

# Expõe a porta 3000, que o 'serve' usará
EXPOSE 3000

# Comando para iniciar o servidor estático
# -s: Serve como Single-Page App (essencial para React Router)
# -l 3000: Escuta na porta 3000
CMD ["serve", "-s", "-l", "3000"]