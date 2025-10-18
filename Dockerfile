# ---- Build dependencies ----
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ---- Build app ----
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# ---- Production image ----
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable && apk add --no-cache netcat-openbsd
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/public ./public
COPY --from=build /app/src ./src
COPY --from=build /app/src/payload.config.ts ./payload.config.ts
COPY --from=build /app/docker-entrypoint.sh ./docker-entrypoint.sh
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=build /app/tsconfig.json ./tsconfig.json
RUN chmod +x ./docker-entrypoint.sh
EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
