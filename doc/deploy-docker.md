# Docker 手工部署（API + 前端两个容器）

等价于 docker-compose 方案的手工版本，逐个构建镜像并启动容器。适合无法使用 Compose 的环境。

> 手工部署与 compose 部署的主要区别：本方案需要先在本地构建镜像，再手动建网络、逐个启动容器。已有镜像也可直接 `docker run`
> 拉取。

## 步骤

```bash
# 1. 构建 API + 前端两个镜像
#    （前端 nginx 镜像会在 builder 阶段自动 pnpm build）
docker build -f docker/Dockerfile -t tku-api .
docker build -f docker/Dockerfile.nginx -t tku-web .

# 2. 建网络 + 数据目录，启动 API 容器（挂 data 卷持久化）
docker network create tku-net
mkdir -p data
docker run -d --name api --network tku-net \
  -e DB_PATH=/app/data/site.db \
  -v "$(pwd)/data:/app/data" \
  tku-api

# 3. 启动前端 nginx 容器，映射 8080 并反代同网段 api
docker run -d --name tku-web --network tku-net \
  -p 8080:80 \
  tku-web

# 4. 访问：http://localhost:8080
```

## 注意

- **API 容器必须命名为 `api`** 且与 nginx 同网络，`nginx.conf` 内置反代目标 `http://api:8080` 才能解析
- 数据卷 `./data` 持久化 SQLite（`DB_PATH=/app/data/site.db` 指向该卷）
- 如需更新：`docker rm -f api tku-web` 后重新 run 即可