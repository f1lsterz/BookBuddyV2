# BookBuddy — backend

NestJS microservices + RabbitMQ, MongoDB per service, Redis cache.

**План:** [docs/roadmap.md](./docs/roadmap.md) · **Demo (Swagger):** [docs/demo-swagger.md](./docs/demo-swagger.md)

## Monorepo (pnpm workspaces)

Усі команди — з каталогу **`server/`**. Потрібен [pnpm](https://pnpm.io/) 9+ (`corepack enable`).

| Що         | Де                                                     |
| ---------- | ------------------------------------------------------ |
| Workspaces | `pnpm-workspace.yaml` — ті самі сервіси + `packages/*` |
| Lockfile   | `pnpm-lock.yaml`                                       |

## Prerequisites

- Node.js 20+ (`.nvmrc`)
- **pnpm 9** — `corepack enable` (або `npm exec pnpm@9.15.9 …`, якщо corepack на Windows дає EPERM)
- Docker Desktop (інфраструктура)

## Local dev (рекомендовано)

```bash
pnpm install
pnpm run infra:up
pnpm run setup:env    # .env.example → .env (не перезаписує існуючі)
```

Вирівняй **`JWT_SECRET`** у всіх `.env` (однакове значення).

```bash
pnpm run dev:all      # gateway + 6 мікросервісів (watch mode)
```

- API: http://localhost:3000
- Swagger: http://localhost:3000/api
- Health: http://localhost:3000/health
- RabbitMQ UI: http://localhost:15672 (`user` / `password`)

## Docker (усі Nest-сервіси в контейнерах)

Після `pnpm run setup:env` і зміни секретів:

```bash
pnpm run infra:up
pnpm run apps:up      # build images + api-gateway, auth, user, …
```

Зупинка: `pnpm run apps:down` та `pnpm run infra:down`.

## Scripts

| Command                            | Description                                       |
| ---------------------------------- | ------------------------------------------------- |
| `pnpm run dev:all`                 | Усі сервіси в dev (concurrently)                  |
| `pnpm run build:services`          | Паралельний build лише Nest-сервісів (після libs) |
| `pnpm run setup:env`               | Створити `.env` з прикладів                       |
| `pnpm run build` / `lint`          | Monorepo                                          |
| `pnpm run e2e:run`                 | E2E (infra + build + seed + HTTP tests)           |
| `pnpm run test:e2e`                | E2E HTTP (стек уже запущений)                     |
| `pnpm run infra:up` / `infra:down` | Rabbit, Redis, Mongo                              |
| `pnpm run apps:up` / `apps:down`   | Nest у Docker (+ infra)                           |

## Documentation

- [Repo structure (git root = `server/`, CI в `.github`)](./docs/repo-structure.md)
- [Architecture](./docs/architecture.md)
- [Error handling](./docs/errors.md)
- [Demo Swagger](./docs/demo-swagger.md)
- [Roadmap](./docs/roadmap.md)
