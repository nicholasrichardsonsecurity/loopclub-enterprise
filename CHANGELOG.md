# Changelog

Todas as mudanças notáveis neste projeto serão documentadas aqui.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/) e este projeto segue [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Adicionado

- JwtStrategy com validação de assinatura, expiração e payload (sub, role)
- JwtAuthGuard com suporte a `@Public()` para rotas públicas
- Decorator `@Public()` para marcar rotas que não exigem autenticação
- Proteção JWT Bearer nas rotas `GET /users`, `GET /companies`, `POST /companies`, `PATCH /companies/:id/block`, `PATCH /companies/:id/unblock`
- Swagger atualizado com `@ApiBearerAuth()` e `@ApiUnauthorizedResponse()` nas rotas protegidas
- RolesGuard com `@Roles()` para controle de acesso baseado em perfil (admin, company_owner, employee, client)
- Matriz de permissões: GET /users (admin), GET /companies (admin, company_owner), POST/PATCH companies (admin)

### Validado

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
- RolesGuard — admin acessa todas as rotas; company_owner acessa apenas GET /companies; employee e client recebem 403

### Corrigido

- **Falha crítica de segurança em POST /auth/register** — endpoint público aceitava `role` no body, permitindo criação de contas administrativas sem autenticação. Removido `role` e `phone` do `RegisterDto`. Service agora força `role: "client"` internamente. `ValidationPipe` global com `forbidNonWhitelisted: true` rejeita campos administrativos (role, status, companyId, permissions) com HTTP 400. Swagger atualizado para mostrar apenas name, email e password.
- **Segurança do seed (`prisma/seed.ts`)** — senha fixa removida do código. Seed lê `RBAC_SEED_PASSWORD` de variável de ambiente. Allowlist de ambientes: permitido exclusivamente com `NODE_ENV=development` ou `NODE_ENV=test` (production, staging, ausente ou inválido bloqueiam). Upsert com `update: {}` — não altera nenhum dado de usuários existentes. Nenhum token, senha, hash ou JWT_SECRET é exibido nos logs. `.env.example` documenta `RBAC_SEED_PASSWORD` com aviso de uso exclusivo local.

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
