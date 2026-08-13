# CLAUDE.md

为 Claude Code (claude.ai/code) 在此仓库中工作时提供指导。

## 项目语言规范

请始终使用简体中文与我对话。

## 命令

- `pnpm dev` — 启动 Vite 开发服务器
- `pnpm build` — `vue-tsc -b` 类型检查后 `vite build` 生产构建
- `pnpm preview` — 本地预览生产构建
- `pnpm format` — Prettier 格式化 `src/**/*.{ts,vue,css,json}`
- `pnpm format:check` — 检查格式不写入

## 项目架构

TKU（T Knit Utensil，在线工具站）是一个 Vue 3 + TypeScript + Vite 单页应用。 技术栈：Vue 3.5、Vite 8、TypeScript 6、Tailwind CSS
v4、Vue Router 5（history 模式）、Naive UI 2.44+、JSZip。

要求 Node >= 24，pnpm >= 10（`package.json` 中 `packageManager` 固定为 `pnpm@10.26.1`）。

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
├── types/
│   ├── tools.ts         # Tool, ToolGroup — 工具条目与分组
│   ├── site.ts          # FooterConfig, AuthConfig, SiteConfig — 站点配置
│   ├── ssh.ts           # KeyType, KeyPairResult, KeyTypeMeta — SSH 密钥
│   ├── ai.ts            # ApiPreset, HistoryItem, TestStatus, ApiResponse — AI API 测试
│   ├── license.ts       # LicenseProfile, QuestionOption, Question, ScoredLicense — 许可证
│   └── image.ts         # FaviconSize — Favicon 尺寸选项
├── data/
│   ├── tools.ts         # 工具定义（ToolGroup[]，getToolById），从 types 重导出类型
│   ├── siteConfig.ts    # 响应式配置 store + loadConfig/saveConfig，从 types 重导出类型
│   └── auth.ts          # useAuth() — 登录/登出，token 存 localStorage
├── router/index.ts      # Vue Router 配置 + beforeEach 守卫
├── utils/
│   ├── clipboard.ts     # copyToClipboard()
│   ├── download.ts      # downloadBlob(), downloadTextFile()
│   └── ssh.ts           # SSH 密钥生成（RSA/ECDSA，Web Crypto API），从 types 重导出类型
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
│   ├── text/            # 正则、文本对比、字数统计
│   ├── ai/              # AI API 测试
│   └── common/          # 开源许可证选择器
├── assets/theme/index.ts # Naive UI 蓝色主题覆盖
└── App.vue              # 外层框架：侧边栏、顶栏、<router-view>、页脚
```

### 添加新工具

`ToolPage.vue` 使用 **双 script 块**模式注册工具组件，添加新工具的完整步骤：

1. **在 `src/data/tools.ts` 对应分组中添加 Tool 条目：**

   ```ts
   { id: 'my-tool', name: '我的工具', description: '工具描述', icon: '🔧' }
   ```

2. **在 `src/components/tools/<分组>/` 下创建工具组件：**
   - 使用 `<script lang="ts" setup>` 编写组件逻辑
   - 表单控件使用 Naive UI（NButton, NInput, NSelect 等）
   - 布局/间距使用 Tailwind 工具类
   - 命名约定：使用 `*Tool.vue` 后缀

3. **在 `src/views/ToolPage.vue` 中注册 — 该文件有两个 `<script>` 块：**
   - **第二个 `<script lang="ts">` 块（第 55-97 行）：** import 组件，添加到 `export default { components: { ... } }` 中
   - **模板（第 11-53 行）：** 添加 `<YourTool v-else-if="toolId === 'my-tool'" />` 分支
   - 标签名必须与 `export default` 的 `components` 对象中的 key 一致
   - 第一个 `<script lang="ts" setup>` 块（第 1-9 行）处理路由逻辑， **不要修改**

### 样式：Tailwind CSS v4 + Naive UI

- **布局、间距、容器、排版** → Tailwind 工具类
- **表单控件、选择器、开关、标签、按钮** → Naive UI 组件
- `src/style.css` 包含 CSS 重置，阻止 Tailwind preflight 破坏 Naive UI 的 button/image 默认样式
- Naive UI 主题：`src/assets/theme/index.ts` 导出 `themeOverrides`（蓝色系）。`App.vue` 用
  `<n-config-provider :theme-overrides="themeOverrides">` 包裹整个应用
- 不要编写自定义 CSS 类；使用 Tailwind 工具类或 Naive UI 组件属性
- Tailwind v4 使用 `@import 'tailwindcss'`（无 `tailwind.config.js`）

### 状态管理

- **无 Pinia / Vuex** — 项目保持简单
- `reactive()` 用于全局共享状态：`siteConfig`（`src/data/siteConfig.ts`）
- `ref()` 用于所有组件本地状态
- **Composable 模式**（`use*` 前缀）用于共享逻辑：`useAuth()`（`src/data/auth.ts`）
- `localStorage` 用于客户端持久化：auth token（`tku-auth-token`）、AI 测试器历史（`ai-api-tester-history`）

### 配置与数据库系统（仅开发模式）

- `site.config.json` — 人类可读的默认配置（纳入版本控制）
- `site.db.json` — node-json-db 管理的运行时数据库（已 gitignore）
- `vite-plugin-config.ts` — Vite 插件，提供以下 API 端点：

| 端点          | 方法 | 说明                                                                                           |
|---------------|------|------------------------------------------------------------------------------------------------|
| `/api/config` | GET  | 从 node-json-db 读取完整配置                                                                   |
| `/api/config` | POST | 覆写配置，保存到 site.db.json                                                                  |
| `/api/auth`   | POST | 校验密码，返回 token                                                                           |
| `/api/proxy`  | POST | 服务端转发外部 HTTP 请求以绕过 CORS。Body: `{url, method, headers, body}`。由 AiApiTester 使用 |

密码读取优先级：运行时 `site.db.json` → 默认 `site.config.json` → `"admin"`。

### 编码规范

- 系统中不要在目录名称中出现多个单词组成的文件夹名称，尽可能的使用单个单词作为文件夹名称
- 系统中使用 pnpm 而不是 npm
- 新增的文件，及时添加到 git 中
- 使用 naive-ui 中的组件 + tailwindcss 进行样式设计，确保一致性和可维护性
- 所有 interface / type 定义放到 `src/types/` 下按领域分文件管理，禁止在组件或工具文件中内联定义
- 原有的导出文件（如 `src/data/tools.ts`）通过 `export type { ... } from '@/types/...'` 重导出以保持向后兼容
- 重复的静态方法提取到 `src/utils` 中，不要散落在各个组件中
- 新增的工具组件统一使用 `*Tool.vue` 命名后缀
- 共享状态/逻辑使用 `src/data/` 下的 composable 导出（`use*` 前缀）

### TypeScript 配置说明

- `tsconfig.app.json` 覆盖 `src/**`（应用代码），继承自 `@vue/tsconfig/tsconfig.dom.json`
- `tsconfig.node.json` 覆盖 `vite.config.ts` + `vite-plugin-config.ts`（Node 端代码）
- 路径别名：`@/` 映射到 `src/`（在 `tsconfig.app.json` 和 `vite.config.ts` 中均配置）
- Node 端文件使用 `module: "nodenext"`，import 需显式写 `.ts` 扩展名
- 两者均启用 `erasableSyntaxOnly: true`：限制为仅类型擦除的特性（import、interface、type alias），禁止 enums 和 namespace

### CI/CD 与 DevOps

- **Dockerfile**：多阶段构建（node:24-alpine 构建 → nginx:stable-alpine 运行），端口 80，含 healthcheck
- **nginx.conf**：SPA 回退（`try_files ... /index.html`），gzip 开启，`/assets/` 静态资源 1 年缓存
- **GitLab CI**（`.gitlab-ci.yml`）：仅 Git Tag 触发，构建 dist 压缩包 + 多标签 Docker 镜像推送至私有 Nexus 仓库
- 项目目前 **没有配置任何测试框架**
