# TKU — T Knit Utensil

开发者常用在线工具集合，无需安装，即开即用。绝大多数工具纯前端运算，数据不离开浏览器；仅 SSH 密钥生成、AI API 测试与 VirtIO
下载涉及服务端操作。

> **声明：本项目由 AI 99% 负责开发，本人只负责小调整和提示词修改。**

## 功能

10 个工具分组，共 28 个实用工具：

| 分组       | 工具                                                                                                                                                  |
|------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| 编解码     | Base64、URL 编解码、Unicode 互转、编码探测                                                                                                            |
| 格式化     | JSON 格式化（含随机 JSON 生成）、SQL 格式化                                                                                                           |
| 数据转换   | 时间戳转换、颜色转换（HEX/RGB/HSL）                                                                                                                   |
| 数据生成   | UUID 生成器（v1-v7）、哈希计算（MD5/SHA）、二维码生成、密码生成、Faker 系列 8 个（身份/地址/企业/网络/文本/金融/自然/车辆，支持 14 种语言，默认中文） |
| OpenSSH    | 密钥对生成（RSA / ECDSA，支持密码短语与注释，ZIP 打包下载）                                                                                           |
| 图片工具   | Favicon 生成器（裁剪 + 多尺寸 PNG/ICO + ZIP 打包下载）                                                                                                |
| 文本工具   | 正则测试、文本对比（差异高亮）、字数统计                                                                                                              |
| AI 工具    | AI API 测试（OpenAI / Anthropic / Gemini 格式，Key 可用性、模型列表、对话测试）                                                                       |
| 常用工具   | 开源许可证选择器（问答匹配 + 全文细览 + 复制下载）                                                                                                    |
| 虚拟化工具 | VirtIO 驱动下载（Fedora 官方归档，版本滚动加载，ISO/RPM/MSI/EXE 直接下载）                                                                            |

## 技术栈

- Vue 3.5 + TypeScript 6
- Vite 8
- Tailwind CSS v4
- Vue Router 5（history 模式）
- Naive UI
- JSZip（浏览器端 ZIP 生成）
- iconv-lite（编码探测）
- @faker-js/faker（多语言随机数据生成，语言包按需懒加载）
- uuid（UUID v1-v7）
- ssh-keygen-lite（服务端 SSH 密钥生成）
- better-sqlite3（配置存储）

## 环境要求

- Node.js >= 24
- pnpm >= 10（`packageManager` 固定为 `pnpm@10.26.1`）

## 开发

```bash
pnpm install       # 安装依赖
pnpm dev           # 启动开发服务器
pnpm build         # 类型检查 + 生产构建
pnpm preview       # 本地预览构建结果
pnpm format        # Prettier 格式化代码
pnpm format:check  # 检查格式
```

## 目录结构

```
src/
├── types/       # 领域类型声明（按领域分文件，组件内禁止内联定义命名类型）
├── data/        # 纯静态数据（工具注册表 tools.ts、图标注册表 icons.ts）
├── composable/  # 组合式函数（useAuth / useFaker / siteConfig 等）
├── utils/       # 普通静态函数（clipboard / download / base64 / encoding 等）
├── component/   # 通用 UI 组件（多个 view 共用，如 TkuIcon）
├── fragment/    # 页面片段组件（仅单个 view 使用，按 分组/工具id 拆分为多个哑组件）
├── layout/      # 布局框架（AppLayout）
├── view/        # 最终访问页面（所有路由只指向这里，持有业务状态并组装 fragment）
├── router/      # 路由配置（/tool 嵌套子路由 + 登录守卫）
└── assets/      # 主题、许可证全文、Logo
```

每个工具页由三部分组成：

- **fragment**：`src/fragment/tool/<分组>/<工具id>/` 下拆分的多个「哑组件」（只收 props、发 emit，不持有业务状态）， 如
  `ModeSelect` / `InputPanel` / `ActionBar` / `OutputPanel` / `ResultList` / `AboutPanel`
- **view**：`src/view/tool/<分组>/*View.vue` 持有全部业务状态与逻辑，组装对应 fragment 小组件
- **路由**：`src/router/index.ts` 的 `/tool` 子路由懒加载指向对应 view

## 部署

项目由两部分组成： **前端静态资源**（Vite 构建产物，由 nginx 托管）+ **API 服务**（Node.js，提供 `/api/*` 接口，数据存
SQLite）。生产模式下配置管理页允许直接修改配置。

部署方案详见 [doc/deployment.md](doc/deployment.md)：

- [本地部署（Node + nginx）](doc/deploy-local.md)
- [Docker 手工部署](doc/deploy-docker.md)
- [Docker Compose 部署（推荐）](doc/deploy-compose.md)

配置与认证详见 [doc/config-auth.md](doc/config-auth.md)。

## 添加新工具

1. **注册工具**：在 `src/data/tools.ts` 对应分组中添加 `Tool` 条目（icon 取 `src/data/icons.ts` 的 Iconify 图标名）
2. **创建片段组件**：在 `src/fragment/tool/<分组>/<工具id>/` 下创建多个「哑组件」子目录（PascalCase 命名，只收 props / 发
   emit，不持有业务状态）
3. **创建组装 view**：在 `src/view/tool/<分组>/` 下创建 `MyToolView.vue`，持有全部业务状态与逻辑函数，组装 fragment
   小组件；子组件作用注释写在 `<template>` 中组件标签上方（`<!-- 组件名：说明 -->`）
4. **注册路由**：在 `src/router/index.ts` 的 `/tool` 路由 `children` 中添加子路由（path 与工具 `id` 一致，懒加载指向
   `@/view/tool/<分组>/MyToolView.vue`）

涉及领域类型时先在 `src/types/` 下建文件，组件内只 `import type` 引入。

## 鸣谢

感谢以下项目和工具：

- [Vue](https://vuejs.org/) — 渐进式 JavaScript 框架
- [Vite](https://vite.dev/) — 下一代前端构建工具
- [Tailwind CSS](https://tailwindcss.com/) — 实用优先的 CSS 框架
- [Naive UI](https://www.naiveui.com/) — Vue 3 组件库
- [Faker](https://fakerjs.dev/) — 多语言随机数据生成库
- [JSZip](https://stuk.github.io/jszip/) — 浏览器端 ZIP 生成库
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) — SQLite 驱动

## 许可证

[Apache 2.0](LICENSE)
