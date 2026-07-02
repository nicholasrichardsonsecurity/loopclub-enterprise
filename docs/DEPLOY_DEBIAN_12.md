# Deploy em Debian 12 (Bookworm)

## 1. Requisitos do servidor
- **Sistema**: Debian 12 (Bookworm) 64‑bit
- **CPU**: 8 vCPUs
- **RAM**: ~8 GB
- **Disco**: ~97 GB livre
- **Rede**: IP interno (ex.: `10.255.255.43`) e IP público (ex.: `190.89.151.9`)
- **Acesso**: usuário SSH com chave pública autorizada
- **Pacotes essenciais**: `git`, `curl`, `wget`, `ca-certificates`, `build‑essential`

## 2. Instalar Git
```bash
apt-get update && apt-get install -y git
```
Verifique: `git --version`

## 3. Instalar Docker (versão oficial)
```bash
# Instala dependências
apt-get install -y apt-transport-https ca-certificates gnupg lsb-release

# Adiciona repositório Docker
curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list

apt-get update && apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```
Teste: `docker run --rm hello-world`

## 4. Configurar Deploy Key no GitHub
1. Gere a chave SSH no servidor:
   ```bash
   ssh-keygen -t ed25519 -C "deploy-key" -f ~/.ssh/deploy_key -N ""
   ```
2. Copie a **public key** (`~/.ssh/deploy_key.pub`).
3. No GitHub, acesse **Settings → Deploy keys** do repositório e adicione a chave pública com permissão de *Read‑only*.
4. Teste a conexão:
   ```bash
   ssh -i ~/.ssh/deploy_key -T git@github.com
   ```

## 5. Clonar o repositório
```bash
mkdir -p /opt/loopclub && cd /opt/loopclub
git clone git@github.com:nicholasrichardsonsecurity/loopclub-enterprise.git .
```

## 6. Criar o arquivo `.env`
```bash
cp backend/.env.example backend/.env
```
Edite `backend/.env` com os valores reais (não commit‑ar).

## 7. Gerar segredos seguros com OpenSSL
```bash
# Exemplo: 32‑bytes em hexadecimal (64 chars)
openssl rand -hex 32
```
Use o output para `POSTGRES_PASSWORD`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CUSTOMER_PII_HMAC_SECRET`, etc.

## 8. Montar a variável `DATABASE_URL`
Formato:
```
postgresql://<usuario>:<senha>@<host>:5432/<banco>?schema=public
```
**Atenção**: se a senha contém caracteres especiais (`@`, `:`, `/`, `%`), URL‑encode‑a ou prefira a senha em hexadecimal.

## 9. Recomendações de senha
- Use senhas **hexadecimais** (ex.: `a1b2c3d4e5f6...`) para evitar problemas de *URL‑encoding*.
- Nunca exponha senhas reais em repositório ou logs.

## 10. Criar `Dockerfile`
Copie o conteúdo de `backend/Dockerfile` (já versionado) para o diretório `backend/`.

## 11. Criar `.dockerignore`
Copie o conteúdo de `backend/.dockerignore` para ignorar artefatos desnecessários.

## 12. Configurar `docker‑compose.yml`
Edite o arquivo raiz `docker-compose.yml` removendo a exposição da porta `5432` (não publicar). Exemplo:
```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: loopclub_postgres
    restart: always
    environment:
      POSTGRES_USER: loopclub
      POSTGRES_PASSWORD: <senha_hex>
      POSTGRES_DB: loopclub_db
    volumes:
      - loopclub_pgdata:/var/lib/postgresql/data
    # portas removidas → não expõe 5432 ao host

volumes:
  loopclub_pgdata:
```

## 13. Build da API
```bash
cd backend
docker build -t loopclub_api .
```

## 14. Executar migrations
```bash
docker run --rm \
  -e DATABASE_URL="$DATABASE_URL" \
  loopclub_api npx prisma migrate deploy
```

## 15. Subir containers
```bash
cd /opt/loopclub
docker compose up -d --build
```

## 16. Verificar containers
```bash
docker compose ps
```

## 17. Consultar logs
```bash
docker compose logs -f api
```

## 18. Testar health endpoint
```bash
curl -s https://api-homolog.giganetpetelecom.com.br/auth/health | jq
```
Resposta esperada: `{"status":"ok","service":"auth"}`

## 19. Instalar Caddy
```bash
apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg

echo "deb [signed-by=/usr/share/keyrings/caddy-stable-archive-keyring.gpg] https://apt.fury.io/caddy/ stable main" > /etc/apt/sources.list.d/caddy-stable.list

apt-get update && apt-get install -y caddy
```

## 20. Configurar DNS
Apontar o domínio `api-homolog.giganetpetelecom.com.br` (registro A) para o **IP público** `190.89.151.9`.

## 21. Abrir portas 80 e 443 no firewall
```bash
ufw allow 80/tcp
ufw allow 443/tcp
ufw reload
```

## 22. Criar `Caddyfile`
```caddyfile
api-homolog.giganetpetelecom.com.br {
    reverse_proxy 10.255.255.43:3100
}
```
Salve em `/etc/caddy/Caddyfile` e reinicie:
```bash
systemctl restart caddy
```

## 23. Validar Caddy
```bash
caddy validate --config /etc/caddy/Caddyfile
```
Se tudo estiver correto, o certificado **Let’s Encrypt** será emitido automaticamente.

## 24. Testar HTTPS
```bash
curl -k https://api-homolog.giganetpetelecom.com.br/auth/health
```
Deve retornar o mesmo JSON do passo 18.

## 25. Redirecionamento HTTP → HTTPS
O Caddy já inclui o redirecionamento por padrão quando o site usa TLS.

## 26. Atualizações futuras
- Atualize a imagem `loopclub_api` com `docker compose build api && docker compose up -d api`.
- Revise `docker‑compose.yml` para incluir novos serviços.

## 27. Rollback
```bash
docker compose down
# Reverter a tag da imagem ou usar a imagem anterior
docker compose up -d --build
```

## 28. Backup do PostgreSQL
```bash
docker exec loopclub_postgres pg_dump -U loopclub -Fc loopclub_db > /backup/loopclub_$(date +%F).dump
```
Armazene o dump em volume externo ou storage seguro.

## 29. Restaurar backup
```bash
docker exec -i loopclub_postgres pg_restore -U loopclub -d loopclub_db < /backup/loopclub_YYYY-MM-DD.dump
```

## 30. Diagnóstico de erros comuns
| Problema | Possível causa | Solução |
|---|---|---|
| `P1013` na `DATABASE_URL` | Senha com caracteres especiais | URL‑encode ou use senha hexadecimal |
| API reiniciando | Log de erro no container `api` | `docker compose logs api` e ajustar variáveis |
| Postgres exposto `0.0.0.0:5432` | `ports:` configurado no compose | Remova a seção `ports` |
| Swagger tela branca | CSP do Helmet bloqueando recursos | Ajustar CSP por ambiente (dev) |
| DNS NXDOMAIN temporário | Propagação de DNS ainda em andamento | Aguardar TTL ou validar com `dig` |
| Caddy sem HTTPS | DNS ainda não resolvendo ou firewall bloqueando | Verificar DNS, abrir portas 80/443 |
| `curl /auth/health` devolve JSON simples | Comportamento esperado – endpoint health apenas confirma disponibilidade |
| Usar URLs diretamente no shell como comando | Confundir URL com comando; use `curl` ou `wget` |
| Comandos `Test-NetConnection` | São comandos PowerShell (Windows) – não disponíveis no Debian |
| Seed de desenvolvimento em produção | Seed só executa em `NODE_ENV=development`/`test`; nunca habilite em produção |

---

**Observação**: nunca versionar arquivos `.env` com valores reais. Sempre manter segredos fora do repositório.
