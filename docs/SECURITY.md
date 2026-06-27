# Segurança

Este documento descreve as práticas de segurança atuais e planejadas do LoopClub Enterprise, incluindo controles técnicos e organizacionais para proteção de dados pessoais.

> **Aviso:** A segurança completa ainda está em desenvolvimento. Consulte [THREAT-MODEL.md](THREAT-MODEL.md) para o mapeamento detalhado de riscos e [LGPD.md](LGPD.md) para os requisitos de proteção de dados.

## Implementado

### Autenticação e senhas
- **Hash de senhas:** bcrypt com 10 rounds — `validado manualmente` (confirmado no código-fonte `auth.service.ts`)
- **JWT:** tokens gerados com segredo configurável via `.env`, expiração de 1 dia
- **JwtStrategy:** valida assinatura, expiração e payload (sub, role) — `implementado e validado`
- **JwtAuthGuard:** protege rotas de users e companies; decorator `@Public()` permite exceções — `implementado e validado`
- **Validação de entrada:** DTOs com `class-validator` garantem tipos e formatos
- **Whitelist de dados:** `ValidationPipe` com `whitelist: true, forbidNonWhitelisted: true` — campos administrativos (role, status, companyId, permissions, phone) são rejeitados com HTTP 400 — `validado manualmente`
- **`passwordHash` não exposto:** `select` limita retorno a 5 campos (id, name, email, role, status) — `validado manualmente` (resposta do register não contém hash)

### Headers de segurança
- **Helmet:** configurado globalmente via `app.use(helmet())` — CSP, HSTS, X-Frame-Options, X-Content-Type-Options, X-XSS-Protection ativos — `validado manualmente` (headers confirmados via `curl -I`)
- **x-powered-by:** removido via `app.getHttpAdapter().getInstance().disable('x-powered-by')` — `validado manualmente` (header ausente via `curl -I`)
- **CORS:** restrito por ambiente — lê `CORS_ORIGIN` do `.env` (lista de origens separadas por vírgula), fallback para `http://localhost:3001` — `validado manualmente` (header `Access-Control-Allow-Origin` confirmado via `curl`)

### Tratamento de erros
- **Mensagens sem detalhes internos:** erros de autenticação não expõem stack trace, detalhes do Prisma, senha, hash ou token — `validado manualmente` (respostas 400, 401, 409 testadas via `curl`)

### Infraestrutura de desenvolvimento
- **Segredos:** `.env` bloqueado pelo `.gitignore`; `.env.example` com valores fictícios

### Banco e ORM
- **Prevenção SQL injection:** Prisma ORM usa queries parametrizadas
- **Conexão:** string com senha em variável de ambiente (não hardcoded)

## Obrigatórios (pendentes de implementação)

### Controle de acesso
- [x] Guardas JWT em users e companies (JwtAuthGuard) — `implementado e validado`
- [x] RolesGuard com decorator @Roles (RBAC) — `implementado e validado`. Perfis: admin, company_owner, employee, client. Princípio do menor privilégio aplicado: cada endpoint exige o perfil mínimo necessário.
- [ ] Validação de tenant isolation (companyId em todas as consultas)
- [ ] Proteção contra IDOR em rotas com parâmetros de ID

### Sessão e tokens
- [ ] Refresh token com rotação e revogação
- [ ] Rate limiting em rotas de autenticação (especialmente `/auth/login`)
- [ ] Rate limiting global para abuso de endpoints abertos
- [ ] HTTPS obrigatório em produção

### Headers e proteção web
- [x] Helmet para headers de segurança (CSP, HSTS, X-Frame-Options, X-Content-Type-Options) — `implementado e validado`
- [x] CORS configurável por ambiente via `CORS_ORIGIN` (lista de origens) — `implementado e validado`
- [x] `x-powered-by` removido para evitar fingerprinting — `implementado e validado`

### Logs e monitoramento
- [ ] Interceptor NestJS para sanitização automática de logs
- [ ] Auditoria de ações sensíveis (implementar registro em AuditLog)
- **Observação:** senhas e tokens não devem aparecer em logs — validado manualmente (nenhuma rota de autenticação loga body da requisição). Tokens JWT no header `Authorization` não são registrados pelo NestJS em logs padrão.

### Controle de acesso — pendências
- ~~**RBAC (RolesGuard):** pendente — qualquer token JWT válido acessa todas as rotas protegidas~~ (corrigido — RolesGuard implementado com matriz de permissões)
- **Isolamento multiempresa:** pendente — consultas não filtram por `companyId`
- **Refresh token e revogação de sessão:** pendentes — token JWT tem expiração fixa de 1 dia sem revogação

### Pagamentos e webhooks (planejado)
- [ ] Webhooks assinados com verificação de assinatura HMAC ou equivalente
- [ ] Idempotência em requisições financeiras (evitar duplicidade de cobrança)
- [ ] Tratamento seguro de chargeback e estorno com registro de auditoria
- [ ] Falha de pagamento: notificação segura sem expor dados do meio de pagamento

### Push notifications (planejado)
- [ ] Opt-out e consentimento explícito para push promocional (LGPD art. 7º)
- [ ] Auditoria de disparos (quem autorizou, quando, para quem, qual conteúdo)
- [ ] Preferências de notificação armazenadas por usuário
- [ ] Conteúdo de push sem dados sensíveis (não incluir tokens, valores ou dados pessoais no corpo)

### NFS-e (planejado)
- [ ] Provedor fiscal substituível sem exposição de credenciais no core
- [ ] Chaves de API do provedor armazenadas em variável de ambiente ou secrets manager

### QR Code e tokens
- [ ] Validação de token QR Code com expiração curta (30s)
- [ ] One-time use prevention (impedir replay)

### Dados e armazenamento
- [ ] Mascaramento de dados em interfaces e logs
- [ ] Política de backups com criptografia e teste de restore
- [ ] Anonimização ou exclusão real de dados (não apenas soft delete)
- [ ] Exclusão segura (overwrite ou quarantine + exclusão física)

### Gestão de dependências
- [ ] Auditoria periódica de dependências (`npm audit`)
- [ ] Revisão de permissão de pacotes

## Boas práticas

### Variáveis de ambiente

- Nunca versionar `.env` ou arquivos com credenciais reais
- `.env.example` contém apenas valores fictícios para desenvolvimento
- Em produção, usar chaves JWT de 64+ caracteres aleatórios
- Rotacionar segredos periodicamente
- Em produção, usar serviço de gerenciamento de segredos (se disponível)

### Banco de dados

- Usuário do banco com privilégios mínimos necessários
- Conexão via string com senha em variável de ambiente
- Em produção, usar SSL na conexão PostgreSQL
- Backups criptografados com acesso restrito

### Código

- Nunca hardcodar senhas, tokens ou chaves de API
- Nunca expor dados sensíveis em respostas de API (usar `select` para campos específicos)
- Usar `ValidationPipe` com `whitelist` para prevenir poluição de parâmetros
- Validar permissões em toda operação que cruze empresas (multi-tenancy)
- Nunca logar body de requisições de login ou registro
- Remover dados sensíveis de logs antes de persistir

## Documentos relacionados

- [LGPD.md](LGPD.md) — Adequação à Lei Geral de Proteção de Dados
- [PRIVACY.md](PRIVACY.md) — Princípios de privacidade do produto
- [DATA-MAP.md](DATA-MAP.md) — Mapa completo de dados e riscos
- [THREAT-MODEL.md](THREAT-MODEL.md) — Modelo de ameaças detalhado
- [RETENTION-POLICY.md](RETENTION-POLICY.md) — Política de retenção e descarte
- [INCIDENT-RESPONSE.md](INCIDENT-RESPONSE.md) — Plano de resposta a incidentes
- [DATA-SUBJECT-RIGHTS.md](DATA-SUBJECT-RIGHTS.md) — Fluxo de direitos dos titulares

## Relatório de vulnerabilidades

Para reportar vulnerabilidades de segurança, entre em contato com a equipe de desenvolvimento. Não abra issues públicas para vulnerabilidades.
