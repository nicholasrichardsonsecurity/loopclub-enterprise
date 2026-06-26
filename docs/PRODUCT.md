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

### Visual e relatórios
- Dashboard da empresa
- Dashboard do Admin Master
- Personalização visual por empresa (cores, logo)

## Diferenciais

- App único: o cliente não precisa instalar um app por loja
- Multi-tenant nativo: dados isolados por `companyId`
- Flexível para pequenos negócios: planos simples e gestão manual
