# TKU — T Knit Utensil

开发者常用在线工具集合，无需安装，即开即用。绝大多数工具纯前端运算，数据不离开浏览器；仅 SSH 密钥生成与 AI API 测试涉及服务端操作。

> **声明：本项目由 AI 99% 负责开发，本人只负责小调整和提示词修改。**

## 功能

9 个工具分组，共 19 个实用工具：

| 分组     | 工具                                                                            |
|----------|---------------------------------------------------------------------------------|
| 编解码   | Base64、URL 编解码、Unicode 互转、编码探测                                      |
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
- iconv-lite（编码探测）

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

项目由两部分组成： **前端静态资源**（Vite 构建产物，由 nginx 托管）+ **API 服务**（Node.js，提供 `/api/*` 接口，数据存
SQLite）。生产模式下配置管理页允许直接修改配置。

部署方案详见 [doc/deployment.md](doc/deployment.md)：

- [本地部署（Node + nginx）](doc/deploy-local.md)
- [Docker 手工部署](doc/deploy-docker.md)
- [Docker Compose 部署（推荐）](doc/deploy-compose.md)

配置与认证详见 [doc/config-auth.md](doc/config-auth.md)。

## 添加新工具

1. 在 `src/data/tools.ts` 对应分组中添加 `Tool` 条目
2. 在 `src/components/tools/<分组>/` 下创建工具组件（`*Tool.vue` 后缀）
3. 在 `src/router/index.ts` 的 `/tool` 路由 `children` 数组中添加子路由（path 与工具 `id` 一致）

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
