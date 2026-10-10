# BookBuddy — roadmap удосконалення

Оновлюй чекбокси по мірі прогресу.

---

## 0. Monorepo та інфра репозиторію

- [x] Кореневий `server/package.json` + **pnpm workspaces** (`pnpm-workspace.yaml`)
- [x] Один `server/pnpm-lock.yaml` (lock-файли в сервісах прибрані)
- [x] Спільні `tsconfig.base.json`, Prettier, EditorConfig, `.nvmrc`
- [x] Спільний ESLint: `tooling/eslint/nest.mjs`
- [x] Пакет `@bookbuddy/shared` (заготовка)
- [x] `.env.example` у кожному сервісі
- [x] `pnpm install` з кореня `server/`
- [x] `pnpm run build` — усі workspace збираються
- [x] `pnpm run lint` — проходить (є warnings; суворіші правила — етап 5)
- [x] `pnpm run setup:env` — `.env` + вирівнювання `JWT_SECRET`

**Команди (з `server/`):**

```bash
pnpm install
pnpm run build
pnpm run lint
pnpm run format:check
pnpm run infra:up
pnpm --filter api-gateway run start:dev   # + auth, user, book, library, club, chat
```

---

## 1. Архітектурні швидкі перемоги

- [x] `AppError` + RMQ payload у `@bookbuddy/shared`; Nest filters у `@bookbuddy/nest-common` ([errors.md](./errors.md))
- [x] Прибрати імпорти `../../api-gateway/...` з мікросервісів (помилки, validation, timeout)
- [x] RMQ `cmd` + `RmqQueue` у `@bookbuddy/shared`
- [x] Gateway: лише HTTP + `ClientProxy` (без `connectMicroservice`)
- [x] Дефолти черг у `main.ts`; `durable: true`; library→book client на `book_queue`
- [x] Спільні DTO в shared + Swagger-обгортки в `api-gateway/src/dto/swagger/`
- [x] Доповнити `docs/architecture.md` діаграмою (клієнт → gateway → RMQ → сервіс)

---

## 2. Dev experience — «підняти зручно»

- [x] Docker: `docker/Dockerfile` + `docker-compose.apps.yml` (`pnpm run apps:up`); mongo healthchecks + `service_healthy` для apps
- [x] `pnpm run dev:all` (concurrently) + `pnpm run setup:env`
- [x] Health: `GET /health`, `GET /health/ready`
- [x] [docs/demo-swagger.md](./demo-swagger.md)
- [x] Readiness: `GET /health/ready` пінгує RabbitMQ

---

## 3. Структура коду (легкий DDD)

Еталон: **club** — [club-layers.md](./club-layers.md)

- [x] `transport/` — `club.listener.ts`
- [x] `application/` — `club.application.service.ts`
- [x] `domain/` — `club-membership.policy.ts`
- [x] `infrastructure/` — `club.repository.ts`

Пріоритетні правила:

- [x] **club** — один клуб на юзера, членство (policy + repo)
- [x] **user** — friend requests (policy + repos) — [user-layers.md](./user-layers.md)
- [x] **library** — [library-layers.md](./library-layers.md)
- [x] **book** — [book-layers.md](./book-layers.md)
- [x] **auth** — [auth-layers.md](./auth-layers.md) (RMQ + JWT, без Mongo)

---

## 4. Контракти між сервісами

- [x] Словник `cmd` у `@bookbuddy/shared` (`packages/shared/src/rmq/commands.ts`)
- [x] Єдиний формат помилок по RMQ → `RpcErrorInterceptor` + `BookbuddyHttpExceptionFilter` на gateway
- [x] Domain event `club.member.joined` (topic exchange `bookbuddy.domain` → user: сповіщення + analytics log)
- [x] Refresh token: httpOnly cookie на gateway (`POST /auth/refresh` — cookie або body для сумісності)

---

## 5. Якість і CI

- [x] GitHub Actions: `lint` + `build` + `format:check` + `test` — `.github/workflows/ci.yml`
- [x] Тести: `*.policy.spec.ts` у club / user / library
- [x] 1–2 e2e HTTP (`pnpm run e2e:run`)
- [x] application-layer tests (`pnpm run test:application`; у CI — `test:unit:extended`)
- [x] e2e: club member → notifications (`e2e/src/club-notifications.e2e-spec.ts`)
- [x] Сповіщення: idempotency `sourceEventId`, `unreadOnly`, mark read / read-all
- [x] E2E у CI (`docker compose` + `infra:replset` + `e2e-run.mjs`)
- [ ] Опційно testcontainers замість compose у CI
- [x] ESLint strict (`no-unsafe-*` + `require-await` → error) на сервісах + gateway

---

## 6. Backend без frontend (продуктовий API)

- [x] Domain events: `club.member.left`, `user.friend.request.sent`, `user.friend.request.accepted` → notifications
- [x] Gateway: проксі `/socket.io` → `SOCKET_CHAT_PORT` (chat)
- [x] Auth: refresh rotation (`jti` + Redis), `REVOKE_REFRESH` на logout
- [x] Auth: `POST /auth/forgot-password`, `POST /auth/reset-password` (токен у dev: `devResetToken`)
- [x] OAuth redirect на `CLIENT_URL` (`#accessToken=…`, refresh cookie на API host)
- [x] Окрема analytics queue (`analytics` → `analytics_events_queue`)
- [x] Husky + lint-staged (prettier на staged файлах)
- [x] Outbox для domain events (club + user → `domain_event_outbox` + processor)
- [x] Outbox: retry з backoff, стабільний `eventId`, relay у Rabbit (не напряму з application)
- [x] Outbox + membership/friends у Mongo transaction (`replicaSet=rs0` для user/club mongo)
- [x] Per-service readiness (`HealthCmd.PING` + `GET /health/ready` aggregate)
- [x] ESLint strict у `club`, `user`, `auth`, `library`, `book`, `chat`, `api-gateway`
- [x] e2e: friend notifications, password reset
- [x] Chat WS: Socket.IO Redis adapter (horizontal scale)
- [x] Rabbit DLX/DLQ + outbox dead-letter publish; admin replay API
- [x] Mongo migrations (`migrate-mongo`, `pnpm run migrate`)

---

## 7. Презентація (поруч із Deli)

| Deli                                | BookBuddy                              |
| ----------------------------------- | -------------------------------------- |
| Модульний моноліт, домени в модулях | Мікросервіси, DB per service, RabbitMQ |
| Простий локальний старт             | Розподілена система                    |

- [ ] Pitch 2–3 хв: проблема → схема → live Swagger
- [ ] (Опційно) мінімальний frontend або лише Swagger + README

---

## Monorepo — нагадування

- **Окремий `package.json` на сервіс** — норма: свої залежності й скрипти, окремий deploy/image.
- **Workspaces** — **pnpm** (`pnpm-workspace.yaml`, `packageManager` у root `package.json`).
- Після змін залежностей: завжди `pnpm install` з **`server/`**, не з підпапки сервісу.
