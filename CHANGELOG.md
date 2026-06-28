# Changelog

Todas as mudanças notáveis neste projeto serão documentadas aqui.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/) e este projeto segue [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Adicionado

- **Infraestrutura completa de testes e2e** — Supertest, Jest config separado (`jest.e2e.config.cjs`), PostgreSQL exclusivo (`loopclub_e2e`), seed e2e dedicado (`seed-e2e.ts`), proteção destrutiva de ambiente (`validateTestEnvironment()`), reset de banco (`resetTestDatabase()`). 24 testes e2e: 9 de segurança do ambiente, 3 smoke tests de infraestrutura, 12 cenários HTTP de autenticação, RBAC e isolamento multiempresa.
- **Helper de autenticação e2e** — `auth-e2e.ts` com função `loginAs()`, reduz duplicação de login nos cenários.
- **Helper de assertions e2e** — `assertions-e2e.ts` com `getCompanies()` e `getCompaniesUnauthenticated()`.
- **Scripts e2e** — `npm run test:e2e` (prepara banco + executa testes), `npm run test:e2e:ci` (modo CI).
- **GitHub Actions com PostgreSQL service container** — CI agora executa 19 testes unitários + build + 24 testes e2e com PostgreSQL 16 Alpine efêmero. Secrets: CI_POSTGRES_PASSWORD, CI_E2E_TEST_PASSWORD, CI_JWT_SECRET.
- **Identidade visual aprovada** — cores `#6D28D9`, `#4C1D95`, `#14B8A6`, tipografia Inter, símbolo de elos sobrepostos.
- **Estratégia comercial (hipóteses)** — planos Essencial, Profissional, Premium, Enterprise com preços sugeridos; diferenciais de roadmap documentados como hipóteses a validar.

- JwtStrategy com validação de assinatura, expiração e payload (sub, role)
- JwtAuthGuard com suporte a `@Public()` para rotas públicas
- Decorator `@Public()` para marcar rotas que não exigem autenticação
- Proteção JWT Bearer nas rotas `GET /users`, `GET /companies`, `POST /companies`, `PATCH /companies/:id/block`, `PATCH /companies/:id/unblock`
- Swagger atualizado com `@ApiBearerAuth()` e `@ApiUnauthorizedResponse()` nas rotas protegidas
- RolesGuard com `@Roles()` para controle de acesso baseado em perfil (admin, company_owner, employee, client)
- Matriz de permissões: GET /users (admin), GET /companies (admin, company_owner), POST/PATCH companies (admin)
- **Padrões brasileiros como requisito transversal permanente** — documentado em 9 arquivos (PRODUCT, ARCHITECTURE, DATABASE, API, DEVELOPMENT, LGPD, SECURITY, DECISIONS, STATUS). Especificação completa de idioma pt-BR, moeda R$, datas DD/MM/AAAA, horário 24h, timezone America/Recife, telefone com DDD, CPF, CNPJ, CEP e endereço brasileiro. ADR-017 registrado. **Nenhum controle implementado no código.**
- **Correções de documentação viva:** STATUS.md, INSTALLATION.md, DEVELOPMENT.md, README.md, .env.example
- **Infraestrutura inicial de testes unitários** — Jest + ts-jest configurados com jest.config.cjs e tsconfig.spec.json. Scripts `npm test`, `npm run test:watch` e `npm run test:cov`. Build de produção continua excluindo spec files. Cobertura gerada localmente e ignorada pelo .gitignore.
- **Primeira camada de isolamento multiempresa no módulo de empresas via CompanyUser** — TenantModule, TenantService, TenantGuard e decorator `@RequireCompany()`. PrismaModule global. Resolução do companyId por requisição via banco (sem companyId no JWT). GET /companies: admin vê todas, company_owner vê somente sua empresa vinculada. Validação de coerência User.role × CompanyUser.role. Bloqueio de zero vínculos, múltiplos vínculos e empresa inativa. Nenhuma migration, schema inalterado. Seed atualizado com Empresa Alpha, Beta, usuários multi-vínculo e sem vínculo. Build aprovado. 9 testes HTTP validados (100%).

### Validado

- **43 testes aprovados no total** (19 unitários + 24 e2e), sendo:
  - 9 testes negativos de segurança do ambiente de teste
  - 3 smoke tests de infraestrutura (NestJS, banco e2e, health check)
  - 12 cenários HTTP (login admin, RBAC: admin/owner/employee/client, tenant isolation: sem vínculo, múltiplos vínculos, empresa inativa, vínculo inativo; 401 sem token; 401 token inválido)

- `POST /auth/register` — retorno HTTP 201 (cadastro novo) e HTTP 409 (e-mail duplicado) validados manualmente via `curl`
- `POST /auth/login` — retorno HTTP 200 (credenciais válidas) e HTTP 401 (credenciais inválidas) validados manualmente via `curl`
- Hash de senha — bcrypt confirmado no código-fonte; `passwordHash` não exposto nas respostas da API
- Helmet — headers de segurança (CSP, HSTS, X-Frame-Options, X-Content-Type-Options) confirmados via `curl -I`
- `x-powered-by` — header ausente confirmado via `curl -I`
- CORS — configurável por ambiente via `CORS_ORIGIN`, fallback `http://localhost:3001`
- Mensagens de erro — não expõem detalhes internos, stack trace, senha, hash ou token
- JwtAuthGuard — rotas sem token retornam 401, com token inválido retornam 401, com token válido retornam 200
- Rotas públicas — `GET /auth/health`, `POST /auth/register`, `POST /auth/login` permanecem acessíveis sem token
- Swagger Bearer Auth — documentação e autenticação via Swagger UI validada
- **Matriz RBAC validada manualmente** — todos os 4 perfis (admin, company_owner, employee, client) testados contra todas as 6 rotas protegidas via `curl`.
- **Diferenciação 401 vs 403 confirmada** — usuário não autenticado recebe 401; usuário autenticado sem permissão recebe 403.
- **Permissões de admin validadas:** acesso completo a GET /users (200), GET /companies (200), POST /companies (201), PATCH block/unblock (200).
- **Permissões de company_owner validadas:** apenas GET /companies (200) permitido. Demais rotas retornam 403.
- **Permissões de employee validadas:** todas as rotas administrativas retornam 403.
- **Permissões de client validadas:** todas as rotas administrativas retornam 403.
- **Rotas sem token:** GET /users e GET /companies retornam 401.
- **Nenhum token, senha ou hash registrado nos testes.**
- **Princípio do menor privilégio confirmado:** cada perfil acessa exclusivamente o mínimo necessário.
- **Swagger Bearer Auth validado** em conjunto com a matriz.
- **3 suítes de testes unitários (Jest + ts-jest):** TenantService (9 testes, 100% cobertura), TenantGuard (5 testes, 100% cobertura), CompaniesService.findAll (5 testes). 19 testes aprovados, 0 falhos. Nenhum banco acessado. Nenhum código funcional corrigido. Nenhum warning de compatibilidade.
- **CI GitHub Actions do backend:** `.github/workflows/ci.yml` — actions/checkout@v5, actions/setup-node@v5, Node 24, cache npm, prisma generate, 19 testes aprovados, build OK. Execução real validada no runner Linux. Permissão mínima (contents: read). DATABASE_URL fictícia para geração do Prisma Client.

### Corrigido

- **Falha crítica de segurança em POST /auth/register** — endpoint público aceitava `role` no body, permitindo criação de contas administrativas sem autenticação. Removido `role` e `phone` do `RegisterDto`. Service agora força `role: "client"` internamente. `ValidationPipe` global com `forbidNonWhitelisted: true` rejeita campos administrativos (role, status, companyId, permissions) com HTTP 400. Swagger atualizado para mostrar apenas name, email e password.
- **Segurança do seed (`prisma/seed.ts`)** — senha fixa removida do código. Seed lê `RBAC_SEED_PASSWORD` de variável de ambiente. Allowlist de ambientes: permitido exclusivamente com `NODE_ENV=development` ou `NODE_ENV=test` (production, staging, ausente ou inválido bloqueiam). Upsert com `update: {}` — não altera nenhum dado de usuários existentes. Nenhum token, senha, hash ou JWT_SECRET é exibido nos logs. `.env.example` documenta `RBAC_SEED_PASSWORD` com aviso de uso exclusivo local.
- **Documentação: URL de clone corrigida** — substituído placeholder `seu-usuario` pela URL real `https://github.com/nicholasrichardsonsecurity/loopclub-enterprise.git` em INSTALLATION.md e README.md.
- **Documentação: nome da pasta corrigido** — de `loopclub_enterprise_sprint01` para `loopclub-enterprise` em README.md e INSTALLATION.md.
- **Documentação: desenvolvimento.** — afirmação incorreta de que "consultas sempre filtram por companyId" corrigida para "DEVEM filtrar — implementação pendente".
- **Documentação: .env.example duplicado removido** — `.env.example` da raiz removido; `backend/.env.example` definido como oficial e atualizado com variáveis faltantes (QR_TOKEN_SECRET, QR_TOKEN_EXPIRES_IN_SECONDS) e linhas de bloco markdown removidas.
- **Documentação: STATUS.md** — conexão Prisma/PostgreSQL atualizada de "pendente" para "validado manualmente" (banco real usado nos testes).

## [0.1.0] — 2026-06-26

### Adicionado

- Monorepo com estrutura organizada (apps, backend, docs, infra, packages)
- Backend NestJS com TypeScript, Prisma ORM e PostgreSQL
- Módulo de autenticação (registro, login, JWT com sub e role)
- Módulo de gestão de empresas (listar, criar, bloquear, desbloquear)
- Módulo de consulta de usuários
- Swagger/OpenAPI configurado em `/docs` com Bearer Auth
- Admin Web Next.js com dashboard visual (layout, cards, tabela mockada)
- App mobile Flutter com splash, login e carteira do cliente (3 telas)
- Schema Prisma completo (11 modelos, 6 enums)
- Migration inicial executada e consistente com o schema
- Docker Compose para PostgreSQL 16
- Documentação viva do projeto (22 documentos no total)
- Documentação LGPD e privacidade (LGPD.md, PRIVACY.md, DATA-MAP.md, RETENTION-POLICY.md, INCIDENT-RESPONSE.md, THREAT-MODEL.md, DATA-SUBJECT-RIGHTS.md)
- Mapa de dados com 13 categorias de dados pessoais
- Modelo de ameaças com 16 ameaças mapeadas
- 12 ADRs registrados (incluindo privacy by design, refresh token, auditoria)
- README modernizado com previews ASCII, diagrama Mermaid e seção LGPD

### Segurança
- Helmet configurado globalmente (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, X-XSS-Protection)
- CORS configurável por ambiente via `CORS_ORIGIN` (lista de origens separadas por vírgula)
- Header `x-powered-by` removido para evitar fingerprinting do servidor
- `.env.example` documenta nova variável `CORS_ORIGIN` com valor fictício

### Observações

- Projeto em desenvolvimento ativo — funcionalidades não validadas em produção
- **Nenhuma rota possui guarda JWT** — qualquer requisição anônima funciona
- **Zero testes automatizados** — nenhum arquivo `.spec.ts` encontrado
- Admin e mobile são esqueletos iniciais sem integração com API
- A contagem de enums foi corrigida de 4 para 6 no banco
- **Documentação LGPD é inicial** — nenhum controle foi implementado no código

## [0.0.0] — Antes da Sprint 01

- Estado inicial do repositório sem funcionalidades implementadas
