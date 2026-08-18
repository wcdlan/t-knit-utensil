# 部署总览

TKU 由两部分组成：

- **前端静态资源**：Vite 构建产物（`dist/`），由 nginx 托管，SPA 回退到 `index.html`
- **API 服务**：Node.js 进程（`server/index.ts`），提供 `/api/*` 接口，数据存 SQLite（better-sqlite3）

## 架构

```
浏览器 ──→ nginx（托管 dist/ + 反代 /api/）──→ Node API（server/index.ts）──→ SQLite（site.db）
```

nginx 只负责静态文件与 `/api/` 反向代理；所有业务 API 在 Node 进程内实现。开发模式（`pnpm dev`）下同一套 API 以 Vite 中间件形式注入
dev server，无需单独起 Node。

## 部署方案对比

| 方案                                     | 文件                    | 适用场景                         | 前置要求                |
|------------------------------------------|-------------------------|----------------------------------|-------------------------|
| [本地部署](deploy-local.md)              | `doc/deploy-local.md`   | 单机手动跑 Node + nginx          | Node >= 24、pnpm、nginx |
| [Docker 手工部署](deploy-docker.md)      | `doc/deploy-docker.md`  | 手动构建并启动两个容器           | Docker、能访问 Nexus    |
| [Docker Compose 部署](deploy-compose.md) | `doc/deploy-compose.md` | 拉取已构建镜像，开箱即用（推荐） | Docker 及 Compose 插件  |

生产模式下配置管理页（`/admin/config`）允许直接修改配置，详见[配置与认证](config-auth.md)。

## 相关文件

- `docker/docker-compose.yml` — 拉取镜像编排两个容器（推荐）
- `docker/docker-compose.build.yml` — 本地构建镜像的 compose 配置
- `docker/Dockerfile` — API 镜像（Node + SQLite，多阶段构建）
- `docker/Dockerfile.nginx` — 前端 nginx 镜像（含 dist + `/api` 反代）
- `docker/nginx.conf` — nginx 配置模板（SPA 回退 + gzip + `/api/` 反代）
- `.gitlab-ci.yml` — GitLab CI：打 Git Tag 时构建镜像推送至私有 Nexus