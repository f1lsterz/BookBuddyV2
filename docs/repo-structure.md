# Структура репозиторію BookBuddyV2

## Де що лежить

```
BookBuddyV2/                 ← папка workspace в IDE (git тут може не бути)
├── README.md                ← короткий вказівник → server/
└── server/                  ← **корінь git-репозиторію** + backend monorepo
    ├── .github/workflows/   ← CI тільки тут (корінь репо = server/)
    │   └── ci.yml
    ├── api-gateway/         ← HTTP + Swagger
    ├── auth/ user/ book/ library/ club/ chat/
    ├── packages/
    │   ├── shared/          ← DTO, cmd, помилки
    │   └── nest-common/     ← Nest filters/interceptors
    ├── docs/                ← архітектура, roadmap, demo
    ├── docker/              ← Dockerfile для сервісів
    ├── tooling/             ← eslint, jest, scripts
    ├── package.json
    ├── pnpm-workspace.yaml
    └── pnpm-lock.yaml
```

## Де лежить `.github`

**Git root у цьому проєкті — каталог `server/`.**  
GitHub Actions підхоплює лише **`server/.github/workflows/ci.yml`**.

Папка `BookBuddyV2/.github/` **поза репозиторієм** (якщо `.git` лише в `server/`) — її треба **не тримати**; вона нічого не запускає на GitHub і лише плутає в Explorer.

## Де читати документацію

| Тема            | Файл                                 |
| --------------- | ------------------------------------ |
| Запуск локально | [server/README.md](../README.md)     |
| Архітектура     | [architecture.md](./architecture.md) |
| План робіт      | [roadmap.md](./roadmap.md)           |
| Swagger demo    | [demo-swagger.md](./demo-swagger.md) |

Nest-дефолтні `README.md` у підпапках сервісів — короткі вказівки; **канонічна** документація в `server/README.md` і `server/docs/`.
