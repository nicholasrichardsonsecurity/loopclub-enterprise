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
- Consultas DEVEM sempre filtrar por `companyId` (multi-tenancy) — regra obrigatória de isolamento entre empresas. Implementado no GET /companies via TenantGuard + CompanyUser. Demais endpoints pendentes.

### Orientações para novas rotas empresariais

Ao criar uma rota que acessa dados de uma empresa específica:

1. **Autenticação:** adicionar `@UseGuards(JwtAuthGuard)` no controller ou no método.
2. **RBAC:** adicionar `@Roles()` com os perfis permitidos.
3. **Contexto empresarial:** adicionar `@RequireCompany()` no método. O TenantGuard resolverá o companyId do usuário autenticado e injetará em `request.user.companyId`.
4. **Filtro no service:** usar exclusivamente `request.user.companyId` para filtrar consultas. Exemplo:
   ```typescript
   findAll(user: JwtUser) {
     const where = user.role === UserRole.admin ? {} : { id: user.companyId };
     return this.prisma.company.findMany({ where });
   }
   ```
5. **Nunca aceitar companyId externo:** não confiar em `body.companyId`, `query.companyId` ou `params.companyId` como fonte de tenant. O companyId vem exclusivamente do contexto autenticado e validado pelo TenantService.
6. **Recursos de outro tenant:** retornar HTTP 404 (não 403) para evitar confirmação de existência do recurso.
7. **Testes de isolamento:** ao implementar uma rota empresarial, testar com dois tenants diferentes (ex.: Owner Alpha e Owner Beta) para confirmar que cada um vê apenas seus dados.

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

## Testes

### Comandos de teste

```powershell
# Executar todos os testes unitários (modo determinístico)
npm test

# Executar em modo watch (desenvolvimento local)
npm run test:watch

# Executar com relatório de cobertura
npm run test:cov
```

### Estratégia de testes

- **Testes unitários:** usam mocks do PrismaService. Não acessam PostgreSQL. Executam rapidamente.
- **Testes e2e:** pendentes. Exigirão Supertest, banco PostgreSQL exclusivo e seed dedicado.
- **Cobertura:** relatório gerado em `backend/coverage/`. Este diretório é ignorado pelo `.gitignore` e não deve ser versionado.
- **Configuração:** Jest configurado via `jest.config.cjs` (CommonJS). TypeScript para testes em `tsconfig.spec.json` (separado do tsconfig de produção).
- **Build de produção:** arquivos `.spec.ts` continuam excluídos do build.

### Suítes atuais

| Suíte | Arquivo | Testes | Cobertura |
|-------|---------|:------:|:---------:|
| TenantService | `src/modules/tenant/tenant.service.spec.ts` | 9 | 100% |
| TenantGuard | `src/modules/tenant/tenant.guard.spec.ts` | 5 | 100% |
| CompaniesService | `src/modules/companies/companies.service.spec.ts` | 5 | Parcial (findAll) |

**Total:** 19 testes, 19 aprovados, 0 falhos.

### Compatibilidade

Jest e ts-jest foram validados na versão atual do projeto. Atualizações futuras dessas dependências devem ser testadas antes de adoção.

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

## Padrões brasileiros — regras obrigatórias de desenvolvimento (planejado)

O LoopClub Enterprise atende exclusivamente o mercado brasileiro. As regras abaixo são requisitos aprovados que devem ser observados em **todo código novo**. Nenhuma dessas validações ou formatadores está implementada atualmente — bibliotecas, funções utilitárias e interceptadores mencionados são sugestões para implementação futura, não dependências existentes.

### Datas
- Armazenar em UTC (ISO 8601). `DateTime` do Prisma — já é o comportamento atual.
- Converter para America/Recife na exibição. **Pendente:** nenhuma conversão de timezone está implementada. Sugestão: `date-fns-tz` ou `Intl.DateTimeFormat` com timezone para implementação futura.
- Nunca armazenar DD/MM/AAAA no banco — já é prática válida (nenhuma data é armazenada como string).
- APIs aceitam/retornam ISO 8601 UTC — já é o comportamento atual.

### Valores monetários
- Usar `Decimal` no Prisma — já implementado em `Plan.price` e `Subscription.price`.
- Nunca usar `float` para moeda — prática já seguida.
- Formatação pt-BR exclusivamente no frontend — **pendente** (nenhum frontend aplica formatação `R$` atualmente).
- Sugestão: `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` para implementação futura.

### CPF e CNPJ — planejado, não implementado
- Validar dígitos verificadores no backend. **Pendente:** implementar função reutilizável de validação.
- Armazenar apenas números (11 dígitos CPF, 14 dígitos CNPJ).
- Impedir duplicidade com `@unique` no schema quando couber.
- Não logar documentos completos.
- **Estado atual:** não há campos de CPF ou CNPJ no schema, DTOs ou serviços.

### Telefones — planejado, não implementado
- Armazenar apenas números com DDD (mínimo 10 dígitos).
- Validar no backend: DDD (11-99) e quantidade de dígitos.
- **Estado atual:** `phone` aceita string livre sem validação de formato brasileiro.

### CEP — planejado, não implementado
- Armazenar 8 dígitos numéricos. **Pendente:** validação e campo no schema.
- Preparar integração futura com ViaCEP.

### Endereço — planejado, não implementado
- Modelo obrigatório: logradouro, número, complemento (opcional), bairro, município, UF (2 chars), CEP.
- UF: sigla maiúscula de 2 caracteres (AC a TO).

### Interface — em evolução
- Todos os textos visíveis ao usuário em pt-BR: mensagens de erro, validações, e-mails, SMS, push.
- **Estado atual:** as mensagens de erro da API (ValidationPipe do NestJS) já estão em português. As interfaces admin-web e mobile precisam ser verificadas e ajustadas.
- Nomes de variáveis, logs de sistema e comentários técnicos podem ficar em inglês.

### Validação
- CPF, CNPJ e CEP devem ser validados no backend. **Pendente:** implementar validadores customizados com `class-validator`. A validação no frontend é adicional, nunca substituta.

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
