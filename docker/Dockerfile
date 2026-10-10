# Build any BookBuddy workspace service from monorepo root (server/).
# Example: docker build -f docker/Dockerfile --build-arg START_CMD="node auth/dist/main.js" .

FROM node:20-bookworm-slim AS build
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY packages ./packages
COPY api-gateway ./api-gateway
COPY auth ./auth
COPY user ./user
COPY book ./book
COPY library ./library
COPY club ./club
COPY chat ./chat
COPY tooling ./tooling
COPY tsconfig.base.json ./

RUN pnpm install --frozen-lockfile
RUN pnpm run build

FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN corepack enable

COPY --from=build /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/.npmrc ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
COPY --from=build /app/api-gateway ./api-gateway
COPY --from=build /app/auth ./auth
COPY --from=build /app/user ./user
COPY --from=build /app/book ./book
COPY --from=build /app/library ./library
COPY --from=build /app/club ./club
COPY --from=build /app/chat ./chat

ARG START_CMD=node api-gateway/dist/main.js
ENV START_CMD=${START_CMD}
CMD sh -c "$START_CMD"
