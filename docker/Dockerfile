# ---- Build Stage ----
FROM node:24-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.26.1 --activate

# better-sqlite3 原生模块编译兜底（musl prebuilt 缺失时）
RUN apk add --no-cache python3 make g++

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG VITE_APP_VERSION
# 由 CI 传入（--build-arg VITE_APP_VERSION=<tag>），Vite 构建时内联为前端常量
ENV VITE_APP_VERSION=$VITE_APP_VERSION

RUN pnpm build

# ---- Runtime: TKU API server ----
# nginx 由外部 compose 编排（反代 /api/* → 本服务），本镜像只跑 Node API
FROM node:24-alpine AS runtime

WORKDIR /app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server ./server
COPY --from=builder /app/site.config.json ./site.config.json

EXPOSE 8080

CMD ["node", "server/index.ts"]