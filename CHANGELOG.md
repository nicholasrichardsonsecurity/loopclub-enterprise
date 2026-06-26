# Changelog

Todas as mudanças notáveis neste projeto serão documentadas aqui.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/) e este projeto segue [Semantic Versioning](https://semver.org/).

## [0.1.0] — 2026-06-26

### Adicionado

- Monorepo com estrutura organizada (apps, backend, docs, infra, packages)
- Backend NestJS com TypeScript, Prisma ORM e PostgreSQL
- Módulo de autenticação (registro, login, JWT)
- Módulo de gestão de empresas (listar, criar, bloquear, desbloquear)
- Módulo de consulta de usuários
- Swagger/OpenAPI configurado em `/docs`
- Admin Web Next.js com dashboard visual
- App mobile Flutter com splash, login e carteira do cliente
- Schema Prisma completo (User, Company, CompanyUser, Plan, Subscription, LoyaltyProgram, LoyaltyProgress, Transaction, QrToken, AuditLog)
- Docker Compose para PostgreSQL 16
- Documentação viva (PRODUCT, ARCHITECTURE, DATABASE, API, INSTALLATION, DEVELOPMENT, DEPLOYMENT, SECURITY, ROADMAP, STATUS, DECISIONS, SPRINT-01)

### Observações

- Projeto em desenvolvimento ativo — funcionalidades não validadas em produção
- Autenticação JWT implementada, mas sem guardas nas rotas
- Admin e mobile são esqueletos iniciais sem integração com API
