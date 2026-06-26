# Arquitetura do LoopClub Enterprise

## Visão geral

Monorepo com três frontends conectados a uma API REST central.

```mermaid
graph TB
    subgraph "Mobile (Flutter)"
        A[App Cliente/Funcionário/Empresa]
    end

    subgraph "Admin Web (Next.js)"
        B[Painel Administrativo]
    end

    subgraph "API (NestJS)"
        C[Auth Module]
        D[Companies Module]
        E[Users Module]
        F[Fidelity Module<br/>planejado]
    end

    subgraph "Banco (PostgreSQL)"
        G[(Database)]
    end

    A -->|HTTP :3000| C
    A -->|HTTP :3000| D
    B -->|HTTP :3000| C
    B -->|HTTP :3000| D
    C -->|Prisma ORM| G
    D -->|Prisma ORM| G
    E -->|Prisma ORM| G
```

## Estrutura do monorepo

```
loopclub_enterprise_sprint01/
├── apps/
│   ├── admin-web/       # Next.js — painel do Admin Master
│   └── mobile/           # Flutter — app único multi-perfil
├── backend/              # NestJS — API REST
├── database/             # Scripts SQL auxiliares
├── docker/               # Configurações Docker
├── docs/                 # Documentação (inclui LGPD, privacidade, segurança)
├── infra/                # Configurações de infraestrutura
└── packages/             # Pacotes compartilhados (futuro)
```

## Backend (NestJS)

Estrutura modular com separação clara de responsabilidades:

- **Módulos:** cada domínio de negócio é um módulo independente
- **Controllers:** responsáveis apenas por receber requisições HTTP
- **Services:** contêm a lógica de negócio
- **DTOs:** validam e tipam dados de entrada
- **PrismaService:** camada única de acesso ao banco

### Módulos atuais

| Módulo | Status | Descrição |
|--------|--------|-----------|
| Auth | Implementado | Registro, login, JWT |
| Companies | Implementado | CRUD, block/unblock |
| Users | Implementado | Listagem de usuários |
| Fidelity | Planejado | Programas de fidelidade |
| Plans | Planejado | Gestão de planos |
| Dashboard | Planejado | Relatórios e métricas |

## Frontend Mobile (Flutter)

Arquitetura feature-first. Atualmente contém esqueleto visual com:

- Splash screen com identidade visual
- Tela de login
- Home da carteira do cliente com cards de fidelidade

## Frontend Admin (Next.js)

Dashboard administrativo com layout de sidebar. Atualmente contém:

- Cards de métricas (MRR previsto, empresas ativas, etc.)
- Tabela de empresas recentes (dados mockados)
- Navegação lateral com seções planejadas

## Multi-tenancy

O isolamento entre empresas é feito por `companyId`. Cada registro sensível (progresso, transações, programas) referencia a empresa proprietária. Consultas devem sempre filtrar por `companyId` para evitar vazamento de dados entre tenants.

> **Aviso:** A validação de tenant isolation ainda não está implementada. Nenhum endpoint atual verifica se o usuário pertence à empresa que está acessando.

## Arquitetura de segurança (atual vs. planejada)

```mermaid
graph TB
    subgraph "Camada de Apresentação"
        REQ[Requisição HTTP]
    end

    subgraph "Camada de Segurança — Implementada"
        JWT_GUARD[JwtAuthGuard<br/>valida token JWT]
        PUBLIC[Decorator @Public()<br/>marca rotas públicas]
    end

    subgraph "Camada de Segurança — Planejada"
        RBAC[RolesGuard]
        TENANT[Tenant Validation]
        RATE[Rate Limiter]
    end

    subgraph "Camada de Negócio"
        CTRL[Controller]
        SRV[Service]
        AUDIT[AuditLog]
    end

    subgraph "Camada de Dados"
        PRISMA[Prisma ORM]
        DB[(PostgreSQL)]
    end

    REQ --> JWT_GUARD
    JWT_GUARD -->|rota pública| CTRL
    JWT_GUARD -->|rota protegida| RBAC
    RBAC --> TENANT
    TENANT --> RATE
    RATE --> CTRL
    CTRL --> SRV
    SRV --> AUDIT
    SRV --> PRISMA
    PRISMA --> DB
```

### Fluxo atual de autorização

1. Requisição chega com (ou sem) JWT no header `Authorization`
2. `JwtAuthGuard` verifica se a rota possui `@Public()` — se sim, libera sem validar token
3. Se não for pública, `JwtStrategy` valida assinatura, expiração e payload (`sub`, `role`)
4. Token inválido, ausente ou expirado → HTTP 401
5. Token válido → `userId` e `role` disponíveis no `request.user` para o controller
6. Rotas públicas: `GET /auth/health`, `POST /auth/register`, `POST /auth/login`

> **Implementado:** JWT AuthGuard com `@Public()`. **Pendente:** RBAC (RolesGuard), validação de tenant, rate limiting, audit log.

## Documentos de arquitetura relacionados

- [LGPD.md](LGPD.md) — Adequação à LGPD e privacy by design
- [PRIVACY.md](PRIVACY.md) — Princípios de privacidade do produto
- [SECURITY.md](SECURITY.md) — Medidas de segurança
- [THREAT-MODEL.md](THREAT-MODEL.md) — Modelo de ameaças
- [DATA-MAP.md](DATA-MAP.md) — Mapa de dados pessoais
