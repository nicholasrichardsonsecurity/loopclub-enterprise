# Guia de Instalação

Este guia cobre a instalação completa do ambiente de desenvolvimento local do LoopClub Enterprise.

## Pré-requisitos

- **Node.js** >= 18 LTS
- **npm** >= 9
- **PostgreSQL** 16 (instalação local ou Docker)
- **Git**
- **Flutter SDK** >= 3.4.0 (apenas para desenvolvimento mobile)
- **Docker Desktop** (opcional, para banco via container)

## 1. Clone o repositório

```powershell
git clone https://github.com/seu-usuario/loopclub-enterprise.git
cd loopclub_enterprise_sprint01
```

## 2. Configure o PostgreSQL

### Opção A: Via Docker (recomendado)

```powershell
docker compose up -d postgres
```

Isso cria o container `loopclub_postgres` com banco `loopclub_db`, usuário `loopclub` e senha `loopclub123`.

### Opção B: Instalação local

1. Instale o PostgreSQL 16 pelo site oficial ou winget:
   ```powershell
   winget install PostgreSQL.PostgreSQL.16
   ```

2. Crie o banco de dados:
   ```powershell
   psql -U postgres -c "CREATE DATABASE loopclub_db;"
   ```

## 3. Configure o backend

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Edite o arquivo `.env` com suas credenciais PostgreSQL:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/loopclub_db?schema=public"
JWT_SECRET="uma_chave_segura_aqui"
JWT_REFRESH_SECRET="outra_chave_segura"
APP_PORT=3000
QR_TOKEN_SECRET="qr_secret_trocar_em_producao"
QR_TOKEN_EXPIRES_IN=30
```

### Gere o Prisma Client e execute migrações

```powershell
npx prisma generate
npx prisma migrate dev
```

### Inicie o servidor

```powershell
npm run start:dev
```

O backend estará disponível em http://localhost:3000 e o Swagger em http://localhost:3000/docs.

## 4. Configure o admin web

```powershell
cd apps/admin-web
npm install
npm run dev
```

O admin estará disponível em http://localhost:3001.

## 5. Configure o mobile (Flutter)

```powershell
cd apps/mobile
flutter pub get
flutter run
```

## Comandos úteis

| Comando | Descrição |
|---------|-----------|
| `npm run start:dev` | Iniciar backend com hot-reload |
| `npx prisma studio` | Abrir Prisma Studio (http://localhost:5555) |
| `npx prisma migrate dev` | Executar migrações pendentes |
| `npx prisma generate` | Regenerar Prisma Client |
| `npm run build` | Compilar backend para produção |

## Resolução de problemas

### Porta 3000 já em uso
```powershell
netstat -ano | findstr :3000
# Altere APP_PORT no .env ou mate o processo
```

### Erro de conexão com PostgreSQL
- Verifique se o serviço PostgreSQL está rodando: `Get-Service postgresql*`
- Verifique se as credenciais no `.env` estão corretas
- Teste a conexão: `psql -U seu_usuario -d loopclub_db`

### Prisma Client desatualizado
```powershell
npx prisma generate
```

### Migração pendente
```powershell
npx prisma migrate dev
```
