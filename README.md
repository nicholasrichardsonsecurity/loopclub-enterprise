# LoopClub Enterprise — SaaS de Fidelização e Retenção

**Status:** Desenvolvimento ativo — Sprint 01 concluída, funcionalidades básicas implementadas.

O LoopClub é uma plataforma SaaS multiempresa de fidelização e retenção de clientes. Oferece um aplicativo único para clientes, funcionários e empresas, além de um painel web para administração master.

## Stack oficial

| Camada | Tecnologia |
|--------|-----------|
| Mobile | Flutter (Android e iOS) |
| Backend | NestJS + TypeScript |
| ORM | Prisma |
| Banco | PostgreSQL |
| Admin Web | Next.js |
| Documentação | Swagger / OpenAPI |
| Versionamento | Git e GitHub |
| Containerização | Docker (planejado) |

## Estrutura do monorepo

```txt
loopclub_enterprise_sprint01/
├── apps/
│   ├── admin-web/          # Painel administrativo Next.js
│   └── mobile/             # App Flutter (clientes/empresas/funcionários)
├── backend/                # API NestJS
│   ├── prisma/             # Schema e migrações
│   └── src/
│       ├── modules/
│       │   ├── auth/       # Autenticação (registro, login, JWT)
│       │   ├── companies/  # Gestão de empresas (CRUD, block/unblock)
│       │   └── users/      # Consulta de usuários
│       └── prisma.service.ts
├── database/               # Scripts SQL auxiliares
├── docker/                 # Configurações Docker auxiliares
├── docs/                   # Documentação viva do projeto
├── infra/                  # Configurações de infraestrutura
├── packages/               # Pacotes compartilhados (futuro)
├── docker-compose.yml      # PostgreSQL via Docker
└── .env.example            # Modelo de variáveis de ambiente
```

## Requisitos

- Node.js >= 18
- npm >= 9
- PostgreSQL 16 (local ou Docker)
- Flutter SDK >= 3.4.0 (para mobile)
- Docker Desktop (opcional — para banco via container)

## Instalação rápida

```powershell
# 1. Clone o repositório
git clone https://github.com/seu-usuario/loopclub-enterprise.git
cd loopclub_enterprise_sprint01

# 2. Entre na pasta do backend
cd backend

# 3. Instale as dependências
npm install

# 4. Copie o arquivo de ambiente
Copy-Item .env.example .env

# 5. Edite o .env com os dados do seu PostgreSQL
#    DATABASE_URL="postgresql://usuario:senha@localhost:5432/loopclub_db?schema=public"

# 6. Crie o banco de dados (pelo psql ou pgAdmin)
psql -U postgres -c "CREATE DATABASE loopclub_db;"

# 7. Gere o Prisma Client
npx prisma generate

# 8. Execute as migrações
npx prisma migrate dev

# 9. Inicie o servidor em modo desenvolvimento
npm run start:dev
```

Após iniciar, o servidor estará disponível em:
- **Backend:** http://localhost:3000
- **Swagger:** http://localhost:3000/docs
- **Prisma Studio:** `npx prisma studio` → http://localhost:5555

### Admin Web

```powershell
cd apps/admin-web
npm install
npm run dev
# Admin: http://localhost:3001
```

### Mobile (Flutter)

```powershell
cd apps/mobile
flutter pub get
flutter run
```

## Comandos Git

```powershell
# Adicionar e commitar
git add .
git commit -m "mensagem"

# Enviar para o remoto
git push origin nome-da-branch
```

## Documentação relacionada

| Documento | Descrição |
|-----------|-----------|
| [PRODUCT.md](docs/PRODUCT.md) | Visão geral do produto e personas |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Decisões e diagramas de arquitetura |
| [DATABASE.md](docs/DATABASE.md) | Modelo de dados e entidades |
| [API.md](docs/API.md) | Endpoints disponíveis |
| [INSTALLATION.md](docs/INSTALLATION.md) | Guia completo de instalação |
| [DEVELOPMENT.md](docs/DEVELOPMENT.md) | Fluxo de desenvolvimento |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Deploy e infraestrutura |
| [SECURITY.md](docs/SECURITY.md) | Segurança e boas práticas |
| [ROADMAP.md](docs/ROADMAP.md) | Roteiro completo do produto |
| [STATUS.md](docs/STATUS.md) | Status atual do desenvolvimento |
| [DECISIONS.md](docs/DECISIONS.md) | Registro de decisões arquiteturais (ADR) |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Guia de contribuição |
| [CHANGELOG.md](CHANGELOG.md) | Histórico de versões |

## Roadmap resumido

- **Sprint 01** — Fundação técnica: monorepo, NestJS, Prisma, PostgreSQL, Swagger, admin web base, Flutter base
- **Sprint 02** — Autenticação robusta + RBAC + seed inicial
- **Sprint 03** — Gestão de empresas + planos + assinaturas manuais
- **Sprint 04** — Programas de fidelidade (Compre X Ganhe Y, Progressivo)
- **Sprint 05** — Carteira do cliente + QR Code + scanner
- **Sprint 06** — Dashboards + relatórios + personalização visual

## Aviso

> Este projeto está em desenvolvimento ativo. Funcionalidades documentadas podem não estar completamente implementadas ou validadas. Consulte [STATUS.md](docs/STATUS.md) para o estado atual de cada funcionalidade.
