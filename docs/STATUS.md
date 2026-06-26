# Status do Desenvolvimento

Atualizado em: 26/06/2026

## ✅ Concluído

- [x] Monorepo estruturado (apps, backend, docs, infra, packages)
- [x] Backend NestJS inicia localmente com hot-reload
- [x] Swagger configurado e acessível em `/docs`
- [x] Prisma conectado ao PostgreSQL
- [x] Schema Prisma completo (11 modelos, 4 enums)
- [x] Migration inicial executada
- [x] Módulo Auth: POST /auth/register (cria usuário com hash bcrypt)
- [x] Módulo Auth: POST /auth/login (valida credenciais, retorna JWT)
- [x] Módulo Auth: GET /auth/health (health check)
- [x] Módulo Users: GET /users (lista usuários)
- [x] Módulo Companies: GET /companies (lista empresas)
- [x] Módulo Companies: POST /companies (cria empresa)
- [x] Módulo Companies: PATCH /companies/:id/block (bloqueia empresa)
- [x] Módulo Companies: PATCH /companies/:id/unblock (desbloqueia empresa)
- [x] Docker Compose com PostgreSQL 16
- [x] Admin Web Next.js com dashboard mockado
- [x] App Flutter com splash, login e carteira mockada
- [x] Documentação viva criada

## 🔄 Em Desenvolvimento

- [ ] Validar registro e login com testes manuais/automáticos
- [ ] Proteger rotas com JWT Guards
- [ ] Implementar RolesGuard (RBAC)
- [ ] Seed inicial (Admin Master)
- [ ] Integrar admin web com API real
- [ ] Integrar app Flutter com API real

## 📋 Próximos Passos (Sprint 02)

- [ ] Guardas JWT em todas as rotas
- [ ] Refresh token
- [ ] Vincular CompanyUser no registro
- [ ] Testes de integração para auth
- [ ] Validação de multi-tenancy
- [ ] CRUD completo de empresas

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
