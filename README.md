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

## Autenticação (Etapa 2)

Rotas:

- `POST /api/auth/register`
- `POST /api/auth/login` (`rememberMe` opcional)
- `POST /api/auth/refresh` (cookie httpOnly)
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

UI: `/login`, `/register`, `/forgot-password`, `/reset-password`, área protegida `/app`.

Em desenvolvimento, o forgot-password devolve `resetUrl` no JSON para facilitar o teste.

## Etapas do projeto

1. Fundação — scaffold, Docker, tema, estrutura
2. Autenticação — JWT, refresh, remember me, recuperação
3. Layout do app — sidebar, topbar, tema, toasts, empty/error/skeleton
4. Dashboard — KPIs, filtros de período, gráficos Recharts + seed
5. Gestão de usuários — CRUD, cargos, permissões, foto, filtros, paginação
6. Gestão de produtos — CRUD, categorias, preço, estoque, status, imagem
7. **Relatórios e perfil** — tabela/export, perfil, empresa, sessões, notificações
8. **Polimento** — lazy loading, code splitting, SEO básico
# insight-Analytics
