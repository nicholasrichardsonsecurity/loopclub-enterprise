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

---

## ADR-014 — Pagamento desacoplado com provedor substituível

**Status:** Proposto (planejado)

**Contexto:** O LoopClub precisará processar pagamentos recorrentes (Pix, cartão) e emitir NFS-e. Gateways de pagamento e provedores fiscais mudam com frequência por questões de custo, confiabilidade ou compliance.

**Decisão:** No módulo Payments, o gateway de pagamento será uma interface (`PaymentGateway`) com implementações concretas por provedor. O módulo Nfse seguirá o mesmo padrão (`FiscalProvider`). O core do sistema não deve conhecer detalhes do provedor. Webhooks de callback devem ser assinados com chave secreta e validados antes do processamento.

**Consequências:**
- Positivas: troca de provedor sem alterar regras de negócio; testável com mocks; isolamento de responsabilidade
- Negativas: complexidade inicial maior (interface, adaptador, factory); cada novo provedor exige implementação separada

---

## ADR-015 — Push notifications auditáveis com opt-out

**Status:** Proposto (planejado)

**Contexto:** O sistema precisará enviar notificações push operacionais e promocionais. Push promocional exige consentimento LGPD. Disparos precisam ser auditáveis para compliance e investigação de incidentes.

**Decisão:** Criar um módulo PushNotifications com:
1. Armazenamento de preferências por usuário (opt-out explícito por categoria)
2. Consentimento separado para push promocional (base legal: art. 7º, I da LGPD)
3. Registro de auditoria para cada disparo (data, conteúdo, destinatário, canal, autorizador)
4. Agendamento com fila (para evitar sobrecarga e permitir reprocessamento)

**Consequências:**
- Positivas: compliance LGPD para push promocional; rastreabilidade completa; usuário controla o que recebe
- Negativas: aumento de armazenamento (histórico de disparos); necessidade de fila e worker para agendamento; custo operacional de notificações

---

## ADR-016 — RolesGuard com decorator @Roles para RBAC

**Status:** Aceito

**Contexto:** Após implementar JwtAuthGuard, qualquer token JWT válido acessava todas as rotas protegidas. Era necessário restringir o acesso por perfil (admin, company_owner, employee, client) sem implementar tenant isolation.

**Decisão:** Criar RolesGuard que lê os perfis permitidos via decorator `@Roles()` e compara com `request.user.role` (extraído do JWT pelo JwtStrategy). O perfil nunca é aceito de parâmetros externos — vem exclusivamente do token assinado. A combinação `@UseGuards(JwtAuthGuard, RolesGuard)` por controller garante que o token é validado antes do perfil.

**Consequências:**
- Positivas: perfil seguro (vem do JWT, não do frontend); 403 claro para perfil sem acesso; decorator simples de aplicar em novas rotas; princípio do menor privilégio aplicado
- Negativas: ainda não há validação de companyId (qualquer admin vê dados de todas as empresas); precisa lembrar de adicionar `@Roles()` em cada novo endpoint protegido

---

## ADR-017 — Padrões brasileiros como requisito transversal permanente

**Status:** Aceito

**Contexto:** O LoopClub Enterprise atende exclusivamente o mercado brasileiro. Era necessário formalizar que todos os padrões de apresentação, armazenamento, validação e integração devem seguir normas brasileiras — e não assumir padrões internacionais como default.

**Decisão:** Estabelecer como requisito transversal permanente que todo o produto segue padrões brasileiros. Nenhuma funcionalidade, interface, API ou integração deve assumir formato internacional como padrão sem validação explícita. Os padrões são:

- **Idioma:** português do Brasil (pt-BR) em toda interface de usuário
- **Moeda:** Real brasileiro (R$). Armazenamento em `Decimal` ou centavos. Formatação pt-BR na apresentação.
- **Datas:** ISO 8601 UTC no armazenamento e APIs. DD/MM/AAAA e fuso America/Recife na exibição.
- **Horários:** Formato 24 horas.
- **Documentos:** CPF (11 dígitos) e CNPJ (14 dígitos). Armazenar apenas números. Validar dígitos verificadores.
- **Telefones:** Padrão brasileiro com DDD. E.164 para integrações.
- **CEP:** 8 dígitos numéricos.
- **Endereço:** Logradouro, número, complemento, bairro, município, UF, CEP.

**Consequências:**
- Positivas: clareza para novos desenvolvedores sobre os padrões esperados; consistência entre backend, frontend mobile e frontend web; documentação unificada
- Negativas: CPF, CNPJ e formatos regionais adicionam complexidade de validação; timezone America/Recife pode não ser adequado para todos os clientes (mantida possibilidade de configuração futura); CEP requer integração com API externa (ViaCEP) para auto-preenchimento
- Riscos: esquecer de validar dígitos verificadores de CPF/CNPJ no backend (não apenas no frontend); expor documentos completos em logs ou respostas de API sem necessidade

---

## ADR-018 — Multi-tenancy via CompanyUser com resolução em tempo de requisição

**Status:** Aceito

**Contexto:** O schema Prisma já possuía o model CompanyUser (N:N entre User e Company), mas ele nunca era populado nem utilizado. Era necessário implementar isolamento multiempresa sem alterar o schema, sem migration e sem colocar companyId no JWT.

**Decisão:** Adotar CompanyUser como fonte oficial de tenant. O companyId é resolvido em tempo de requisição através de consulta ao banco (TenantService), nunca lido do JWT, body, query ou parâmetros de rota. O JWT permanece mínimo: apenas `sub` e `role`.

**Detalhes da implementação:**
- **TenantModule** com TenantService e TenantGuard, exportados para importação por outros módulos.
- **TenantService.resolveTenant()** — consulta CompanyUser com status active, valida quantidade de vínculos (0, 1, múltiplos), valida Company.status, valida coerência User.role × CompanyUser.role.
- **TenantGuard** — lê metadata `@RequireCompany()`. Só consulta banco se a rota exigir contexto empresarial.
- **Decorator `@RequireCompany()`** — combina SetMetadata + UseGuards(TenantGuard) em um único decorator.
- **PrismaModule global (@Global)** — registrado uma vez no AppModule, elimina instâncias duplicadas de PrismaService.
- **Regra do MVP:** no máximo um vínculo ativo por usuário; múltiplos vínculos bloqueados com erro controlado.
- **Admin global** não exige companyId.

**Consequências:**
- Positivas: JWT leve (sem companyId); efeito imediato ao remover/inativar vínculo (sem esperar expiração de token); isolamento sem migration; schema inalterado; infraestrutura reutilizável para novos módulos
- Negativas: consulta ao banco em cada requisição empresarial (cache adiado); validação de múltiplos vínculos pela aplicação (não há constraint no banco); company_owner com múltiplas empresas não tem seleção explícita de tenant nesta etapa
- Riscos: esquecer de adicionar `@RequireCompany()` em nova rota empresarial; vínculo órfão se empresa for excluída (soft delete mitigaria)
