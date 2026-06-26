# API LoopClub Enterprise

**Base URL:** `http://localhost:3000`
**Documentação Swagger:** `http://localhost:3000/docs`

## Autenticação

A API utiliza JWT Bearer Token. Endpoints protegidos exigem o header:

```
Authorization: Bearer <token>
```

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

**Resposta (201):**
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

#### POST /auth/login

```json
{
  "email": "email@exemplo.com",
  "password": "senha123"
}
```

**Resposta (201):**
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

### Users — `/users`

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|-------------|
| GET | `/users` | Listar todos os usuários | Não |

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
| GET | `/companies` | Listar todas as empresas | Não |
| POST | `/companies` | Criar nova empresa | Não |
| PATCH | `/companies/:id/block` | Bloquear empresa | Não |
| PATCH | `/companies/:id/unblock` | Desbloquear empresa | Não |

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
| Auth | Guardas JWT, refresh token, logout |
| Companies | Update, delete, busca por ID |
| Plans | CRUD completo de planos |
| Subscriptions | CRUD de assinaturas |
| Fidelity | CRUD de programas, milestones, progresso |
| Transactions | Lançamento de pontos, resgate, reset, extrato |
| QrCode | Gerar token, validar token |
| Dashboard | Métricas por empresa, métricas globais |
| Audit | Consulta de logs de auditoria |

## Observações

- **Validação:** DTOs validam tipos, campos obrigatórios e formato de e-mail
- **Erros:** Respostas seguem padrão NestJS com status code e mensagem
- **CORS:** Habilitado para desenvolvimento local
- **Senhas:** Hash bcrypt com 10 rounds
