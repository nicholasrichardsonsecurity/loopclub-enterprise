# Modelo de Ameaças — LoopClub Enterprise

**Mapeamento de ameaças, riscos e controles.**

> **Aviso:** Este modelo reflete o estado atual do desenvolvimento. Novas ameaças devem ser adicionadas conforme novas funcionalidades são implementadas.

## Legenda

| Campo | Descrição |
|-------|-----------|
| **Ativo** | Recurso ou dado afetado |
| **Ameaça** | O que pode acontecer |
| **Impacto** | Consequência da ameaça concretizada |
| **Probabilidade** | Baixa / Média / Alta |
| **Severidade** | Baixa / Média / Alta / Crítica |
| **Mitigação atual** | Controle já implementado |
| **Mitigação pendente** | Controle necessário |

---

## Tabela de ameaças

### T01 — Acesso entre empresas

| Campo | Valor |
|-------|-------|
| **Ativo** | Dados de empresas (clientes, transações, programas) |
| **Ameaça** | Usuário de uma empresa acessa dados de outra empresa |
| **Impacto** | Vazamento generalizado de dados, violação de isolamento multi-tenant |
| **Probabilidade** | Média |
| **Severidade** | Crítica |
| **Mitigação atual** | Nenhuma — não há guardas de tenant isolation |
| **Mitigação pendente** | Toda consulta deve filtrar por companyId extraído do token JWT; testes de tenant isolation |

### T02 — Enumeração de usuários

| Campo | Valor |
|-------|-------|
| **Ativo** | Base de usuários |
| **Ameaça** | Através de mensagens de erro diferentes para e-mail existente vs. inexistente, atacante descobre quais e-mails estão cadastrados |
| **Impacto** | Vazamento de informações, ataques direcionados |
| **Probabilidade** | Alta |
| **Severidade** | Média |
| **Mitigação atual** | Nenhuma — `/auth/register` retorna `BadRequestException` se e-mail existe, permitindo enumeração |
| **Mitigação pendente** | Mensagem de erro genérica independente de o e-mail existir; rate limiting em registro e login |

### T03 — Vazamento de tokens JWT

| Campo | Valor |
|-------|-------|
| **Ativo** | Token JWT |
| **Ameaça** | Token é interceptado (HTTP sem HTTPS, log, XSS) e usado para acessar a API como o titular |
| **Impacto** | Acesso não autorizado à conta do usuário |
| **Probabilidade** | Média |
| **Severidade** | Alta |
| **Mitigação atual** | Token expira em 1 dia |
| **Mitigação pendente** | HTTPS obrigatório; refresh token com rotação; revogação de token; não logar tokens |

### T04 — Replay de QR Code

| Campo | Valor |
|-------|-------|
| **Ativo** | QR Code token |
| **Ameaça** | QR Code é copiado/fotografado e reutilizado para se passar pelo cliente |
| **Impacto** | Cliente tem pontos roubados ou creditados indevidamente |
| **Probabilidade** | Média |
| **Severidade** | Alta |
| **Mitigação atual** | Nenhuma — módulo não implementado |
| **Mitigação pendente** | Token de uso único (one-time), expiração curta (30s), validação de QR já usado |

### T05 — Brute force

| Campo | Valor |
|-------|-------|
| **Ativo** | Rota de login |
| **Ameaça** | Atacante tenta múltiplas senhas para um e-mail conhecido |
| **Impacto** | Acesso não autorizado à conta |
| **Probabilidade** | Alta |
| **Severidade** | Alta |
| **Mitigação atual** | Nenhuma — `/auth/login` não tem rate limit |
| **Mitigação pendente** | Rate limiting (ex.: 5 tentativas por minuto por IP); bloqueio temporário após falhas; captcha se necessário |

### T06 — Abuso de endpoints abertos

| Campo | Valor |
|-------|-------|
| **Ativo** | Todos os endpoints |
| **Ameaça** | Endpoints sem autenticação sofrem scraping, DoS parcial, ou coleta massiva |
| **Impacto** | Exposição de dados, sobrecarga do servidor |
| **Probabilidade** | Alta |
| **Severidade** | Alta |
| **Mitigação atual** | Nenhuma — nenhum endpoint possui guarda JWT |
| **Mitigação pendente** | JWT Guards em todas as rotas; rate limiting global |

### T07 — IDOR (Insecure Direct Object Reference)

| Campo | Valor |
|-------|-------|
| **Ativo** | Rotas com parâmetros de ID (companies/:id, users) |
| **Ameaça** | Usuário altera o ID na URL para acessar recurso de outro usuário/empresa |
| **Impacto** | Acesso não autorizado a dados |
| **Probabilidade** | Alta |
| **Severidade** | Alta |
| **Mitigação atual** | Nenhuma — `/companies/:id/block` não verifica se o usuário tem permissão |
| **Mitigação pendente** | Validar propriedade ou permissão antes de qualquer operação por ID; RBAC funcional |

### T08 — SQL Injection

| Campo | Valor |
|-------|-------|
| **Ativo** | Banco de dados |
| **Ameaça** | Injeção de SQL malicioso através de parâmetros não sanitizados |
| **Impacto** | Acesso total ao banco, extração de dados |
| **Probabilidade** | Baixa |
| **Severidade** | Crítica |
| **Mitigação atual** | Prisma ORM usa query parameterized por padrão |
| **Mitigação pendente** | Revisão de queries raw se forem adicionadas |

### T09 — Mass Assignment

| Campo | Valor |
|-------|-------|
| **Ativo** | Criação/atualização de registros |
| **Ameaça** | Atacante envia campos extras no corpo da requisição para alterar dados não permitidos |
| **Impacto** | Alteração indevida de role, status, etc. |
| **Probabilidade** | Baixa |
| **Severidade** | Alta |
| **Mitigação atual** | `ValidationPipe` global com `whitelist: true` e `forbidNonWhitelisted: true` rejeita campos administrativos (role, status, companyId, permissions, phone) com HTTP 400 — validado manualmente. DTOs definem campos permitidos. AuthService força `role: "client"` no registro. |
| **Mitigação pendente** | Revisar demais DTOs (companies, users) para mesmo padrão de whitelist |

### T10 — Exposição de dados sensíveis em logs

| Campo | Valor |
|-------|-------|
| **Ativo** | Logs do servidor |
| **Ameaça** | Logs registram senhas, tokens, ou dados pessoais que podem ser acessados por terceiros |
| **Impacto** | Vazamento de credenciais e dados pessoais |
| **Probabilidade** | Média |
| **Severidade** | Alta |
| **Mitigação atual** | Nenhuma — não há política de sanitização de logs |
| **Mitigação pendente** | Interceptor NestJS para sanitizar logs; nunca logar body de requisições de login/register; revisão de logs existentes |

### T11 — Upload malicioso (futuro)

| Campo | Valor |
|-------|-------|
| **Ativo** | Upload de arquivos (logo, imagem) |
| **Ameaça** | Upload de arquivo malicioso (PHP, script, executável) |
| **Impacto** | Execução remota de código, comprometimento do servidor |
| **Probabilidade** | Média |
| **Severidade** | Crítica |
| **Mitigação atual** | Nenhuma — funcionalidade não implementada |
| **Mitigação pendente** | Validar tipo MIME, extensão, tamanho; armazenar em storage externo; não executar arquivos |

### T12 — Sequestro de sessão

| Campo | Valor |
|-------|-------|
| **Ativo** | Sessão do usuário |
| **Ameaça** | Token JWT é roubado e usado antes de expirar (1 dia) |
| **Impacto** | Acesso total à conta do usuário por até 1 dia |
| **Probabilidade** | Média |
| **Severidade** | Alta |
| **Mitigação atual** | Expiração de 1 dia |
| **Mitigação pendente** | Refresh token com rotação; revogação manual de sessões; HTTPS; armazenamento seguro no cliente |

### T13 — Escalada de privilégio

| Campo | Valor |
|-------|-------|
| **Ativo** | Role do usuário |
| **Ameaça** | Usuário altera própria role ou acessa recursos de perfil superior |
| **Impacto** | Acesso administrativo não autorizado |
| **Probabilidade** | Baixa |
| **Severidade** | Crítica |
| **Mitigação atual** | `RegisterDto` não aceita `role` no body. AuthService força `role: "client"` no registro público. `ValidationPipe` com `forbidNonWhitelisted: true` rejeita role, status, companyId enviados. RolesGuard com matriz de permissões. |
| **Mitigação pendente** | Garantir que endpoint de atualização de perfil (futuro) não permita auto-elevação de role |

### T14 — Vazamento em backups

| Campo | Valor |
|-------|-------|
| **Ativo** | Backups do banco |
| **Ameaça** | Backup armazenado sem criptografia é acessado por terceiros |
| **Impacto** | Vazamento completo da base de dados |
| **Probabilidade** | Baixa |
| **Severidade** | Crítica |
| **Mitigação atual** | Nenhuma — backup não configurado |
| **Mitigação pendente** | Criptografia de backups; storage com acesso restrito; política de rotação |

### T15 — Segredo versionado

| Campo | Valor |
|-------|-------|
| **Ativo** | Repositório Git |
| **Ameaça** | .env ou segredo é commitado no repositório |
| **Impacto** | Credenciais expostas a todos com acesso ao repositório |
| **Probabilidade** | Baixa |
| **Severidade** | Crítica |
| **Mitigação atual** | `.gitignore` bloqueia `.env` e `.env.*`; `.env.example` com valores fictícios e avisos de segurança. `seed.ts` não contém senha fixa — lê de `RBAC_SEED_PASSWORD` (variável de ambiente). Seed bloqueado por padrão — permitido apenas com `NODE_ENV=development` ou `test`. |
| **Mitigação pendente** | Scanner de segredos no CI (ex.: truffleHog, git-secrets) |

### T16 — Erro humano

| Campo | Valor |
|-------|-------|
| **Ativo** | Todos |
| **Ameaça** | Operador comete erro (exclui tabela errada, expõe dado, concede permissão excessiva) |
| **Impacto** | Perda de dados, exposição, indisponibilidade |
| **Probabilidade** | Média |
| **Severidade** | Alta |
| **Mitigação atual** | Seed bloqueado por padrão — permitido exclusivamente com `NODE_ENV=development` ou `test`. `seed.ts` sem senha fixa no código. Upsert não altera dados existentes. |
| **Mitigação pendente** | Princípio do menor privilégio; approvals em operações sensíveis; backup testado; rollback de migrações |

---

## Matriz de severidade

| Severidade | Quantidade |
|------------|-----------|
| Crítica | 5 (T01, T08, T11, T13, T15) |
| Alta | 7 (T03, T04, T05, T06, T07, T10, T12, T16) |
| Média | 2 (T02, T14) |
| Baixa | 2 (T09, T13 — probabilidade reduzida após mitigação) |

**Total de ameaças identificadas:** 16

## Controles existentes vs. pendentes

| Tipo | Quantidade |
|------|-----------|
| Controles existentes | Parciais — Prisma ORM (anti SQL injection), ValidationPipe whitelist + forbidNonWhitelisted, bcrypt, .gitignore, expiração de JWT, JwtAuthGuard, RolesGuard, RegisterDto sem role |
| Controles pendentes | 14 ameaças com lacunas de controle |
