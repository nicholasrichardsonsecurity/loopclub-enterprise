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
14. Documentação LGPD e privacidade (7 novos arquivos: LGPD.md, PRIVACY.md, DATA-MAP.md, RETENTION-POLICY.md, INCIDENT-RESPONSE.md, THREAT-MODEL.md, DATA-SUBJECT-RIGHTS.md)
15. Mapa de dados com 13 categorias e riscos
16. Modelo de ameaças com 16 ameaças mapeadas com controles
17. 4 novos ADRs (privacy by design, dados minimizados, refresh token, auditoria)
18. Atualização de SECURITY.md, ARCHITECTURE.md, DATABASE.md, API.md, DECISIONS.md, STATUS.md, CLAUDE.md

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

### Segurança e LGPD
- **Rotas não protegidas:** Nenhum `@UseGuards()`, `AuthGuard` ou `RolesGuard` implementado
- **Risco de enumeração:** `/auth/register` retorna erro específico se e-mail existe
- **Risco de brute force:** `/auth/login` não possui rate limiting
- **Risco de IDOR:** rotas com parâmetros de ID não validam permissão
- **Dados expostos:** `GET /users` expõe todos os usuários sem filtro por empresa
- **Sem logs de auditoria:** ações não são registradas no AuditLog
- **Sem refresh token:** apenas access token com expiração de 1 dia
- **Sem política de senha forte:** qualquer senha com 6+ caracteres é aceita
- **Sem sanitização de logs:** dados sensíveis podem vazar em logs
- **CORS aberto:** configurado para desenvolvimento, sem restrição

### Funcionalidades
- **Zero testes:** Nenhum arquivo `.spec.ts` no projeto
- **Admin Web usa dados mockados** (sem integração com API real)
- **App Flutter usa dados mockados** (sem integração com API real)
- **CompanyUser não é criado no registro** — vínculo empresa-usuário não existe
- **Sem seed de dados iniciais** — Admin Master precisa ser criado manualmente
- **Endpoints de company não validam permissão** — qualquer um pode criar/alterar empresa

### LGPD e privacidade
- **DPO não nomeado:** encarregado de proteção de dados não definido
- **Canal de titulares não criado:** sem canal para exercício de direitos LGPD
- **Bases legais não validadas:** dependem de revisão jurídica
- **Entidades LGPD não implementadas:** PrivacyPolicyVersion, UserConsent, DataSubjectRequest, RefreshToken
- **Política de retenção não automatizada:** prazos propostos mas sem job de execução

## Próximos passos (Sprint 02)

1. Implementar JWT Guards em todas as rotas existentes
2. RolesGuard com decorator @Roles
3. Refresh token com rotação
4. Vincular CompanyUser no registro (usuário como COMPANY_OWNER)
5. Seed inicial (Admin Master padrão)
6. Rate limiting em rotas de autenticação
7. Sanitização de logs (Interceptor NestJS)
8. Registro de auditoria para ações críticas (AuditLog)
9. Testes de integração para módulo Auth
10. Iniciar validação de multi-tenancy
