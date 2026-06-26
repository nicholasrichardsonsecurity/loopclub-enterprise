# Status do Desenvolvimento

Atualizado em: 26/06/2026

## ✅ Concluído

- [x] Monorepo estruturado (apps, backend, docs, infra, packages)
- [x] Backend NestJS compila e inicia localmente com hot-reload (`nest build` OK)
- [x] Swagger configurado e acessível em `/docs` com Bearer Auth
- [x] Prisma conectado ao PostgreSQL
- [x] Schema Prisma completo (11 modelos, 6 enums)
- [x] Migration inicial executada e consistente com o schema Prisma
- [x] Módulo Auth: POST /auth/register (cria usuário com hash bcrypt, valida e-mail duplicado)
- [x] Módulo Auth: POST /auth/login (valida credenciais, retorna JWT com sub e role)
- [x] Módulo Auth: GET /auth/health (health check do serviço)
- [x] Módulo Users: GET /users (lista usuários com campos selecionados)
- [x] Módulo Companies: GET /companies (lista empresas ordenadas por criação)
- [x] Módulo Companies: POST /companies (cria empresa com dados validados)
- [x] Módulo Companies: PATCH /companies/:id/block (altera status para blocked)
- [x] Módulo Companies: PATCH /companies/:id/unblock (altera status para active)
- [x] Docker Compose com PostgreSQL 16
- [x] Admin Web Next.js com dashboard mockado (layout, cards, tabela)
- [x] App Flutter com splash, login e carteira mockada (3 telas)
- [x] Documentação viva completa (15 arquivos: README, CHANGELOG, CONTRIBUTING, CLAUDE.md + 11 docs)

## 🔄 Em Desenvolvimento

- [ ] Validar registro e login com testes manuais ou automatizados
- [ ] Proteger rotas com JWT Guards (AuthGuard)
- [ ] Implementar RolesGuard com decorator @Roles (RBAC)
- [ ] Seed inicial (Admin Master padrão)
- [ ] Integrar admin web com API real (atualmente dados mockados)
- [ ] Integrar app Flutter com API real (atualmente dados mockados)
- [ ] Testes automatizados (0 arquivos .spec.ts encontrados)

## 📋 Próximos Passos (Sprint 02)

- [ ] Guardas JWT em todas as rotas existentes
- [ ] Refresh token
- [ ] Vincular CompanyUser no registro (criar vínculo empresa-usuário)
- [ ] Testes de integração para módulo Auth
- [ ] Validação de multi-tenancy nas consultas
- [ ] CRUD completo de empresas (update, delete, busca por ID)

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
- [ ] Pagamento automático (gateway)
- [ ] Deploy em produção
- [ ] Testes automatizados (unitários, integração, e2e)
- [ ] CI/CD com GitHub Actions
- [ ] Docker para serviços (não só banco)
