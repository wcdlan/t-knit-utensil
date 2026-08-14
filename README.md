# TKU — T Knit Utensil

开发者常用在线工具集合，无需安装，即开即用。所有工具纯前端运算，数据不离开浏览器。

> **声明：本项目由 AI 99% 负责开发，本人只负责小调整和提示词修改。**

## 功能

9 个工具分组，共 18 个实用工具：

| 分组     | 工具                                                                            |
|----------|---------------------------------------------------------------------------------|
| 编解码   | Base64、URL 编解码、Unicode 互转                                                |
| 格式化   | JSON 格式化、SQL 格式化                                                         |
| 数据转换 | 时间戳转换、颜色转换（HEX/RGB/HSL）                                             |
| 数据生成 | UUID 生成器、哈希计算（MD5/SHA）、二维码生成、密码生成                          |
| OpenSSH  | 密钥对生成（RSA / ECDSA）                                                       |
| 图片工具 | Favicon 生成器（PNG/ICO + ZIP 打包下载）                                        |
| 文本工具 | 正则测试、文本对比、字数统计                                                    |
| AI 工具  | AI API 测试（OpenAI / Anthropic / Gemini 格式，Key 可用性、模型列表、对话测试） |
| 常用工具 | 开源许可证选择器                                                                |

## 技术栈

- Vue 3 + TypeScript
- Vite 8
- Tailwind CSS v4
- Vue Router 5
- Naive UI
- JSZip

## 环境要求

- Node.js >= 24
- pnpm >= 10

## 开发

```bash
pnpm install       # 安装依赖
pnpm dev           # 启动开发服务器
pnpm build         # 类型检查 + 生产构建
pnpm preview       # 本地预览构建结果
pnpm format        # Prettier 格式化代码
pnpm format:check  # 检查格式
```

## 部署

项目由两部分组成： **前端静态资源**（Vite 构建产物，由 nginx 托管）+ **API 服务**（Node.js，提供 `/api/config`、`/api/auth`、
`/api/proxy`、`/api/health`，数据存 SQLite）。生产模式下配置管理页允许直接修改配置。

### 方案一：本地部署（Node + nginx）

```bash
# 1. 构建前端
pnpm install
pnpm build          # 产物在 dist/

# 2. 启动 API 服务（默认端口 8080，可用 PORT 覆盖，DB_PATH 指定运行时数据库路径）
mkdir -p data       # 数据目录（server 也会自动创建，手动建是惯例）
DB_PATH=./data/site.db pnpm serve

# 3. 用 nginx 托管 dist/ 并反代 /api/ → localhost:8080
#    参考 docker/nginx.conf（将 proxy_pass http://api:8080 改为 http://localhost:8080）
```

### 方案二：Docker 手工部署（API + 前端两个容器）

先构建两个镜像，再手动启动（等价于方案三 compose 的手工版）。

```bash
# 1. 构建 API + 前端两个镜像（前端 nginx 镜像会在 builder 阶段自动 pnpm build）

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

# 4. 访问：http://localhost:8080（nginx 内置 nginx.conf 反向代理 /api/ → http://api:8080）
```

> API 容器必须命名为 `api` 且与 nginx 同网络，`nginx.conf` 内置反代目标 `http://api:8080` 才能解析。

### 方案三：Docker Compose 部署（推荐，拉取已构建镜像）

GitLab CI 打标签即推两镜像至私有 Nexus（`v4.nagioa.cn:35483`）：

- `entropycrop/t-knit-utensil:latest` — API 服务
- `entropycrop/t-knit-utensil-web:latest` — 前端 nginx（含 dist + `/api` 反代）

`docker/docker-compose.yml` 编排两个容器， **无需本地构建**，直接拉取即用：

```bash
# 1. 登录私有 Nexus 拉取镜像（私有仓需凭据；不打算发布到 Git/Docker Hub）
docker login v4.nagioa.cn:35483

# 2. 启动（docker 目录，首次自动拉 latest 镜像）
cd docker
mkdir -p data
docker compose up -d

# 3. 访问：http://localhost:8080
```

镜像版本默认 `latest`；如拉旧版本可将 compose 中 `:latest` 改为 `:vX.Y.Z` 标签（CI 会推完整 tag、主版本、主.次、主.次.修）。

部署后配置入口在配置页（首页「系统管理」→「系统配置」`/admin/config`），默认密码 `admin`，登录后可修改站点信息、页脚、登录密码，保存即持久化到
SQLite；无 token 时自动重定向到 `/login`。

## 配置与认证

配置管理 API（生产与开发均可用）：

| 端点          | 方法 | 说明                     |
|---------------|------|--------------------------|
| `/api/config` | GET  | 读取完整站点配置         |
| `/api/config` | POST | 覆写配置                 |
| `/api/auth`   | POST | 校验密码，返回认证 token |
| `/api/health` | GET  | 健康检查                 |

配置存储：运行时数据存 `site.db`（better-sqlite3）。默认配置 `site.config.json` 仅作初始默认值。 密码读取优先级：运行时
`site.db` → 默认 `site.config.json` → `"admin"`。

访问 `/admin/config` 需先登录，无 token 时自动重定向到 `/login`。

## 添加新工具

1. 在 `src/data/tools.ts` 对应分组中添加 `Tool` 条目
2. 在 `src/components/tools/<分组>/` 下创建工具组件
3. 在 `src/views/ToolPage.vue` 中 import 并注册组件，模板中添加 `v-else-if` 分支

## 鸣谢

感谢以下项目和工具：

- [Vue](https://vuejs.org/) — 渐进式 JavaScript 框架
- [Vite](https://vite.dev/) — 下一代前端构建工具
- [Tailwind CSS](https://tailwindcss.com/) — 实用优先的 CSS 框架
- [Naive UI](https://www.naiveui.com/) — Vue 3 组件库
- [JSZip](https://stuk.github.io/jszip/) — 浏览器端 ZIP 生成库
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) — SQLite 驱动

## 许可证

[Apache 2.0](LICENSE)
