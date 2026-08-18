FROM node:24-alpine

# 启用 corepack 并使用 pnpm
RUN corepack enable && corepack prepare pnpm@10.26.1 --activate

# 安装原生模块编译依赖和 ssh-keygen
RUN apk add --no-cache python3 make g++ openssh-client

WORKDIR /app

# 复制依赖定义文件并安装生产依赖
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod

# 复制源码和配置
COPY server ./server
COPY site.config.json ./site.config.json

EXPOSE 8080

CMD ["node", "server/index.ts"]