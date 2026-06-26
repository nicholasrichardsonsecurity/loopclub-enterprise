# Deploy

> **Aviso:** O deploy ainda não foi configurado. Este documento descreve o plano e os requisitos para deploy futuro.

## Plano de deploy

### Backend (NestJS)

**Opções consideradas:**

- Fly.io — deploy simplificado para apps Node.js
- Railway — deploy com PostgreSQL integrado
- VPS própria (DigitalOcean, Hetzner) — controle total
- AWS ECS / Fargate — para escala futura

**Requisitos:**

- Node.js 18+ runtime
- PostgreSQL 16 gerenciado
- Variáveis de ambiente configuradas
- Build: `npm run build` → executa `dist/main.js`

### Frontend Admin (Next.js)

**Opções consideradas:**

- Vercel — integração nativa com Next.js
- Cloudflare Pages — alternativa serverless

### Mobile (Flutter)

- Google Play Store (Android)
- Apple App Store (iOS)

## Variáveis de ambiente (produção)

```env
# Banco de dados
DATABASE_URL="postgresql://usuario:senha@host:5432/loopclub_db?schema=public"

# JWT
JWT_SECRET="<chave-aleatoria-segura-64-caracteres>"
JWT_REFRESH_SECRET="<outra-chave-aleatoria-64-caracteres>"

# App
APP_PORT=3000
NODE_ENV=production

# QR Code
QR_TOKEN_SECRET="<chave-para-assinar-qr>"
QR_TOKEN_EXPIRES_IN=30
```

## CI/CD (planejado)

- GitHub Actions para testes automatizados
- Lint e build em todo PR
- Deploy automático em merge na `main`

## Checklist pré-deploy

- [ ] Variáveis de ambiente configuradas no provedor
- [ ] Migrations executadas no banco de produção
- [ ] Build de produção testado localmente
- [ ] CORS configurado para domínios permitidos
- [ ] JWT_SECRET forte e único
- [ ] Logs configurados (não em modo debug)
- [ ] Health check endpoint funcional
- [ ] Backup do banco configurado
