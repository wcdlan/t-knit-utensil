# Docker Compose 部署（推荐）

拉取已构建镜像，无需本地构建，开箱即用。

GitLab CI 打标签即推送两镜像至私有 Nexus（`v4.nagioa.cn:35483`）：

- `entropycrop/t-knit-utensil:latest` — API 服务
- `entropycrop/t-knit-utensil-web:latest` — 前端 nginx（含 dist + `/api` 反代）

`docker/docker-compose.yml` 编排两个容器， **无需本地构建**，直接拉取即用。

## 步骤

```bash
# 1. 登录私有 Nexus 拉取镜像（私有仓需凭据；不打算发布到 Git/Docker Hub）
docker login v4.nagioa.cn:35483

# 2. 启动（docker 目录，首次自动拉 latest 镜像）
cd docker
mkdir -p data
docker compose up -d

# 3. 访问：http://localhost:8080
```

## 镜像版本

镜像默认 `latest`；如拉取旧版本可将 compose 中 `:latest` 改为 `:vX.Y.Z` 标签（CI 会推送完整 tag、主版本、主.次、主.次.修）。

## 相关文件

- `docker/docker-compose.yml` — 编排配置（两个服务：`api` + `nginx`）
- `docker/nginx.conf` — 内置反代 `http://api:8080`，api 服务名须与 compose 中服务名一致