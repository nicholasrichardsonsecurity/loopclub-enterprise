# Sprint 01 — Fundação Técnica

## Objetivo
Criar o repositório executável inicial do LoopClub Enterprise.

## Entregas

- Monorepo organizado
- PostgreSQL via Docker Compose
- Backend NestJS com Swagger
- Prisma schema inicial
- Auth inicial com registro/login e JWT
- CRUD inicial de empresas
- Admin Web Next.js com dashboard visual
- Flutter com Splash, Login e Carteira Cliente visual

## Critérios de Aceite

1. `docker compose up -d postgres` sobe o banco.
2. Backend instala dependências e executa `npm run start:dev`.
3. Swagger abre em `/docs`.
4. Prisma gera client com `npx prisma generate`.
5. Admin Web abre em `localhost:3001`.
6. Flutter executa splash/login/home.

## Próxima Sprint

Sprint 02 — Autenticação robusta + RBAC + seed inicial.
