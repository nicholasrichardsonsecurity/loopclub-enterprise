# LGPD — Lei Geral de Proteção de Dados

**Documento de adequação do LoopClub Enterprise à Lei nº 13.709/2018.**

> **Aviso:** Este documento descreve o planejamento e as medidas implementadas para adequação à LGPD. Não constitui parecer jurídico. A conformidade integral depende de auditoria jurídica antes da produção.

## Objetivo

Estabelecer as diretrizes de proteção de dados pessoais tratados pelo LoopClub Enterprise, garantindo transparência, segurança e respeito aos direitos dos titulares conforme a Lei nº 13.709/2018.

## Escopo

Aplica-se a todo tratamento de dados pessoais realizado pela plataforma LoopClub, incluindo:

- Aplicativo mobile (Flutter)
- Painel administrativo web (Next.js)
- API REST (NestJS)
- Banco de dados (PostgreSQL)
- Logs, auditoria e tokens
- Backups e retenção

## Categorias de titulares

| Titular | Descrição |
|---------|-----------|
| CLIENT | Cliente final que acumula pontos de fidelidade |
| COMPANY_OWNER | Proprietário de empresa cadastrada na plataforma |
| EMPLOYEE | Funcionário que opera o sistema da empresa |
| ADMIN | Administrador master com acesso global |

## Categorias de dados pessoais

### Dados de identificação
- Nome
- Telefone (padrão brasileiro com DDD)
- E-mail
- CPF (11 dígitos, armazenado apenas números)
- CNPJ (14 dígitos, armazenado apenas números — empresas)
- Senha (armazenada como hash bcrypt)
- Role / perfil de acesso

### Dados de relacionamento
- Vínculo empresa-usuário (CompanyUser)
- Empresa onde trabalha ou é cliente

### Dados de fidelidade
- Histórico de pontos acumulados
- Histórico de recompensas resgatadas
- Milestones atingidos
- Ciclos completados

### Dados de transação
- Lançamentos de pontos (data, tipo, operador)
- Resgates de recompensa
- Resets de progresso

### Dados de autenticação e segurança
- Tokens JWT de acesso
- Refresh tokens (futuro)
- QR Code tokens (hash)
- Logs de acesso e ações

### Dados de endereço (futuros)
- Logradouro, número, complemento, bairro, município, UF, CEP — modelo brasileiro
- CEP (8 dígitos, armazenado apenas números)
- UF (sigla de 2 caracteres)

### Dados técnicos (futuros)
- Dados de dispositivo
- Endereço IP
- User-agent
- Dados de localização (somente se houver finalidade clara)

## Finalidades de tratamento

| Finalidade | Dados | Base legal proposta |
|------------|-------|---------------------|
| Cadastro e identificação do usuário | Nome, e-mail, telefone, CPF, role | Execução de contrato (art. 7º, V) |
| Cadastro de empresa (CNPJ) | CNPJ, dados do proprietário, endereço | Obrigação legal (art. 7º, II) — NFS-e e legislação fiscal |
| Autenticação e segurança | E-mail, senha hash, tokens | Legítimo interesse (art. 7º, IX) |
| Gestão de empresas | Dados do proprietário, CNPJ | Execução de contrato (art. 7º, V) |
| Programa de fidelidade | Pontos, transações, histórico | Execução de contrato (art. 7º, V) |
| Cobrança e assinatura | Dados da empresa, planos | Execução de contrato (art. 7º, V) |
| Auditoria e compliance | Logs de acesso, ações | Obrigação legal (art. 7º, II) |
| Prevenção a fraudes | Tokens, logs, padrões de uso | Legítimo interesse (art. 7º, IX) |
| Comunicação com o usuário | E-mail, telefone | Legítimo interesse (art. 7º, IX) |

> **Nota:** As bases legais são propostas e dependem de validação jurídica. Cada finalidade deve ter sua base legal confirmada antes da produção.

## Papéis definidos (propostos)

| Papel | Responsável | Descrição |
|-------|-------------|-----------|
| Controlador | Operador da plataforma LoopClub | Decide sobre o tratamento de dados |
| Operador | Equipe de desenvolvimento / infra | Processa dados conforme instruções do controlador |
| Encarregado/DPO | A definir | Canal de comunicação com titulares e ANPD |

> **Pendência:** Nomear o encarregado e registrar sua designação antes da produção.

## Princípios aplicáveis (art. 6º LGPD)

| Princípio | Aplicação no LoopClub |
|-----------|----------------------|
| Finalidade | Cada dado coletado tem finalidade documentada |
| Adequação | Tratamento compatível com as finalidades informadas |
| Necessidade | Coleta apenas do mínimo necessário (privacy by design) |
| Livre acesso | Direitos dos titulares garantidos via canal de solicitação |
| Qualidade | Dados mantidos atualizados e corretos |
| Transparência | Informações claras sobre o tratamento |
| Segurança | Medidas técnicas e administrativas de proteção |
| Prevenção | Mitigação de danos e riscos |
| Não discriminação | Dados não utilizados para fins discriminatórios |
| Responsabilização | Comprovação de conformidade e boas práticas |

## Medidas de segurança

### Implementadas
- Hash de senha com bcrypt (10 rounds)
- JWT com segredo configurável, JwtStrategy com validação de sub/role
- Guardas JWT (JwtAuthGuard) nas rotas users e companies
- RBAC (RolesGuard) com decorator @Roles — perfis admin, company_owner, employee, client — **validado manualmente (matriz completa)**
- Validação de entrada com `class-validator`
- Whitelist de parâmetros via ValidationPipe com `forbidNonWhitelisted: true`
- Registro público não coleta `phone` nem aceita `role` no body — coleta mínima de dados (somente name, email, password)
- Role `client` forçada internamente no registro público — impede escalada de privilégio via API
- Helmet para headers de segurança (CSP, HSTS, X-Frame-Options, X-Content-Type-Options)
- CORS configurável por ambiente via `CORS_ORIGIN`
- Header `x-powered-by` removido
- Mensagens de erro não expõem detalhes internos

### Pendentes (necessários antes da produção)
- Rate limiting (especialmente em /auth/login)
- HTTPS obrigatório
- Sanitização de logs (remoção de dados sensíveis)
- Validação de tenant isolation
- Refresh token com rotação
- Registro de consentimento
- Política de senha forte

### Planejado para versões futuras

#### Pagamentos
- Dados financeiros (cartão, Pix, endereço de cobrança) exigem proteção adicional e base legal específica (art. 7º, V — execução de contrato)
- Histórico de pagamentos armazena dados de transação e deve ter retenção definida (5 anos para fins fiscais)
- Webhooks de pagamento podem conter dados do pagador — não registrar payload bruto em logs

#### NFS-e
- NFS-e contém dados do tomador (nome, CPF/CNPJ, endereço) — incluir no mapa de dados quando implementado
- Prazo de retenção de 5 anos após emissão (legislação fiscal)
- Cancelamento e substituição devem manter trilha de auditoria

#### Push notifications
- Push promocional exige consentimento explícito do titular (art. 7º, I)
- Preferências de notificação e opt-out devem ser armazenados e respeitados
- Conteúdo de push não deve conter dados sensíveis
- Histórico de disparos deve ser auditável com data, conteúdo e destinatário

## Direitos dos titulares

O LoopClub deve atender aos direitos previstos no art. 18 da LGPD:

- Confirmação de tratamento
- Acesso aos dados
- Correção de dados incompletos ou inexatos
- Anonimização, bloqueio ou eliminação
- Portabilidade (futuro)
- Revogação de consentimento
- Informação sobre compartilhamento
- Oposição ao tratamento

> Detalhamento no documento [DATA-SUBJECT-RIGHTS.md](DATA-SUBJECT-RIGHTS.md).

## Processo de atendimento a titulares

1. Titular solicita via canal designado (e-mail ou formulário)
2. Autenticação da identidade do titular
3. Prazo interno de 5 dias úteis para resposta preliminar
4. Registro da solicitação com protocolo
5. Execução da ação (correção, exclusão, etc.)
6. Resposta formal ao titular
7. Registro em trilha de auditoria

> **Pendência:** Definir canal oficial e responsável antes da produção.

## Retenção e descarte

Ver política completa em [RETENTION-POLICY.md](RETENTION-POLICY.md).

## Incidentes

Ver procedimento completo em [INCIDENT-RESPONSE.md](INCIDENT-RESPONSE.md).

## Suboperadores

Atualmente nenhum suboperador contratado. Caso haja contratação futura (serviço de nuvem, analytics, e-mail transacional), devem ser avaliados quanto à conformidade LGPD e firmados contratos com cláusulas de proteção de dados.

## Transferências internacionais

Atualmente não há transferência internacional de dados. Se no futuro a infraestrutura utilizar servidores fora do Brasil, devem ser adotadas as salvaguardas do art. 33 da LGPD.

## Registro das operações de tratamento

O sistema mantém logs de auditoria para ações críticas (modelo `AuditLog`). Este registro deve ser complementado com:

- Finalidade do tratamento
- Categoria dos dados
- Base legal aplicada
- Prazo de retenção
- Medidas de segurança

> **Pendência:** Criar documento formal de ROPA (Registro das Operações de Tratamento) antes da produção.

## Necessidade de revisão jurídica

Os seguintes pontos exigem validação por assessoria jurídica especializada antes da produção:

1. Bases legais propostas para cada finalidade
2. Definição do papel de controlador vs. operador
3. Contrato com empresas clientes (cláusulas de proteção de dados)
4. Termo de consentimento, se aplicável
5. Política de privacidade para usuários finais
6. Registro das operações de tratamento (ROPA)
7. Nomeação do encarregado (DPO)
8. Avaliação de necessidade de DPIAs
9. Procedimento de resposta a incidentes
10. Cláusulas contratuais com suboperadores futuros
