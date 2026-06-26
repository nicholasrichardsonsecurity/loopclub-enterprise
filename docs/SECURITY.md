# Segurança

Este documento descreve as práticas de segurança atuais e planejadas do LoopClub Enterprise.

## Status atual

> A segurança completa ainda está em desenvolvimento. Este documento registra o que está implementado e o que precisa ser implementado.

## Implementado

- **Hash de senhas:** bcrypt com 10 rounds
- **JWT:** tokens gerados com segredo configurável via `.env`
- **Validação de entrada:** DTOs com `class-validator` garantem tipos e formatos
- **Whitelist de dados:** `ValidationPipe` com `whitelist: true` rejeita campos não esperados
- **CORS:** habilitado para desenvolvimento

## Em desenvolvimento / planejado

- [ ] Guardas JWT nas rotas protegidas (AuthGuard, RolesGuard)
- [ ] RBAC completo com decorators de perfil
- [ ] Refresh token com rota de renovação
- [ ] Rate limiting nas rotas de autenticação
- [ ] Sanitização de logs (não expor senhas, tokens)
- [ ] Validação de multi-tenancy (garantir companyId correto)
- [ ] HTTPS em produção
- [ ] Headers de segurança (Helmet)
- [ ] Validação de token QR Code com expiração
- [ ] Auditoria de ações sensíveis (AuditLog)

## Boas práticas

### Variáveis de ambiente

- Nunca versionar `.env` ou arquivos com credenciais reais
- `.env.example` contém apenas valores fictícios para desenvolvimento
- Em produção, usar chaves JWT de 64+ caracteres aleatórios
- Rotacionar segredos periodicamente

### Banco de dados

- Usuário do banco com privilégios mínimos necessários
- Conexão via string com senha em variável de ambiente
- Em produção, usar SSL na conexão PostgreSQL

### Código

- Nunca hardcodar senhas, tokens ou chaves de API
- Nunca expor dados sensíveis em respostas de API (selecionar campos com `select`)
- Usar `ValidationPipe` com `whitelist` para prevenir poluição de parâmetros
- Validar permissões em toda operação que cruze empresas (multi-tenancy)

## Relatório de vulnerabilidades

Para reportar vulnerabilidades de segurança, entre em contato com a equipe de desenvolvimento. Não abra issues públicas para vulnerabilidades.
