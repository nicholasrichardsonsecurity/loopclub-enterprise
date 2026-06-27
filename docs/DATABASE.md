# Banco de Dados

## Tecnologia

- PostgreSQL 16
- Prisma ORM 5.x
- Acesso via Prisma Client no NestJS

## Schema atual

O schema completo está em [`backend/prisma/schema.prisma`](../backend/prisma/schema.prisma).

## Enums

| Enum | Valores |
|------|---------|
| UserRole | admin, company_owner, employee, client |
| UserStatus | active, blocked, deleted |
| CompanyStatus | active, blocked, trial, canceled |
| CompanyUserRole | owner, manager, employee |
| LoyaltyProgramType | buy_x_get_y, progressive |
| TransactionType | qr_point, manual_point, remove_point, reset, reward_redeemed |

## Entidades

### User

Usuário do sistema. Pode ser admin, empresa, funcionário ou cliente.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Chave primária |
| name | String | Nome completo |
| phone | String? | Telefone (único) |
| email | String? | E-mail (único) |
| passwordHash | String? | Hash bcrypt da senha |
| role | UserRole | admin, company_owner, employee, client |
| status | UserStatus | active, blocked, deleted |

### Company

Empresa cliente da plataforma.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Chave primária |
| name | String | Nome fantasia |
| document | String? | CNPJ/CPF (único) |
| category | String | Ex.: "acai", "restaurante", "barbearia" |
| phone | String? | Telefone de contato |
| email | String? | E-mail de contato |
| ownerName | String? | Nome do proprietário |
| status | CompanyStatus | active, blocked, trial, canceled |
| logoUrl | String? | URL da logo |
| primaryColor | String | Cor primária (#6F13A5) |
| secondaryColor | String | Cor secundária (#CF00FF) |

### CompanyUser — Fonte oficial de vínculo de tenant

Vínculo entre usuário e empresa. É a única fonte autorizada para determinar o contexto empresarial de um usuário. Não há `companyId` diretamente no model `User` nem no payload do JWT.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Chave primária |
| companyId | UUID | FK → Company |
| userId | UUID | FK → User |
| role | CompanyUserRole | owner, manager, employee |
| status | UserStatus | active, blocked, deleted |

**Restrição:** único por par (companyId, userId).

**Regras de validação no MVP:**
- No máximo um vínculo ativo por usuário (validado pela aplicação, não por constraint no banco).
- Múltiplos vínculos ativos: erro controlado (403) + log interno de inconsistência.
- Vínculo inativo ou empresa inativa: 403.
- Papéis empresariais (CompanyUserRole): `owner` (para company_owner), `employee` (para employee). `manager` sem permissões definidas nesta etapa.
- Coerência obrigatória: `User.role = company_owner` exige `CompanyUser.role = owner`; `User.role = employee` exige `CompanyUser.role = employee`.
- `Company.document` é usado como chave única do seed para upsert idempotente de empresas.
- **Schema e migrations:** nenhuma alteração foi necessária para a primeira camada de isolamento. O model CompanyUser já existia e foi utilizado como fonte de tenant.

### Plan

Planos de assinatura disponíveis.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Chave primária |
| name | String | Nome do plano |
| price | Decimal | Preço mensal |
| maxClients | Int? | Limite de clientes |
| maxPrograms | Int? | Limite de programas |
| features | JSON? | Features habilitadas |

### Subscription

Assinatura de uma empresa a um plano.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Chave primária |
| companyId | UUID | FK → Company |
| planId | UUID | FK → Plan |
| price | Decimal | Preço contratado |
| status | String | active, canceled, overdue |
| dueDate | DateTime? | Próximo vencimento |
| paidUntil | DateTime? | Pago até |

### LoyaltyProgram

Programa de fidelidade de uma empresa.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Chave primária |
| companyId | UUID | FK → Company |
| name | String | Nome do programa |
| type | LoyaltyProgramType | buy_x_get_y, progressive |
| targetPoints | Int | Pontos alvo |
| rewardName | String | Nome da recompensa |

### LoyaltyMilestone

Marcos de programas progressivos (múltiplas recompensas).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Chave primária |
| programId | UUID | FK → LoyaltyProgram |
| pointsRequired | Int | Pontos necessários |
| rewardName | String | Recompensa deste marco |

### LoyaltyProgress

Progresso individual do cliente em um programa.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Chave primária |
| companyId | UUID | FK → Company |
| programId | UUID | FK → LoyaltyProgram |
| clientId | UUID | FK → User (client) |
| currentPoints | Int | Pontos acumulados |
| completedCycles | Int | Ciclos completados |

**Restrição:** único por par (programId, clientId).

### Transaction

Transação de pontos (lançamento, resgate, etc.).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Chave primária |
| companyId | UUID | FK → Company |
| programId | UUID? | FK → LoyaltyProgram |
| clientId | UUID | FK → User (client) |
| operatorId | UUID? | FK → User (employee/admin) |
| type | TransactionType | qr_point, manual_point, remove_point, reset, reward_redeemed |
| points | Int | Quantidade de pontos |
| description | String? | Observação |

### QrToken

Token QR Code dinâmico para identificação do cliente.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Chave primária |
| companyId | UUID | FK → Company |
| clientId | UUID | FK → User |
| tokenHash | String | Hash do token (único) |
| expiresAt | DateTime | Data de expiração |
| usedAt | DateTime? | Quando foi usado |

### AuditLog

Auditoria de ações no sistema.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Chave primária |
| userId | UUID? | Quem executou |
| companyId | UUID? | Empresa afetada |
| action | String | Ação executada |
| entity | String | Entidade alvo |
| entityId | String? | ID da entidade |
| metadata | JSON? | Dados adicionais |

## Entidades propostas (LGPD e segurança)

As entidades abaixo são planejadas para conformidade com LGPD e segurança. Não fazem parte do schema atual e devem ser implementadas conforme necessário.

| Entidade | Finalidade | Prioridade |
|----------|-----------|------------|
| `PrivacyPolicyVersion` | Versionamento das políticas de privacidade | Média |
| `TermsVersion` | Versionamento dos termos de uso | Média |
| `UserConsent` | Registro de consentimento do usuário (base legal) | Alta |
| `DataSubjectRequest` | Registro de solicitações de titulares (LGPD art. 18) | Alta |
| `SecurityIncident` | Registro de incidentes de segurança | Alta |
| `RefreshToken` | Armazenamento de refresh tokens com revogação | Alta |
| `Session` | Controle de sessões ativas por usuário | Média |
| `DataRetentionJob` | Job programado para execução da política de retenção | Média |

> **Nota:** Essas entidades são propostas e não devem ser implementadas sem análise de impacto e validação da arquitetura.

## Diagrama de relacionamentos

```mermaid
erDiagram
    User ||--o{ CompanyUser : "tem vinculo"
    Company ||--o{ CompanyUser : "tem usuarios"
    Company ||--o{ LoyaltyProgram : "possui"
    Company ||--o{ Subscription : "possui"
    Company ||--o{ LoyaltyProgress : "possui"
    Company ||--o{ Transaction : "possui"
    Company ||--o{ QrToken : "possui"
    Company ||--o{ AuditLog : "possui"
    Plan ||--o{ Subscription : "assinado"
    LoyaltyProgram ||--o{ LoyaltyMilestone : "tem marcos"
    LoyaltyProgram ||--o{ LoyaltyProgress : "rastreia"
    LoyaltyProgram ||--o{ Transaction : "gerou"
    User ||--o{ LoyaltyProgress : "progresso"
    User ||--o{ Transaction : "como cliente"
    User ||--o{ Transaction : "como operador"
```

## Padrões brasileiros — regras de armazenamento (planejado)

O produto atende exclusivamente o mercado brasileiro. As regras abaixo são requisito transversal e permanente. **A implementação destas regras no schema atual está pendente**, exceto onde explicitamente indicado.

### Estado atual do schema
- `DateTime` do Prisma já armazena em UTC — compatível com o requisito
- `Plan.price` e `Subscription.price` já usam `Decimal` — compatível com o requisito monetário
- `User.phone` é `String?` — armazena string livre, sem validação de formato brasileiro
- Não há campos de CPF, CNPJ, CEP ou endereço no schema atual
- Não há normalização ou validação de DDD, dígitos verificadores ou formato de CEP

### Estado planejado

#### Datas e timestamps
- Manter UTC (ISO 8601) — já implementado via `DateTime` do Prisma
- Timezone padrão de exibição: America/Recife (configurável por empresa no futuro) — **não implementado**
- Nunca armazenar datas como string formatada (DD/MM/AAAA) no banco — já é prática válida
- Conversão para fuso local feita exclusivamente na camada de apresentação — **não implementado**

#### Valores monetários
- Manter `Decimal` do Prisma/PostgreSQL (`@db.Decimal(10,2)`) — já implementado em `Plan.price` e `Subscription.price`
- Nunca usar float para moeda — prática já seguida
- Formatação pt-BR aplicada apenas na apresentação — **não implementado** (não há formatação pt-BR nos frontends)

#### CPF e CNPJ — planejado, não implementado no schema
- Armazenar como `String?` normalizada (apenas números, sem pontos, traços ou barras)
- CPF: 11 dígitos, CNPJ: 14 dígitos — validar dígitos verificadores antes de persistir
- Aplicar `@unique` quando o documento for identificador único do registro
- **Schema atual:** nenhum campo de CPF ou CNPJ existe

#### Telefones — planejado, validação não implementada
- Armazenar como `String` normalizada (apenas números) com DDD obrigatório
- Não armazenar formatação visual (parênteses, traços, espaços)
- **Schema atual:** `User.phone` e `Company.phone` são `String?` — aceitam qualquer formato, sem validação de DDD ou dígitos

#### CEP — planejado, não implementado no schema
- Armazenar como `String` de 8 dígitos (apenas números)
- Exibir como 00000-000 (máscara na apresentação)
- **Schema atual:** nenhum campo de CEP existe

#### Endereço — planejado, não implementado no schema
- Modelo brasileiro: logradouro, número, complemento, bairro, município, UF (2 caracteres), CEP
- **Schema atual:** nenhum campo de endereço existe em qualquer modelo

## Observações

- Todas as chaves primárias usam UUID
- Timestamps automáticos com `@default(now())` e `@updatedAt`
- Índices criados nas FKs e campos de busca frequente (companyId, clientId, createdAt)
- Multi-tenancy por `companyId` — toda consulta deve filtrar pela empresa. Implementado no GET /companies via TenantGuard + CompanyUser. Demais rotas pendentes.
- PrismaModule global (@Global) registrado no AppModule — elimina instâncias duplicadas de PrismaService.
