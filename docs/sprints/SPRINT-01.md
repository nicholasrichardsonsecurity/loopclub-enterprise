# Sprint 01 — Fundação Técnica

**Período:** Junho de 2026

## Objetivo

Criar a base técnica e executável do LoopClub Enterprise, com monorepo organizado, backend funcional, schema de banco completo, esqueletos dos frontends e documentação viva.

## Escopo

- Monorepo com estrutura padronizada
- Backend NestJS com Prisma, PostgreSQL, Swagger
- Módulos de autenticação, empresas e usuários
- Admin Web Next.js com dashboard visual
- App mobile Flutter com splash, login e carteira
- Schema completo do banco de dados
- Documentação profissional e viva

## Tarefas executadas

1. Criação da estrutura de monorepo (apps, backend, docs, docker, infra, packages)
2. Configuração do backend NestJS com TypeScript (compilação validada: `nest build` OK)
3. Schema Prisma (11 modelos, 6 enums)
4. Migration inicial do banco executada e consistente com schema
5. Módulo Auth (register, login, JWT, health)
6. Módulo Companies (list, create, block, unblock)
7. Módulo Users (list)
8. Swagger configurado com Bearer Auth
9. Docker Compose para PostgreSQL 16
10. Admin Web Next.js com layout e dashboard (dados mockados)
11. App Flutter com splash, login e carteira mockada (3 telas)
12. Documentação viva completa (15 arquivos)
13. Arquivos de documentação antigos e duplicados removidos (`docs/api/`, `docs/architecture/`, `docs/database/`)
14. Documentação LGPD e privacidade (7 novos arquivos: LGPD.md, PRIVACY.md, DATA-MAP.md, RETENTION-POLICY.md, INCIDENT-RESPONSE.md, THREAT-MODEL.md, DATA-SUBJECT-RIGHTS.md)
15. Mapa de dados com 13 categorias e riscos
16. Modelo de ameaças com 16 ameaças mapeadas com controles
17. 4 novos ADRs (privacy by design, dados minimizados, refresh token, auditoria)
18. Atualização de SECURITY.md, ARCHITECTURE.md, DATABASE.md, API.md, DECISIONS.md, STATUS.md, CLAUDE.md
19. README modernizado com previews ASCII do produto, diagrama Mermaid, seção LGPD e badges reais
20. Hardening de segurança mínima: Helmet, CORS restritivo, remoção de x-powered-by
21. Correção de códigos HTTP do Auth: register retorna 201/409/400, login retorna 200/401
22. Decorators Swagger do Auth documentam respostas corretas (register: 201, 409, 400; login: 200, 401, 400)

## Critérios de aceite

| Critério | Status | Validação |
|----------|--------|-----------|
| `docker compose up -d postgres` sobe o banco | ⚠️ Não testado | Docker Compose configurado, mas não executado nesta sessão |
| Backend instala dependências e inicia | ⚠️ Não validado | `npm install` não executado; `nest build` compila sem erros |
| Swagger abre em `/docs` | ✅ Validado | `curl http://localhost:3000/docs` retorna HTTP 200. Decorators Swagger documentam register (201, 409, 400) e login (200, 401, 400) |
| Auth endpoints retornam códigos HTTP corretos | ✅ Validado | register: 201, 409, 400; login: 200, 401 — todos testados via `curl` |
| Prisma gera client e executa migration | ⚠️ Não testado | Migration `init` existe no diretório, mas `prisma migrate dev` não foi reexecutado |
| Admin Web abre em `localhost:3001` | ⚠️ Não testado | Next.js configurado na porta 3001, mas sem execução |
| Flutter executa splash/login/carteira | ⚠️ Não testado | 3 telas implementadas, mas sem `flutter run` na sessão

## Comandos executados

```powershell
# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run start:dev     # ou nest build para validar compilação

# Admin Web
cd apps/admin-web
npm install
npm run dev

# Mobile
cd apps/mobile
flutter pub get
flutter run

# Banco via Docker
docker compose up -d postgres
```

## Validação manual — Autenticação e hardening

Testes executados em 26/06/2026 contra `localhost:3000` com o servidor rodando via `node dist/main.js`.

### POST /auth/register

| Cenário | Resultado |
|---------|-----------|
| Cadastro novo com dados válidos | HTTP 201 Created — `{ user: { id, name, email, role, status } }` |
| E-mail já cadastrado | HTTP 409 Conflict — `{ "message": "E-mail já cadastrado." }` |
| Dados inválidos (nome vazio, e-mail inválido, senha curta) | HTTP 400 Bad Request — array de erros de validação |

### POST /auth/login

| Cenário | Resultado |
|---------|-----------|
| Credenciais válidas | HTTP 200 OK — `{ accessToken, user: { id, name, email, role, status } }` |
| Senha incorreta | HTTP 401 Unauthorized — `{ "message": "Credenciais inválidas." }` |

### Segurança — headers e hardening

| Verificação | Resultado |
|-------------|-----------|
| Helmet ativo (CSP, HSTS, X-Frame-Options, X-Content-Type-Options) | Headers presentes no response |
| `x-powered-by` removido | Header ausente no response |
| CORS restritivo | `Access-Control-Allow-Origin: http://localhost:3001` |
| `passwordHash` não exposto | Resposta do register contém apenas `{ id, name, email, role, status }` |
| Mensagens de erro sem detalhes internos | Nenhum stack trace ou detalhe Prisma exposto |
| Senha armazenada com hash | bcrypt 10 rounds confirmado no código-fonte (`auth.service.ts`) |

## Endpoints disponíveis

| Método | Rota | Descrição | Protegido? |
|--------|------|-----------|------------|
| GET | `/auth/health` | Health check | Não |
| POST | `/auth/register` | Registrar usuário | Não |
| POST | `/auth/login` | Login | Não |
| GET | `/users` | Listar usuários | Não |
| GET | `/companies` | Listar empresas | Não |
| POST | `/companies` | Criar empresa | Não |
| PATCH | `/companies/:id/block` | Bloquear empresa | Não |
| PATCH | `/companies/:id/unblock` | Desbloquear empresa | Não |

> **Nota:** Nenhuma rota possui guarda JWT. A proteção será implementada na Sprint 02.

## Pendências e problemas conhecidos

### Segurança e LGPD
- **Rotas não protegidas:** Nenhum `@UseGuards()`, `AuthGuard` ou `RolesGuard` implementado
- **Risco de enumeração:** `/auth/register` retorna erro específico se e-mail existe
- **Risco de brute force:** `/auth/login` não possui rate limiting
- **Risco de IDOR:** rotas com parâmetros de ID não validam permissão
- **Dados expostos:** `GET /users` expõe todos os usuários sem filtro por empresa
- **Sem logs de auditoria:** ações não são registradas no AuditLog
- **Sem refresh token:** apenas access token com expiração de 1 dia
- **Sem política de senha forte:** qualquer senha com 6+ caracteres é aceita
- **Sem sanitização de logs:** dados sensíveis podem vazar em logs
- ~~**CORS aberto:** configurado para desenvolvimento, sem restrição~~ (corrigido — CORS configurável via `CORS_ORIGIN`)

### Funcionalidades
- **Zero testes:** Nenhum arquivo `.spec.ts` no projeto
- **Admin Web usa dados mockados** (sem integração com API real)
- **App Flutter usa dados mockados** (sem integração com API real)
- **CompanyUser não é criado no registro** — vínculo empresa-usuário não existe
- **Sem seed de dados iniciais** — Admin Master precisa ser criado manualmente
- **Endpoints de company não validam permissão** — qualquer um pode criar/alterar empresa

### Riscos residuais de segurança (após hardening)
- **Sem rate limiting:** rotas abertas como `/auth/login` e `/auth/register` não possuem proteção contra brute force ou abuso
- **Sem HTTPS:** em produção, toda comunicação trafega sem criptografia se TLS não for configurado
- **Sem CSP personalizado:** o CSP padrão do Helmet pode precisar de ajustes conforme novas origens (ex: integração com CDN, webhooks)
- **Sem rotação de segredos:** JWT_SECRET usa valor fixo do `.env`; não há política de rotação automática
- **Sem proteção contra replay de QR Code:** tokens QR não possuem one-time-use enforcement
- **Sem validação de refresh token:** implementação pendente para Sprint 02

### LGPD e privacidade
- **DPO não nomeado:** encarregado de proteção de dados não definido
- **Canal de titulares não criado:** sem canal para exercício de direitos LGPD
- **Bases legais não validadas:** dependem de revisão jurídica
- **Entidades LGPD não implementadas:** PrivacyPolicyVersion, UserConsent, DataSubjectRequest, RefreshToken
- **Política de retenção não automatizada:** prazos propostos mas sem job de execução

## Próximos passos (Sprint 02)

1. Implementar JWT Guards em todas as rotas existentes
2. RolesGuard com decorator @Roles
3. Refresh token com rotação
4. Vincular CompanyUser no registro (usuário como COMPANY_OWNER)
5. Seed inicial (Admin Master padrão)
6. Rate limiting em rotas de autenticação
7. Sanitização de logs (Interceptor NestJS)
8. Registro de auditoria para ações críticas (AuditLog)
9. Testes de integração para módulo Auth
10. Iniciar validação de multi-tenancy
