# 本地部署（Node + nginx）

适合单机手动部署，无 Docker 环境时的选择。

## 前置要求

- Node.js >= 24
- pnpm >= 10
- nginx

## 步骤

```bash
# 1. 构建前端
pnpm install
pnpm build          # 产物在 dist/

# 2. 启动 API 服务
#    默认端口 8080；PORT 环境变量可覆盖
#    DB_PATH 指定运行时数据库路径（默认站点根目录 site.db）
mkdir -p data       # 数据目录（server 也会自动创建，手动建是惯例）
DB_PATH=./data/site.db pnpm serve

# 3. 用 nginx 托管 dist/ 并反代 /api/ → localhost:8080
#    参考 docker/nginx.conf（将 proxy_pass http://api:8080 改为 http://localhost:8080）
```

## API 服务说明

- `pnpm serve` 执行 `node server/index.ts`，监听 `0.0.0.0:8080`
- 提供端点：`/api/config`、`/api/auth`、`/api/proxy`、`/api/ssh-keygen/*`、`/api/health`
- 数据默认存在项目根目录 `site.db`；指定 `DB_PATH` 可持久化到指定目录

## nginx 关键配置

由 `docker/nginx.conf` 修改而来：

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;   # 改为 dist 实际路径

    # SPA 回退
    location / { try_files $uri $uri/ /index.html; }

    # API 反代到本机 Node 服务
    location /api/ {
        proxy_pass http://localhost:8080;   # 修改点：api:8080 → localhost:8080
    }
}
```