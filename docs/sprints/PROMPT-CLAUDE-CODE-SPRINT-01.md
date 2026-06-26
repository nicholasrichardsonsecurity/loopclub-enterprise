# Prompt para Claude Code — Sprint 01

Você está trabalhando no projeto LoopClub Enterprise SaaS v1.0.

Objetivo: revisar e completar a Sprint 01, garantindo que o monorepo rode localmente.

Stack:
- Backend: NestJS + Prisma + PostgreSQL
- Admin Web: Next.js + TypeScript
- Mobile: Flutter
- Banco: PostgreSQL via Docker Compose

Tarefas:

1. No backend:
   - Rodar npm install.
   - Copiar .env.example para .env.
   - Rodar npx prisma generate.
   - Rodar npx prisma migrate dev --name init.
   - Corrigir qualquer erro de TypeScript.
   - Garantir que Swagger funcione em /docs.
   - Testar endpoints /auth/register, /auth/login e /companies.

2. No admin-web:
   - Rodar npm install.
   - Corrigir qualquer erro.
   - Garantir que rode em localhost:3001.

3. No mobile:
   - Rodar flutter pub get.
   - Corrigir qualquer erro.
   - Garantir que splash, login e home abram no emulador.

4. Não implementar fidelidade, QR dinâmico ou pagamentos nesta sprint.

5. Ao terminar, gerar um relatório com:
   - O que foi corrigido.
   - Comandos usados.
   - Erros encontrados.
   - Próximos passos para Sprint 02.
