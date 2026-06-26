# Política de Retenção de Dados

**Proposta de prazos de retenção e descarte para o LoopClub Enterprise.**

> **Aviso:** Esta política é uma proposta técnica. Os prazos marcados como "proposta" dependem de validação jurídica e definição de negócio antes da produção. Esta política não aborda todos os cenários legais possíveis.

## Princípios

- Dados devem ser retidos apenas pelo tempo necessário à finalidade
- Após o prazo, dados devem ser excluídos ou anonimizados de forma segura
- Prazos devem ser executados por processo automatizado (DataRetentionJob)
- Exceções legais (defesa de direitos, obrigação regulatória) devem ser observadas
- A política deve ser revisada anualmente

## Tabela de retenção

| Categoria | Prazo proposto | Motivo | Ação após prazo |
|-----------|---------------|--------|-----------------|
| Usuários ativos | Enquanto a conta estiver ativa | Necessário para operação do serviço | N/A |
| Usuários inativos | **Proposta:** 5 anos após última atividade | Possibilidade de reativação | Anonimização ou exclusão |
| Empresas canceladas | **Proposta:** 5 anos após cancelamento | Defesa de direitos, obrigações fiscais | Anonimização dos dados vinculados |
| Logs de autenticação | **Proposta:** 6 meses | Segurança, investigação de incidentes | Exclusão programada |
| Logs de auditoria | **Proposta:** 5 anos | Compliance, LGPD art. 37 | Exclusão programada (manter anonimizado se necessário) |
| Tokens JWT | Até expirar (1 dia) | Sessão ativa | Exclusão automática (não persistido) |
| Refresh tokens | **Proposta:** até 90 dias após revogação | Rotação de sessão | Exclusão ou invalidação |
| QR Code tokens | **Proposta:** token expirado + 30 dias | Prevenção de replay | Exclusão programada |
| Transações de fidelidade | **Proposta:** 5 anos | Direitos do consumidor, defesa de direitos | Anonimização (desvincular dados pessoais) |
| Progresso de fidelidade | **Proposta:** 2 anos após cancelamento da conta | Período de reativação | Exclusão |
| Dados de dispositivo | **Proposta:** 6 meses | Segurança | Exclusão programada |
| Backups | **Proposta:** 90 dias (retenção rotativa) | Recuperação de desastres | Exclusão no próximo ciclo |
| Dados excluídos (logical delete) | **Proposta:** 30 dias em quarantine | Recuperação acidental | Exclusão física definitiva |
| Consentimento registrado | **Proposta:** 5 anos após revogação | Comprovação de conformidade | Exclusão |
| Registro de solicitação de titular | **Proposta:** 5 anos | Prestação de contas à ANPD | Exclusão |

## Procedimento de exclusão

### Exclusão física (hard delete)
Registro é removido definitivamente do banco. Apropriado para dados sem necessidade de retenção legal.

### Anonimização
Dados pessoais são removidos ou substituídos por valores irreversíveis, mantendo registros estatísticos ou operacionais quando necessário. Ex.: substituir nome e e-mail por "anon-{uuid}".

### Quarantine (exclusão temporizada)
Dados marcados para exclusão são movidos para uma área de quarantine por 30 dias antes da exclusão definitiva, permitindo recuperação em caso de erro.

## Logs de exclusão

Toda exclusão de dados pessoais deve ser registrada em trilha de auditoria, contendo:

- Data e hora da exclusão
- Responsável pela execução (sistema ou operador)
- Categoria dos dados excluídos
- Quantidade de registros afetados
- Método de exclusão (física, anonimização, quarantine)

## Exceções

- Dados necessários para defesa de direitos em processo judicial ou administrativo podem ser retidos além do prazo
- Obrigações legais ou regulatórias específicas podem exigir prazos diferentes
- A pedido do titular, dados podem ser excluídos antes do prazo (ver [DATA-SUBJECT-RIGHTS.md](DATA-SUBJECT-RIGHTS.md))
- A empresa cliente (controladora de seus dados) pode solicitar prazos específicos mediante contrato
