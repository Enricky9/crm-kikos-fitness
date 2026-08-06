# FRONTEND_FIGMA.md

# Objetivo

Sua missão é reproduzir o frontend do CRM seguindo fielmente o design apresentado no Figma enviado pela Kikos Fitness.

A prioridade absoluta é a fidelidade visual. A aplicação deve transmitir a sensação de um produto pronto para produção.

## Regras Gerais

- O Figma é a fonte da verdade.
- Não utilize componentes padrão do Material UI sem customização.
- Caso exista conflito entre Material UI e o layout do Figma, priorize o layout do Figma.
- Mantenha consistência visual em todas as telas.

## Stack

- React
- TypeScript
- Material UI customizado
- React Router
- TanStack Query
- React Hook Form
- dnd-kit
- Framer Motion
- Sonner

## Tema

- Background: #0B0B0D
- Sidebar: #111115
- Cards: #17171F
- Inputs: #0E0E12
- Bordas: #2A2A36
- Texto principal: #FFFFFF
- Texto secundário: #9A9AA5
- Primária: #FF4D2D

## Layout

- Sidebar fixa
- Conteúdo principal
- Painel lateral de detalhes

## Sidebar

Itens:
- Dashboard
- Leads
- Negócios
- Vendedores

Rodapé com avatar, nome e cargo.

## Kanban

- dnd-kit
- Atualização otimista
- Rollback em erro
- Cards com hover, borda vermelha e sombra discreta

## Lista de Leads

- Busca
- Filtros
- Paginação
- Tabela moderna

## Formulários

Criar Lead e Criar Negócio em cards centralizados com grid de duas colunas.

## Login

Card centralizado com logo, formulário e botão principal vermelho.

## Responsividade

Desktop com sidebar fixa.
Tablet com sidebar colapsável.
Mobile com drawer e kanban horizontal.

## Material UI

Personalizar Theme, Palette, Typography, Buttons, Cards, Inputs, Tables, Chips e Drawer.

## Melhorias

- Skeleton Loading
- Empty States
- Toasts
- Debounce na busca
- Página 404
- Micro animações

## Objetivo Final

O resultado deve ser visualmente muito próximo do Figma e parecer um produto pronto para produção.
