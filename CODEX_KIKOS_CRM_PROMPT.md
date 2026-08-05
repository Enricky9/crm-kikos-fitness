# Prompt de Implementação — Desafio Técnico Kikos Fitness CRM

## Papel

Atue como um engenheiro de software fullstack sênior responsável por desenvolver uma aplicação CRM para o desafio técnico da Kikos Fitness.

Antes de alterar qualquer arquivo:

1. Inspecione o estado atual do repositório.
2. Identifique configurações e arquivos existentes.
3. Apresente um plano curto de implementação.
4. Trabalhe em etapas pequenas e verificáveis.
5. Não sobrescreva código válido sem necessidade.

---

# 1. Contexto

A Kikos Fitness está construindo uma nova plataforma com uma stack baseada em:

- TypeScript end-to-end
- Node.js
- React
- Effect-TS
- Programação funcional
- AWS
- Kubernetes

O desafio consiste em construir um CRM simples para gerenciamento de leads e oportunidades comerciais.

A solução será avaliada considerando:

- Qualidade e legibilidade do código
- Organização da aplicação
- Arquitetura e separação de responsabilidades
- Uso correto de TypeScript
- Tratamento explícito de erros
- Funcionamento ponta a ponta
- Documentação
- Histórico organizado de commits
- Testes automatizados
- Usabilidade do frontend
- Familiaridade com programação funcional e Effect-TS

Priorize um projeto enxuto e completo. Não sacrifique funcionalidades obrigatórias para implementar bônus.

---

# 2. Objetivo

Construir um CRM fullstack com:

- Login e logout
- Cadastro e gerenciamento de leads
- Cadastro e gerenciamento de negócios
- Associação de negócios a vendedores
- Funil comercial em formato kanban
- Transição de negócios entre etapas
- Marcação de negócio como ganho ou perdido
- Comentários em leads e negócios
- Histórico de alteração de status
- Visualização dos detalhes de leads e negócios

Frontend e backend devem estar no mesmo repositório, em formato monorepo.

Referência visual:

https://www.figma.com/design/torONxnd1LUOplv6f9ccgA/Kiko---CRM?node-id=0-1

O Figma é uma referência. Não é necessário implementar uma interface pixel-perfect.

---

# 3. Stack

## Monorepo

- pnpm workspaces
- Turborepo
- TypeScript
- ESLint
- Prettier

Estrutura sugerida:

```text
/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   └── shared/
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── .env.example
└── README.md
```

Não crie pacotes ou abstrações sem uso real.

## Backend

- Node.js
- TypeScript com `strict: true`
- Fastify
- Effect-TS para serviços, operações de domínio e tratamento de erros
- PostgreSQL
- Drizzle ORM
- Zod ou Effect Schema
- JWT
- Argon2 ou bcrypt
- Vitest
- Swagger/OpenAPI

## Frontend

- React
- Vite
- TypeScript com `strict: true`
- React Router
- TanStack Query
- React Hook Form
- Zod
- Material UI
- dnd-kit
- Vitest
- React Testing Library

## Infraestrutura local

- Docker Compose para PostgreSQL
- `.env.example`
- Migrations
- Seed idempotente
- Scripts de desenvolvimento, build, lint, testes e typecheck

---

# 4. Diretrizes de TypeScript

A implementação deve demonstrar:

- Tipagem estrita
- Uniões discriminadas
- Inferência de tipos
- Imutabilidade quando aplicável
- Generics apenas quando agregarem valor
- Separação entre domínio, DTOs e persistência
- Ausência de `any`, salvo caso inevitável e documentado
- Ausência de assertions desnecessárias
- Estados inválidos difíceis de representar

Exemplo conceitual:

```ts
type DealOutcome =
  | { type: "OPEN" }
  | { type: "WON"; closedAt: Date }
  | { type: "LOST"; closedAt: Date; reason?: string };
```

Não copie obrigatoriamente esse modelo. Preserve o princípio de representar corretamente os estados do domínio.

---

# 5. Programação funcional e Effect-TS

Utilize programação funcional de forma pragmática:

- Funções puras para regras de negócio
- Imutabilidade
- Composição
- Efeitos colaterais isolados
- Tratamento explícito de erros
- Dependências injetadas
- Separação entre domínio e infraestrutura

Utilize Effect-TS principalmente em:

- Autenticação
- Criação de leads
- Criação e atualização de negócios
- Transições de status
- Marcação como ganho ou perdido
- Busca de entidades
- Serviços de domínio
- Repositórios
- Integração opcional com IA

Não transforme toda a aplicação em abstrações complexas apenas para aumentar o uso de Effect-TS.

---

# 6. Tratamento de erros

Evite exceções genéricas como mecanismo principal de controle de fluxo.

Crie erros tipados, como:

- `InvalidCredentialsError`
- `UnauthorizedError`
- `LeadNotFoundError`
- `DealNotFoundError`
- `SellerNotFoundError`
- `InvalidDealTransitionError`
- `ValidationError`
- `ConflictError`

Mapeie os erros para respostas HTTP adequadas:

- 400 — Bad Request
- 401 — Unauthorized
- 403 — Forbidden
- 404 — Not Found
- 409 — Conflict
- 422 — Unprocessable Entity
- 500 — Internal Server Error

Formato padrão:

```json
{
  "error": {
    "code": "DEAL_NOT_FOUND",
    "message": "Negócio não encontrado",
    "details": null
  }
}
```

Não exponha stack traces ou informações internas.

---

# 7. Arquitetura do backend

Organize o backend por módulos de negócio.

Estrutura sugerida:

```text
apps/api/src/
├── app/
│   ├── server.ts
│   ├── routes.ts
│   └── plugins/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── leads/
│   ├── deals/
│   └── comments/
├── shared/
│   ├── errors/
│   ├── http/
│   ├── database/
│   └── security/
└── main.ts
```

Cada módulo pode conter:

```text
module/
├── domain/
├── application/
├── infrastructure/
└── presentation/
```

Adapte quando necessário. Não crie camadas vazias.

Responsabilidades:

- Rotas lidam com HTTP.
- Casos de uso coordenam operações.
- Domínio contém regras de negócio.
- Repositórios abstraem persistência.
- Infraestrutura implementa banco e serviços externos.

---

# 8. Modelo de dados

## User

Campos:

- `id`
- `name`
- `email`
- `passwordHash`
- `role`
- `createdAt`
- `updatedAt`

Papéis:

- `ADMIN`
- `SELLER`

O vendedor deve ser representado pelo usuário com papel `SELLER`, evitando duplicação desnecessária.

## Lead

Campos:

- `id`
- `name`
- `email`
- `phone`
- `company`, opcional
- `source`, opcional
- `createdAt`
- `updatedAt`

Regras:

- Nome obrigatório
- E-mail válido quando informado
- Validação mínima de telefone
- Pode possuir vários negócios
- Pode possuir vários comentários

## Deal

Campos:

- `id`
- `title`
- `description`, opcional
- `value`
- `status`
- `leadId`
- `sellerId`
- `lostReason`, opcional
- `closedAt`, opcional
- `createdAt`
- `updatedAt`

Status:

- `NEW`
- `IN_PROGRESS`
- `PROPOSAL`
- `WON`
- `LOST`

Regras:

- Deve estar vinculado a um lead
- Deve estar vinculado a um vendedor
- Valor não pode ser negativo
- Negócio ganho deve estar em `WON`
- Negócio perdido deve estar em `LOST`
- Negócio encerrado só pode retornar ao funil por reabertura explícita
- Transições devem ser validadas no backend

Transições sugeridas:

```text
NEW -> IN_PROGRESS | LOST
IN_PROGRESS -> NEW | PROPOSAL | WON | LOST
PROPOSAL -> IN_PROGRESS | WON | LOST
WON -> apenas reabertura explícita
LOST -> apenas reabertura explícita
```

## Comment

Campos:

- `id`
- `content`
- `authorId`
- `leadId`, opcional
- `dealId`, opcional
- `createdAt`

Regras:

- Deve estar associado a um lead ou negócio
- Conteúdo não pode ser vazio
- Autor deve ser válido

## DealStatusHistory

Campos:

- `id`
- `dealId`
- `fromStatus`
- `toStatus`
- `changedBy`
- `createdAt`

Toda mudança de status deve:

1. Atualizar o negócio.
2. Registrar o histórico.
3. Executar ambas as operações na mesma transação.

---

# 9. Autenticação e autorização

Implemente:

- Login com e-mail e senha
- Logout no frontend
- Endpoint do usuário autenticado
- JWT com expiração
- Hash de senha
- Middleware de autenticação
- Rotas privadas

Endpoints:

```text
POST /api/v1/auth/login
GET  /api/v1/auth/me
```

Envio do token:

```text
Authorization: Bearer <token>
```

No frontend, centralize o acesso ao token.

Autorização:

- `ADMIN` visualiza todos os negócios.
- `SELLER` visualiza apenas os negócios sob sua responsabilidade.

Documente essa decisão no README.

---

# 10. API REST

Use o prefixo:

```text
/api/v1
```

## Health check

```text
GET /health
```

## Sellers

```text
GET /api/v1/sellers
```

## Leads

```text
GET    /api/v1/leads
POST   /api/v1/leads
GET    /api/v1/leads/:leadId
PATCH  /api/v1/leads/:leadId
GET    /api/v1/leads/:leadId/comments
POST   /api/v1/leads/:leadId/comments
```

A listagem deve suportar:

- Busca por nome, e-mail ou empresa
- Paginação
- Ordenação por nome ou data

Exemplo:

```text
GET /api/v1/leads?page=1&pageSize=20&search=maria&sortBy=createdAt&sortOrder=desc
```

## Negócios

```text
GET    /api/v1/deals
POST   /api/v1/deals
GET    /api/v1/deals/:dealId
PATCH  /api/v1/deals/:dealId
PATCH  /api/v1/deals/:dealId/status
POST   /api/v1/deals/:dealId/win
POST   /api/v1/deals/:dealId/lose
POST   /api/v1/deals/:dealId/reopen
GET    /api/v1/deals/:dealId/comments
POST   /api/v1/deals/:dealId/comments
```

Filtros:

- Status
- Vendedor
- Lead
- Busca textual

O endpoint do board deve retornar dados suficientes para montar o kanban sem múltiplas requisições desnecessárias.

---

# 11. Contratos compartilhados

Use `packages/shared` para:

- Enums
- Schemas públicos
- DTOs
- Paginação
- Tipos de resposta
- Códigos de erro

Não compartilhe entidades internas do banco nem detalhes de infraestrutura.

---

# 12. Frontend

Textos da interface em português.

Código, variáveis e commits em inglês.

Implemente:

## Login

Rota:

```text
/login
```

Recursos:

- E-mail
- Senha
- Validação
- Loading
- Erro para credenciais inválidas
- Redirecionamento após login

## Board

Rota principal:

```text
/deals/board
```

Colunas:

- Novos
- Em andamento
- Proposta
- Ganhos
- Perdidos

Cada card deve exibir:

- Título
- Lead
- Vendedor
- Valor
- Status
- Data de criação ou atualização

Ações:

- Abrir detalhes
- Alterar status
- Drag and drop
- Marcar como ganho
- Marcar como perdido
- Adicionar comentário

Ao mover um card:

1. Atualize a UI de forma otimista.
2. Envie a mudança à API.
3. Faça rollback se houver erro.
4. Exiba mensagem clara.

Também forneça uma alternativa acessível ao drag and drop, como um seletor de status.

## Lista de leads

Rota:

```text
/leads
```

Recursos:

- Busca
- Paginação
- Nome
- E-mail
- Telefone
- Empresa
- Quantidade de negócios
- Abrir detalhes
- Criar lead

## Criar lead

Rota:

```text
/leads/new
```

Campos:

- Nome
- E-mail
- Telefone
- Empresa
- Origem

## Detalhes do lead

Rota:

```text
/leads/:leadId
```

Exibir:

- Dados do lead
- Negócios relacionados
- Comentários
- Formulário de comentário
- Ação para criar negócio

## Criar negócio

Rota:

```text
/deals/new
```

Campos:

- Título
- Descrição
- Valor
- Lead
- Vendedor
- Status inicial

Quando iniciado a partir de um lead, ele deve vir previamente selecionado.

## Detalhes do negócio

Rota:

```text
/deals/:dealId
```

Exibir:

- Título
- Descrição
- Valor
- Lead
- Vendedor
- Status
- Resultado
- Datas
- Comentários
- Histórico de status

Ações:

- Alterar status
- Marcar como ganho
- Marcar como perdido
- Reabrir

Ao marcar como perdido, permita informar o motivo.

---

# 13. Estado e integração

Use TanStack Query para:

- Cache
- Loading
- Erros
- Invalidação
- Atualização otimista
- Rollback do kanban

Crie uma camada HTTP centralizada.

Não faça chamadas HTTP diretamente em componentes visuais.

Use React Hook Form e schemas para formulários.

Evite estado global desnecessário. Use contexto apenas para autenticação quando necessário.

---

# 14. Seed

Crie um seed idempotente com:

- Um administrador
- Pelo menos dois vendedores
- Pelo menos cinco leads
- Negócios em diferentes status
- Comentários
- Histórico de status

Credenciais locais:

```text
admin@kikos.local
Admin123!
```

```text
seller@kikos.local
Seller123!
```

Inclua essas credenciais apenas como demonstração local no README.

---

# 15. Testes

## Backend

Priorize:

- Login válido
- Login inválido
- Criação de lead
- Criação de negócio
- Negócio sem lead
- Negócio sem vendedor
- Transição válida
- Transição inválida
- Marcação como ganho
- Marcação como perdido
- Comentários
- Autorização de vendedor

Inclua testes unitários de domínio e testes de integração dos endpoints principais.

## Frontend

Priorize:

- Validação de login
- Formulário de lead
- Renderização do board
- Alteração de status
- Exibição de erros
- Atualização otimista e rollback

Não busque cobertura artificial de 100%.

---

# 16. Swagger

Disponibilize documentação em:

```text
/api/docs
```

Documente:

- Autenticação
- Payloads
- Respostas
- Erros
- Filtros
- Paginação
- Códigos HTTP

Mantenha os schemas coerentes com a validação real.

---

# 17. Segurança

Implemente:

- Hash seguro de senha
- Validação de entrada
- Proteção de rotas
- CORS configurável
- Helmet
- Rate limit no login
- Limite de body
- Secrets via ambiente
- Queries parametrizadas
- Logs sem senhas ou tokens
- Erros sem dados internos
- Renderização segura de comentários

---

# 18. Logs

Use logs estruturados com Fastify/Pino.

Registre:

- Método
- Rota
- Status
- Duração
- Request ID
- Erros inesperados

Não registre senhas, tokens ou dados pessoais completos.

---

# 19. Qualidade de interface

Implemente:

- Layout com sidebar ou header
- Navegação entre board e leads
- Toasts ou alerts
- Loading e skeletons
- Estados vazios
- Confirmações
- Valores em BRL
- Datas em formato brasileiro
- Responsividade básica
- Labels acessíveis
- Navegação por teclado quando aplicável

---

# 20. Bônus de IA

Implemente apenas depois que as funcionalidades principais estiverem prontas.

Funcionalidade sugerida:

## Resumo dos comentários do negócio

Adicionar a ação:

```text
Gerar resumo com IA
```

Comportamento:

- Reunir comentários
- Gerar resumo curto
- Apresentar resultado no frontend
- Tratar indisponibilidade
- Não bloquear o CRM

Crie uma abstração de serviço e providers:

- Provider real configurável
- Provider mock para desenvolvimento e testes

Variáveis:

```text
AI_PROVIDER=mock
AI_API_KEY=
AI_MODEL=
```

O modo mock deve funcionar sem chave externa.

Não envie dados pessoais desnecessários ao serviço.

Caso a IA prejudique o escopo, apenas documente a arquitetura prevista.

---

# 21. Docker e execução

Crie um `docker-compose.yml` para PostgreSQL.

Fluxo esperado:

```bash
pnpm install
docker compose up -d
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Scripts na raiz:

```json
{
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "test": "turbo test",
    "format": "prettier --write .",
    "db:migrate": "...",
    "db:seed": "..."
  }
}
```

Todos os comandos documentados devem funcionar.

---

# 22. Variáveis de ambiente

Backend:

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
```

Frontend:

```text
VITE_API_URL=http://localhost:3333/api/v1
```

Nunca versione secrets reais.

---

# 23. README

Crie um README profissional contendo:

1. Visão geral
2. Funcionalidades
3. Stack
4. Arquitetura
5. Estrutura do monorepo
6. Modelo de dados
7. Decisões técnicas
8. Execução local
9. Variáveis de ambiente
10. Migrations e seed
11. Credenciais de demonstração
12. Testes
13. Swagger
14. Funcionamento do kanban
15. Tratamento de erros
16. Uso de Effect-TS
17. Integração opcional com IA
18. Trade-offs
19. Melhorias futuras
20. Links de deploy, caso existam

Na seção de decisões técnicas, explique:

- Fastify
- PostgreSQL
- Drizzle
- Uso pragmático do Effect-TS
- Regras de transição
- Contratos compartilhados
- Atualização otimista
- Simplificações adotadas

Melhorias futuras sugeridas:

- Refresh token
- Recuperação de senha
- Permissões mais granulares
- Auditoria completa
- WebSocket
- Métricas e tracing
- Upload de anexos
- E-mail ou WhatsApp
- Filtros avançados
- Playwright
- AWS/Kubernetes
- Lead scoring com IA

---

# 24. Commits

Organize o trabalho em commits pequenos e coerentes.

Sugestão:

```text
chore: initialize pnpm monorepo
chore: configure linting formatting and typescript
feat(api): configure fastify server and health check
feat(api): add database schema and migrations
feat(api): implement authentication
feat(api): implement leads module
feat(api): implement deals and status transitions
feat(api): implement comments and deal history
feat(web): configure application shell and authentication
feat(web): implement leads management
feat(web): implement deals kanban board
feat(web): implement deal details and comments
test: add domain and integration tests
docs: add swagger and project documentation
feat(ai): add optional deal comments summary
```

Não altere a configuração global do Git e não faça push automaticamente.

---

# 25. Critérios de aceite

## Autenticação

- Login válido funciona
- Login inválido exibe erro
- Rotas privadas exigem autenticação
- Logout funciona

## Leads

- Listagem
- Busca
- Paginação
- Criação
- Detalhes
- Comentários
- Validações

## Negócios

- Criação vinculada a lead
- Associação obrigatória a vendedor
- Exibição no board
- Transições válidas
- Rejeição de transições inválidas
- Marcação como ganho
- Marcação como perdido
- Motivo da perda
- Histórico
- Comentários
- Detalhes
- Reabertura explícita

## Qualidade

- Projeto compila
- Typecheck passa
- Lint passa
- Testes passam
- Build passa
- Migrations funcionam
- Seed é idempotente
- Swagger abre
- README possui comandos válidos
- Não existem secrets versionados
- Não existem erros críticos no console
- Não existem TODOs críticos nas funcionalidades obrigatórias

---

# 26. Ordem de implementação

1. Inspecionar o repositório
2. Configurar monorepo
3. Configurar PostgreSQL e Drizzle
4. Criar schema, migrations e seed
5. Implementar autenticação
6. Implementar leads
7. Implementar negócios e transições
8. Implementar comentários e histórico
9. Implementar testes do backend
10. Configurar frontend
11. Implementar autenticação no frontend
12. Implementar leads
13. Implementar kanban
14. Implementar detalhes e comentários
15. Adicionar feedbacks e estados vazios
16. Configurar Swagger
17. Escrever README
18. Executar lint, typecheck, testes e build
19. Corrigir os problemas encontrados
20. Avaliar bônus de IA

---

# 27. Regras para execução

Durante o trabalho:

- Não invente requisitos externos
- Não use persistência em memória
- Não retorne dados falsos no frontend
- Não use `any` para contornar tipagem
- Não ignore erros do TypeScript
- Não desative lint sem justificativa
- Não crie abstrações sem benefício
- Não deixe endpoints privados desprotegidos
- Não exponha hash de senha
- Não faça alterações gigantes sem validação
- Não declare algo como validado sem executar o comando correspondente

Após cada etapa relevante:

1. Execute o typecheck.
2. Execute os testes relacionados.
3. Corrija erros antes de avançar.
4. Informe os arquivos principais alterados.
5. Explique brevemente as decisões.

Ao final:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Também valide migrations, seed e fluxos principais.

Informe:

- O que foi concluído
- Limitações reais
- Melhorias futuras
- Comandos executados
- Sugestão de commits

Não afirme que testes ou builds passaram caso não tenham sido realmente executados.

---

# 28. Prioridades

## Prioridade 1

- Monorepo
- Login
- Banco
- Leads
- Negócios
- Vendedores
- Kanban
- Alteração de status
- Ganho e perda
- Comentários
- README
- Validação
- Tratamento de erros

## Prioridade 2

- Testes
- Swagger
- Histórico
- Paginação
- Busca
- Atualização otimista
- Seed
- Segurança

## Prioridade 3

- Uso mais abrangente de Effect-TS
- IA
- Testes E2E
- Deploy
- Melhorias visuais avançadas

Nunca sacrifique funcionalidades obrigatórias para implementar bônus.

---

# Instrução inicial

Comece inspecionando o repositório e apresente um plano curto antes de modificar os arquivos.
