# ---- Runtime: TKU API server ----
# nginx 由外部 compose 编排（反代 /api/* → 本服务），本镜像只跑 Node API。
# 前端 dist 由 nginx 镜像（docker/Dockerfile.nginx）构建，本镜像不跑 pnpm build。
FROM node:24-alpine AS runtime

RUN corepack enable && corepack prepare pnpm@10.26.1 --activate

# better-sqlite3 原生模块编译兜底（musl prebuilt 缺失时）
RUN apk add --no-cache python3 make g++ openssh-client

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY server ./server
COPY site.config.json ./site.config.json

# ssh-keygen 通过 server/ssh-keygen.ts (ssh-keygen-lite) 调用，alpine 默认不含，已在上方安装
EXPOSE 8080

CMD ["node", "server/index.ts"]

# ssh-keygen 通过 server/ssh-keygen.ts (ssh-keygen-lite) 调用，alpine 默认不含，需显式安装
RUN apk add --no-cache openssh-client
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server ./server
COPY --from=builder /app/site.config.json ./site.config.json

EXPOSE 8080

CMD ["node", "server/index.ts"]