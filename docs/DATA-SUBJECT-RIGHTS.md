# Direitos dos Titulares — LoopClub Enterprise

**Procedimento para atendimento aos direitos previstos no art. 18 da Lei nº 13.709/2018 (LGPD).**

> **Aviso:** Este documento descreve o fluxo proposto. Os processos devem ser implementados e testados antes da produção. A portabilidade e a revisão de decisões automatizadas dependem de funcionalidades futuras.

## Canal de solicitação

| Canal | Descrição | Status |
|-------|-----------|--------|
| **A definir** | Canal oficial para recebimento de solicitações | Pendente — definir antes da produção |
| **Sugestão:** E-mail dedicado | `privacidade@loopclub.com.br` (ou similar) | A criar |
| **Sugestão:** Formulário web | Página no admin ou app para solicitação | A implementar |

## Autenticação do titular

Antes de atender qualquer solicitação, a identidade do titular deve ser verificada:

1. Solicitação recebida via canal oficial com protocolo
2. Titular deve fornecer dados que permitam identificação (e-mail cadastrado ou telefone)
3. Sistema valida se os dados conferem com o registro
4. Se houver dúvida sobre a identidade, solicitar confirmação adicional
5. Registrar a tentativa de exercício de direito em trilha de auditoria

> **Pendência:** Implementar mecanismo de verificação de identidade no backend.

## Direitos e fluxos

### 1. Confirmação de tratamento

| Campo | Detalhe |
|-------|---------|
| **Descrição** | Titular pergunta se tratamos dados pessoais dele |
| **Prazo interno** | 5 dias úteis |
| **Resposta** | Sim / Não, com informações básicas sobre o tratamento |
| **Exceção legal** | Segredo industrial ou comercial (art. 18, §3º) |

### 2. Acesso

| Campo | Detalhe |
|-------|---------|
| **Descrição** | Titular solicita acesso aos dados pessoais que tratamos |
| **Prazo interno** | 5 dias úteis |
| **Resposta** | Lista completa dos dados em formato claro e simplificado |
| **Formato** | JSON ou CSV legível |
| **Exceção legal** | Informações sobre outros titulares devem ser omitidas |

### 3. Correção

| Campo | Detalhe |
|-------|---------|
| **Descrição** | Titular solicita correção de dados incompletos ou inexatos |
| **Prazo interno** | 5 dias úteis |
| **Processo** | Validar a correção solicitada, aplicar a alteração, confirmar ao titular |
| **Auditoria** | Registrar a correção com data, responsável e dados anteriores |

### 4. Anonimização, bloqueio ou eliminação

| Campo | Detalhe |
|-------|---------|
| **Descrição** | Titular solicita anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade |
| **Prazo interno** | 5 dias úteis |
| **Processo** | Avaliar a solicitação, verificar se há obrigação legal de retenção, executar a ação |
| **Auditoria** | Registrar a ação com detalhes |
| **Exceção legal** | Dados necessários para cumprimento de obrigação legal ou defesa de direitos |

### 5. Portabilidade (futuro)

| Campo | Detalhe |
|-------|---------|
| **Descrição** | Titular solicita portabilidade dos dados a outro fornecedor |
| **Prazo interno** | A definir (depende de regulamentação da ANPD) |
| **Formato** | JSON estruturado e interoperável |
| **Status** | Não implementado — funcionalidade futura |

### 6. Revogação de consentimento

| Campo | Detalhe |
|-------|---------|
| **Descrição** | Titular revoga consentimento previamente dado |
| **Prazo interno** | Imediato (processamento em até 48h) |
| **Processo** | Registrar a revogação, identificar dados tratados com base no consentimento revogado, cessar o tratamento |
| **Consequência** | Serviços baseados no consentimento podem não ser mais prestados |
| **Auditoria** | Registrar data, hora e canal da revogação |

### 7. Informação sobre compartilhamento

| Campo | Detalhe |
|-------|---------|
| **Descrição** | Titular pergunta com quem compartilhamos dados |
| **Prazo interno** | 5 dias úteis |
| **Resposta** | Lista de suboperadores, parceiros e finalidades do compartilhamento |

### 8. Oposição

| Campo | Detalhe |
|-------|---------|
| **Descrição** | Titular se opõe a tratamento baseado em legítimo interesse |
| **Prazo interno** | 5 dias úteis |
| **Processo** | Avaliar se existem motivos legítimos que prevalecem sobre a oposição |
| **Resposta** | Deferir (cessar tratamento) ou indeferir (justificar motivo) |

### 9. Revisão de decisões automatizadas (futuro)

| Campo | Detalhe |
|-------|---------|
| **Descrição** | Titular solicita revisão de decisão tomada unicamente com base em tratamento automatizado |
| **Status** | Futuro — não há decisões automatizadas na v1.0 |

## Registro da solicitação

Cada solicitação deve ser registrada contendo:

- Número de protocolo único
- Data e hora da solicitação
- Canal utilizado
- Dados do titular (identificados)
- Direito exercido
- Descrição da solicitação
- Decisão e justificativa
- Data da resposta
- Ações executadas
- Trilha de auditoria vinculada

## Responsável

| Função | Responsável atual |
|--------|-------------------|
| Atendimento a titulares | **A definir** |
| DPO / Encarregado | **A nomear** |

## Prazos legais

- Resposta ao titular: **5 dias úteis** (sugerido — art. 18, §6º do Marco Civil pode exigir prazo menor)
- Comunicação à ANPD: **48 horas úteis** em caso de incidente com risco ou dano relevante (art. 48 LGPD)

## Exceções legais

- Dados necessários para cumprimento de obrigação legal ou regulatória
- Dados necessários para defesa de direitos em processo judicial ou administrativo
- Segredo industrial ou comercial (art. 18, §3º)
- Impossibilidade técnica de anonimização ou exclusão (justificar)
- Pedido excessivo ou repetitivo (art. 18, §8º — pode cobrar custo ou recusar)

## Ações futuras necessárias

- [ ] Definir canal de solicitação (e-mail, formulário, chatbot)
- [ ] Implementar endpoint para titulares acessarem próprios dados
- [ ] Implementar endpoint para correção de dados
- [ ] Implementar fluxo de exclusão de conta (com quarantine)
- [ ] Implementar registro de consentimento (UserConsent)
- [ ] Implementar registro de solicitações (DataSubjectRequest)
- [ ] Nomear DPO/Encarregado
