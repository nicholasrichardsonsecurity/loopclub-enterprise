# Changelog

Todas as mudanças notáveis neste projeto serão documentadas aqui.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/) e este projeto segue [Semantic Versioning](https://semver.org/).

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
- Documentação viva do projeto (14 documentos + CLAUDE.md)

### Observações

- Projeto em desenvolvimento ativo — funcionalidades não validadas em produção
- **Nenhuma rota possui guarda JWT** — qualquer requisição anônima funciona
- **Zero testes automatizados** — nenhum arquivo `.spec.ts` encontrado
- Admin e mobile são esqueletos iniciais sem integração com API
- A contagem de enums foi corrigida de 4 para 6 no banco

## [0.0.0] — Antes da Sprint 01

- Estado inicial do repositório sem funcionalidades implementadas
