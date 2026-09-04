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

## Demo e deploy

A demo pública é preparada como somente leitura. Com `DEMO_MODE=true`, cadastro,
recuperação de senha e mutações autenticadas são bloqueados; uploads também ficam
indisponíveis, pois o filesystem do serviço é efêmero.

Credenciais fictícias da demo:

```text
E-mail: demo@insight.dev
Senha: DemoInsight2026!
```

### Banco, migration e seed

```bash
cd backend
npm run db:generate
npm run db:deploy
npm run db:seed
```

O seed usa `upsert` e marcadores próprios, podendo ser executado novamente sem
apagar dados. Não use `prisma db push` em produção.

### Backend no Render

O `render.yaml` na raiz define um Web Service com root `backend`, build, start,
health check em `/api/health`; no plano gratuito, o start executa migration e o
seed idempotente antes da API. Em plano pago, esses comandos podem ser movidos
para `preDeployCommand`. Cadastre
`DATABASE_URL`, `CORS_ORIGIN` e `FRONTEND_URL`; mantenha os segredos JWT fora do Git.

### Frontend na Vercel

Use `frontend` como Root Directory, `npm run build` como Build Command e `dist`
como Output Directory. Antes do primeiro deploy, substitua
`REPLACE_WITH_INSIGHT_BACKEND` em `frontend/vercel.json` pelo hostname real do
Render. Cadastre `VITE_DEMO_MODE=true`. O rewrite `/api` deve permanecer antes do
fallback da SPA.

### Variáveis do backend

`NODE_ENV`, `PORT`, `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`,
`JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`,
`JWT_REFRESH_REMEMBER_EXPIRES_IN`, `CORS_ORIGIN`, `FRONTEND_URL`, `DEMO_MODE` e,
opcionalmente, `REDIS_URL`.

### Limitações da demo

- Dados podem ser consultados, mas não alterados.
- Cadastro e recuperação de senha ficam desabilitados.
- Upload de avatar, logo e imagem de produto fica desabilitado.
- Cold starts do plano escolhido podem exigir alguns segundos na primeira carga.
