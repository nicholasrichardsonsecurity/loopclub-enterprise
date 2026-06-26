# Política de Privacidade — LoopClub Enterprise

**Princípios de produto para proteção de dados dos usuários.**

> **Aviso:** Este documento define os princípios de privacidade adotados no desenvolvimento do produto. Não substitui a política de privacidade legal que deve ser apresentada aos usuários finais.

## Princípios fundamentais

### 1. Coletar apenas o necessário
Nunca solicitar ou armazenar dados que não sejam estritamente necessários para a funcionalidade. Cada campo adicional deve ser justificado por finalidade específica.

### 2. Evitar CPF na v1.0
CPF não é indispensável para o programa de fidelidade na versão inicial. Identificação por telefone ou e-mail é suficiente. CPF só deve ser implementado se houver requisito fiscal ou legal que o exija.

### 3. Evitar data de nascimento salvo necessidade real
Data de nascimento só deve ser coletada se houver funcionalidade que dependa dela (ex.: campanha de aniversário). Não coletar "para usar no futuro".

### 4. Não coletar localização precisa sem finalidade clara
Geolocalização precisa (GPS) não deve ser coletada sem uma finalidade específica informada ao usuário. Dados aproximados (cidade/estado) podem ser obtidos por outros meios.

### 5. Não usar dados para publicidade sem base adequada
Dados de fidelidade (histórico de compras, preferências) não devem ser usados para publicidade direcionada sem consentimento explícito e finalidade específica.

### 6. Não reutilizar dados para finalidade incompatível
Dados coletados para fidelidade não devem ser reutilizados para outras finalidades sem nova base legal e comunicação ao titular.

### 7. Não expor ranking de clientes sem critério e transparência
Se houver ranking ou gamificação, o critério deve ser transparente e o cliente deve poder optar por não participar.

### 8. Não armazenar senha em texto puro
Todas as senhas devem ser hash com bcrypt (ou algoritmo equivalente) antes do armazenamento. Nunca logar senhas em texto puro.

### 9. Não registrar tokens em logs
Tokens JWT, refresh tokens e QR Code tokens não devem aparecer em logs de aplicação, console ou sistemas de monitoramento.

### 10. Não registrar dados sensíveis desnecessários
Dados sensíveis (art. 5º, II da LGPD) não devem ser coletados ou armazenados sem justificativa clara e base legal específica.

## Decisões de produto baseadas em privacidade

| Decisão | Justificativa |
|---------|---------------|
| Login por e-mail + senha | Dados mínimos para autenticação |
| Registro sem CPF obrigatório | Reduz exposição de dado sensível |
| Telefone como campo opcional | Minimização — muitos programas não precisam |
| Senha hash com bcrypt | Proteção contra vazamento |
| Segregação por companyId | Isolamento lógico entre empresas |
| Role no JWT | Evita consulta extra ao banco |
| Logs de auditoria (AuditLog) | Rastreabilidade |
| Dados mockados nos frontends | Protege dados reais durante desenvolvimento |

## O que NÃO será feito na v1.0 (por decisão de privacidade)

- Coleta de CPF obrigatório
- Coleta de data de nascimento sem funcionalidade vinculada
- Geolocalização contínua
- Compartilhamento de dados com terceiros para publicidade
- Perfil comportamental sem consentimento
- Integração com redes sociais sem avaliação de privacidade
- Armazenamento de dados biométricos
- Coleta de dados de crianças sem base legal adequada

## Diretrizes para desenvolvimento

1. **Privacy by design:** Privacidade deve ser considerada desde a concepção de cada funcionalidade
2. **Data minimization review:** Antes de adicionar novo campo, perguntar: "realmente precisamos disso?"
3. **Default privado:** Configurações padrão devem sempre privilegiar a privacidade do usuário
4. **Transparência:** O usuário deve saber quais dados estão sendo coletados e por quê
5. **Controle:** O usuário deve poder acessar, corrigir e solicitar exclusão dos próprios dados
