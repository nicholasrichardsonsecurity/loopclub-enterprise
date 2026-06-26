# Mapa de Dados — LoopClub Enterprise

**Registro das operações de tratamento de dados pessoais.**

> **Aviso:** Este mapa é uma ferramenta de documentação técnica. As bases legais são propostas e dependem de validação jurídica. Prazos de retenção marcados como "proposta" dependem de definição legal ou de negócio.

## Legenda

| Campo | Descrição |
|-------|-----------|
| **Base legal proposta** | Fundamento jurídico preliminar (art. 7º LGPD) |
| **Prazo de retenção** | Período proposto de armazenamento |
| **Controles existentes** | O que já está implementado |
| **Controles pendentes** | O que precisa ser implementado |

## Mapa de dados

### 1. Nome

| Campo | Valor |
|-------|-------|
| **Dado** | Nome completo |
| **Titular** | CLIENT, COMPANY_OWNER, EMPLOYEE, ADMIN |
| **Origem** | Formulário de registro |
| **Finalidade** | Identificação do usuário na plataforma |
| **Base legal proposta** | Execução de contrato (art. 7º, V) |
| **Onde é armazenado** | Tabela `User`, coluna `name` |
| **Quem acessa** | ADMIN (todos), COMPANY_OWNER (seus funcionários), EMPLOYEE (clientes da empresa), CLIENT (próprio) |
| **Prazo de retenção** | Proposta: enquanto a conta estiver ativa + 5 anos após inatividade |
| **Forma de exclusão** | Exclusão direta na tabela ou anonimização com overwrite |
| **Risco** | Exposição acidental em listagens de API |
| **Controles existentes** | Nenhum — rotas sem guarda, qualquer pessoa pode listar usuários |
| **Controles pendentes** | Guardas JWT, RBAC, validação de tenant isolation, limitar campos expostos por perfil |

### 2. Telefone

| Campo | Valor |
|-------|-------|
| **Dado** | Número de telefone |
| **Titular** | CLIENT, COMPANY_OWNER, EMPLOYEE |
| **Origem** | Formulário de registro (campo opcional) |
| **Finalidade** | Contato e identificação alternativa |
| **Base legal proposta** | Execução de contrato (art. 7º, V) |
| **Onde é armazenado** | Tabela `User`, coluna `phone` (único) |
| **Quem acessa** | ADMIN, COMPANY_OWNER (funcionários), EMPLOYEE (clientes) |
| **Prazo de retenção** | Proposta: enquanto a conta estiver ativa + 5 anos |
| **Forma de exclusão** | Atualização para NULL ou exclusão da conta |
| **Risco** | Enumeração via uniqueness constraint |
| **Controles existentes** | Campo opcional (minimização) |
| **Controles pendentes** | Proteção contra enumeração em erros de registro, rate limiting |

### 3. E-mail

| Campo | Valor |
|-------|-------|
| **Dado** | Endereço de e-mail |
| **Titular** | CLIENT, COMPANY_OWNER, EMPLOYEE, ADMIN |
| **Origem** | Formulário de registro |
| **Finalidade** | Identificação única, login, comunicação |
| **Base legal proposta** | Execução de contrato (art. 7º, V) |
| **Onde é armazenado** | Tabela `User`, coluna `email` (único) |
| **Quem acessa** | ADMIN (todos), COMPANY_OWNER (funcionários), EMPLOYEE (clientes) |
| **Prazo de retenção** | Proposta: enquanto a conta estiver ativa + 5 anos |
| **Forma de exclusão** | Exclusão da conta |
| **Risco** | Enumeração, vazamento, uso para spam |
| **Controles existentes** | DTO valida formato de e-mail |
| **Controles pendentes** | Proteção contra enumeração em erros de registro e login, rate limiting |

### 4. PasswordHash

| Campo | Valor |
|-------|-------|
| **Dado** | Hash da senha (bcrypt) |
| **Titular** | CLIENT, COMPANY_OWNER, EMPLOYEE, ADMIN |
| **Origem** | Gerado a partir da senha fornecida no registro |
| **Finalidade** | Autenticação segura |
| **Base legal proposta** | Legítimo interesse (art. 7º, IX) — segurança |
| **Onde é armazenado** | Tabela `User`, coluna `passwordHash` |
| **Quem acessa** | Ninguém — apenas o processo de login compara hashes |
| **Prazo de retenção** | Proposta: enquanto a conta existir |
| **Forma de exclusão** | Exclusão da conta (nunca reverter o hash) |
| **Risco** | Vazamento do banco expõe hashes (mas bcrypt dificulta reversão) |
| **Controles existentes** | Hash bcrypt com 10 rounds |
| **Controles pendentes** | Política de senha forte, rotação periódica |

### 5. Role

| Campo | Valor |
|-------|-------|
| **Dado** | Perfil de acesso (admin, company_owner, employee, client) |
| **Titular** | CLIENT, COMPANY_OWNER, EMPLOYEE, ADMIN |
| **Origem** | Definido no registro |
| **Finalidade** | Controle de acesso baseado em papéis |
| **Base legal proposta** | Execução de contrato (art. 7º, V) |
| **Onde é armazenado** | Tabela `User`, coluna `role` |
| **Quem acessa** | ADMIN (todos), o próprio usuário |
| **Prazo de retenção** | Enquanto a conta existir |
| **Forma de exclusão** | Exclusão da conta |
| **Risco** | Role alterada indevidamente permite escalada de privilégio |
| **Controles existentes** | Nenhum — rota de alteração não existe, mas registro permite escolher qualquer role |
| **Controles pendentes** | Validação de que apenas ADMIN pode definir role ADMIN, RBAC funcional |

### 6. companyId (vínculo empresa)

| Campo | Valor |
|-------|-------|
| **Dado** | Identificador da empresa vinculada |
| **Titular** | COMPANY_OWNER, EMPLOYEE, CLIENT |
| **Origem** | Criação do vínculo CompanyUser |
| **Finalidade** | Isolamento multiempresa, associação do usuário |
| **Base legal proposta** | Execução de contrato (art. 7º, V) |
| **Onde é armazenado** | Tabela `CompanyUser`, colunas `companyId` e `userId` |
| **Quem acessa** | ADMIN, COMPANY_OWNER (sua empresa) |
| **Prazo de retenção** | Proposta: enquanto o vínculo existir + 5 anos |
| **Forma de exclusão** | Exclusão do registro CompanyUser |
| **Risco** | Vazamento de companyId permite associar usuário a empresa indevidamente |
| **Controles existentes** | Nenhum — vínculo nem é criado no registro atual |
| **Controles pendentes** | Criação automática de CompanyUser no registro, validação de tenant isolation |

### 7. Histórico de pontos (LoyaltyProgress)

| Campo | Valor |
|-------|-------|
| **Dado** | Pontos acumulados, ciclos completados, status |
| **Titular** | CLIENT |
| **Origem** | Transações de fidelidade |
| **Finalidade** | Execução do programa de fidelidade |
| **Base legal proposta** | Execução de contrato (art. 7º, V) |
| **Onde é armazenado** | Tabela `LoyaltyProgress` |
| **Quem acessa** | CLIENT (próprio), EMPLOYEE/COMPANY_OWNER (clientes da empresa), ADMIN |
| **Prazo de retenção** | Proposta: enquanto a empresa estiver ativa + 2 anos |
| **Forma de exclusão** | Exclusão ou anonimização com desvinculação do clientId |
| **Risco** | Exposição de histórico de consumo do cliente |
| **Controles existentes** | Nenhum implementado (módulo não foi criado) |
| **Controles pendentes** | Módulo de fidelidade, RBAC, tenant isolation |

### 8. Transações (Transaction)

| Campo | Valor |
|-------|-------|
| **Dado** | Tipo de transação, pontos, data, operador, descrição |
| **Titular** | CLIENT |
| **Origem** | Ações de fidelidade (lançamento, resgate, reset) |
| **Finalidade** | Registro e auditoria do programa de fidelidade |
| **Base legal proposta** | Obrigação legal / Execução de contrato (art. 7º, II e V) |
| **Onde é armazenado** | Tabela `Transaction` |
| **Quem acessa** | CLIENT (próprio), EMPLOYEE/COMPANY_OWNER (empresa), ADMIN |
| **Prazo de retenção** | Proposta: 5 anos após a transação (defesa de direitos) |
| **Forma de exclusão** | Anonimização (manter registro sem dados pessoais) |
| **Risco** | Mapeamento completo do comportamento do cliente |
| **Controles existentes** | Nenhum implementado (módulo não foi criado) |
| **Controles pendentes** | Módulo de transações, RBAC, tenant isolation |

### 9. Logs de auditoria (AuditLog)

| Campo | Valor |
|-------|-------|
| **Dado** | Ação, entidade, ID da entidade, metadata, data |
| **Titular** | COMPANY_OWNER, EMPLOYEE, ADMIN, CLIENT (indiretamente) |
| **Origem** | Ações no sistema (criação, alteração, exclusão) |
| **Finalidade** | Auditoria, segurança, rastreabilidade |
| **Base legal proposta** | Obrigação legal (art. 7º, II) / Legítimo interesse (art. 7º, IX) |
| **Onde é armazenado** | Tabela `AuditLog` |
| **Quem acessa** | ADMIN |
| **Prazo de retenção** | Proposta: 5 anos |
| **Forma de exclusão** | Exclusão programada por job de retenção |
| **Risco** | Metadata pode conter dados sensíveis se não sanitizada |
| **Controles existentes** | Schema criado, mas sem implementação de registro |
| **Controles pendentes** | Implementar registro de auditoria, sanitizar metadata, política de retenção |

### 10. Tokens JWT

| Campo | Valor |
|-------|-------|
| **Dado** | Token JWT contendo sub (userId) e role |
| **Titular** | CLIENT, COMPANY_OWNER, EMPLOYEE, ADMIN |
| **Origem** | Login |
| **Finalidade** | Autenticação de sessão |
| **Base legal proposta** | Legítimo interesse (art. 7º, IX) |
| **Onde é armazenado** | Em memória no cliente (não persistido no backend) |
| **Quem acessa** | O próprio usuário (via header Authorization) |
| **Prazo de retenção** | Até expirar (1 dia configurado) |
| **Forma de exclusão** | Expiração natural ou logout |
| **Risco** | Interceptação do token permite acesso indevido |
| **Controles existentes** | Assinatura com JWT_SECRET, expiração em 1 dia |
| **Controles pendentes** | HTTPS obrigatório, refresh token com rotação, revogação |

### 11. Tokens QR Code (QrToken)

| Campo | Valor |
|-------|-------|
| **Dado** | Hash de token, expiração, status |
| **Titular** | CLIENT |
| **Origem** | Geração de QR Code para identificação |
| **Finalidade** | Identificação do cliente via QR Code dinâmico |
| **Base legal proposta** | Execução de contrato (art. 7º, V) |
| **Onde é armazenado** | Tabela `QrToken` |
| **Quem acessa** | CLIENT (próprio), EMPLOYEE (ao escanear) |
| **Prazo de retenção** | Proposta: token expirado + 30 dias |
| **Forma de exclusão** | Exclusão após período de graça |
| **Risco** | Replay de QR Code, rastreamento de localização |
| **Controles existentes** | Schema criado, expiração prevista no token |
| **Controles pendentes** | Implementação do módulo QR, validação de one-time use |

### 12. Dados de dispositivo (futuro)

| Campo | Valor |
|-------|-------|
| **Dado** | IP, user-agent, modelo do dispositivo |
| **Titular** | CLIENT, COMPANY_OWNER, EMPLOYEE, ADMIN |
| **Origem** | Headers HTTP / SDK mobile (futuro) |
| **Finalidade** | Segurança, análise de fraude, compatibilidade |
| **Base legal proposta** | Legítimo interesse (art. 7º, IX) |
| **Onde é armazenado** | A definir |
| **Quem acessa** | ADMIN |
| **Prazo de retenção** | Proposta: 6 meses |
| **Forma de exclusão** | Exclusão programada |
| **Risco** | Criação de perfil comportamental |
| **Controles existentes** | Nenhum (não implementado) |
| **Controles pendentes** | Definir necessidade antes de coletar, registrar finalidade |

### 13. Dados de auditoria (AuditLog completo)

Ver item 9 — os logs de auditoria registram quem fez o quê e quando, servindo como trilha para compliance e investigação de incidentes.

## Resumo de riscos

| Risco | Nível | Controles existentes | Controles pendentes |
|-------|-------|---------------------|---------------------|
| Enumeração de usuários | Alto | Nenhum | Rate limiting, mensagens genéricas de erro |
| Acesso entre empresas | Alto | Nenhum | RBAC, tenant isolation |
| Exposição de dados em APIs | Alto | Campos selecionados com `select` | Guardas JWT, validação de perfil |
| Vazamento de senhas | Médio | Hash bcrypt | Política de senha forte |
| Interceptação de tokens | Médio | Nenhum | HTTPS obrigatório |
| Vazamento em logs | Médio | Nenhum | Sanitização de logs |
| Sequestro de sessão | Alto | Nenhum | Refresh token, rotação |
| Exclusão incompleta | Médio | Nenhum | Política de exclusão, soft delete |
| Replay de QR Code | Médio | Nenhum | One-time tokens, expiração curta |
| Segredo versionado | Alto | .env.example sem valores reais | Scanner de segredos no CI |
