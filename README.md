# Kikos Fitness CRM

CRM fullstack para gerenciamento de leads e oportunidades comerciais, desenvolvido em monorepo TypeScript com API Fastify, frontend React e PostgreSQL.

## Funcionalidades

- Login com JWT e logout no frontend.
- Rotas privadas no frontend e backend.
- Cadastro, busca, paginacao e detalhes de leads.
- Comentarios em leads e negocios.
- Cadastro e detalhes de negocios.
- Associacao obrigatoria de negocio a lead e vendedor.
- Board Kanban de negocios com drag and drop e alternativa por seletor.
- Transicoes de status validadas no backend.
- Marcacao de negocio como ganho, perdido com motivo e reabertura explicita.
- Historico de alteracao de status.
- Swagger/OpenAPI em `/api/docs`.

## Stack

- Monorepo: pnpm workspaces e Turborepo.
- Linguagem: TypeScript strict.
- Backend: Node.js, Fastify, Effect-TS, Sequelize, PostgreSQL, Zod, JWT, bcryptjs, Vitest.
- Frontend: React, Vite, React Router, TanStack Query, React Hook Form, Zod, Material UI, dnd-kit, Vitest.
- Infra local: Docker Compose para PostgreSQL.

## Arquitetura

```text
apps/
  api/
    src/app
    src/modules/auth
    src/modules/users
    src/modules/leads
    src/modules/deals
    src/modules/comments
    src/shared/database
    src/shared/errors
  web/
    src/auth
    src/api
    src/features/leads
    src/features/deals
    src/ui
packages/
  shared/
```

O backend e organizado por modulos de negocio. Rotas tratam HTTP, servicos coordenam regras com Effect-TS, repositorios isolam persistencia, e `packages/shared` concentra contratos publicos, schemas e DTOs.

## Modelo de Dados

- `User`: usuario administrador ou vendedor.
- `Lead`: contato comercial com dados basicos e varios negocios.
- `Deal`: oportunidade vinculada a lead e vendedor.
- `Comment`: comentario associado a lead ou negocio.
- `DealStatusHistory`: historico transacional das mudancas de status.

Status de negocio:

```text
NEW -> IN_PROGRESS | LOST
IN_PROGRESS -> NEW | PROPOSAL | WON | LOST
PROPOSAL -> IN_PROGRESS | WON | LOST
WON -> apenas reabertura explicita
LOST -> apenas reabertura explicita
```

## Decisoes Tecnicas

- **Fastify**: escolhido por performance, tipagem boa e ecossistema de plugins.
- **PostgreSQL**: banco relacional adequado para integridade entre leads, negocios, usuarios e historico.
- **Sequelize**: usado no lugar de Drizzle por decisao do projeto durante a implementacao; mantem migrations, models, repositorios e transacoes claras.
- **Effect-TS**: aplicado de forma pragmatica em servicos e regras de dominio, principalmente para erros explicitos e composicao.
- **Contratos compartilhados**: schemas Zod e DTOs ficam em `packages/shared`, sem expor detalhes internos do banco.
- **Atualizacao otimista**: usada no Kanban com TanStack Query; em erro, o cache volta ao estado anterior.
- **Autorizacao de vendedor**: `ADMIN` ve todos os negocios; `SELLER` ve apenas negocios sob sua responsabilidade.

## Execucao Local

Pre-requisitos:

- Node.js compativel com o projeto.
- Corepack habilitado.
- Docker com Docker Compose.

Instalacao:

```bash
corepack enable
pnpm install
```

Subir PostgreSQL:

```bash
docker compose up -d
```

Criar tabelas e dados de demonstracao:

```bash
pnpm db:migrate
pnpm db:seed
```

Rodar API e web:

```bash
pnpm dev
```

URLs locais:

- Frontend: `http://localhost:5173`
- API: `http://localhost:3333`
- Swagger: `http://localhost:3333/api/docs`

## Variaveis de Ambiente

Use `.env.example` como base:

```text
NODE_ENV=development
PORT=3333
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kikos_crm
JWT_SECRET=change-me-in-development
JWT_EXPIRES_IN=8h
CORS_ORIGIN=http://localhost:5173
AI_PROVIDER=mock
AI_API_KEY=
AI_MODEL=
VITE_API_URL=http://localhost:3333/api/v1
```

Nao versionar secrets reais.

## Credenciais de Demonstracao

Administrador:

```text
admin@kikos.local
Admin123!
```

Vendedor:

```text
seller@kikos.local
Seller123!
```

## Scripts

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm db:migrate
pnpm db:seed
```

Scripts especificos:

```bash
pnpm --filter @kikos/api db:migrate
pnpm --filter @kikos/api db:migrate:down
pnpm --filter @kikos/api db:seed
pnpm --filter @kikos/web dev
```

## API e Swagger

A API usa prefixo `/api/v1`.

Endpoints principais:

- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/sellers`
- `GET|POST /api/v1/leads`
- `GET|PATCH /api/v1/leads/:leadId`
- `GET|POST /api/v1/leads/:leadId/comments`
- `GET|POST /api/v1/deals`
- `GET|PATCH /api/v1/deals/:dealId`
- `PATCH /api/v1/deals/:dealId/status`
- `POST /api/v1/deals/:dealId/win`
- `POST /api/v1/deals/:dealId/lose`
- `POST /api/v1/deals/:dealId/reopen`
- `GET|POST /api/v1/deals/:dealId/comments`

Documentacao:

- UI: `/api/docs`
- JSON: `/api/docs/json`

## Testes e Validacao

Comandos executados durante a implementacao:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

O backend possui testes de rotas, autenticacao, leads, negocios, comentarios, autorizacao de vendedor e transicoes de status. O frontend ainda usa `vitest --passWithNoTests`; testes de interface com React Testing Library sao uma melhoria futura importante.

## Tratamento de Erros

Erros sao padronizados no formato:

```json
{
  "error": {
    "code": "DEAL_NOT_FOUND",
    "message": "Negocio nao encontrado",
    "details": null
  }
}
```

O backend mapeia erros tipados para HTTP `400`, `401`, `403`, `404`, `409`, `422` e `500`, sem expor stack trace.

## Kanban

O board fica em `/deals/board` e exibe colunas:

- Novos
- Em andamento
- Proposta
- Ganhos
- Perdidos

Ao mover um card por drag and drop ou seletor:

1. O frontend atualiza a UI de forma otimista.
2. A API valida a transicao.
3. Em caso de erro, o estado anterior e restaurado.
4. Uma mensagem de feedback e exibida.

## Seguranca

- Senhas com hash bcrypt.
- JWT com expiracao configuravel.
- Helmet e CORS configuravel.
- Rate limit no login.
- Body limit no Fastify.
- Queries parametrizadas via Sequelize.
- Rotas privadas protegidas por middleware de autenticacao.

## IA Opcional

As variaveis `AI_PROVIDER`, `AI_API_KEY` e `AI_MODEL` ja estao previstas no ambiente, mas o resumo com IA ainda nao foi implementado. A recomendacao e criar um provider mock e um provider real configuravel apenas depois de fechar os requisitos principais.

## Trade-offs e Limitacoes

- A especificacao original citava Drizzle, mas o projeto usa Sequelize por decisao posterior.
- O OpenAPI foi implementado como documento estatico para cobrir rapidamente os contratos reais; uma evolucao seria gerar schemas automaticamente a partir dos schemas Zod.
- O board busca ate 100 negocios para montar o Kanban em uma unica chamada.
- Os seletores de leads na criacao de negocio buscam ate 100 leads, sem autocomplete paginado.
- Neste ambiente, Docker nao esta disponivel, entao migrations e seed nao foram validados contra um PostgreSQL real aqui.
- O build do frontend passa, mas o Vite avisa que o bundle esta acima de 500 kB; code splitting pode melhorar isso.

## Melhorias Futuras

- Refresh token.
- Recuperacao de senha.
- Permissoes mais granulares.
- Auditoria completa.
- WebSocket para atualizacao em tempo real.
- Metricas e tracing.
- Upload de anexos.
- Integracao com e-mail ou WhatsApp.
- Filtros avancados.
- Testes frontend com React Testing Library.
- Testes E2E com Playwright.
- Deploy em AWS/Kubernetes.
- Lead scoring ou resumo de comentarios com IA.
