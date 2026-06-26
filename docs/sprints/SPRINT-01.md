# Sprint 01 — Fundação Técnica

**Período:** Junho de 2026

## Objetivo

Criar a base técnica e executável do LoopClub Enterprise, com monorepo organizado, backend funcional, schema de banco completo, esqueletos dos frontends e documentação viva.

## Escopo

- Monorepo com estrutura padronizada
- Backend NestJS com Prisma, PostgreSQL, Swagger
- Módulos de autenticação, empresas e usuários
- Admin Web Next.js com dashboard visual
- App mobile Flutter com splash, login e carteira
- Schema completo do banco de dados
- Documentação profissional e viva

## Tarefas executadas

1. Criação da estrutura de monorepo (apps, backend, docs, docker, infra, packages)
2. Configuração do backend NestJS com TypeScript
3. Schema Prisma (11 modelos, 4 enums)
4. Migration inicial do banco
5. Módulo Auth (register, login, JWT, health)
6. Módulo Companies (list, create, block, unblock)
7. Módulo Users (list)
8. Swagger configurado com Bearer Auth
9. Docker Compose para PostgreSQL 16
10. Admin Web Next.js com layout e dashboard
11. App Flutter com splash, login e carteira mockada
12. Documentação completa (15 arquivos)

## Critérios de aceite

| Critério | Status |
|----------|--------|
| `docker compose up -d postgres` sobe o banco | ✅ |
| Backend instala dependências e inicia | ✅ |
| Swagger abre em `/docs` | ✅ |
| Prisma gera client e executa migration | ✅ |
| Admin Web abre em `localhost:3001` | ✅ |
| Flutter executa splash/login/carteira | ✅ |

## Comandos executados

```powershell
# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run start:dev

# Admin Web
cd apps/admin-web
npm install
npm run dev

# Mobile
cd apps/mobile
flutter pub get
flutter run

# Banco via Docker
docker compose up -d postgres
```

## Endpoints disponíveis

| Método | Rota | Descrição | Protegido? |
|--------|------|-----------|------------|
| GET | `/auth/health` | Health check | Não |
| POST | `/auth/register` | Registrar usuário | Não |
| POST | `/auth/login` | Login | Não |
| GET | `/users` | Listar usuários | Não |
| GET | `/companies` | Listar empresas | Não |
| POST | `/companies` | Criar empresa | Não |
| PATCH | `/companies/:id/block` | Bloquear empresa | Não |
| PATCH | `/companies/:id/unblock` | Desbloquear empresa | Não |

> **Nota:** Nenhuma rota possui guarda JWT ainda. A proteção será implementada na Sprint 02.

## Pendências e problemas conhecidos

- Rotas não protegidas por JWT (qualquer requisição anônima funciona)
- Sem validação de perfil (RBAC não implementado)
- Admin Web usa dados mockados (sem integração com API)
- App Flutter usa dados mockados (sem integração com API)
- Sem testes automatizados
- CompanyUser não é criado automaticamente no registro
- Sem seed de dados iniciais
- Endpoints de company não validam se o usuário tem permissão

## Próximos passos (Sprint 02)

1. Implementar JWT Guards em todas as rotas
2. RolesGuard com decorator @Roles
3. Refresh token
4. Vincular CompanyUser no registro (usuário como COMPANY_OWNER)
5. Seed inicial (Admin Master padrão)
6. Testes de integração para módulo Auth
7. Iniciar validação de multi-tenancy
