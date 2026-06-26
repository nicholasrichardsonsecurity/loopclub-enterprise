# LoopClub Enterprise — Sprint 01

Fundação técnica do LoopClub SaaS v1.0.

## Objetivo
Criar a base profissional do projeto:

- Monorepo organizado
- Backend NestJS com Prisma
- PostgreSQL via Docker
- Admin Web Next.js base
- Mobile Flutter base
- Documentação viva

## Estrutura

```txt
loopclub_enterprise_sprint01/
├── apps/
│   ├── admin-web/
│   └── mobile/
├── backend/
├── database/
├── docs/
├── infra/
├── packages/
└── docker-compose.yml
```

## Como executar

### 1. Subir banco PostgreSQL

```bash
docker compose up -d postgres
```

### 2. Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run start:dev
```

Backend: http://localhost:3000
Swagger: http://localhost:3000/docs
Prisma Studio:

```bash
npx prisma studio
```

### 3. Admin Web

```bash
cd apps/admin-web
npm install
npm run dev
```

Admin: http://localhost:3001

### 4. Mobile Flutter

```bash
cd apps/mobile
flutter pub get
flutter run
```

## Credenciais iniciais

Ainda não há seed obrigatório nesta Sprint. A Sprint 02 criará login funcional completo.

## Status

Esta Sprint entrega a fundação. Não é o produto final, mas já é a base correta para evoluir.
