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

### Hipóteses de diferenciais futuros (não implementados)

Os itens abaixo são hipóteses de diferenciação e roadmap, não funcionalidades implementadas. Devem ser validadas com clientes reais antes do desenvolvimento.

| Diferencial | Descrição | Status |
|-------------|-----------|--------|
| Simulador de custo e rentabilidade | Calculadora de retorno do programa de fidelidade | Hipótese |
| Assistente guiado de criação | Wizard de configuração do primeiro programa | Hipótese |
| Centro de implantação | Checklist e acompanhamento do onboarding | Hipótese |
| Academia LoopClub | Treinamentos, tutoriais e certificação | Hipótese |
| Modo balcão | Interface otimizada para atendimento presencial | Hipótese |
| Experiência por link/PWA | Carteira do cliente sem instalação de app | Hipótese |
| Carteira única multiempresa | Acumular pontos em várias empresas com um único login | Hipótese |
| Central de LGPD | Ferramentas de compliance para o cliente empresarial | Hipótese |
| Antifraude | Detecção de uso indevido de pontos | Hipótese |
| Campanhas com proteção de margem | Promoções que não comprometem a rentabilidade | Hipótese |
| Modelos por segmento | Programas pré-configurados para segmentos específicos | Hipótese |
| Assistente de campanhas com IA | Sugestão de regras e recompensas com revisão humana | Hipótese |

### Hipóteses de modelo comercial (não implementado)

Os valores abaixo são hipóteses comerciais, não preços definitivos. Nenhum plano, faturamento ou contratação automática está implementado.

| Plano | Preço hipotético | Modelo |
|-------|-------------------|--------|
| Essencial | R$ 129/mês | Autoimplantação guiada |
| Profissional | R$ 249/mês | Autoimplantação guiada |
| Premium | R$ 449/mês | Implantação assistida |
| Enterprise | a partir de R$ 899/mês | Implantação assistida |

- **Lançamento:** 50% de desconto na implantação (hipótese)
- **Modelo:** venda consultiva inicial, migração futura para contratação automática
- **Treinamento:** padrão e enxuto, com automação progressiva
- **Site institucional e comercial:** pendente

## Mercado e padrões brasileiros

O LoopClub Enterprise é desenvolvido exclusivamente para o mercado brasileiro. Todos os padrões de apresentação, validação e armazenamento seguem as normas e formatos nacionais.

**Este é um requisito transversal e permanente do produto.** Nenhuma funcionalidade, interface ou integração deve assumir padrão internacional como padrão — o ponto de partida é sempre o Brasil.

### Padrões obrigatórios

| Aspecto | Padrão |
|---------|--------|
| Idioma padrão | Português do Brasil (pt-BR) |
| Moeda | Real brasileiro (R$ 1.234,56) |
| Data | DD/MM/AAAA |
| Horário | Formato 24 horas |
| Timezone inicial | America/Recife (configurável por empresa no futuro) |
| Telefone | Brasileiro com DDD (celular e fixo) |
| Documentos | CPF (11 dígitos) e CNPJ (14 dígitos) |
| CEP | 00000-000 |
| Endereço | Logradouro, número, complemento, bairro, município, UF, CEP |

### Regras técnicas por tipo de dado

#### Datas
- Armazenar internamente em UTC (ISO 8601)
- Converter para o timezone configurado apenas na exibição
- Nunca armazenar datas formatadas como DD/MM/AAAA no banco de dados
- Operações de relatório, filtro e API devem aceitar/enviar datas em ISO, exceto quando a interface do usuário exigir formato local

#### Valores monetários
- Nunca usar float para valores financeiros
- Usar `Decimal` do Prisma/PostgreSQL ou inteiros em centavos no armazenamento
- Formatação pt-BR (R$ 1.234,56) aplicada exclusivamente na camada de apresentação
- Cálculos e operações devem usar o tipo nativo (Decimal), não strings formatadas

#### CPF e CNPJ
- Validar dígitos verificadores no backend (regra de negócio, não apenas no frontend)
- Armazenar normalizados, preferencialmente apenas números (sem pontos, traços ou barras)
- Aplicar máscara na interface do usuário (XXX.XXX.XXX-XX e XX.XXX.XXX/XXXX-XX)
- Impedir duplicidade quando aplicável (CPF único por usuário, CNPJ único por empresa)
- Evitar exposição completa em logs, telas sem necessidade ou respostas de API sem justificativa
- Mascarar parcialmente quando possível (ex.: XXX.XXX.XXX-00)

#### Telefones
- Armazenar normalizados, apenas números
- Aceitar DDD obrigatório (2 dígitos)
- Preparar diferenciação entre celular (9 dígitos) e fixo (8 dígitos)
- Exibir no padrão brasileiro: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
- Considerar formato E.164 para integrações externas (+5521XXXXXXXXX)

#### CEP
- Armazenar apenas números (8 dígitos)
- Exibir como 00000-000
- Preparar futura integração com API de consulta de CEP (ex.: ViaCEP)
- Permitir correção manual do endereço após preenchimento automático
- Considerar CEP como dado facultativo na base, mas obrigatório para NFS-e

#### Interface do usuário
- Todos os textos, botões, mensagens de erro, validações, e-mails, SMS, push notifications e documentos gerados devem estar em português do Brasil
- Não deixar textos em inglês visíveis ao usuário final
- Termos técnicos internos (nomes de variáveis, chaves de API, logs de sistema) podem permanecer em inglês no código

#### Segurança e LGPD
- CPF, CNPJ, telefone e endereço completo são dados pessoais nos termos da LGPD
- Seguir o princípio da minimização: coletar apenas quando houver finalidade específica
- Não registrar documentos completos (CPF, CNPJ) em logs de aplicação
- Mascarar dados sensíveis em telas e relatórios quando possível
- Definir finalidade e prazo de retenção para cada dado pessoal brasileiro antes de implementar a coleta

## Observações fiscais e tributárias

- **NFS-e é o documento fiscal previsto.** O LoopClub emite Nota Fiscal de Serviço (NFS-e) para as assinaturas e serviços prestados. A implementação está sujeita a validação contábil e às regras municipais de cada prestador.
- **NFCom modelo 62 não se aplica.** A Nota Fiscal de Comunicação (NFCom, modelo 62) é voltada exclusivamente a serviços de telecomunicações. Não deve ser confundida com NFS-e. O LoopClub não emite NFCom.
- **DAS não é gerado automaticamente.** O Documento de Arrecadação do Simples Nacional (DAS) é de responsabilidade do contribuinte. O sistema não deve prometer geração automática do DAS sem validação contábil e tributária.
