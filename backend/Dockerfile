# Use a imagem oficial do Node.js como base
FROM node:18-alpine

# Defina o diretório de trabalho dentro do contêiner
WORKDIR /usr/src/app

# Copie os arquivos de dependência
# O wildcard (*) é usado para copiar tanto package.json quanto package-lock.json
COPY package*.json ./

# Instale as dependências do projeto
# Usamos --only=production para instalar apenas as dependências necessárias em produção
RUN npm install --only=production

# Copie o resto do código-fonte da aplicação
COPY . .

# Exponha a porta que o servidor está usando
EXPOSE 3001

# Comando para iniciar a aplicação
CMD [ "node", "src/index.js" ]
