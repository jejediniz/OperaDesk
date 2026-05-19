# OperaDesk

## Finalidade

O **OperaDesk** é um sistema web de gestão de chamados de suporte/operacional, construído em Next.js (App Router). Oferece painel para administradores e equipe de TI, área para usuários comuns abrirem e acompanharem chamados, gestão de usuários e patrimônio (ativos). A autenticação usa JWT em cookie `httpOnly`, com papéis (admin, técnico, usuário comum).

## Stack

- Next.js 16 (App Router, Route Handlers, `proxy.js` no boundary de rede com validação JWT)
- React 19, React Query 5, Joi 17, bcrypt 6
- PostgreSQL (migrações com `node-pg-migrate`); Prisma Client usado na camada de **ativos**
- Redis 7 opcional no `docker-compose` para rate limit distribuído no login (`REDIS_URL`)
- Vitest para testes; ESLint flat config; Prettier; Husky + lint-staged

## Como rodar localmente

1. Copie `.env.example` para `.env` e preencha `JWT_SECRET` (por exemplo: `openssl rand -base64 48`).
2. Instale dependências e suba o Postgres.
3. Rode as migrações e o servidor de desenvolvimento.

```bash
cp .env.example .env
npm install
npm run db:up
npm run db:migrate
npm run dev
```

Ou em um único passo (sobe Postgres e Next):

```bash
npm run dev:full
```

Aplicação em `http://localhost:3000`. Usuário administrador de desenvolvimento criado pela migration de seed (somente quando `NODE_ENV !== 'production'`): **admin@operadesk.local**.

## Variáveis de ambiente

| Variável              | Descrição                                                                                                      |
| --------------------- | -------------------------------------------------------------------------------------------------------------- |
| `JWT_SECRET`          | ≥32 caracteres; em produção valores fracos abortam o boot                                                      |
| `JWT_EXPIRES_IN`      | Ex.: `8h`, `24h`                                                                                               |
| `BCRYPT_ROUNDS`       | Custo do bcrypt; mínimo 12 em produção                                                                         |
| `AUTH_COOKIE_NAME`    | Nome do cookie; em produção recebe prefixo `__Host-` automático                                                |
| `AUTH_COOKIE_MAX_AGE` | Tempo de vida em segundos                                                                                      |
| `LOG_LEVEL`           | `debug` \| `info` \| `warn` \| `error`                                                                         |
| `DB_*`                | Conexão Postgres (vide `.env.example`)                                                                         |
| `DATABASE_URL`        | Usada pelo `node-pg-migrate`                                                                                   |
| `REDIS_URL`           | Opcional: rate limit de login distribuído (ex.: `redis://localhost:6379`); sem isso o contador fica em memória |

Detalhes adicionais de segurança e endpoints permanecem alinhados à implementação em `app/api/` e `src/server/`.

Para uma visão de **camadas e responsabilidades** (onde colocar código novo), veja [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Estrutura do projeto

O README mantém apenas o mapa de entrada. O detalhamento de cada pasta, arquivo e limite arquitetural fica em [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

| Caminho             | Responsabilidade principal                                                                                       |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `app/`              | Rotas do Next.js: páginas, layouts, estados de loading/erro e route handlers em `app/api/`.                      |
| `src/features/`     | Telas e lógica de interface por domínio: dashboard, chamados, ativos, usuários e autenticação.                   |
| `src/components/`   | Componentes reutilizáveis de UI, layout e controle visual de permissão.                                          |
| `src/contexts/`     | Estado global React: sessão, tema, toasts, confirmação, query e chamados.                                        |
| `src/providers/`    | Composição dos providers globais usada pelo layout raiz.                                                         |
| `src/services/api/` | Cliente HTTP usado pelo frontend para chamar `/api/*`.                                                           |
| `src/server/`       | Código server-only usado pelas APIs: services, repositories, validators, autenticação, HTTP, banco, logs e erro. |
| `db/`               | Migrações oficiais do banco e snapshot SQL de referência.                                                        |
| `prisma/`           | Schema Prisma usado principalmente na área de ativos.                                                            |
| `tests/`            | Testes Vitest, hoje focados na camada de servidor.                                                               |
| `public/`           | Assets públicos, como logos, manifest e robots.                                                                  |
| `scripts/`          | Scripts utilitários executados manualmente.                                                                      |

Regra prática: tela ou fluxo de usuário fica em `src/features/`; regra de negócio e persistência ficam em `src/server/`; páginas e route handlers em `app/` devem permanecer finos.

Alias TypeScript/JavaScript: `@/*` → `src/*`.

## Onde alterar (mapa rápido)

| Área                    | Onde mexer                                                                                                                                                                         |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dashboard (início)**  | `src/features/dashboard/` (`Inicio.js`, `MetricsGrid.js`, `DashboardPanels.js`, `useDashboardData.js`, …) e rota `app/(app)/page.jsx`                                              |
| **Chamados**            | `src/features/chamados/` (telas, modais, `useChamadosQueries.js`); API em `app/api/chamados/`; regras em `src/server/services/chamadosService.js` e repositórios relacionados      |
| **Usuários**            | `src/features/usuarios/`; `app/(app)/usuarios/`; `app/api/users/`; `src/server/services/userService.js`                                                                            |
| **Ativos / patrimônio** | `src/features/ativos/`; `app/(app)/ativos/`; `app/api/ativos/`; `src/server/services/ativosService.js` (Prisma)                                                                    |
| **Autenticação**        | `src/features/auth/Login.js`; `app/login/`; `app/api/auth/`; `src/server/services/authService.js`; contexto `src/contexts/authContext.js`; políticas `src/server/auth/policies.js` |
| **Conexão com banco**   | Pool SQL: `src/server/config/database.js`; variáveis: `src/server/config/env.js`; migrações: `db/migrations/`; Prisma: `prisma/schema.prisma` e `src/lib/prisma.js`                |
| **Estilos globais**     | `app/globals.css` (entrada Tailwind 4); tokens e utilitários em `src/styles/index.css` (import em `app/layout.jsx`)                                                                |

## Comandos principais

| Comando                                   | Uso                                                                |
| ----------------------------------------- | ------------------------------------------------------------------ |
| `npm install`                             | Instalar dependências (dispara `prisma generate` no `postinstall`) |
| `npm run dev`                             | Servidor de desenvolvimento Next                                   |
| `npm run dev:full`                        | Sobe Postgres (e Redis do compose) + Next                          |
| `npm run build`                           | Build de produção                                                  |
| `npm start`                               | Servidor após `build`                                              |
| `npm run lint` / `npm run lint:fix`       | ESLint                                                             |
| `npm run format` / `npm run format:check` | Prettier                                                           |
| `npm run typecheck`                       | `tsc --noEmit`                                                     |
| `npm test` / `npm run test:watch`         | Vitest                                                             |
| `npm run db:migrate`                      | Aplica migrações (`node-pg-migrate`, usa `DATABASE_URL` no `.env`) |
| `npm run db:migrate:down`                 | Reverte última migração                                            |
| `npm run db:migrate:create <nome>`        | Cria arquivo de migração                                           |
| `npm run db:reset`                        | Derruba compose e volume (**somente dev**)                         |

## Banco de dados

A criação e evolução das tabelas é feita com `node-pg-migrate`. O `docker-compose` sobe um Postgres limpo. O arquivo `db/schema.sql` é apenas referência humana.

## CI

O workflow `.github/workflows/ci.yml` executa lint, format, typecheck, build, migrações e testes.

## Convenções

- Commits e branches em inglês são preferidos.
- Código novo em camelCase / PascalCase. Nomes de negócio em português podem permanecer onde já existem para reduzir impacto.
- Para ajustes pequenos de estilo: `npm run lint:fix && npm run format`.

## Limpeza recente da arquitetura (manutenção)

- Pastas renomeadas/organizadas: `contexts`, `constants`, `features`, `components/layout`, `services/api`.
- Removidos: `src/services/api.js` (shim sem uso) e `src/constants/perfis.js` (sem referências no código).
- A camada `src/server/` foi mantida no mesmo caminho para não quebrar dezenas de imports em `app/api/` e testes; ela corresponde à “camada de serviços” no servidor.
