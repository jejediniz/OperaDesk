# Arquitetura do OperaDesk

Este documento ajuda quem chega no projeto a saber **onde colocar código novo** e **quais limites respeitar**, sem misturar camadas.

## Visão em camadas

```text
app/                    Rotas Next.js: páginas finas + route handlers HTTP
  (app)/**/page.jsx       Importa telas de src/features/* (composição mínima)
  api/**/route.js         Orquestração: autentica valida entrada → chama src/server

src/features/           Interface por domínio (telas, modais só daquele domínio, React Query do domínio)
  */use*Queries.js       TanStack Query relacionado ao domínio (ex.: chamados)
  *                       Não acessa banco diretamente; usa services/api e contexts

src/components/         UI reutilizável: ui/, layout/, auth guard (cross-cutting)
src/providers/          Composição dos providers globais da aplicação
src/contexts/           Estado global React (sessão, tema, toasts, etc.)
src/hooks/              Hooks genéricos (debounce, focus trap, etc.) — não React Query por domínio
src/services/api/       Cliente HTTP (fetch) para a API interna (/api/*)
src/constants/          Rótulos, mapas de status e constantes de domínio (front)
src/utils/              Formatadores e helpers sem efeitos colaterais

src/server/             Código **só Node** usado por app/api e por scripts internos
  services/             Regras de negócio e orquestração
  repositories/       SQL (pg) / persistência
  validators/           Joi
  http/ auth/ config/   Helpers de request, cookie, env, pool
```

**Regra prática:** alteração de regra de negócio ou persistência → `src/server/`. Alteração de tela ou fluxo do usuário → `src/features/` + `src/components/`. Chamadas do browser → `src/services/api/` (nunca `pg` ou Prisma no cliente).

## Guia de estrutura

Este projeto usa o App Router do Next.js. A regra geral é: `app/` define rotas e entradas HTTP, `src/features/` concentra telas por domínio, `src/components/` guarda peças reutilizáveis de UI, e `src/server/` contém tudo que roda no servidor.

### Pastas principais

| Caminho             | Responsabilidade                                                                                                             |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `app/`              | Rotas do Next.js: páginas, layouts, estados de loading/erro e route handlers em `app/api/`. Deve ser uma camada fina.        |
| `src/`              | Código principal da aplicação, separado por frontend reutilizável, features, cliente HTTP, servidor e utilitários.           |
| `src/features/`     | Telas e lógica de interface por domínio de negócio. É onde ficam componentes grandes de página e hooks específicos do fluxo. |
| `src/components/`   | Componentes reutilizáveis entre domínios: UI base, shell/layout e controles de autorização visual.                           |
| `src/contexts/`     | Estado global React: sessão, tema, toasts, confirmação, cache/query e chamados.                                              |
| `src/providers/`    | Composição dos providers globais usada pelo layout raiz.                                                                     |
| `src/hooks/`        | Hooks genéricos, sem vínculo forte com um domínio específico.                                                                |
| `src/services/api/` | Cliente HTTP usado pelo frontend para chamar `/api/*`. Não acessa banco diretamente.                                         |
| `src/server/`       | Código server-only usado por `app/api/*`: autenticação, validação, services, repositories, banco, logs e erros.              |
| `src/constants/`    | Constantes de domínio usadas principalmente pela UI, como status, filtros e rótulos.                                         |
| `src/lib/`          | Integrações pontuais compartilhadas, hoje o singleton Prisma.                                                                |
| `src/utils/`        | Funções puras de apoio para frontend, como formatadores.                                                                     |
| `src/styles/`       | CSS global complementar importado por `app/layout.jsx`.                                                                      |
| `db/`               | Migrações oficiais do banco e snapshot SQL de referência.                                                                    |
| `prisma/`           | Schema Prisma usado principalmente na área de ativos.                                                                        |
| `tests/`            | Testes Vitest, hoje focados na camada de servidor.                                                                           |
| `docs/`             | Documentação técnica complementar.                                                                                           |
| `public/`           | Arquivos públicos servidos diretamente pelo Next, como imagens usadas pela UI e manifest.                                    |
| `scripts/`          | Scripts utilitários executados manualmente.                                                                                  |
| `.husky/`           | Git hooks locais. O `pre-commit` roda `lint-staged`.                                                                         |
| `.vscode/`          | Configurações recomendadas para VS Code.                                                                                     |

### Arquivos da raiz

| Arquivo                | O que significa                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| `README.md`            | Guia principal de setup, estrutura, comandos e convenções.                                  |
| `docs/ARCHITECTURE.md` | Regras de arquitetura, limites entre camadas e inventário detalhado da estrutura.           |
| `package.json`         | Scripts NPM, dependências, `lint-staged` e configuração do projeto Node.                    |
| `package-lock.json`    | Lockfile das dependências instaladas via npm.                                               |
| `.env.example`         | Modelo das variáveis de ambiente necessárias.                                               |
| `.env`                 | Variáveis locais reais. Não deve ser usado como documentação nem versionado com segredos.   |
| `docker-compose.yml`   | Sobe Postgres e Redis para desenvolvimento local.                                           |
| `next.config.js`       | Configuração do Next.js.                                                                    |
| `proxy.js`             | Boundary de rede do Next: valida JWT e protege rotas do painel antes de chegar nas páginas. |
| `instrumentation.js`   | Inicialização server-side usada pelo Next para bootstrap da aplicação.                      |
| `eslint.config.mjs`    | Configuração flat do ESLint.                                                                |
| `.prettierrc.json`     | Regras de formatação do Prettier.                                                           |
| `.prettierignore`      | Arquivos ignorados pelo Prettier.                                                           |
| `.editorconfig`        | Padrão básico de editor: indentação, charset e fim de linha.                                |
| `postcss.config.mjs`   | Configuração do PostCSS/Tailwind.                                                           |
| `tsconfig.json`        | Configuração TypeScript e alias `@/*` para `src/*`.                                         |
| `next-env.d.ts`        | Arquivo gerado/controlado pelo Next para tipos globais.                                     |
| `tsconfig.tsbuildinfo` | Cache incremental do TypeScript.                                                            |
| `vitest.config.mjs`    | Configuração dos testes Vitest.                                                             |

### Rotas e arquivos em `app/`

| Caminho                                 | O que faz                                                 |
| --------------------------------------- | --------------------------------------------------------- |
| `app/layout.jsx`                        | Layout raiz: importa CSS global, fontes e `AppProviders`. |
| `app/globals.css`                       | Entrada global de CSS/Tailwind.                           |
| `app/error.jsx`                         | Tela de erro global do App Router.                        |
| `app/not-found.jsx`                     | Tela 404 global.                                          |
| `app/icon.png`                          | Ícone da aplicação.                                       |
| `app/(app)/layout.jsx`                  | Layout das páginas autenticadas, com shell protegido.     |
| `app/(app)/page.jsx`                    | Página inicial/dashboard autenticado.                     |
| `app/(app)/loading.jsx`                 | Loading compartilhado das rotas autenticadas.             |
| `app/(app)/abrir-chamado/page.jsx`      | Página para usuário abrir chamado e metadata da rota.     |
| `app/(app)/ativos/page.jsx`             | Listagem/gestão de ativos e metadata da rota.             |
| `app/(app)/ativos/novo/page.jsx`        | Cadastro de ativo e metadata da rota.                     |
| `app/(app)/ativos/[id]/page.jsx`        | Detalhes de um ativo e metadata da rota.                  |
| `app/(app)/ativos/[id]/editar/page.jsx` | Edição de um ativo e metadata da rota.                    |
| `app/(app)/chamados/page.jsx`           | Gestão/listagem de chamados e metadata da rota.           |
| `app/(app)/meus-chamados/page.jsx`      | Chamados do usuário comum e metadata da rota.             |
| `app/(app)/usuarios/page.jsx`           | Listagem/gestão de usuários e metadata da rota.           |
| `app/(app)/usuarios/novo/page.jsx`      | Cadastro de usuário e metadata da rota.                   |
| `app/login/page.jsx`                    | Tela pública de login e metadata da rota.                 |
| `app/login/loading.jsx`                 | Loading da rota de login.                                 |
| `app/dev/ui/page.jsx`                   | Galeria interna de componentes de UI.                     |
| `app/dev/ui/DevUiGallery.jsx`           | Implementação da galeria de UI.                           |

Evite criar layouts locais que apenas retornam `children`. Quando a rota não precisa de shell próprio, coloque `metadata` diretamente no `page.jsx`.

### APIs em `app/api/`

| Caminho                                     | O que expõe                                |
| ------------------------------------------- | ------------------------------------------ |
| `app/api/auth/login/route.js`               | Login e criação de sessão.                 |
| `app/api/auth/logout/route.js`              | Encerramento de sessão.                    |
| `app/api/auth/me/route.js`                  | Usuário autenticado atual.                 |
| `app/api/auth/register/route.js`            | Registro/cadastro via API.                 |
| `app/api/users/route.js`                    | Listagem e criação de usuários.            |
| `app/api/users/[id]/route.js`               | Operações em um usuário específico.        |
| `app/api/users/me/route.js`                 | Dados/ações do próprio usuário.            |
| `app/api/users/tecnicos/route.js`           | Lista de técnicos para atribuição.         |
| `app/api/chamados/route.js`                 | Listagem e criação de chamados.            |
| `app/api/chamados/[id]/route.js`            | Detalhe e atualização de chamado.          |
| `app/api/chamados/[id]/interacoes/route.js` | Mensagens/interações de um chamado.        |
| `app/api/chamados/metrics/route.js`         | Métricas do dashboard.                     |
| `app/api/ativos/route.js`                   | Listagem e criação de ativos.              |
| `app/api/ativos/[id]/route.js`              | Detalhe, edição e remoção lógica de ativo. |
| `app/api/ativos/bulk-inativar/route.js`     | Inativação em massa de ativos.             |
| `app/api/ativos/export/route.js`            | Exportação de ativos.                      |
| `app/api/ativos/resumo/route.js`            | Resumo/métricas de ativos.                 |
| `app/api/docs/route.js`                     | Página/endpoint de documentação de API.    |
| `app/api/docs/openapi/route.js`             | Documento OpenAPI.                         |
| `app/api/health/route.js`                   | Health check principal.                    |
| `app/api/health/live/route.js`              | Liveness check simples.                    |

Route handlers devem validar entrada, aplicar autenticação/autorização, chamar `src/server/services/*` e devolver resposta. Regra de negócio não deve crescer dentro de `app/api`.

### Frontend em `src/`

| Caminho                            | O que contém                                                                                                                   |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `src/providers/AppProviders.jsx`   | Encadeia Theme, Query, Toast, Confirm, Auth e Chamados providers.                                                              |
| `src/components/ui/*`              | Componentes base: `Button`, `Card`, `Input`, `Select`, `Textarea`, `Skeleton`, `EmptyState`, `PageHeader` e barrel `index.js`. |
| `src/components/layout/*`          | Shell da aplicação: cabeçalho, rodapé, container, tema, atalhos, loading, anúncio de rota e proteção visual.                   |
| `src/components/auth/RoleGuard.js` | Exibe ou bloqueia trechos da UI conforme papel/permissão.                                                                      |
| `src/contexts/authContext.js`      | Sessão do usuário e operações de auth no cliente.                                                                              |
| `src/contexts/chamadosContext.js`  | Estado compartilhado relacionado a chamados.                                                                                   |
| `src/contexts/confirmContext.js`   | Modal/fluxo global de confirmação.                                                                                             |
| `src/contexts/queryProvider.js`    | Provider do TanStack Query.                                                                                                    |
| `src/contexts/themeContext.js`     | Tema visual persistido.                                                                                                        |
| `src/contexts/toastContext.js`     | Notificações/toasts globais.                                                                                                   |
| `src/hooks/useAnimatedNumber.js`   | Anima valores numéricos na UI.                                                                                                 |
| `src/hooks/useDebouncedValue.js`   | Debounce genérico para inputs/filtros.                                                                                         |
| `src/hooks/useFocusTrap.js`        | Mantém foco preso em modais/overlays.                                                                                          |
| `src/hooks/usePersistentState.js`  | Estado React sincronizado com storage.                                                                                         |
| `src/services/api/http.js`         | Wrapper `fetch` para chamadas internas.                                                                                        |
| `src/services/api/chamadosApi.js`  | Cliente das APIs de chamados.                                                                                                  |
| `src/services/api/ativosApi.js`    | Cliente das APIs de ativos.                                                                                                    |
| `src/services/api/usuariosApi.js`  | Cliente das APIs de usuários.                                                                                                  |
| `src/constants/chamados.js`        | Status, prioridades, rótulos e filtros de chamados.                                                                            |
| `src/constants/ativos.js`          | Status, rótulos e opções da área de ativos.                                                                                    |
| `src/styles/index.css`             | Tokens/utilitários visuais complementares.                                                                                     |
| `src/utils/formatters.js`          | Formatadores de data, texto e valores usados pela UI.                                                                          |
| `src/lib/prisma.js`                | Singleton Prisma Client para evitar múltiplas conexões em dev.                                                                 |

### Features em `src/features/`

| Caminho                                | O que contém                                                                                                                                  |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/features/dashboard/`              | Dashboard inicial: `Inicio`, cards de métricas, painéis, modal e hook `useDashboardData`.                                                     |
| `src/features/chamados/`               | Telas e componentes de chamados: listas, linha de tabela, toolbar, seleção em massa, modais, chamado rápido e hooks de ações/filtros/queries. |
| `src/features/ativos/`                 | Telas de patrimônio: listagem, detalhes, formulário, edição, badge de status e slide-over.                                                    |
| `src/features/usuarios/`               | Listagem e criação de usuários.                                                                                                               |
| `src/features/auth/`                   | Login e modal de alteração de senha.                                                                                                          |
| `src/features/common/NaoEncontrada.js` | Tela compartilhada para estado de não encontrado.                                                                                             |

### Servidor em `src/server/`

| Caminho                                    | O que contém                                                                                  |
| ------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `src/server/bootstrap.js`                  | Inicialização server-side chamada pela instrumentação.                                        |
| `src/server/config/env.js`                 | Leitura e validação de variáveis de ambiente.                                                 |
| `src/server/config/database.js`            | Pool Postgres via `pg`.                                                                       |
| `src/server/auth/policies.js`              | Políticas de autorização por papel/permissão.                                                 |
| `src/server/http/nextApi.js`               | Barrel dos helpers HTTP usados pelos route handlers.                                          |
| `src/server/http/auth.js`                  | Leitura de token e autenticação JWT.                                                          |
| `src/server/http/cookies.js`               | Opções, leitura, criação e limpeza do cookie de auth.                                         |
| `src/server/http/request.js`               | Leitura de body, query params, params dinâmicos, IP e validação Joi.                          |
| `src/server/http/response.js`              | Respostas JSON padronizadas, request id, tratamento de erro e status HTTP.                    |
| `src/server/http/coerceAtivosListQuery.js` | Normalização específica da query de listagem de ativos.                                       |
| `src/server/services/*Service.js`          | Regras de negócio e orquestração de auth, usuários, chamados, interações, auditoria e ativos. |
| `src/server/repositories/*Repository.js`   | Persistência SQL via `pg` para usuários, chamados, interações e auditoria.                    |
| `src/server/validators/*Schemas.js`        | Schemas Joi para validar entrada das APIs.                                                    |
| `src/server/docs/openapi.js`               | Definição OpenAPI servida por `app/api/docs/openapi`.                                         |
| `src/server/utils/AppError.js`             | Erro de aplicação com status HTTP e detalhes.                                                 |
| `src/server/utils/logger.js`               | Logger estruturado da aplicação.                                                              |
| `src/server/utils/rateLimit.js`            | Rate limit, com Redis opcional e fallback em memória.                                         |
| `src/server/utils/*.d.ts`                  | Tipos auxiliares para módulos JavaScript usados pelo TypeScript.                              |

### Banco, assets, scripts e testes

| Caminho                                | O que significa                                                    |
| -------------------------------------- | ------------------------------------------------------------------ |
| `db/migrations/*.js`                   | Migrações oficiais executadas por `node-pg-migrate`.               |
| `db/schema.sql`                        | Snapshot SQL para consulta humana; não é aplicado automaticamente. |
| `prisma/schema.prisma`                 | Modelo Prisma usado principalmente por ativos.                     |
| `public/img/*`                         | Imagens da marca usadas pela UI.                                   |
| `public/manifest.webmanifest`          | Manifest PWA/metadados do app.                                     |
| `public/robots.txt`                    | Regras para crawlers.                                              |
| `scripts/migrate-ativos-od-tokens.mjs` | Script de migração de tokens/estilo da área de ativos.             |
| `tests/setup.js`                       | Setup global dos testes.                                           |
| `tests/server/*.test.js`               | Testes de serviços, políticas, logger e rate limit.                |
| `tests/server/http/*.test.js`          | Testes dos helpers HTTP.                                           |
| `tests/server/validators/*.test.js`    | Testes dos schemas Joi.                                            |

Alias TypeScript/JavaScript: `@/*` → `src/*`.

### Arquivos que normalmente não devem receber regra de negócio

| Caminho               | Orientação                                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `app/**/page.jsx`     | Deve compor/importar telas de `src/features`, não concentrar lógica complexa.                                            |
| `app/api/**/route.js` | Deve orquestrar HTTP, não virar service.                                                                                 |
| `src/components/ui/`  | Deve ser genérico. Se conhece regra de chamados, ativos ou usuários, provavelmente pertence a `src/features/<domínio>/`. |
| `src/services/api/`   | Só chama API pelo browser. Banco, Prisma, `pg`, JWT e regras server-only ficam em `src/server/`.                         |

## Backend (`src/server`)

- **Route handlers** (`app/api/.../route.js`) devem permanecer finos: parse, política, chamar service, responder.
- **Autorização** centralizada em `src/server/auth/policies.js` (e helpers HTTP em `src/server/http/nextApi.js`).
- **Duas formas de dados:** a maioria das tabelas usa `pg` via repositories; **ativos** também usam Prisma (`src/lib/prisma.js`, `prisma/schema.prisma`). Migrações oficiais do schema SQL estão em `db/migrations/`.

## Frontend

- **`@/`** em imports aponta para `src/` (vide `tsconfig.json`).
- **Páginas** em `app/` não devem crescer com lógica pesada; prefira `src/features/<domínio>/`.
- **Telas grandes:** preferir um hook de orquestração no mesmo domínio (ex.: `features/chamados/useChamadosGestao.js` usado por `Chamados.js`) para manter o componente focado em JSX.
- **Componentes genéricos** em `src/components/ui/`; shell do app em `src/components/layout/`.
- **Componentes e hooks específicos de um domínio** em `src/features/<domínio>/` (não criar `src/components/<domínio>/` só para telas dessa área).

## Bibliotecas e utilitários

- **`src/lib/`** integrações pontuais (ex.: cliente Prisma). **`src/utils/`** funções puras sem IO.

## Onde procurar por funcionalidade

| Área          | Front (UI)                  | API (HTTP)                 | Servidor / dados                  |
| ------------- | --------------------------- | -------------------------- | --------------------------------- |
| Chamados      | `features/chamados`         | `app/api/chamados`         | `server/services/chamados*`       |
| Ativos        | `features/ativos`           | `app/api/ativos`           | `server/services/ativosService`   |
| Usuários      | `features/usuarios`         | `app/api/users`            | `server/services/userService`     |
| Auth / sessão | `features/auth`, `contexts` | `app/api/auth`             | `server/services/authService`     |
| Dashboard     | `features/dashboard`        | `app/api/chamados/metrics` | `server/services/chamadosService` |

## Conexão com banco e variáveis

- Pool Postgres: `src/server/config/database.js`. Variáveis: `src/server/config/env.js` e `.env.example`.
- Documentação de setup: `README.md` na raiz.

## Testes

- `tests/` — Vitest, testa principalmente módulos em `src/server/` (serviços, validators, utilitários).
