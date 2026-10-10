# Demo flow (Swagger)

Prerequisites: `pnpm run infra:up`, `pnpm run setup:env`, `pnpm run seed:books`, `pnpm run dev:all` (from `server/`).

Open: http://localhost:3000/api

## 1. Auth

1. **POST** `/auth/registration` — email, password, name.
2. Response: `accessToken`, `user`; refresh — httpOnly cookie `refreshToken` (path `/auth`).
3. Swagger **Authorize** → `Bearer <accessToken>`.
4. When access expires: **POST** `/auth/refresh` (browser sends cookie) or body `{ "refreshToken": "..." }` for API clients.

Registration creates the user, default library shelves (via user → library RPC), and tokens.

## 2. Profile & friends

1. **GET** `/user/me/friends` — your friends (empty at first).
2. **GET** `/user/{id}` — only your own id (or admin).
3. **POST** `/user/friend-request` — body `{ "receiverId": "<otherUserId>" }`.

## 3. Books (catalog public)

1. **GET** `/book` — list (no auth required).
2. **GET** `/book/{id}` — detail.

## 4. Library

1. **GET** `/library/me` — five default shelves + any custom lists.
2. Pick a shelf `_id` from the response (e.g. `WANNA_READ`).
3. **POST** `/library/books` — `{ "bookId": "...", "libraryId": "..." }`.

## 5. Club & chat

1. **POST** `/club` — multipart: `name`, `description` (you are admin via JWT).
2. **POST** `/club/{id}/members` — `{ "userId": "<friendId>" }`.
3. **POST** `/chats/send-message` — `{ "clubId": "...", "message": "Hello" }`.
4. **GET** `/chats/club/{clubId}/messages`.

## Health

- **GET** `/health`, **GET** `/health/ready` — no auth.
