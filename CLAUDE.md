# CLAUDE.md

为 Claude Code (claude.ai/code) 在此仓库中工作时提供指导。

## 命令

- `pnpm dev` — 启动 Vite 开发服务器
- `pnpm build` — `vue-tsc` 类型检查后 `vite build` 生产构建
- `pnpm preview` — 本地预览生产构建

## 项目架构

TKU（T Knit Utensil，在线工具站）是一个 Vue 3 + TypeScript + Vite 单页应用，使用 Tailwind CSS v4 和 Vue Router（history 模式）。

### 路由

| 路径            | 组件           | 说明                   |
|-----------------|----------------|------------------------|
| `/`             | `Home.vue`     | 直接加载，工具分组卡片 |
| `/tool/:toolId` | `ToolPage.vue` | 懒加载，按工具 id 渲染 |
| `/settings`     | `Settings.vue` | 懒加载，路由守卫保护   |
| `/login`        | `Login.vue`    | 懒加载                 |

路由守卫：访问 `/settings` 时如无 auth token，重定向到 `/login`。

### 目录结构

```
src/
├── data/
│   ├── tools.ts         # 工具定义（ToolGroup[]，getToolById）
│   ├── siteConfig.ts    # 响应式配置 store + loadConfig/saveConfig
│   └── auth.ts          # useAuth() — 登录/登出，token 存 localStorage
├── router/index.ts      # Vue Router 配置 + beforeEach 守卫
├── views/
│   ├── Home.vue         # 工具分组展示，顶部快捷导航
│   ├── ToolPage.vue     # 动态工具加载（按 toolId 的 v-if 链）
│   ├── Settings.vue     # 站点配置编辑（需登录）
│   └── Login.vue        # 登录表单
├── components/tools/
│   ├── codec/           # Base64、URL 编解码、Unicode
│   ├── formatter/       # JSON、SQL
│   ├── converter/       # 时间戳、颜色
│   ├── generator/       # UUID、哈希、二维码、密码
│   ├── ssh/             # SSH 密钥对生成
│   ├── image/           # Favicon 生成器
│   └── text/            # 正则、文本对比、字数统计
└── App.vue              # 外层框架：固定顶栏、<router-view>、页脚
```

### 添加新工具

1. 在 `src/data/tools.ts` 对应分组中添加 `Tool` 条目
2. 在 `src/components/tools/<分组>/` 下创建工具组件
3. 在 `src/views/ToolPage.vue` 中注册：在 `<script lang="ts">` 中 import，在 `components` 中注册，在模板中添加 `v-else-if`
   分支

### 配置与数据库系统（仅开发模式）

- `site.config.json` — 人类可读的默认配置（纳入版本控制）
- `site.db.json` — node-json-db 管理的运行时数据库（已 gitignore）
- `vite-plugin-config.ts` — Vite 插件，提供以下 API 端点：

| 端点          | 方法 | 说明                          |
|---------------|------|-------------------------------|
| `/api/config` | GET  | 从 node-json-db 读取完整配置  |
| `/api/config` | POST | 覆写配置，保存到 site.db.json |
| `/api/auth`   | POST | 校验密码，返回 token          |

密码读取优先级：运行时 `site.db.json` → 默认 `site.config.json` → `"admin"`。

### 编码规范

- 系统中不要在目录名称中出现多个单词组成的文件夹名称，尽可能的使用单个单词作为文件夹名称
- 系统中使用pnpm而不是npm
- 新增的文件，及时添加到git中

### TypeScript 配置说明

- `tsconfig.app.json` 覆盖 `src/**`（应用代码）
- `tsconfig.node.json` 覆盖 `vite.config.ts` + `vite-plugin-config.ts`（Node 端代码）
- Node 端文件使用 `module: "nodenext"`，import 需显式写 `.ts` 扩展名
