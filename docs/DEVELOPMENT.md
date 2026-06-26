# Desenvolvimento

Este documento descreve o fluxo de desenvolvimento do LoopClub Enterprise.

## Fluxo de trabalho

1. Escolha uma tarefa no backlog ou sprint atual
2. Crie uma branch a partir de `main`
3. Implemente a funcionalidade
4. Atualize a documentação (veja política em [CONTRIBUTING.md](../CONTRIBUTING.md))
5. Execute testes locais
6. Abra um Pull Request

## Branches

```
main           # Branch estável
feature/*      # Novas funcionalidades
fix/*          # Correções de bugs
docs/*         # Documentação
refactor/*     # Refatoração
```

## Backend

### Estrutura de módulos

```
backend/src/modules/
├── auth/           # Autenticação
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   └── dto/
├── companies/      # Empresas
├── users/          # Usuários
└── ...             # Novos módulos seguem o mesmo padrão
```

### Criar um novo módulo

```powershell
cd backend
nest generate module modules/nome
nest generate controller modules/nome
nest generate service modules/nome
```

### Boas práticas (backend)

- Controllers validam entrada, delegam lógica para services
- Services contêm regras de negócio e acesso ao banco
- DTOs usam `class-validator` para validação
- Swagger decorators nos controllers para documentação automática
- Consultas sempre filtram por `companyId` (multi-tenancy)

## Mobile (Flutter)

Arquitetura feature-first em desenvolvimento.

### Estrutura atual

```
apps/mobile/lib/
└── main.dart    # Splash, Login, Carteira (esqueleto visual)
```

## Admin Web (Next.js)

### Estrutura atual

```
apps/admin-web/app/
├── layout.tsx
├── page.tsx       # Dashboard (dados mockados)
└── styles.css
```

## Prisma

### Comandos frequentes

```powershell
# Gerar Prisma Client após alterar schema
npx prisma generate

# Criar migration
npx prisma migrate dev --name descricao

# Abrir Prisma Studio (visualizar dados)
npx prisma studio

# Resetar banco (cuidado: apaga dados)
npx prisma migrate reset
```

## Docker

O Docker Compose atual oferece apenas PostgreSQL. O Docker para os serviços será planejado futuramente.

```powershell
docker compose up -d postgres    # Iniciar banco
docker compose down              # Parar tudo
```

## Variáveis de ambiente

Mantenha o arquivo `.env.example` atualizado com as novas variáveis. Valores reais nunca devem ser versionados.

## Checklist de desenvolvimento

Antes de finalizar qualquer tarefa:

- [ ] Código compila sem erros
- [ ] Testes executados (se existentes)
- [ ] API.md atualizada (se houver mudanças em endpoints)
- [ ] DATABASE.md atualizada (se houver mudanças no schema)
- [ ] STATUS.md atualizado
- [ ] CHANGELOG.md atualizado
- [ ] Sprint atual atualizada (docs/sprints/)
- [ ] Nenhum segredo incluído
- [ ] `git status` revisado
