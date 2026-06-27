# API LoopClub Enterprise

**Base URL:** `http://localhost:3000`
**Documentação Swagger:** `http://localhost:3000/docs`

## Autenticação

A API utiliza JWT Bearer Token. Endpoints protegidos exigem o header:

```
Authorization: Bearer <token>
```

### Comportamentos de autenticação

| Cenário | Resposta |
|---------|----------|
| Rota protegida sem token | HTTP 401 Unauthorized — `{ "message": "Token inválido ou ausente." }` |
| Rota protegida com token inválido | HTTP 401 Unauthorized |
| Rota protegida com token expirado | ⚠️ Pendente de validação |
| Rota protegida com token válido mas perfil sem permissão | HTTP 403 Forbidden — `{ "message": "Acesso negado." }` |
| Rota protegida com token válido e perfil autorizado | Acesso permitido conforme a rota |
| Rota pública sem token | Acesso permitido |

### Matriz de permissões (RBAC) — validado manualmente

| Rota | admin | company_owner | employee | client | sem token |
|------|-------|---------------|----------|--------|-----------|
| `GET /users` | ✅ 200 | ❌ 403 | ❌ 403 | ❌ 403 | ❌ 401 |
| `GET /companies` | ✅ 200 | ✅ 200 | ❌ 403 | ❌ 403 | ❌ 401 |
| `POST /companies` | ✅ 201 | ❌ 403 | ❌ 403 | ❌ 403 | ❌ 401 |
| `PATCH /companies/:id/block` | ✅ 200 | ❌ 403 | ❌ 403 | ❌ 403 | ❌ 401 |
| `PATCH /companies/:id/unblock` | ✅ 200 | ❌ 403 | ❌ 403 | ❌ 403 | ❌ 401 |

**Comportamentos confirmados:**

| Cenário | Resposta |
|---------|----------|
| Rota protegida sem token | HTTP 401 Unauthorized — `{ "message": "Token inválido ou ausente." }` |
| Rota protegida com token inválido | HTTP 401 Unauthorized |
| Rota protegida com token válido mas perfil sem permissão | HTTP 403 Forbidden — `{ "message": "Acesso negado." }` |
| Rota protegida com token válido e perfil autorizado | HTTP 200 OK ou 201 Created conforme a rota |
| Rota pública sem token | Acesso permitido |

**Princípio do menor privilégio aplicado:**

- `GET /users` — exclusivo para admin. Nenhum outro perfil pode listar todos os usuários do sistema.
- `GET /companies` — admin e company_owner podem visualizar empresas. Employee e client não.
- `POST /companies`, `PATCH /companies/:id/block`, `PATCH /companies/:id/unblock` — exclusivos para admin. Ações críticas de criação e bloqueio de empresas são restritas ao administrador global.

### Rotas públicas

- `GET /auth/health`
- `POST /auth/register`
- `POST /auth/login`

## Endpoints implementados

### Auth — `/auth`

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|-------------|
| GET | `/auth/health` | Health check do serviço | Não |
| POST | `/auth/register` | Registrar novo usuário | Não |
| POST | `/auth/login` | Login e obtenção de token | Não |

#### POST /auth/register

```json
{
  "name": "Nome do usuário",
  "email": "email@exemplo.com",
  "password": "senha123"
}
```

**Campos aceitos:** apenas `name`, `email` e `password`.  
**Segurança:** `role`, `phone`, `status`, `companyId` e `permissions` são rejeitados com HTTP 400. Todo cadastro público cria perfil `client`.

**Resposta (201 - sucesso):**
```json
{
  "user": {
    "id": "uuid",
    "name": "Nome do usuário",
    "email": "email@exemplo.com",
    "role": "client",
    "status": "active"
  }
}
```

**Resposta (409 - e-mail duplicado):**
```json
{
  "message": "E-mail já cadastrado.",
  "error": "Conflict",
  "statusCode": 409
}
```

**Resposta (400 - dados inválidos):**
```json
{
  "message": ["name should not be empty", "email must be an email"],
  "error": "Bad Request",
  "statusCode": 400
}
```

#### POST /auth/login

```json
{
  "email": "email@exemplo.com",
  "password": "senha123"
}
```

**Resposta (200 - sucesso):**
```json
{
  "accessToken": "jwt_token_aqui",
  "user": {
    "id": "uuid",
    "name": "Nome do usuário",
    "email": "email@exemplo.com",
    "role": "client",
    "status": "active"
  }
}
```

**Resposta (401 - credenciais inválidas):**
```json
{
  "message": "Credenciais inválidas.",
  "error": "Unauthorized",
  "statusCode": 401
}
```

**Resposta (400 - dados inválidos):**
```json
{
  "message": ["email must be an email", "password must be longer than or equal to 6 characters"],
  "error": "Bad Request",
  "statusCode": 400
}
```

### Users — `/users`

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|-------------|
| GET | `/users` | Listar todos os usuários | JWT Bearer Token |

**Resposta (200):**
```json
[
  {
    "id": "uuid",
    "name": "Nome",
    "email": "email@exemplo.com",
    "phone": "11999999999",
    "role": "client",
    "status": "active",
    "createdAt": "2026-06-26T00:00:00.000Z"
  }
]
```

### Companies — `/companies`

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|-------------|
| GET | `/companies` | Listar empresas (filtradas por tenant) | JWT Bearer Token |
| POST | `/companies` | Criar nova empresa | JWT Bearer Token |
| PATCH | `/companies/:id/block` | Bloquear empresa | JWT Bearer Token |
| PATCH | `/companies/:id/unblock` | Desbloquear empresa | JWT Bearer Token |

**Comportamento do GET /companies por perfil (com isolamento multiempresa):**

| Perfil | HTTP | Resposta |
|--------|:----:|----------|
| admin | 200 | Todas as empresas |
| company_owner com vínculo ativo | 200 | Apenas a empresa vinculada |
| company_owner sem vínculo | 403 | `"Nenhum vínculo empresarial encontrado."` |
| company_owner com múltiplos vínculos | 403 | `"Não foi possível determinar o contexto empresarial deste usuário."` |
| employee | 403 | `"Acesso negado."` (RolesGuard) |
| client | 403 | `"Acesso negado."` (RolesGuard) |
| sem token | 401 | `"Token inválido ou ausente."` (JwtAuthGuard) |
| token inválido | 401 | `"Token inválido."` (JwtStrategy) |

> **Nota:** O companyId usado na consulta é derivado exclusivamente do contexto autenticado (via CompanyUser + TenantService). Parâmetros, body ou query não alteram o tenant.

#### POST /companies

```json
{
  "name": "Açaí Modelo",
  "category": "acai",
  "document": "00.000.000/0001-00",
  "phone": "11999999999",
  "email": "contato@acaimodelo.com",
  "ownerName": "João Silva"
}
```

**Resposta (201):** Objeto da empresa criada.

#### PATCH /companies/:id/block

**Resposta (200):** Empresa com status `blocked`.

#### PATCH /companies/:id/unblock

**Resposta (200):** Empresa com status `active`.

## Endpoints planejados (próximas sprints)

| Módulo | Endpoints |
|--------|-----------|
| Auth | Refresh token, logout, revogação de sessão |
| Companies | Update, delete, busca por ID |
| Plans | CRUD completo de planos |
| Subscriptions | CRUD de assinaturas |
| Fidelity | CRUD de programas, milestones, progresso |
| Transactions | Lançamento de pontos, resgate, reset, extrato |
| QrCode | Gerar token, validar token |
| Dashboard | Métricas por empresa, métricas globais |
| Audit | Consulta de logs de auditoria |

## Padrões brasileiros — formato dos dados na API (planejado)

O LoopClub Enterprise atende exclusivamente o mercado brasileiro. Os padrões abaixo descrevem o **formato planejado** para dados brasileiros na API. Nenhuma dessas validações ou formatos está implementada no código atual — são requisitos aprovados que devem ser implementados progressivamente.

### Estado atual
- A API retorna datas em ISO 8601 UTC (comportamento padrão do NestJS/JavaScript — sem conversão de timezone)
- A API não possui campos de CPF, CNPJ, endereço ou CEP atualmente
- O campo `phone` no schema aceita string livre, sem validação de formato brasileiro
- Valores monetários em `Plan.price` e `Subscription.price` usam Decimal no banco (já implementado), mas a API retorna como `number` sem formatação pt-BR

### Estado planejado

#### Datas e horários
- **Requisição:** aceitar datas em ISO 8601 (`2026-06-27T14:30:00Z` ou `2026-06-27T11:30:00-03:00`)
- **Resposta:** retornar datas em ISO 8601 UTC (`2026-06-27T14:30:00.000Z`)
- **Interface:** conversão para America/Recife e formato DD/MM/AAAA é responsabilidade do frontend
- **Nota:** o comportamento atual (ISO 8601 UTC) já é compatível — a diferença é que a conversão de timezone na exibição não está implementada

#### Valores monetários
- Aceitar e retornar valores como `number` (ex.: `29.90`), correspondentes ao tipo Decimal do banco — comportamento já padrão
- Frontend responsável pela formatação pt-BR (`R$ 29,90`)
- Nunca retornar valores como string formatada para evitar erro de precisão

#### Documentos (CPF e CNPJ) — planejado, não implementado
- CPF e CNPJ aceitos apenas como números (11 e 14 dígitos, sem máscara)
- Validação de dígitos verificadores no backend
- Resposta da API retorna documentos sem máscara (números apenas)
- Formatação visual é responsabilidade do frontend
- **Atualmente:** não há campos de CPF ou CNPJ em nenhum endpoint da API

#### Telefones — planejado, não implementado
- Aceitar telefones como números com DDD (10 ou 11 dígitos)
- E.164 para integrações externas
- **Atualmente:** o campo `phone` aceita string livre. O DTO de criação de empresa (`CreateCompanyDto`) tem `phone` como `@IsOptional() @IsString()` — sem validação de formato brasileiro

#### CEP — planejado, não implementado
- Aceitar CEP como 8 dígitos numéricos
- **Atualmente:** não há campo de CEP em nenhum endpoint

#### Endereço — planejado, não implementado
- Modelo brasileiro: logradouro, número, complemento, bairro, município, UF (2 caracteres), CEP
- **Atualmente:** não há campos de endereço em nenhum endpoint ou schema

## Observações de segurança

- **Validação:** DTOs validam tipos, campos obrigatórios e formato de e-mail. `ValidationPipe` global com `whitelist: true, forbidNonWhitelisted: true` — campos não declarados no DTO são rejeitados com HTTP 400
- **Erros:** Respostas seguem padrão NestJS com status code e mensagem
- **CORS:** Habilitado para desenvolvimento local
- **Senhas:** Hash bcrypt com 10 rounds
- **Rotas públicas:** `GET /auth/health`, `POST /auth/register`, `POST /auth/login` — não exigem autenticação — `validado manualmente`
- **Rotas protegidas (JWT Bearer):** `GET /users`, `GET /companies`, `POST /companies`, `PATCH /companies/:id/block`, `PATCH /companies/:id/unblock` — exigem token JWT válido no header `Authorization: Bearer <token>` — `validado manualmente`
- **RolesGuard (RBAC) implementado** — cada rota protegida exige perfil específico. Ver matriz de permissões acima. Perfil sem permissão recebe HTTP 403
- **Risco de enumeração:** `/auth/register` retorna erro específico se e-mail já existe, permitindo enumeração de usuários
- **Risco de brute force:** `/auth/login` não possui rate limiting
- **Risco de IDOR:** rotas com parâmetros de ID não validam permissão do usuário. Mitigação parcial: `GET /companies` usa companyId do contexto autenticado. GET /companies/:id não existe.
- **Dados expostos:** `GET /users` expõe todos os usuários sem filtro por empresa ou perfil
- **Isolamento multiempresa:** implementado no GET /companies — companyId derivado exclusivamente do TenantService. Demais rotas (POST, PATCH) são exclusivas admin sem filtro de tenant.
- **Sem logs de auditoria:** ações nos endpoints não são registradas no AuditLog
- **Consulte:** [SECURITY.md](SECURITY.md), [THREAT-MODEL.md](THREAT-MODEL.md) e [DATA-MAP.md](DATA-MAP.md) para mapeamento completo de riscos
