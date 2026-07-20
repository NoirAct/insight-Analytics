# Insight Analytics

Plataforma SaaS de monitoramento e análise de indicadores de negócio.

## Stack

| Camada | Tecnologias |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS, Framer Motion, TanStack Query, Recharts |
| Backend | Node.js, Express, TypeScript, Prisma, JWT, PostgreSQL |
| Infra | Docker (PostgreSQL + Redis) |

## Estrutura

```
.
├── frontend/          # App React
├── backend/           # API Express
└── docker-compose.yml # Postgres + Redis
```

## Pré-requisitos

- Node.js 20+
- Docker Desktop

## Setup (Etapa 1)

```bash
# 1. Subir banco e cache
docker compose up -d

# 2. Backend
cd backend
cp .env.example .env   # já existe .env de desenvolvimento
npm install
npx prisma generate
npx prisma db push
npm run dev            # http://localhost:3333

# 3. Frontend (outro terminal)
cd frontend
npm install
npm run dev            # http://localhost:5173
```

Health check da API: `GET http://localhost:3333/api/health`

## Etapas do projeto

1. **Fundação** — scaffold, Docker, tema, estrutura
2. Autenticação
3. Layout do app
4. Dashboard
5. Gestão de usuários
6. Gestão de produtos
7. Relatórios e perfil
8. Polimento (performance, Lighthouse)
# insight-Analytics
