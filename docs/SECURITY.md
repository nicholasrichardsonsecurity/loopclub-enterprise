# Segurança

Este documento descreve as práticas de segurança atuais e planejadas do LoopClub Enterprise, incluindo controles técnicos e organizacionais para proteção de dados pessoais.

> **Aviso:** A segurança completa ainda está em desenvolvimento. Consulte [THREAT-MODEL.md](THREAT-MODEL.md) para o mapeamento detalhado de riscos e [LGPD.md](LGPD.md) para os requisitos de proteção de dados.

## Implementado

### Autenticação e senhas
- **Hash de senhas:** bcrypt com 10 rounds
- **JWT:** tokens gerados com segredo configurável via `.env`, expiração de 1 dia
- **Validação de entrada:** DTOs com `class-validator` garantem tipos e formatos
- **Whitelist de dados:** `ValidationPipe` com `whitelist: true` rejeita campos não esperados

### Infraestrutura de desenvolvimento
- **CORS:** habilitado para desenvolvimento
- **Segredos:** `.env` bloqueado pelo `.gitignore`; `.env.example` com valores fictícios
- **Senhas:** hash bcrypt com 10 rounds

### Banco e ORM
- **Prevenção SQL injection:** Prisma ORM usa queries parametrizadas
- **Conexão:** string com senha em variável de ambiente (não hardcoded)

## Obrigatórios (pendentes de implementação)

### Controle de acesso
- [ ] Guardas JWT em todas as rotas (AuthGuard)
- [ ] RBAC completo com decorators de perfil (RolesGuard)
- [ ] Validação de tenant isolation (companyId em todas as consultas)
- [ ] Princípio do menor privilégio em todas as permissões
- [ ] Proteção contra IDOR em rotas com parâmetros de ID

### Sessão e tokens
- [ ] Refresh token com rotação e revogação
- [ ] Rate limiting em rotas de autenticação (especialmente `/auth/login`)
- [ ] Rate limiting global para abuso de endpoints abertos
- [ ] HTTPS obrigatório em produção

### Logs e monitoramento
- [ ] Sanitização de logs (não expor senhas, tokens, dados pessoais)
- [ ] Interceptor NestJS para sanitização automática
- [ ] Auditoria de ações sensíveis (implementar registro em AuditLog)

### Headers e proteção web
- [ ] Helmet para headers de segurança (CSP, X-Frame-Options, etc.)
- [ ] CORS restritivo em produção (apenas origens autorizadas)

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
