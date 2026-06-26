# Plano de Resposta a Incidentes de Segurança

**LoopClub Enterprise — Procedimento para detecção, contenção, análise e comunicação de incidentes.**

> **Aviso:** Este é um plano proposto. Deve ser revisado e aprovado pela equipe de segurança e assessoria jurídica antes da produção.

## Definição de incidente

Um incidente de segurança é qualquer evento que comprometa a confidencialidade, integridade ou disponibilidade dos dados pessoais tratados pelo LoopClub. Inclui:

- Acesso não autorizado a dados
- Vazamento ou exposição acidental de dados
- Perda ou destruição de dados
- Alteração indevida de dados
- Ataque que afete a disponibilidade do sistema
- Suspeita de qualquer um dos acima

## Classificação por severidade

| Severidade | Descrição | Exemplos | Prazo de resposta |
|------------|-----------|----------|-------------------|
| **Crítico** | Risco iminente ou dano concreto a titulares | Vazamento massivo de dados, exposição de senhas, acesso externo ao banco | Imediato |
| **Alto** | Risco potencial a titulares | Acesso não autorizado a empresa específica, falha de tenant isolation | 2 horas |
| **Médio** | Risco baixo mas com comprometimento comprovado | Log expondo dados sensíveis, bug de permissão sem exploração conhecida | 24 horas |
| **Baixo** | Sem risco direto a titulares | Tentativa de brute force bloqueada, scan de porta | 72 horas |

## Papéis e responsáveis

| Papel | Responsabilidade | Titular atual |
|-------|------------------|---------------|
| Coordenador de incidente | Lidera a resposta, toma decisões críticas | **A definir** |
| Equipe técnica | Contenção, análise forense, correção | Equipe de desenvolvimento |
| Comunicação | Contato com titulares, ANPD, imprensa | **A definir** |
| Jurídico | Avaliação de obrigações legais, LGPD | **A definir** |
| DPO / Encarregado | Interface com ANPD e titulares | **A nomear** |

> **Pendência:** Nomear os responsáveis antes da produção.

## Fases de resposta

### 1. Detecção e notificação
- Incidente pode ser reportado por: monitoramento, usuário, equipe interna, autoridade
- Registrar no canal de incidentes com data/hora e descrição inicial
- Abrir registro em `SecurityIncident` (entidade proposta)

### 2. Triagem e classificação
- Avaliar severidade conforme tabela acima
- Notificar coordenador de incidente
- Se severidade Crítica ou Alta, acionar equipe imediatamente

### 3. Contenção
- Isolar sistemas afetados (desconectar servidor, revogar tokens, bloquear acesso)
- Preservar logs e evidências (não desligar servidor sem copiar dados)
- Se aplicável, ativar modo de manutenção
- Registrar todas as ações tomadas

### 4. Preservação de evidências
- Copiar logs do sistema, banco, servidor web
- Preservar estado atual do banco (snapshot se possível)
- Registrar timeline do incidente
- Não alterar arquivos no sistema afetado antes da cópia forense
- Cadeia de custódia documentada

### 5. Análise de impacto
- Determinar quais dados foram acessados ou comprometidos
- Determinar quais titulares foram afetados
- Avaliar severidade real (pode diferir da classificação inicial)
- Documentar descobertas

### 6. Comunicação interna
- Reportar ao coordenador e equipe jurídica
- Se crítico/alto, reportar à direção
- Estabelecer canal restrito de comunicação

### 7. Avaliação de risco ou dano relevante (art. 48 LGPD)
- Avaliar se o incidente pode causar dano relevante aos titulares
- Se sim, comunicar à ANPD em até 48 horas
- Comunicar titulares afetados com informações claras

### 8. Comunicação externa
- **ANPD:** Se risco ou dano relevante, comunicar em até 48 horas úteis (art. 48 LGPD)
- **Titulares:** Informar sobre: natureza do incidente, dados afetados, medidas de contenção, recomendações
- **Contratos:** Notificar empresas clientes conforme SLA contratual

### 9. Remediação e recuperação
- Aplicar correções necessárias
- Validar que a causa foi eliminada
- Restaurar serviços monitorando recorrência
- Testar correção em ambiente isolado

## Registro do incidente

Cada incidente deve ser registrado com:

- ID único do incidente
- Data e hora da detecção
- Severidade inicial e final
- Descrição detalhada
- Dados e titulares afetados
- Timeline completo
- Ações tomadas e responsáveis
- Causa raiz
- Lições aprendidas
- Anexos (logs, prints, relatórios)

## Lições aprendidas

Após cada incidente:

1. Reunião pós-incidente em até 5 dias úteis
2. Documentar causa raiz
3. Identificar melhorias em processos e controles
4. Atualizar planos de resposta
5. Atualizar threat model
6. Compartilhar lições com a equipe

## Checklist operacional

- [ ] Incidente detectado e registrado
- [ ] Severidade classificada
- [ ] Coordenador notificado
- [ ] Conteve o acesso não autorizado
- [ ] Evidências preservadas (logs, snapshots)
- [ ] Impacto avaliado (dados e titulares)
- [ ] Jurídico consultado
- [ ] ANPD comunicada (se aplicável — 48h úteis)
- [ ] Titulares comunicados (se aplicável)
- [ ] Causa raiz identificada
- [ ] Correção aplicada e testada
- [ ] Incidente registrado e documentado
- [ ] Lições aprendidas documentadas

## Modelo de relatório de incidente

```md
# Relatório de Incidente

## ID: INC-{ANO}-{SEQUENCIAL}

### Dados básicos
- **Data da detecção:** 
- **Data de notificação:** 
- **Severidade:** (Crítico / Alto / Médio / Baixo)
- **Status:** (Aberto / Em análise / Contido / Resolvido / Fechado)

### Descrição

### Dados e titulares afetados

### Timeline
| Data/Hora | Ação | Responsável |
|-----------|------|-------------|

### Causa raiz

### Ações de contenção

### Comunicações
- ANPD: (Sim / Não / Não aplicável) — Data:
- Titulares: (Sim / Não / Não aplicável) — Data:

### Correções aplicadas

### Lições aprendidas

### Anexos
```
