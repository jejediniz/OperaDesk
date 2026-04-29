# Arquitetura do OperaDesk

Este documento ajuda quem chega no projeto a saber **onde colocar código novo** e **quais limites respeitar**, sem misturar camadas.

## Visão em camadas

```text
app/                    Rotas Next.js: páginas finas + route handlers HTTP
  (app)/**/page.jsx       Importa telas de src/features/* (composição mínima)
  api/**/route.js         Orquestração: autentica valida entrada → chama src/server

src/features/           Interface por domínio (telas, hooks de tela, fluxo do usuário)
  *                       Não acessa banco diretamente; usa services/api e contexts

src/components/         UI reutilizável (ui, layout, auth, domínio pontual)
src/contexts/           Estado global React (sessão, tema, toasts, etc.)
src/hooks/              Hooks genéricos e React Query agregado
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

## Backend (`src/server`)

- **Route handlers** (`app/api/.../route.js`) devem permanecer finos: parse, política, chamar service, responder.
- **Autorização** centralizada em `src/server/auth/policies.js` (e helpers em `nextApi.js`).
- **Duas formas de dados:** a maioria das tabelas usa `pg` via repositories; **ativos** também usam Prisma (`src/lib/prisma.js`, `prisma/schema.prisma`). Migrações oficiais do schema SQL estão em `db/migrations/`.

## Frontend

- **`@/`** em imports aponta para `src/` (vide `tsconfig.json`).
- **Páginas** em `app/` não devem crescer com lógica pesada; prefira `src/features/<domínio>/`.
- **Telas grandes:** preferir um hook de orquestração no mesmo domínio (ex.: `features/chamados/useChamadosGestao.js` usado por `Chamados.js`) para manter o componente focado em JSX.
- **Componentes genéricos** em `src/components/ui/`; shell do app em `src/components/layout/`.

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
