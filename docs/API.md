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

### Matriz de permissões (RBAC)

| Rota | admin | company_owner | employee | client |
|------|-------|---------------|----------|--------|
| `GET /users` | ✅ | ❌ | ❌ | ❌ |
| `GET /companies` | ✅ | ✅ | ❌ | ❌ |
| `POST /companies` | ✅ | ❌ | ❌ | ❌ |
| `PATCH /companies/:id/block` | ✅ | ❌ | ❌ | ❌ |
| `PATCH /companies/:id/unblock` | ✅ | ❌ | ❌ | ❌ |

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
  "phone": "11999999999",
  "password": "senha123",
  "role": "client"
}
```

**Roles válidas:** `admin`, `company_owner`, `employee`, `client`

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
| GET | `/companies` | Listar todas as empresas | JWT Bearer Token |
| POST | `/companies` | Criar nova empresa | JWT Bearer Token |
| PATCH | `/companies/:id/block` | Bloquear empresa | JWT Bearer Token |
| PATCH | `/companies/:id/unblock` | Desbloquear empresa | JWT Bearer Token |

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

## Observações de segurança

- **Validação:** DTOs validam tipos, campos obrigatórios e formato de e-mail
- **Erros:** Respostas seguem padrão NestJS com status code e mensagem
- **CORS:** Habilitado para desenvolvimento local
- **Senhas:** Hash bcrypt com 10 rounds
- **Rotas públicas:** `GET /auth/health`, `POST /auth/register`, `POST /auth/login` — não exigem autenticação — `validado manualmente`
- **Rotas protegidas (JWT Bearer):** `GET /users`, `GET /companies`, `POST /companies`, `PATCH /companies/:id/block`, `PATCH /companies/:id/unblock` — exigem token JWT válido no header `Authorization: Bearer <token>` — `validado manualmente`
- **RolesGuard (RBAC) implementado** — cada rota protegida exige perfil específico. Ver matriz de permissões acima. Perfil sem permissão recebe HTTP 403
- **Risco de enumeração:** `/auth/register` retorna erro específico se e-mail já existe, permitindo enumeração de usuários
- **Risco de brute force:** `/auth/login` não possui rate limiting
- **Risco de IDOR:** rotas com parâmetros de ID não validam permissão do usuário
- **Dados expostos:** `GET /users` expõe todos os usuários sem filtro por empresa ou perfil
- **Sem logs de auditoria:** ações nos endpoints não são registradas no AuditLog
- **Consulte:** [SECURITY.md](SECURITY.md), [THREAT-MODEL.md](THREAT-MODEL.md) e [DATA-MAP.md](DATA-MAP.md) para mapeamento completo de riscos
