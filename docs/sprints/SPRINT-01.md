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
19. README modernizado com previews ASCII do produto, diagrama Mermaid, seção LGPD e badges reais
20. Hardening de segurança mínima: Helmet, CORS restritivo, remoção de x-powered-by
21. Correção de códigos HTTP do Auth: register retorna 201/409/400, login retorna 200/401
22. Decorators Swagger do Auth documentam respostas corretas (register: 201, 409, 400; login: 200, 401, 400)
23. JwtStrategy + JwtAuthGuard implementados: users e companies protegidos com JWT Bearer; auth público via `@Public()`
24. RolesGuard + @Roles implementados: matriz de permissões (admin, company_owner, employee, client) aplicada a users e companies
25. **Correção de segurança crítica:** `POST /auth/register` não aceita mais `role`, `status`, `companyId`, `permissions` ou `phone` no body. `ValidationPipe` global com `forbidNonWhitelisted: true`. Service força `role: "client"` internamente. Swagger atualizado.
26. **Correção de segurança do seed:** `prisma/seed.ts` — senha fixa removida do código. Seed lê `RBAC_SEED_PASSWORD` de variável de ambiente. Allowlist de ambientes: permitido exclusivamente com `NODE_ENV=development` ou `test` (production, staging, ausente ou inválido bloqueiam). Upsert com `update: {}` — não altera nenhum dado de usuários existentes. Nenhum segredo nos logs. Idempotente.
27. **Validação manual completa da matriz RBAC (27/06/2026):** 26 cenários testados (4 perfis × 6 rotas + 2 sem token), 100% aprovados. Diferenciação 401 vs 403 confirmada. Princípio do menor privilégio aplicado e validado. Nenhum token, senha ou hash registrado nos testes. Swagger Bearer Auth validado em conjunto.
28. **Correções de documentação viva:** STATUS.md (conexão Prisma marcada como validada), INSTALLATION.md (URL real, pasta loopclub-enterprise, NODE_ENV, RBAC_SEED_PASSWORD, seed), DEVELOPMENT.md (corrigida afirmação sobre filtro por companyId), README.md (referência .env.example → backend/.env.example).
29. **Remoção de .env.example duplicado:** `.env.example` da raiz removido; `backend/.env.example` definido como oficial e atualizado com QR_TOKEN_SECRET e QR_TOKEN_EXPIRES_IN_SECONDS, sem delimitadores de bloco markdown.
30. **Padrões brasileiros como requisito transversal permanente (27/06/2026):** documentado em 9 arquivos — PRODUCT.md, ARCHITECTURE.md, DATABASE.md, API.md, DEVELOPMENT.md, LGPD.md, SECURITY.md, DECISIONS.md (ADR-017), STATUS.md. **Nenhum controle implementado no código.** Todos os itens registrados como requisitos aprovados com implementação pendente: idioma pt-BR, moeda R$, datas DD/MM/AAAA, horário 24h, timezone America/Recife, telefone com DDD, CPF, CNPJ, CEP, endereço brasileiro.
31. **Primeira camada de isolamento multiempresa via CompanyUser (27/06/2026):** TenantModule, TenantService, TenantGuard, decorator `@RequireCompany()`, PrismaModule global. JWT mantido com sub+role. CompanyId resolvido por requisição via banco. GET /companies: admin vê todas; company_owner vê somente a própria empresa. Validação de coerência User.role × CompanyUser.role. Bloqueio de zero vínculos, múltiplos vínculos e empresa inativa. Seed atualizado: 7 usuários, 3 empresas (Alpha, Beta, Multi), 5 vínculos CompanyUser. Build aprovado. **Nenhuma migration. Schema inalterado.**
32. **Infraestrutura inicial de testes unitários (27/06/2026):** Jest e ts-jest instalados e configurados. jest.config.cjs e tsconfig.spec.json criados. Scripts `npm test`, `npm run test:watch` e `npm run test:cov` adicionados. Cobertura (`backend/coverage/`) ignorada pelo .gitignore. Build de produção continua excluindo arquivos .spec.ts. 3 suítes criadas: TenantService (9 testes), TenantGuard (5 testes), CompaniesService.findAll (5 testes). 19 testes executados, 19 aprovados, 0 falhos. Nenhum banco acessado. Nenhum código funcional corrigido. Testes e2e com Supertest e banco PostgreSQL exclusivo pendentes.

## Critérios de aceite

| Critério | Status | Validação |
|----------|--------|-----------|
| `docker compose up -d postgres` sobe o banco | ⚠️ Não testado | Docker Compose configurado, mas não executado nesta sessão |
| Backend instala dependências e inicia | ⚠️ Não validado | `npm install` não executado; `nest build` compila sem erros |
| Swagger abre em `/docs` | ✅ Validado | `curl http://localhost:3000/docs` retorna HTTP 200. Decorators Swagger documentam register (201, 409, 400) e login (200, 401, 400) |
| Auth endpoints retornam códigos HTTP corretos | ✅ Validado | register: 201, 409, 400; login: 200, 401 — todos testados via `curl` |
| Rotas protegidas com JWT | ✅ Validado | users e companies: sem token retornam 401, com token válido retornam 200 |
| RBAC com RolesGuard | ✅ Validado | admin acessa tudo; company_owner só GET /companies; employee e client bloqueados com 403 |
| Prisma gera client e executa migration | ⚠️ Não testado | Migration `init` existe no diretório, mas `prisma migrate dev` não foi reexecutado |
| Admin Web abre em `localhost:3001` | ⚠️ Não testado | Next.js configurado na porta 3001, mas sem execução |
| Flutter executa splash/login/carteira | ⚠️ Não testado | 3 telas implementadas, mas sem `flutter run` na sessão

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

## Validação manual — Autenticação e hardening

Testes executados em 26-27/06/2026 contra `localhost:3000` com o servidor rodando via `node dist/main.js`.

### Matriz RBAC — validação completa (27/06/2026)

Todos os 4 perfis (admin, company_owner, employee, client) foram testados manualmente via `curl` contra todas as 6 rotas protegidas. Resultados:

| Perfil | Rota | HTTP esperado | HTTP obtido | Status |
|--------|------|:---:|:---:|:------:|
| admin | POST /auth/login | 200 | 200 | ✅ |
| admin | GET /users | 200 | 200 | ✅ |
| admin | GET /companies | 200 | 200 | ✅ |
| admin | POST /companies | 201 | 201 | ✅ |
| admin | PATCH /companies/:id/block | 200 | 200 | ✅ |
| admin | PATCH /companies/:id/unblock | 200 | 200 | ✅ |
| company_owner | POST /auth/login | 200 | 200 | ✅ |
| company_owner | GET /users | 403 | 403 | ✅ |
| company_owner | GET /companies | 200 | 200 | ✅ |
| company_owner | POST /companies | 403 | 403 | ✅ |
| company_owner | PATCH /companies/:id/block | 403 | 403 | ✅ |
| company_owner | PATCH /companies/:id/unblock | 403 | 403 | ✅ |
| employee | POST /auth/login | 200 | 200 | ✅ |
| employee | GET /users | 403 | 403 | ✅ |
| employee | GET /companies | 403 | 403 | ✅ |
| employee | POST /companies | 403 | 403 | ✅ |
| employee | PATCH /companies/:id/block | 403 | 403 | ✅ |
| employee | PATCH /companies/:id/unblock | 403 | 403 | ✅ |
| client | POST /auth/login | 200 | 200 | ✅ |
| client | GET /users | 403 | 403 | ✅ |
| client | GET /companies | 403 | 403 | ✅ |
| client | POST /companies | 403 | 403 | ✅ |
| client | PATCH /companies/:id/block | 403 | 403 | ✅ |
| client | PATCH /companies/:id/unblock | 403 | 403 | ✅ |
| sem token | GET /users | 401 | 401 | ✅ |
| sem token | GET /companies | 401 | 401 | ✅ |

**Total: 26 cenários executados, 26 aprovados (100%).**

### POST /auth/register

| Cenário | Resultado |
|---------|-----------|
| Cadastro novo com dados válidos | HTTP 201 Created — `{ user: { id, name, email, role, status } }` |
| E-mail já cadastrado | HTTP 409 Conflict — `{ "message": "E-mail já cadastrado." }` |
| Dados inválidos (nome vazio, e-mail inválido, senha curta) | HTTP 400 Bad Request — array de erros de validação |
| Role admin no body | HTTP 400 — `"property role should not exist"` |
| Role company_owner no body | HTTP 400 |
| Role employee no body | HTTP 400 |
| Status no body | HTTP 400 |
| CompanyId no body | HTTP 400 |
| Permissions no body | HTTP 400 |
| Phone no body (campo removido) | HTTP 400 |
| Cadastro sem role | HTTP 201 — role forçada como `client` |

### POST /auth/login

| Cenário | Resultado |
|---------|-----------|
| Credenciais válidas | HTTP 200 OK — `{ accessToken, user: { id, name, email, role, status } }` |
| Senha incorreta | HTTP 401 Unauthorized — `{ "message": "Credenciais inválidas." }` |

### RBAC — RolesGuard

| Cenário | Resultado |
|---------|-----------|
| admin GET /users | HTTP 200 — lista de usuários |
| admin GET /companies | HTTP 200 — lista de empresas |
| admin POST /companies | HTTP 201 — empresa criada |
| admin PATCH /companies/:id/block | HTTP 200 — empresa bloqueada |
| admin PATCH /companies/:id/unblock | HTTP 200 — empresa desbloqueada |
| company_owner GET /users | HTTP 403 — `{ "message": "Acesso negado." }` |
| company_owner GET /companies | HTTP 200 — lista de empresas (permitido) |
| company_owner POST /companies | HTTP 403 |
| company_owner PATCH /companies/:id/block | HTTP 403 |
| company_owner PATCH /companies/:id/unblock | HTTP 403 |
| employee GET /users | HTTP 403 |
| employee GET /companies | HTTP 403 |
| employee POST /companies | HTTP 403 |
| employee PATCH /companies/:id/block | HTTP 403 |
| employee PATCH /companies/:id/unblock | HTTP 403 |
| client GET /users | HTTP 403 |
| client GET /companies | HTTP 403 |
| client POST /companies | HTTP 403 |
| client PATCH /companies/:id/block | HTTP 403 |
| client PATCH /companies/:id/unblock | HTTP 403 |
| Rotas públicas sem token | HTTP 200/201 — permanecem públicas |
| GET /users sem token | HTTP 401 |
| GET /companies sem token | HTTP 401 |

### JWT Guard — rotas protegidas

| Cenário | Resultado |
|---------|-----------|
| GET /users sem token | HTTP 401 — `{ "message": "Token inválido ou ausente." }` |
| GET /companies sem token | HTTP 401 |
| POST /companies sem token | HTTP 401 |
| GET /users com token válido | HTTP 200 — lista de usuários |
| GET /companies com token válido | HTTP 200 — lista de empresas |
| POST /companies com token válido | HTTP 201 — empresa criada |
| Token inválido (payload adulterado) | HTTP 401 |
| Token com string aleatória | HTTP 401 |
| GET /auth/health sem token | HTTP 200 — permanece pública |
| POST /auth/register sem token | HTTP 201 — permanece pública |
| POST /auth/login sem token | HTTP 200 — permanece pública |
| Token expirado | ⚠️ Pendente de teste específico |

### Segurança — headers e hardening

| Verificação | Resultado |
|-------------|-----------|
| Helmet ativo (CSP, HSTS, X-Frame-Options, X-Content-Type-Options) | Headers presentes no response |
| `x-powered-by` removido | Header ausente no response |
| CORS restritivo | `Access-Control-Allow-Origin: http://localhost:3001` |
| `passwordHash` não exposto | Resposta do register contém apenas `{ id, name, email, role, status }` |
| Mensagens de erro sem detalhes internos | Nenhum stack trace ou detalhe Prisma exposto |
| Senha armazenada com hash | bcrypt 10 rounds confirmado no código-fonte (`auth.service.ts`) |

## Endpoints disponíveis

| Método | Rota | Descrição | Protegido? |
|--------|------|-----------|------------|
| GET | `/auth/health` | Health check | Não |
| POST | `/auth/register` | Registrar usuário | Não |
| POST | `/auth/login` | Login | Não |
| GET | `/users` | Listar usuários | Sim (JWT Bearer) |
| GET | `/companies` | Listar empresas | Sim (JWT Bearer) |
| POST | `/companies` | Criar empresa | Sim (JWT Bearer) |
| PATCH | `/companies/:id/block` | Bloquear empresa | Sim (JWT Bearer) |
| PATCH | `/companies/:id/unblock` | Desbloquear empresa | Sim (JWT Bearer) |

> **Nota:** Rotas de Auth (health, register, login) são públicas. Demais rotas exigem JWT Bearer Token via header `Authorization: Bearer <token>`. RolesGuard (RBAC) ainda não implementado — qualquer token válido acessa todas as rotas protegidas.

## Pendências e problemas conhecidos

### Segurança e LGPD
- ~~**Rotas não protegidas:** Nenhum `@UseGuards()`, `AuthGuard` ou `RolesGuard` implementado~~ (corrigido — JwtAuthGuard protege users e companies; RolesGuard com @Roles define permissões por perfil — **matriz RBAC validada manualmente em todos os 4 perfis**)
- **Risco de enumeração:** `/auth/register` retorna erro específico se e-mail existe
- **Risco de brute force:** `/auth/login` não possui rate limiting
- **Risco de IDOR:** rotas com parâmetros de ID não validam permissão
- **Dados expostos:** `GET /users` expõe todos os usuários sem filtro por empresa
- **Sem logs de auditoria:** ações não são registradas no AuditLog
- **Sem refresh token:** apenas access token com expiração de 1 dia
- **Sem política de senha forte:** qualquer senha com 6+ caracteres é aceita
- **Sem sanitização de logs:** dados sensíveis podem vazar em logs
- **Isolamento multiempresa:** implementado no GET /companies via TenantGuard + CompanyUser. Demais rotas ainda sem isolamento (POST/PATCH companies são exclusivas admin).
- ~~**CORS aberto:** configurado para desenvolvimento, sem restrição~~ (corrigido — CORS configurável via `CORS_ORIGIN`)

### Funcionalidades
- **Zero testes:** Nenhum arquivo `.spec.ts` no projeto
- **Admin Web usa dados mockados** (sem integração com API real)
- **App Flutter usa dados mockados** (sem integração com API real)
- **CompanyUser não é criado no registro** — vínculo empresa-usuário não existe
- **Sem seed de dados iniciais** — Admin Master precisa ser criado manualmente

### Riscos residuais de segurança (após hardening)
- **Sem rate limiting:** rotas abertas como `/auth/login` e `/auth/register` não possuem proteção contra brute force ou abuso
- **Sem HTTPS:** em produção, toda comunicação trafega sem criptografia se TLS não for configurado
- **Sem CSP personalizado:** o CSP padrão do Helmet pode precisar de ajustes conforme novas origens (ex: integração com CDN, webhooks)
- **Sem rotação de segredos:** JWT_SECRET usa valor fixo do `.env`; não há política de rotação automática
- **Sem proteção contra replay de QR Code:** tokens QR não possuem one-time-use enforcement
- **Sem validação de refresh token:** implementação pendente para Sprint 02

### LGPD e privacidade
- **DPO não nomeado:** encarregado de proteção de dados não definido
- **Canal de titulares não criado:** sem canal para exercício de direitos LGPD
- **Bases legais não validadas:** dependem de revisão jurídica
- **Entidades LGPD não implementadas:** PrivacyPolicyVersion, UserConsent, DataSubjectRequest, RefreshToken
- **Política de retenção não automatizada:** prazos propostos mas sem job de execução

## Próximos passos (Sprint 02)

1. ~~Implementar JWT Guards em todas as rotas existentes~~ (concluído)
2. ~~RolesGuard com decorator @Roles (RBAC)~~ (concluído)
3. Refresh token com rotação
4. Vincular CompanyUser no registro (usuário como COMPANY_OWNER)
5. Seed inicial (Admin Master padrão)
6. Rate limiting em rotas de autenticação
7. Sanitização de logs (Interceptor NestJS)
8. Registro de auditoria para ações críticas (AuditLog)
9. Testes de integração para módulo Auth
10. Iniciar validação de multi-tenancy
