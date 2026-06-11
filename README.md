# Urbanus IA (Frontend + API + Database)

Plataforma de regularizacao fundiaria com modulos REURB-E/S, Rural, GIS, GED/ECM e assistente de IA Aisha.

## Arquitetura atual

- Frontend: React + Vite
- Backend API: Express + TypeScript
- IA: Gemini via proxy seguro no backend
- Banco: PostgreSQL + PostGIS

## Pre-requisitos

- Node.js 20+
- PostgreSQL 15+
- Extensao PostGIS habilitada

## Configuracao inicial

1. Instale dependencias:
   `npm install`
2. Crie o arquivo de ambiente a partir do modelo:
   `copy .env.example .env`
3. Ajuste variaveis no `.env`:
   - `GEMINI_API_KEY`
   - `DATABASE_URL`
   - `JWT_SECRET`

## Banco de dados

As migracoes estao em `database/migrations`.

1. Validar conexao:
   `npm run db:check`
2. Executar migracoes:
   `npm run db:migrate`

## Desenvolvimento

- Frontend apenas:
  `npm run dev`
- API apenas:
  `npm run dev:server`
- Frontend + API juntos:
  `npm run dev:all`

## Build

`npm run build`

## Endpoints principais

- Health API: `GET /api/health`
- Health banco: `GET /api/health/db`
- Aisha (proxy seguro): `POST /api/aisha/analyze`
