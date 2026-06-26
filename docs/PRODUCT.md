# Produto: LoopClub Enterprise

## Visão geral

O LoopClub é uma plataforma SaaS multiempresa de fidelização e retenção de clientes. Oferece um aplicativo único onde clientes acumulam pontos e trocam por recompensas, enquanto empresas gerenciam seus programas de fidelidade e funcionários operam o dia a dia.

## Público-alvo (v1.0)

- Lojas de açaí
- Lanchonetes
- Restaurantes
- Barbearias

## Modelo de negócio

- Aplicativo único para clientes, empresas e funcionários
- Painel web para Admin Master
- Mensalidade controlada manualmente pelo Admin Master (v1.0)
- Sistema multi-tenant: cada empresa gerencia seus próprios dados

## Perfis de usuário

| Perfil | Descrição |
|--------|-----------|
| ADMIN | Administrador master com acesso global |
| COMPANY_OWNER | Proprietário de uma empresa |
| EMPLOYEE | Funcionário que opera o sistema da empresa |
| CLIENT | Cliente final que acumula pontos |

## Funcionalidades planejadas (v1.0)

### Camada de base
- Autenticação com JWT
- Gestão de usuários (CRUD)
- Gestão de empresas (CRUD, block/unblock)
- RBAC (controle de acesso por perfil)

### Assinaturas
- Planos pré-cadastrados
- Assinatura manual (Admin Master controla)
- Bloqueio automático por inadimplência

### Programas de fidelidade
- Compre X e ganhe Y
- Programa progressivo (múltiplos milestones)
- Carteira de fidelidade do cliente

### Operacional
- QR Code dinâmico por cliente
- Scanner de QR para funcionários
- Lançamento manual de pontos
- Reset manual de progresso
- Histórico e auditoria de transações

### Dashboard Admin Master (planejado)
- Cards de métricas (empresas ativas, bloqueadas, inadimplentes)
- Gráficos de evolução (MRR previsto × recebido)
- Gestão de NFS-e (emissão, status, cancelamento, substituição)
- Solicitações LGPD e incidentes de segurança
- Pagamentos e assinaturas (visão consolidada)

### Pagamentos (planejado)
- Pix, cartão e recorrência via gateway
- Webhooks assinados com verificação de integridade
- Idempotência em operações financeiras
- Liberação automática após confirmação
- Estorno, chargeback e falha de pagamento

### NFS-e (planejado)
- Emissão automática após pagamento confirmado
- Envio ao cliente (e-mail / download)
- Status, reprocessamento, cancelamento e substituição
- Integração desacoplada com provedor fiscal

### Push Notifications (planejado)
- Global, por perfil e por empresa
- Operacional (confirmação, lembrete, alerta)
- Promocional (nova recompensa, oferta)
- Agendamento de disparo
- Preferências e opt-out por usuário
- Histórico e auditoria de disparos

### Relatórios contábeis (planejado)
- Faturamento por competência
- Notas emitidas e canceladas
- Pagamentos, estornos e inadimplência
- Exportação CSV / XLSX
- Conciliação financeira
- Resumo mensal para contabilidade

### Visual e relatórios
- Dashboard da empresa
- Dashboard do Admin Master
- Personalização visual por empresa (cores, logo)

## Diferenciais

- App único: o cliente não precisa instalar um app por loja
- Multi-tenant nativo: dados isolados por `companyId`
- Flexível para pequenos negócios: planos simples e gestão manual

## Observações fiscais e tributárias

- **NFS-e é o documento fiscal previsto.** O LoopClub emite Nota Fiscal de Serviço (NFS-e) para as assinaturas e serviços prestados. A implementação está sujeita a validação contábil e às regras municipais de cada prestador.
- **NFCom modelo 62 não se aplica.** A Nota Fiscal de Comunicação (NFCom, modelo 62) é voltada exclusivamente a serviços de telecomunicações. Não deve ser confundida com NFS-e. O LoopClub não emite NFCom.
- **DAS não é gerado automaticamente.** O Documento de Arrecadação do Simples Nacional (DAS) é de responsabilidade do contribuinte. O sistema não deve prometer geração automática do DAS sem validação contábil e tributária.
