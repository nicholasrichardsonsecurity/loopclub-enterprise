# Roadmap

Roteiro de desenvolvimento do LoopClub Enterprise v1.0.

## Sprint 01 — Fundação Técnica ✅

**Status:** Concluída

- [x] Monorepo organizado
- [x] Backend NestJS com Prisma + PostgreSQL
- [x] Schema Prisma completo
- [x] Swagger configurado
- [x] Módulo Auth (registro, login, JWT)
- [x] Módulo Companies (CRUD, block/unblock)
- [x] Módulo Users (listagem)
- [x] Admin Web Next.js (esqueleto)
- [x] App Flutter (esqueleto)
- [x] Docker Compose PostgreSQL
- [x] Documentação viva

## Sprint 02 — Autenticação e RBAC 🔄

**Status:** Próxima sprint

- [ ] Guardas JWT nas rotas protegidas
- [ ] RolesGuard com decorators (@Roles)
- [ ] Refresh token
- [ ] Seed inicial (Admin Master padrão)
- [ ] Vincular usuário à empresa no registro
- [ ] Testes de autenticação
- [ ] Proteger rotas existentes

## Sprint 03 — Empresas, Planos e Assinaturas

- [ ] CRUD completo de empresas (update, delete)
- [ ] Busca e filtros de empresas
- [ ] CRUD de planos
- [ ] CRUD de assinaturas (manual)
- [ ] Bloqueio automático por assinatura vencida
- [ ] Dashboard de empresas no admin

## Sprint 04 — Programas de Fidelidade

- [ ] CRUD de programas (Compre X Ganhe Y, Progressivo)
- [ ] CRUD de milestones (programa progressivo)
- [ ] Vinculação de programa à empresa
- [ ] Lançamento de pontos (manual e QR)
- [ ] Consulta de progresso do cliente
- [ ] Resgate de recompensa

## Sprint 05 — QR Code e Carteira

- [ ] Geração de token QR dinâmico
- [ ] Validação e consumo de QR
- [ ] Scanner de QR no app
- [ ] Carteira de fidelidade completa
- [ ] Extrato de transações
- [ ] Notificações de progresso

## Sprint 06 — Dashboards e Personalização

- [ ] Dashboard da empresa (métricas, gráficos)
- [ ] Dashboard do Admin (visão geral)
- [ ] Relatórios exportáveis
- [ ] Personalização visual (logo, cores por empresa)
- [ ] Histórico e auditoria completo

## Sprint 07 — Admin Master Dashboard 🔮

- [ ] Dashboard Admin Master com cards de métricas (empresas ativas, bloqueadas, inadimplentes)
- [ ] Gráficos de evolução (MRR previsto × recebido, crescimento de empresas)
- [ ] Gestão de NFS-e (emissão, status, cancelamento, substituição)
- [ ] Solicitações LGPD (painel de DataSubjectRequest)
- [ ] Incidentes de segurança (painel de SecurityIncident)
- [ ] Pagamentos e assinaturas (visão consolidada)

## Sprint 08 — Pagamentos e NFS-e 🔮

- [ ] Integração com gateway de pagamento (Pix, cartão, recorrência)
- [ ] Webhooks assinados para confirmação de pagamento
- [ ] Idempotência em operações financeiras
- [ ] Liberação automática de assinatura após confirmação
- [ ] Fluxo de estorno e chargeback
- [ ] Tratamento de falha de pagamento (retentativa, notificação, bloqueio)
- [ ] Emissão de NFS-e após pagamento confirmado
- [ ] Envio de NFS-e ao cliente (e-mail / download)
- [ ] Status e reprocessamento de NFS-e
- [ ] Cancelamento e substituição de NFS-e
- [ ] Integração desacoplada com provedor fiscal (troca de provider sem impacto no core)

## Sprint 09 — Push Notifications 🔮

- [ ] Infraestrutura de push (global, por perfil, por empresa)
- [ ] Push operacional (confirmação, lembrete, alerta)
- [ ] Push promocional (nova recompensa, oferta)
- [ ] Agendamento de disparo
- [ ] Histórico de notificações enviadas
- [ ] Preferências e opt-out por usuário
- [ ] Auditoria de disparos

## Sprint 10 — Relatórios Contábeis 🔮

- [ ] Relatório de faturamento por competência
- [ ] Relatório de notas emitidas e canceladas
- [ ] Relatório de pagamentos, estornos e inadimplência
- [ ] Exportação CSV / XLSX
- [ ] Conciliação financeira
- [ ] Resumo mensal para contabilidade

## Futuro (pós v1.0)

- [ ] App iOS
- [ ] Chat/suporte in-app
- [ ] Marketplace de recompensas
- [ ] API pública para integração de terceiros
- [ ] Aplicativo dedicado por empresa (white-label)
