# Status do Desenvolvimento

Atualizado em: 28/06/2026

**Legenda:**

| Marcação | Significado |
|----------|-------------|
| `[implementado]` | Código existe e compila |
| `[validado manualmente]` | Testado com requisição HTTP real |
| `[mockado]` | Dados fixos no código, sem integração real |
| `[documentado]` | Documentação criada, sem implementação correspondente |
| `[planejado]` | Descrito em docs, sem código implementado |

---

## ✅ Implementado e validado

### Autenticação — validado manualmente via `curl`

- [x] **POST /auth/register — cadastro novo** — `validado manualmente`. Retorna HTTP 201 Created com `{ user: { id, name, email, role: "client", status } }`. `passwordHash` não exposto. Role forçada como `client` internamente, nunca aceita do body.
- [x] **POST /auth/register — e-mail duplicado** — `validado manualmente`. Retorna HTTP 409 Conflict com `{ "message": "E-mail já cadastrado." }`.
- [x] **POST /auth/register — dados inválidos** — `validado manualmente`. Retorna HTTP 400 Bad Request com array de erros de validação.
- [x] **POST /auth/register — segurança: rejeição de campos administrativos** — `validado manualmente`. Role (admin/company_owner/employee), status, companyId, permissions, phone são rejeitados com HTTP 400 e `"property X should not exist"`. `forbidNonWhitelisted: true` ativo no ValidationPipe global.
- [x] **POST /auth/register — segurança: role sempre client** — `validado manualmente`. Qualquer cadastro sem role ou com role inválida no body resulta em `role: "client"` no banco.
- [x] **POST /auth/login — credenciais válidas** — `validado manualmente`. Retorna HTTP 200 OK com `{ accessToken, user }`.
- [x] **POST /auth/login — credenciais inválidas** — `validado manualmente`. Retorna HTTP 401 Unauthorized com `{ "message": "Credenciais inválidas." }`. Não revela se o e-mail existe.
- [x] **Hash de senha** — `validado manualmente`. bcrypt com 10 rounds confirmado no código-fonte (`auth.service.ts`). `passwordHash` não exposto em respostas.
- [x] **Mensagens de erro sem detalhes internos** — `validado manualmente`. Nenhuma resposta expõe stack trace, detalhes Prisma, senha, hash ou token.

### Hardening de segurança — validado manualmente via `curl`

- [x] **Helmet (headers de segurança)** — `validado manualmente`. CSP, HSTS, X-Frame-Options, X-Content-Type-Options, X-XSS-Protection confirmados no response.
- [x] **CORS restritivo por ambiente** — `validado manualmente`. Lê `CORS_ORIGIN` do `.env`. Header `Access-Control-Allow-Origin` confirmado.
- [x] **x-powered-by removido** — `validado manualmente`. Header ausente no response.
- [x] **Swagger /docs** — `validado manualmente`. Retorna HTTP 200. Decorators Swagger documentam register (201, 409, 400) e login (200, 401, 400). Rotas protegidas (users, companies) documentadas com `@ApiBearerAuth()` e `@ApiUnauthorizedResponse()`. Swagger Bearer Auth validado.
- [x] **JWT Guard — rotas protegidas** — `implementado` e `validado manualmente`. JwtStrategy com validação de sub/role e expiração. JwtAuthGuard com suporte a `@Public()`. UsersController e CompaniesController protegidos. Rotas sem token retornam 401; token inválido retorna 401; token válido retorna 200.
- [x] **Rotas públicas permanecem públicas** — `validado manualmente`. `GET /auth/health`, `POST /auth/register`, `POST /auth/login` continuam acessíveis sem token.

### RBAC — validação manual completa da matriz de permissões

**Status:** `implementado` e `validado manualmente`. Build aprovado. Matriz RBAC também validada por testes e2e automatizados (12 cenários HTTP com Supertest).

A matriz RBAC foi validada manualmente via `curl` contra todos os 4 perfis (admin, company_owner, employee, client) em todas as 6 rotas protegidas. A validação confirmou a separação clara entre:

- **401 Unauthorized** — usuário não autenticado (sem token ou token inválido)
- **403 Forbidden** — usuário autenticado sem permissão para a rota
- **200/201 OK** — usuário autenticado com permissão

#### Resultados por perfil

| Rota | admin | company_owner | employee | client |
|------|-------|---------------|----------|--------|
| `GET /users` | ✅ 200 | ❌ 403 | ❌ 403 | ❌ 403 |
| `GET /companies` | ✅ 200 | ✅ 200 | ❌ 403 | ❌ 403 |
| `POST /companies` | ✅ 201 | ❌ 403 | ❌ 403 | ❌ 403 |
| `PATCH /companies/:id/block` | ✅ 200 | ❌ 403 | ❌ 403 | ❌ 403 |
| `PATCH /companies/:id/unblock` | ✅ 200 | ❌ 403 | ❌ 403 | ❌ 403 |

| Sem token | `GET /users` → 401 | `GET /companies` → 401 |

#### O que foi validado

- `JwtAuthGuard` protege todas as rotas privadas corretamente.
- `RolesGuard` aplica as permissões por perfil via decorator `@Roles()`.
- O decorator `@Roles()` está funcionando conforme especificado.
- Admin possui acesso administrativo completo a todas as rotas testadas.
- Company owner pode listar empresas (GET), mas não pode executar ações administrativas globais (POST/PATCH).
- Employee não pode acessar nenhuma rota administrativa global.
- Client não pode acessar nenhuma rota administrativa global.
- Mesmo ID de empresa foi usado para validar block/unblock com perfis sem permissão.
- Swagger Bearer Auth funcionou nos testes.
- Nenhum token, senha ou hash foi registrado.

### Isolamento multiempresa via CompanyUser — validado manualmente (27/06/2026)

**Status:** `implementado` e `validado manualmente`. Build aprovado.

Primeira camada de isolamento multiempresa, validada exclusivamente na infraestrutura de tenant (TenantModule, TenantService, TenantGuard) e no GET /companies. Infraestrutura reutilizável disponível para demais módulos, mas ainda não estendida para outras rotas.

#### Componentes implementados
- **PrismaModule global** — `@Global()` registrado no AppModule, elimina instâncias duplicadas de PrismaService.
- **TenantModule** — contém TenantService e TenantGuard, exportados para outros módulos.
- **TenantService** — consulta CompanyUser ativo, valida número de vínculos (0, 1, múltiplos), valida Company.status, valida coerência User.role × CompanyUser.role.
- **TenantGuard** — lê metadata `@RequireCompany()`, só consulta banco se a rota exigir contexto empresarial.
- **Decorator `@RequireCompany()`** — combina SetMetadata + UseGuards(TenantGuard) em um único decorator.
- **JWT mantido mínimo** — apenas `sub` + `role`. CompanyId resolvido por requisição via banco.
- **CompanyUser como fonte oficial de tenant** — sem companyId no User, sem companyId no JWT.
- **GET /companies com filtro de tenant** — admin vê todas; company_owner vê somente sua empresa.

#### Resultados da validação (9 testes HTTP)

| # | Teste | HTTP | Camada |
|---|-------|:----:|--------|
| 1 | Admin lista todas | 200 | Service (admin vê tudo) |
| 2 | Owner Alpha lista somente Alpha | 200 | TenantGuard + Service |
| 3 | Owner Beta lista somente Beta | 200 | TenantGuard + Service |
| 4 | Employee lista empresas | 403 | RolesGuard |
| 5 | Client lista empresas | 403 | RolesGuard |
| 6 | Multivínculo (2 vínculos) | 403 | TenantGuard/TenantService |
| 7 | Owner sem vínculo | 403 | TenantGuard/TenantService |
| 8 | Sem token | 401 | JwtAuthGuard |
| 9 | Token inválido | 401 | JwtAuthGuard |

**Total: 9 cenários executados, 9 aprovados (100%).**

#### Testes unitários automatizados — validado

3 suítes de testes unitários criadas e executadas com Jest + ts-jest, usando mocks do PrismaService (sem banco real):

| Suíte | Testes | Status | Cobertura |
|-------|:------:|:------:|:---------:|
| TenantService | 9 | ✅ 9 passed | 100% |
| TenantGuard | 5 | ✅ 5 passed | 100% |
| CompaniesService (findAll) | 5 | ✅ 5 passed | 81% (parcial) |
| **Total** | **19** | **✅ 19 aprovados, 0 falhos** | — |

#### Testes e2e automatizados — validado

Infraestrutura completa de testes e2e com Supertest, Jest config separado (`jest.e2e.config.cjs`), PostgreSQL exclusivo (`loopclub_e2e`) e seed dedicado (`seed-e2e.ts`).

| Categoria | Testes | Status |
|-----------|:------:|:------:|
| Segurança do ambiente (validateTestEnvironment) | 9 | ✅ 9 passed |
| Smoke tests de infraestrutura | 3 | ✅ 3 passed |
| Cenários HTTP (autenticação, RBAC, tenant isolation) | 12 | ✅ 12 passed |
| **Total e2e** | **24** | **✅ 24 aprovados, 0 falhos** |

**12 cenários HTTP validados:**
1. Login do administrador retorna 200 com accessToken
2. Administrador vê todas as 3 empresas
3. Owner Alpha vê somente Empresa Alpha
4. Owner Beta vê somente Empresa Beta
5. Employee recebe 403 (RolesGuard)
6. Client recebe 403 (RolesGuard)
7. Owner sem vínculo recebe 403 (TenantGuard)
8. Owner com múltiplos vínculos recebe 403 (TenantGuard)
9. Requisição sem token recebe 401 (JwtAuthGuard)
10. Token inválido recebe 401 (JwtAuthGuard)
11. Owner de empresa inativa recebe 403 (TenantGuard)
12. Owner com vínculo inativo recebe 403 (TenantGuard)

**Total geral: 43 testes aprovados** (19 unitários + 24 e2e).

**Comandos disponíveis para e2e:**
- `npm run test:e2e` — prepara banco, aplica migrations, limpa, seed e executa os 24 testes e2e (local)
- `npm run test:e2e:ci` — mesmo fluxo, com output otimizado para CI

**Infraestrutura e2e implementada:**
- Supertest + `@types/supertest` para requisições HTTP
- Jest isolado via `jest.e2e.config.cjs` (execução serial, `--runInBand`)
- PostgreSQL exclusivo (`loopclub_e2e`) — nunca usa banco de desenvolvimento
- Seed e2e exclusivo (`test/helpers/seed-e2e.ts`) — 9 usuários, 3 empresas, 8 vínculos
- `DATABASE_URL_TEST` obrigatória, validada antes de qualquer operação
- `NODE_ENV=test` obrigatório, validado cumulativamente
- Proteção destrutiva: valida host (localhost/127.0.0.1/postgres), sufixo do banco (_e2e/_test), rejeita banco de desenvolvimento (`loopclub`)
- `resetTestDatabase()` — TRUNCATE CASCADE em todas as 11 tabelas
- Migrations aplicadas com `prisma migrate deploy` (nunca `prisma migrate dev`)
- `E2E_TEST_PASSWORD` lida de variável de ambiente — nunca fixa no código
- 9 testes negativos de segurança comprovam que as proteções funcionam

#### Pendências (não declarar como concluído)
- Isolamento em POST/PATCH companies — não implementado (rotas exclusivas admin, sem tenant).
- Rota empresarial permitida para employee — nenhuma existe ainda.
- Validação HTTP de vínculo inativo — coberto por testes e2e (C12).
- Validação HTTP de empresa inativa — coberto por testes e2e (C11).
- GET /companies/:id com proteção contra acesso cruzado — endpoint não existe.
- AuditLog para inconsistências de tenant — não implementado.
- Permissões para CompanyUserRole.manager — não definidas.
- Seleção explícita de tenant para múltiplas empresas — adiada.
- Cobertura de create e updateStatus no CompaniesService — pendente (testes unitários).
- Testes e2e de JwtAuthGuard e JwtStrategy via autenticação — cobertos indiretamente pelos cenários C01, C09, C10.
- Testes e2e do RolesGuard — cobertos pelos cenários C05, C06.

#### Regras de validação do TenantService
- Zero vínculos ativos → 403 "Nenhum vínculo empresarial encontrado."
- Múltiplos vínculos ativos → 403 "Não foi possível determinar o contexto empresarial deste usuário." + log interno de inconsistência.
- Empresa inativa → 403 "Empresa inativa ou bloqueada."
- UserRole.company_owner exige CompanyUserRole.owner — incompatibilidade → 403 "Não foi possível validar as permissões empresariais deste usuário."
- UserRole.employee exige CompanyUserRole.employee — incompatibilidade → 403.
- Admin global — não exige tenant.
- CompanyUser.role = manager — sem permissões definidas nesta etapa (bloqueado por incoerência se aparecer).

#### Pendências (não declarar como concluído)

- Testes automatizados específicos do RolesGuard e da matriz RBAC ainda estão pendentes. Já existem testes unitários para TenantService, TenantGuard e CompaniesService, totalizando 3 suítes e 19 testes aprovados.
- **Isolamento multiempresa no GET /companies** — `implementado` e `validado manualmente` (9 testes HTTP, 100% aprovados). Primeira camada aplicada exclusivamente ao módulo de empresas: admin vê todas; company_owner vê somente sua empresa; employee/client bloqueados pelo RolesGuard; zero vínculos, múltiplos vínculos e incoerência bloqueados pelo TenantGuard. Demais módulos e rotas ainda sem isolamento.
- **Segregação de dados entre empresas** — `implementado e validado` exclusivamente no GET /companies. Rotas de block/unblock e criação de empresas continuam sem filtro de tenant (são exclusivas admin).
- Refresh token com rotação — pendente.
- Auditoria de ações críticas (AuditLog) — pendente.
- Conformidade integral com LGPD — pendente.

## ✅ Implementado (não validado)

### Infraestrutura e ferramentas

- [x] **Monorepo estruturado** — `implementado`. Pastas `apps/`, `backend/`, `docs/`, `infra/`, `packages/` criadas.
- [x] **Backend NestJS compila** — `validado`. Comando `nest build` executa sem erros (NestJS 10.4, Node 24.16).
- [x] **Swagger configurado** — `implementado` e `validado`. Configurado em `main.ts` com `DocumentBuilder`, `addBearerAuth()`, rota `/docs`. Retorna HTTP 200 via `curl`. Decorators `@ApiCreatedResponse`, `@ApiConflictResponse`, `@ApiOkResponse`, `@ApiUnauthorizedResponse`, `@ApiBadRequestResponse` documentam respostas de register e login.
- [x] **Prisma conectado ao PostgreSQL** — `implementado` e `validado manualmente`. Conexão com banco local confirmada durante os testes de seed, login, RBAC e operações com empresas (register, login, companies). Todas as operações usaram o banco PostgreSQL real.
- [x] **Migration inicial executada** — `implementado`. Arquivo `20260626085739_init/migration.sql` gerado com schema completo. **Pendente:** reexecutar `prisma migrate dev` para confirmar consistência com estado atual do código (não foi reexecutada após alterações recentes de segurança).
- [x] **Docker Compose PostgreSQL 16** — `implementado`. Arquivo `docker-compose.yml` com PostgreSQL 16 Alpine, porta 5432, volume persistente. **Pendente:** executar `docker compose up -d` e validar.

### Schema Prisma

**11 modelos confirmados no código:**

| # | Modelo | Descrição |
|---|--------|-----------|
| 1 | `User` | Usuários do sistema (todos os perfis) |
| 2 | `Company` | Empresas clientes da plataforma |
| 3 | `CompanyUser` | Vínculo usuário-empresa |
| 4 | `Plan` | Planos de assinatura |
| 5 | `Subscription` | Assinaturas de empresas |
| 6 | `LoyaltyProgram` | Programas de fidelidade |
| 7 | `LoyaltyMilestone` | Marcos de programas progressivos |
| 8 | `LoyaltyProgress` | Progresso do cliente no programa |
| 9 | `Transaction` | Transações de pontos |
| 10 | `QrToken` | Tokens de QR Code dinâmico |
| 11 | `AuditLog` | Logs de auditoria |

**6 enums confirmados no código:**

| # | Enum | Valores |
|---|------|---------|
| 1 | `UserRole` | admin, company_owner, employee, client |
| 2 | `UserStatus` | active, blocked, deleted |
| 3 | `CompanyStatus` | active, blocked, trial, canceled |
| 4 | `CompanyUserRole` | owner, manager, employee |
| 5 | `LoyaltyProgramType` | buy_x_get_y, progressive |
| 6 | `TransactionType` | qr_point, manual_point, remove_point, reset, reward_redeemed |

### Módulos do backend (não validados)

- [x] **Auth — GET /auth/health** — `implementado`. Retorna `{ status: 'ok', service: 'auth' }`. **Pendente:** testar.
- [x] **Users — GET /users** — `implementado` e `protegido por JWT`. Lista usuários com `select` limitado a 7 campos. Requer token Bearer.
- [x] **Companies — GET /companies** — `implementado` e `protegido por JWT`. Lista empresas. Requer token Bearer.
- [x] **Companies — POST /companies** — `implementado` e `protegido por JWT`. Cria empresa com DTO validado. Requer token Bearer.
- [x] **Companies — PATCH /companies/:id/block** — `implementado` e `protegido por JWT`. Altera status para `blocked`. Requer token Bearer.
- [x] **Companies — PATCH /companies/:id/unblock** — `implementado` e `protegido por JWT`. Altera status para `active`. Requer token Bearer.

### Frontends (esqueletos)

- [x] **Admin Web Next.js** — `implementado` e `mockado`. Dashboard com cards de métricas (MRR, empresas ativas, bloqueadas), tabela de empresas recentes. Dados fixos no código. Navegação lateral com 6 seções planejadas.
- [x] **App Flutter** — `implementado` e `mockado`. 3 telas: Splash (gradiente + logo + botão "Começar"), Login (campo de telefone/e-mail + botão), Carteira (3 cards de fidelidade com dados fixos e barra de progresso).

### Documentação

- [x] **Documentação geral** — `documentado`. 23 arquivos no total: 4 na raiz (README, CHANGELOG, CONTRIBUTING, CLAUDE.md), 18 em `docs/` (PRODUCT, ARCHITECTURE, DATABASE, API, INSTALLATION, DEVELOPMENT, DEPLOYMENT, SECURITY, ROADMAP, STATUS, DECISIONS, LGPD, PRIVACY, DATA-MAP, RETENTION-POLICY, INCIDENT-RESPONSE, THREAT-MODEL, DATA-SUBJECT-RIGHTS), 1 em `docs/sprints/` (SPRINT-01).
- [x] **Documentação LGPD e privacidade** — `documentado` (documentação inicial criada). LGPD.md, PRIVACY.md, DATA-MAP.md, RETENTION-POLICY.md, INCIDENT-RESPONSE.md, THREAT-MODEL.md, DATA-SUBJECT-RIGHTS.md. **Nenhum controle LGPD foi implementado no código.**
- [x] **Mapa de dados** — `documentado`. 13 categorias de dados pessoais mapeadas com titular, finalidade, base legal proposta, riscos e controles.
- [x] **Modelo de ameaças** — `documentado`. 16 ameaças mapeadas com severidade, mitigação atual e pendente.
- [x] **ADRs** — `documentado`. 12 ADRs registrados (incluindo 4 de privacidade e segurança).

---

## 🔄 Em Desenvolvimento (pendente de implementação)

### Critérios da Sprint 01 ainda pendentes

- [ ] **Validar Docker Compose** — `docker compose up -d postgres` não foi executado nesta sessão.
- [ ] **Validar conexão Prisma** — `prisma migrate dev` não foi reexecutado para confirmar consistência.
- **Testes automatizados** — 43 testes totais (19 unitários + 24 e2e). CI configurado via GitHub Actions (`.github/workflows/ci.yml`) — executa testes unitários, build e testes e2e com PostgreSQL 16 efêmero.

### Requisitos transversais (permanentes)

- [ ] **Padrões brasileiros — requisito transversal documentado.** `documentado`. Todos os padrões de apresentação, armazenamento, validação e integração foram formalizados em PRODUCT.md, ARCHITECTURE.md, DATABASE.md, API.md, DEVELOPMENT.md, LGPD.md, SECURITY.md e DECISIONS.md (ADR-017). **Nenhum controle foi implementado no código.**

### Requisitos brasileiros

| Item | Situação |
|------|----------|
| Português do Brasil como idioma padrão | Requisito aprovado e documentado. Implementação completa pendente (telas, mensagens de erro, e-mails, push não foram verificados). |
| Real brasileiro (R$) | Requisito aprovado e documentado. Implementação completa pendente (formatação pt-BR em interfaces não implementada). |
| Datas em DD/MM/AAAA | Requisito aprovado e documentado. Implementação completa pendente (conversão UTC → America/Recife em exibição não implementada). |
| Horário em formato de 24 horas | Requisito aprovado e documentado. Implementação completa pendente. |
| Timezone America/Recife | Requisito aprovado e documentado. Configuração técnica pendente ou parcial — timezone não é aplicado atualmente em exibição de datas. |
| Telefone brasileiro com DDD | Requisito aprovado e documentado. Implementação e validação pendentes (campo `phone` existe no schema mas sem validação de DDD ou formato brasileiro). |
| CPF | Requisito aprovado e documentado. Implementação, validação de dígitos verificadores e testes pendentes. |
| CNPJ | Requisito aprovado e documentado. Implementação, validação de dígitos verificadores e testes pendentes. |
| CEP e endereço brasileiro | Requisito aprovado e documentado. Implementação e validação pendentes (schema não possui campos de endereço brasileiro ainda). |
| Interface integralmente em português do Brasil | Em evolução — código-fonte usa inglês técnico, o que é aceitável. Telas do admin-web e mobile precisam ser verificadas quanto a textos em português. Mensagens de erro da API estão em português (validação do NestJS). |

### Próximos itens a implementar (Sprint 02)

- [x] Guardas JWT (JwtAuthGuard) em users e companies — `implementado e validado`
- [x] **Infraestrutura inicial de testes unitários (Jest + ts-jest)** — `implementado e validado`. 3 suítes, 19 testes, 19 aprovados. Configuração separada em jest.config.cjs e tsconfig.spec.json. Build de produção continua excluindo arquivos .spec.ts. Nenhum banco acessado. Cobertura: TenantService 100%, TenantGuard 100%, CompaniesService parcial. Supertest não instalado, testes e2e pendentes.
- [x] **CI GitHub Actions (workflow do backend)** — `implementado e validado`. `.github/workflows/ci.yml` com actions/checkout@v5, actions/setup-node@v5, Node 24, cache npm, npm ci, prisma generate, 19 testes aprovados, build OK. Execução real no runner Linux validada. PostgreSQL 16 Alpine via service container nativo com health check. 24 testes e2e executados via `npm run test:e2e:ci`. DATABASE_URL fictícia para geração do Prisma Client. DATABASE_URL_TEST aponta para o banco efêmero do service container. Permissão mínima (contents: read). Secrets usados: CI_POSTGRES_PASSWORD, CI_E2E_TEST_PASSWORD, CI_JWT_SECRET.
- [x] RolesGuard com decorator @Roles (RBAC) — `implementado e validado`
- [ ] Validação de token expirado — pendente de teste específico
- [ ] Refresh token com rotação e revogação
- [ ] Vincular CompanyUser no registro (criar vínculo empresa-usuário)
- [x] **Seed local para testes de RBAC** — `implementado` e `validado`. Cria usuários fictícios dos perfis admin, company_owner, employee e client somente em ambientes development ou test. Senha lida de `RBAC_SEED_PASSWORD` (variável de ambiente — nunca no código). Allowlist bloqueia production, staging, ausente ou inválido. Upsert com `update: {}` não altera usuários existentes. Nenhum segredo (senha, hash, token, JWT_SECRET) é exibido nos logs. Idempotente.
- [x] **Segurança do POST /auth/register** — `validado manualmente`. DTO público aceita apenas name, email, password. Service força `role: 'client'`. `ValidationPipe` global com `forbidNonWhitelisted: true` rejeita role, status, companyId, permissions, phone com HTTP 400.
- [ ] Rate limiting em rotas de autenticação
- [ ] Sanitização de logs (Interceptor NestJS)
- [ ] Registro de auditoria para ações críticas (AuditLog)
- [ ] Testes de integração para módulo Auth
- [x] **Primeira camada de isolamento multiempresa (GET /companies)** — `implementado e validado`. TenantModule, TenantService, TenantGuard, @RequireCompany(), PrismaModule global. 9 testes HTTP aprovados. Empresa vinculada via CompanyUser. Admin vê todas; company_owner vê só a própria. Sem companyId no JWT. Schema inalterado. Nenhuma migration.
- [ ] Estender isolamento multiempresa para demais rotas e módulos
- [ ] Validação jurídica das bases legais LGPD propostas
- [ ] Implementar canal de atendimento a titulares LGPD

---

## 🔮 Backlog Futuro

- [ ] CRUD de planos e assinaturas
- [ ] Programas de fidelidade (Compre X Ganhe Y)
- [ ] Programa progressivo com milestones
- [ ] Carteira de fidelidade do cliente
- [ ] QR Code dinâmico
- [ ] Scanner de QR no app
- [ ] Lançamento manual de pontos
- [ ] Reset manual de progresso
- [ ] Histórico e auditoria de transações
- [ ] Dashboard da empresa
- [ ] Dashboard do Admin
- [ ] Personalização visual por empresa
- [ ] Dashboard Admin Master (cards, gráficos, MRR, NFS-e, LGPD, incidentes)
- [ ] Pagamento automático (Pix, cartão, recorrência, webhooks, idempotência)
- [ ] NFS-e (emissão, status, cancelamento, substituição, provedor substituível)
- [ ] Push notifications (global, por perfil/empresa, agendamento, opt-out, auditoria)
- [ ] Relatórios contábeis (faturamento, notas, pagamentos, inadimplência, CSV/XLSX)
- [ ] Deploy em produção
- [ ] Expandir a CI para frontends, lint e análise de segurança
- [ ] Docker para serviços (não só banco)
- [ ] Revisão jurídica da documentação LGPD
- [ ] Implementação das entidades LGPD (UserConsent, DataSubjectRequest, RefreshToken, etc.)
- [ ] Nomeação de DPO/Encarregado
