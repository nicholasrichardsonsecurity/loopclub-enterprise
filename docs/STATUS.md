# Status do Desenvolvimento

Atualizado em: 26/06/2026

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

- [x] **POST /auth/register — cadastro novo** — `validado manualmente`. Retorna HTTP 201 Created com `{ user: { id, name, email, role, status } }`. `passwordHash` não exposto.
- [x] **POST /auth/register — e-mail duplicado** — `validado manualmente`. Retorna HTTP 409 Conflict com `{ "message": "E-mail já cadastrado." }`.
- [x] **POST /auth/register — dados inválidos** — `validado manualmente`. Retorna HTTP 400 Bad Request com array de erros de validação.
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
- [x] **RolesGuard (RBAC)** — `implementado` e `validado manualmente`. Decorator `@Roles()` lê perfil do JWT. Users: só admin. Companies GET: admin + company_owner. Companies POST/PATCH: só admin. Retorna 403 para perfil sem permissão.
- [x] **Rotas públicas permanecem públicas** — `validado manualmente`. `GET /auth/health`, `POST /auth/register`, `POST /auth/login` continuam acessíveis sem token.

## ✅ Implementado (não validado)

### Infraestrutura e ferramentas

- [x] **Monorepo estruturado** — `implementado`. Pastas `apps/`, `backend/`, `docs/`, `infra/`, `packages/` criadas.
- [x] **Backend NestJS compila** — `validado`. Comando `nest build` executa sem erros (NestJS 10.4, Node 24.16).
- [x] **Swagger configurado** — `implementado` e `validado`. Configurado em `main.ts` com `DocumentBuilder`, `addBearerAuth()`, rota `/docs`. Retorna HTTP 200 via `curl`. Decorators `@ApiCreatedResponse`, `@ApiConflictResponse`, `@ApiOkResponse`, `@ApiUnauthorizedResponse`, `@ApiBadRequestResponse` documentam respostas de register e login.
- [x] **Prisma conectado ao PostgreSQL** — `implementado`. `PrismaService` configurado com `onModuleInit`/`onModuleDestroy`. **Pendente:** validar conexão com banco rodando.
- [x] **Migration inicial executada** — `implementado`. Arquivo `20260626085739_init/migration.sql` gerado com schema completo. **Pendente:** reexecutar `prisma migrate dev` para validar consistência atual.
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
- [ ] **Testes automatizados** — 0 arquivos `.spec.ts` no projeto (excluindo `node_modules`).

### Próximos itens a implementar (Sprint 02)

- [x] Guardas JWT (JwtAuthGuard) em users e companies — `implementado e validado`
- [x] RolesGuard com decorator @Roles (RBAC) — `implementado e validado`
- [ ] Validação de token expirado — pendente de teste específico
- [ ] Refresh token com rotação e revogação
- [ ] Vincular CompanyUser no registro (criar vínculo empresa-usuário)
- [ ] Seed inicial (Admin Master padrão)
- [ ] Rate limiting em rotas de autenticação
- [ ] Sanitização de logs (Interceptor NestJS)
- [ ] Registro de auditoria para ações críticas (AuditLog)
- [ ] Testes de integração para módulo Auth
- [ ] Validação de multi-tenancy nas consultas
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
- [ ] Testes automatizados (unitários, integração, e2e)
- [ ] CI/CD com GitHub Actions
- [ ] Docker para serviços (não só banco)
- [ ] Revisão jurídica da documentação LGPD
- [ ] Implementação das entidades LGPD (UserConsent, DataSubjectRequest, RefreshToken, etc.)
- [ ] Nomeação de DPO/Encarregado
