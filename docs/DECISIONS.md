# Registro de Decisões Arquiteturais (ADR)

Este documento registra as principais decisões arquiteturais do projeto, usando formato ADR simplificado.

---

## ADR-001 — Flutter para aplicativo mobile

**Status:** Aceito

**Contexto:** Necessitávamos de uma tecnologia cross-platform para entregar Android e iOS com um único código-base, mantendo boa performance e experiência nativa.

**Decisão:** Adotar Flutter com Dart como framework mobile.

**Consequências:**
- Positivas: código único para ambas as plataformas, hot-reload, rico ecossistema de pacotes, boa performance
- Negativas: equipe precisa conhecer Dart, apps maiores que nativos puros

---

## ADR-002 — NestJS para backend

**Status:** Aceito

**Contexto:** O backend precisava de uma estrutura robusta, modular e escalável, com suporte nativo a TypeScript.

**Decisão:** Adotar NestJS com TypeScript como framework backend.

**Consequências:**
- Positivas: arquitetura modular, injeção de dependência, decorators, documentação rica, ecossistema maduro
- Negativas: complexidade inicial maior que Express puro, curva de aprendizado para decorators

---

## ADR-003 — PostgreSQL e Prisma ORM

**Status:** Aceito

**Contexto:** Necessitávamos de um banco relacional confiável com bom suporte a consultas complexas e migrations versionadas.

**Decisão:** Adotar PostgreSQL como banco e Prisma como ORM.

**Consequências:**
- Positivas: schema declarativo, migrations versionadas, Prisma Studio para visualização, type-safety total, ótima DX
- Negativas: Prisma pode ser menos performático que SQL puro em consultas muito complexas, camada extra de abstração

---

## ADR-004 — REST com Swagger/OpenAPI

**Status:** Aceito

**Contexto:** Precisávamos de uma API padronizada, auto-documentada e fácil de consumir tanto pelo frontend quanto por integrações futuras.

**Decisão:** Adotar REST como estilo arquitetural e Swagger/OpenAPI via `@nestjs/swagger` para documentação.

**Consequências:**
- Positivas: documentação automática, UI interativa para testes, padrão amplamente conhecido
- Negativas: GraphQL não será utilizado (menos flexível para consultas complexas)

---

## ADR-005 — Controle manual de mensalidade na v1.0

**Status:** Aceito

**Contexto:** Implementar pagamento automático via gateway aumenta o escopo inicial. Para viabilizar o MVP, o controle de mensalidade será manual.

**Decisão:** O Admin Master controla planos e assinaturas manualmente no painel. Bloqueio de empresa é acionado manualmente.

**Consequências:**
- Positivas: MVP mais rápido, sem dependência de gateway de pagamento
- Negativas: processo manual, risco de atraso em bloqueios, necessidade de automatizar em versão futura

---

## ADR-006 — Desenvolvimento local sem Docker (neste momento)

**Status:** Aceito

**Contexto:** Docker para todos os serviços adiciona complexidade inicial. O foco atual é na fundação técnica.

**Decisão:** Docker é usado apenas para o banco PostgreSQL. Backend, admin e mobile rodam nativamente no host.

**Consequências:**
- Positivas: configuração mais simples, hot-reload mais rápido, menos recursos
- Negativas: ambiente diferente de produção, dependências precisam estar instaladas no host

---

## ADR-007 — Multi-tenancy por companyId

**Status:** Aceito

**Contexto:** Múltiplas empresas usarão a mesma instância do sistema. É necessário isolar dados entre elas.

**Decisão:** Isolamento lógico via campo `companyId` em todas as entidades sensíveis, sem banco separado por empresa.

**Consequências:**
- Positivas: infraestrutura compartilhada, mais simples de operar, consultas com filtro garantem isolamento
- Negativas: risco de vazamento se filtro for esquecido (mitigado por auditoria e código disciplinado)

---

## ADR-008 — Documentação viva obrigatória

**Status:** Aceito

**Contexto:** A documentação frequentemente fica desatualizada em relação ao código, gerando confusão e retrabalho.

**Decisão:** Documentação é parte integrante do desenvolvimento. Toda mudança deve atualizar os documentos correspondentes. Regras definidas em [CONTRIBUTING.md](../CONTRIBUTING.md).

**Consequências:**
- Positivas: documentação sempre atualizada, onboarding mais rápido, rastreabilidade das decisões
- Negativas: custo adicional em cada tarefa, exige disciplina da equipe

---

## ADR-009 — Privacy by design e LGPD desde o início

**Status:** Aceito

**Contexto:** O LoopClub trata dados pessoais de múltiplos perfis (clientes, empresas, funcionários) e está sujeito à LGPD. Adequar o sistema após pronto é mais caro e arriscado.

**Decisão:** Adotar privacy by design como princípio arquitetural desde a concepção. Documentar fundamentos LGPD, mapa de dados, política de retenção, resposta a incidentes e direitos dos titulares antes da produção.

**Consequências:**
- Positivas: conformidade mais barata, riscos identificados cedo, confiança dos usuários
- Negativas: custo adicional de documentação e planejamento, necessidade de revisão jurídica externa

---

## ADR-010 — Controle de dados minimizado na v1.0

**Status:** Aceito

**Contexto:** Dados como CPF, data de nascimento e localização precisa aumentam o risco e a obrigação de conformidade sem agregar valor ao MVP.

**Decisão:** Na v1.0, coletar apenas nome, e-mail, telefone (opcional) e role. CPF, data de nascimento e geolocalização serão avaliados caso a caso em versões futuras.

**Consequências:**
- Positivas: menor exposição de dados sensíveis, compliance mais simples, menos riscos
- Negativas: algumas features futuras podem exigir dados adicionais (ex.: CPF em nota fiscal)

---

## ADR-011 — Refresh token com rotação para sessão segura

**Status:** Proposto (pendente de implementação)

**Contexto:** JWT sem refresh token força sessões longas (1 dia) ou obriga re-login frequente. Rotação de refresh token permite sessões longas com revogação segura.

**Decisão:** Implementar refresh token armazenado em banco (tabela `RefreshToken`), com rotação a cada uso e revogação manual por usuário.

**Consequências:**
- Positivas: sessões seguras com revogação, expiração curta de access token
- Negativas: complexidade adicional, estado no banco para refresh tokens, necessidade de limpeza de tokens expirados

---

## ADR-012 — Auditoria de ações críticas

**Status:** Proposto (pendente de implementação)

**Contexto:** Para compliance LGPD (art. 37) e rastreabilidade de incidentes, ações críticas precisam ser registradas com data, autor e detalhes.

**Decisão:** Implementar registro obrigatório em `AuditLog` para ações: login, criação de usuário, alteração de role, block/unblock de empresa, exclusão de dados, alteração de permissões.

**Consequências:**
- Positivas: rastreabilidade completa, suporte a investigações, compliance LGPD
- Negativas: aumento de volume de dados, necessidade de política de retenção para audit logs

---

## ADR-013 — JwtAuthGuard por controller com decorator @Public()

**Status:** Aceito

**Contexto:** Necessitávamos proteger rotas privadas com JWT sem implementar RBAC completo. As opções consideradas foram:
1. `APP_GUARD` global com `@Public()` — protege tudo por padrão, exige decorator em cada rota pública
2. `@UseGuards(JwtAuthGuard)` por controller — protege apenas controllers com o decorator, sem risco de esquecer @Public() em novas rotas

**Decisão:** Adotar `@UseGuards(JwtAuthGuard)` por controller (opção 2). Criar decorator `@Public()` para marcar rotas de auth que não exigem token. JwtAuthGuard verifica o metadata `isPublic` via `Reflector` antes de validar o token.

**Consequências:**
- Positivas: sem risco de bloquear acidentalmente rotas novas (só são protegidas se explicitamente decoradas); guarda mais simples de entender; não precisa de `APP_GUARD` global
- Negativas: cada módulo que usa o guard precisa importar `AuthModule` (acoplamento entre módulos); esquecer `@UseGuards()` em um novo controller deixa a rota aberta
