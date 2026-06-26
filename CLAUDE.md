# CLAUDE.md — LoopClub Enterprise

## Perfil do projeto

- Nome: LoopClub Enterprise / LoopClub SaaS v1.0
- Stack: NestJS + TypeScript, Prisma ORM, PostgreSQL, Next.js, Flutter, Swagger
- Monorepo com apps/, backend/, docs/
- Multi-tenancy por companyId
- Perfis: ADMIN, COMPANY_OWNER, EMPLOYEE, CLIENT

## Regras obrigatórias

### Antes de alterar o projeto

1. Leia a documentação relevante em `docs/` antes de fazer alterações.
2. Verifique se a funcionalidade já existe ou está planejada.
3. Nunca declare funcionalidades como prontas sem validar no código.
4. **Verifique impacto em LGPD, privacidade, segurança, retenção, auditoria, segregação multiempresa e exposição de dados antes de implementar qualquer funcionalidade.**

### Após alterar o projeto

1. Atualize a documentação correspondente.
2. Atualize [STATUS.md](docs/STATUS.md) se necessário.
3. Atualize [CHANGELOG.md](CHANGELOG.md) se necessário.
4. Atualize o documento da sprint atual em [docs/sprints/](docs/sprints/).
5. **Se a alteração envolver dados pessoais, atualize [DATA-MAP.md](docs/DATA-MAP.md) e [LGPD.md](docs/LGPD.md).**

### Segurança

1. Nunca leia, edite ou versionie arquivos `.env`.
2. Use apenas `.env.example` com valores fictícios para documentar variáveis.
3. Nunca exponha senhas, segredos ou valores reais em documentação.
4. Nunca hardcode credenciais no código.

### Qualidade

1. Execute `npx prisma generate` e `npx prisma migrate dev` após alterar schema.
2. Verifique se o código compila com `npm run build` ou `nest build`.
3. Execute testes quando disponíveis.
4. Revise `git status` antes de finalizar qualquer tarefa.

## Checklist obrigatório ao finalizar tarefas

- [ ] Código compilando sem erros
- [ ] Testes executados (se existentes)
- [ ] API.md atualizada (se houver mudanças em endpoints)
- [ ] DATABASE.md atualizada (se houver mudanças no schema Prisma)
- [ ] STATUS.md atualizado
- [ ] CHANGELOG.md atualizado
- [ ] Sprint atual atualizada (docs/sprints/)
- [ ] Nenhum segredo incluído
- [ ] git status revisado

### Checklist LGPD e segurança (obrigatório em toda tarefa)

- [ ] **Coleta mínima de dados:** o novo campo/feature é realmente necessário?
- [ ] **Finalidade documentada:** a finalidade do tratamento está registrada em DATA-MAP.md?
- [ ] **Base legal avaliada:** qual base legal da LGPD justifica este tratamento?
- [ ] **Acesso restrito:** a funcionalidade respeita RBAC e tenant isolation?
- [ ] **Tenant isolation verificado:** dados de uma empresa não vazam para outra?
- [ ] **Logs sem dados sensíveis:** nenhum dado pessoal ou token será registrado em logs
- [ ] **Segredos fora do Git:** nenhuma credencial hardcoded ou .env versionado
- [ ] **Retenção avaliada:** o prazo de retenção do novo dado está definido?
- [ ] **Exclusão ou anonimização avaliada:** como o dado será removido quando não for mais necessário?
- [ ] **Risco de incidente avaliado:** a funcionalidade introduz nova ameaça? Atualizar THREAT-MODEL.md
- [ ] **Documentação atualizada:** LGPD.md, PRIVACY.md e DATA-MAP.md refletem a mudança

## Comandos úteis

```powershell
# Backend
cd backend
npm run start:dev           # Iniciar servidor com hot-reload
npx prisma generate         # Regenerar Prisma Client
npx prisma migrate dev      # Executar migrações
npx prisma studio           # Abrir visualizador do banco
npm run build               # Compilar para produção

# Admin Web
cd apps/admin-web
npm run dev                 # Iniciar em localhost:3001

# Mobile
cd apps/mobile
flutter pub get             # Baixar dependências
flutter run                 # Executar no emulador

# Banco
docker compose up -d postgres  # Iniciar PostgreSQL
```

## Documentação

| Documento | Quando atualizar |
|-----------|------------------|
| [README.md](README.md) | Estrutura, stack, requisitos |
| [PRODUCT.md](docs/PRODUCT.md) | Visão do produto, personas |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Decisões arquiteturais |
| [DATABASE.md](docs/DATABASE.md) | Mudanças no schema Prisma |
| [API.md](docs/API.md) | Endpoints novos ou alterados |
| [INSTALLATION.md](docs/INSTALLATION.md) | Mudanças na instalação |
| [DEVELOPMENT.md](docs/DEVELOPMENT.md) | Fluxo de desenvolvimento |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Deploy e CI/CD |
| [SECURITY.md](docs/SECURITY.md) | Medidas de segurança |
| [LGPD.md](docs/LGPD.md) | Adequação à LGPD |
| [PRIVACY.md](docs/PRIVACY.md) | Princípios de privacidade do produto |
| [DATA-MAP.md](docs/DATA-MAP.md) | Mapa de dados e riscos |
| [RETENTION-POLICY.md](docs/RETENTION-POLICY.md) | Política de retenção e descarte |
| [INCIDENT-RESPONSE.md](docs/INCIDENT-RESPONSE.md) | Plano de resposta a incidentes |
| [THREAT-MODEL.md](docs/THREAT-MODEL.md) | Modelo de ameaças |
| [DATA-SUBJECT-RIGHTS.md](docs/DATA-SUBJECT-RIGHTS.md) | Direitos dos titulares LGPD |
| [ROADMAP.md](docs/ROADMAP.md) | Planejamento de sprints |
| [STATUS.md](docs/STATUS.md) | Estado de cada funcionalidade |
| [DECISIONS.md](docs/DECISIONS.md) | Novas decisões arquiteturais (ADR) |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Regras de contribuição |
| [CHANGELOG.md](CHANGELOG.md) | Novas versões e mudanças |
