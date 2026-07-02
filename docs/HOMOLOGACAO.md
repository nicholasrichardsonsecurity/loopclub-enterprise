# Homologação – Ambiente de Staging

## Visão geral do ambiente
- **Sistema operacional:** Debian 12 (Bookworm) 64‑bit
- **Recursos:** 8 vCPUs, ~8 GB RAM, ~97 GB de disco
- **Rede:** IP interno `10.255.255.43`, IP público (ex.: `190.89.151.9` – usado apenas como exemplo)
- **Acesso:** usuário SSH com chave pública autorizada

## Infraestrutura de containers
- **Docker Engine** e **Docker Compose** instalados a partir dos repositórios oficiais.
- **PostgreSQL** rodando em container `loopclub_postgres` (imagem `postgres:16-alpine`).
  - Dados persistidos em volume `loopclub_pgdata`.
  - **Porta 5432 não está exposta** ao host – acesso interno apenas.
- **API NestJS** em container `loopclub_api` (imagem construída a partir de `backend/Dockerfile`).
  - Porta interna `3000` mapeada para o host em `3100` (ex.: `190.89.151.9:3100`).
  - Health‑check via `GET /auth/health`.
- **Caddy** rodando como *systemd* service, configurado para o domínio `api‑homolog.giganetpetelecom.com.br`.
  - Reverse proxy para `10.255.255.43:3100`.
  - Emissão automática de certificado **Let’s Encrypt**.
  - Redirecionamento de HTTP → HTTPS.

## URLs de acesso
- **Swagger:** `https://api-homolog.giganetpetelecom.com.br/docs/`
- **Health‑check:** `https://api-homolog.giganetpetelecom.com.br/auth/health`
  - Resposta esperada: `{"status":"ok","service":"auth"}`

## Fluxo de atualização
1. **Atualizar código** no repositório Git (via Deploy Key configurada).
2. **Build da imagem** `loopclub_api` usando `docker compose build api`.
3. **Executar migrações**:
   ```bash
   docker run --rm -e DATABASE_URL="$DATABASE_URL" loopclub_api npx prisma migrate deploy
   ```
4. **Recriar containers**:
   ```bash
   docker compose up -d --build
   ```
5. **Verificar** containers e logs:
   ```bash
   docker compose ps
   docker compose logs -f api
   ```
6. **Testar** endpoint health e Swagger.

## Backup & restauração do PostgreSQL
- **Backup** (executado a partir do host):
  ```bash
  docker exec loopclub_postgres pg_dump -U $POSTGRES_USER -Fc $POSTGRES_DB > /backup/loopclub_$(date +%F).dump
  ```
- **Restaurar**:
  ```bash
  cat /backup/loopclub_YYYY-MM-DD.dump | docker exec -i loopclub_postgres pg_restore -U $POSTGRES_USER -d $POSTGRES_DB
  ```

## Rollback
```bash
docker compose down
# Opcional: usar tag anterior da imagem ou reverter commit no Git
docker compose up -d --build
```

## Acesso administrativo inicial
- **Criar usuário `company_owner`** através da API (endpoint protegido) ou diretamente via seed em ambiente de desenvolvimento – **não** usar seed em homologação.
- **Tokens JWT** e **refresh** devem ser gerados com segredos definidos em `backend/.env.example` (valores fictícios). Nunca usar valores reais em produção.

## Cuidados de segurança
- **Nenhum segredo real** está versionado (`.env.example` contém apenas placeholders).
- **PostgreSQL** não expõe porta externa.
- **Caddy** expõe somente portas 80/443.
- **Tokens** são gerados a partir de segredos aleatórios (`openssl rand -hex 32`).
- **RBAC_SEED_PASSWORD** está presente apenas para desenvolvimento/testes e **não** é utilizado em homologação.

---

*Este documento descreve o ambiente de homologação atualmente instalado. Ajuste os placeholders (`<IP>`, `<domínio>`, `<segredos>`) conforme necessário ao reproduzir o ambiente em outro servidor.*