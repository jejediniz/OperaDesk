# OperaDesk

OperaDesk é um sistema de chamados em Next.js, com frontend e API na mesma aplicação.

**Recursos principais**
- Autenticação com JWT e controle de permissões (admin, técnico, usuário)
- Cadastro e gestão de chamados com solicitante, técnico e histórico visual
- Atribuição/assunção de chamados pelos técnicos via painel dedicado
- Cadastro de usuários (rota protegida por admin)
- Dashboard com métricas básicas

**Estrutura do projeto**
- `app/` rotas, telas e API do Next.js (App Router + Route Handlers)
- `src/` componentes, contextos, serviços do frontend e camada server reutilizada pela API
- `src/server/` services, repositories, validações e conexão com PostgreSQL
- `db/schema.sql` schema base para PostgreSQL
- `db/init/` scripts de inicialização executados pelo Postgres no primeiro start

## Como rodar localmente

1. Copie `.env.example` para `.env`.
2. Instale dependências.
3. Rode a aplicação completa com banco e Next:

```bash
cp .env.example .env
npm install
npm run dev:full
```

A aplicação sobe em `http://localhost:3000`. As telas e a API rodam juntas:

- `GET /login`
- `GET /`
- `POST /api/auth/login`
- `GET /api/chamados`
- `GET /api/users`

## Variáveis de ambiente

- `JWT_SECRET` segredo do JWT
- `JWT_EXPIRES_IN` tempo de expiração do JWT (ex: `8h`)
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` conexão PostgreSQL

## Banco de dados

O PostgreSQL roda via Docker Compose:

```bash
npm run db:up
npm run db:down
npm run db:logs
```

O primeiro start cria as tabelas a partir de `db/schema.sql` e também cria um admin de desenvolvimento:

- Email: `admin@operadesk.local`
- Senha: `admin123`

Para recriar o banco do zero em desenvolvimento:

```bash
npm run db:reset
```

Esse comando apaga o volume local do PostgreSQL, então use apenas quando quiser limpar os dados.

## Documentação da API

- `GET /api/docs`: HTML simples com OpenAPI
- `GET /api/docs/openapi`: JSON OpenAPI

## Observações de segurança

- Tokens JWT são armazenados em `sessionStorage`
- Senhas são armazenadas com hash bcrypt
- Logs não incluem dados sensíveis
