# Changelog

Todas as mudanças notáveis neste projeto serão documentadas aqui.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/) e este projeto segue [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Validado

- `POST /auth/register` — retorno HTTP 201 (cadastro novo) e HTTP 409 (e-mail duplicado) validados manualmente via `curl`
- `POST /auth/login` — retorno HTTP 200 (credenciais válidas) e HTTP 401 (credenciais inválidas) validados manualmente via `curl`
- Hash de senha — bcrypt confirmado no código-fonte; `passwordHash` não exposto nas respostas da API
- Helmet — headers de segurança (CSP, HSTS, X-Frame-Options, X-Content-Type-Options) confirmados via `curl -I`
- `x-powered-by` — header ausente confirmado via `curl -I`
- CORS — configurável por ambiente via `CORS_ORIGIN`, fallback `http://localhost:3001`
- Mensagens de erro — não expõem detalhes internos, stack trace, senha, hash ou token

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

### Corrigido

- `POST /auth/register` agora retorna HTTP 201 (Created) no sucesso e HTTP 409 (Conflict) para e-mail duplicado
- `POST /auth/login` agora retorna HTTP 200 (OK) em vez de 201 (Created)
- E-mail duplicado usa `ConflictException` em vez de `BadRequestException`
- Swagger documenta corretamente as respostas de register (201, 409, 400) e login (200, 401, 400)
- Mensagem de erro de login genérica ("Credenciais inválidas.") não revela se o e-mail existe

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
