# 配置与认证

配置管理 API（生产与开发均可用）：

| 端点                       | 方法 | 说明                          |
|----------------------------|------|-------------------------------|
| `/api/config`              | GET  | 读取完整站点配置              |
| `/api/config`              | POST | 覆写配置                      |
| `/api/auth`                | POST | 校验密码，返回认证 token      |
| `/api/proxy`               | POST | 服务端转发外部请求（绕 CORS） |
| `/api/ssh-keygen/check`    | GET  | 检测系统 ssh-keygen 可用性    |
| `/api/ssh-keygen/generate` | POST | 生成 SSH 密钥对               |
| `/api/health`              | GET  | 健康检查                      |

## 配置存储

- 运行时数据存 `site.db`（better-sqlite3，单表 `config(id=1, value)` 存整个配置 JSON）
- 默认配置 `site.config.json` 仅作初始默认值（纳入版本控制）
- 密码读取优先级：运行时 `site.db` → 默认 `site.config.json` → `"admin"`

## 配置入口

- 首页「系统管理」→「系统配置」`/admin/config`
- 访问 `/admin/config` 需先登录，无 token 时自动重定向到 `/login`
- 登录后可修改站点信息、页脚、登录密码，保存即持久化到 SQLite
- 默认密码 `admin`，登录后建议立即修改

## 开发环境说明

`pnpm dev` 下 Vite dev server 以中间件方式提供同一套 API（`vite-plugin-config.ts`），行为与生产一致。Auth 校验仅在前端：登录成功后获得任意非空
token 即放行，服务端不校验 token（后端只做密码比对）。