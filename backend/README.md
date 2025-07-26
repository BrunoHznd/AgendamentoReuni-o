# Backend - ReuniãoProjeto

Backend Node.js/Express para agendamento de reuniões integrado ao Notion.

## Como rodar

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Copie o arquivo `.env.example` para `.env` e ajuste os valores se necessário:
   ```bash
   cp .env.example .env
   ```
3. Inicie o servidor:
   ```bash
   npm run dev
   ```

O backend ficará disponível em http://localhost:8000

## Endpoints principais

- `GET /meetings` — Lista todas as reuniões
- `POST /meetings` — Cria uma nova reunião (também cria no Notion)

## Integração Notion
- É necessário um token de integração e o ID da base de dados do Notion válidos.
- Os campos enviados são: Título, Líder, Tipo, Data do evento, Participantes.


E-mail: admin@reuniao.local
Senha: 123456
