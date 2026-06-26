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
2. Configuração do backend NestJS com TypeScript (compilação validada: `nest build` OK)
3. Schema Prisma (11 modelos, 6 enums)
4. Migration inicial do banco executada e consistente com schema
5. Módulo Auth (register, login, JWT, health)
6. Módulo Companies (list, create, block, unblock)
7. Módulo Users (list)
8. Swagger configurado com Bearer Auth
9. Docker Compose para PostgreSQL 16
10. Admin Web Next.js com layout e dashboard (dados mockados)
11. App Flutter com splash, login e carteira mockada (3 telas)
12. Documentação viva completa (15 arquivos)
13. Arquivos de documentação antigos e duplicados removidos (`docs/api/`, `docs/architecture/`, `docs/database/`)

## Critérios de aceite

| Critério | Status | Validação |
|----------|--------|-----------|
| `docker compose up -d postgres` sobe o banco | ✅ | Docker Compose configurado |
| Backend instala dependências e inicia | ✅ | `nest build` compila sem erros |
| Swagger abre em `/docs` | ✅ | Configurado em `main.ts` |
| Prisma gera client e executa migration | ✅ | Migration `init` executada |
| Admin Web abre em `localhost:3001` | ✅ | Next.js configurado na porta 3001 |
| Flutter executa splash/login/carteira | ✅ | 3 telas implementadas |

## Comandos executados

```powershell
# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run start:dev     # ou nest build para validar compilação

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

> **Nota:** Nenhuma rota possui guarda JWT. A proteção será implementada na Sprint 02.

## Pendências e problemas conhecidos

- **Rotas não protegidas:** Nenhum `@UseGuards()`, `AuthGuard` ou `RolesGuard` implementado
- **Zero testes:** Nenhum arquivo `.spec.ts` no projeto
- **Admin Web usa dados mockados** (sem integração com API real)
- **App Flutter usa dados mockados** (sem integração com API real)
- **CompanyUser não é criado no registro** — vínculo empresa-usuário não existe
- **Sem seed de dados iniciais** — Admin Master precisa ser criado manualmente
- **Endpoints de company não validam permissão** — qualquer um pode criar/alterar empresa
- **Sem refresh token** — apenas access token com expiração de 1 dia

## Próximos passos (Sprint 02)

1. Implementar JWT Guards em todas as rotas existentes
2. RolesGuard com decorator @Roles
3. Refresh token
4. Vincular CompanyUser no registro (usuário como COMPANY_OWNER)
5. Seed inicial (Admin Master padrão)
6. Testes de integração para módulo Auth
7. Iniciar validação de multi-tenancy
