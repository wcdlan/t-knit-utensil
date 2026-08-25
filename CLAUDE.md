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
v4、Vue Router 5（history 模式）、Naive UI 2.44+、JSZip、Iconify（`@iconify/vue`）、iconv-lite（编码探测）。

要求 Node >= 24，pnpm >= 10（`package.json` 中 `packageManager` 固定为 `pnpm@10.26.1`）。

### 路由

| 路径            | 组件                  | 说明                                                       |
|-----------------|-----------------------|------------------------------------------------------------|
| `/`             | `Home.vue`            | 直接加载，工具分组卡片 + 搜索                              |
| `/tool`         | `ToolPage.vue`        | 懒加载，外层框架（面包屑 + 工具标题）                      |
| `/tool/:toolId` | `view/tool/*View.vue` | ToolPage 的**嵌套子路由**，懒加载，薄包装组合对应 fragment |
| `/admin/config` | `Settings.vue`        | 懒加载，路由守卫保护                                       |
| `/login`        | `Login.vue`           | 懒加载                                                     |

`router/index.ts` 中 `/tool` 路由含 `children` 数组，每个工具一条子路由（`path: 'base64'` →
`@/view/tool/codec/Base64View.vue`），`ToolPage.vue` 用内嵌 `<router-view>` + `<keep-alive>` 渲染子路由组件。所有工具子路由都在
`src/router/index.ts` 内定义。

路由守卫（`router.beforeEach`）：访问 `/admin/config` 时如无 auth token（`localStorage.tku-auth-token`），重定向到 `/login`。

### 目录结构

```
src/
├── types/               # 领域类型声明（按领域分文件）
│   ├── tools.ts         # Tool, ToolGroup — 工具条目与分组
│   ├── site.ts          # FooterConfig, AuthConfig, SiteConfig — 站点配置
│   ├── ssh.ts           # KeyType, KeyPairResult, KeyTypeMeta — SSH 密钥
│   ├── ai.ts            # ApiPreset, HistoryItem, TestStatus, ApiResponse — AI API 测试
│   ├── license.ts       # LicenseProfile, QuestionOption, Question, ScoredLicense — 许可证
│   ├── image.ts         # FaviconSize — Favicon 尺寸选项
│   ├── encoding.ts      # 编码定义相关类型 — 编码探测工具
│   ├── faker.ts         # FakerLocaleKey, FakerLocaleOption — Faker 多语言
│   ├── uuid.ts          # UuidVersion, NamespaceKey — UUID 生成器
│   ├── regex.ts         # 正则测试相关类型
│   └── virtio.ts        # VirtioVersion, VirtioFile — VirtIO 下载
├── data/                # 纯静态数据（常量注册表）
│   ├── tools.ts         # 工具定义（ToolGroup[]，getToolById），从 types 重导出类型
│   ├── licenses.ts      # 开源许可证资料库（LICENSES，许可证选择器数据源）
│   └── icons.ts         # 图标名注册表（Iconify mdi: 前缀），导出 icons 对象 + IconKey 类型
├── composable/          # 组合式函数（可复用的响应式逻辑）
│   ├── auth.ts          # useAuth() — 登录/登出，token 存 localStorage
│   ├── siteConfig.ts    # 响应式配置 store + loadConfig/saveConfig，从 types 重导出类型
│   └── useFaker.ts      # useFaker() — 多语言 faker 实例管理
├── utils/               # 普通静态函数
│   ├── clipboard.ts     # copyToClipboard(text, successText?) — 复制 + 成功提示
│   ├── download.ts      # downloadBlob(), downloadTextFile()
│   ├── base64.ts        # encodeBase64(), decodeBase64() — UTF-8 安全 Base64（TextEncoder/TextDecoder）
│   ├── ssh.ts           # SSH 密钥生成（RSA/ECDSA，Web Crypto API），从 types 重导出类型
│   ├── encoding.ts      # convertEncoding(), SUPPORTED_ENCODINGS — 编码转换（iconv-lite）
│   ├── jsonGenerator.ts # generateRandomJson(mode, pretty) — 随机 JSON 生成
│   ├── debounce.ts      # 防抖工具函数
│   └── fakerLocales.ts  # Faker 语言区域注册表 + getFaker() 异步加载
├── component/           # 通用 UI 组件（多个 view 可能用到）
│   └── common/TkuIcon.vue # Iconify 图标封装（:name 传 icons 里的图标名）
├── fragment/            # 页面片段组件（只有一个 view 会用到）
│   └── tool/            # 各工具页面片段（按工具分组 + 按工具名子目录拆分）
│       ├── codec/       # base64/ url-encode/ unicode/ encoding/
│       ├── formatter/   # json-formatter/ sql-formatter/
│       ├── converter/   # timestamp/ color/
│       ├── generator/   # uuid/ hash/ qrcode/ password/ faker-*/ + common/(共享 LocaleSelect/ResultRow)
│       ├── ssh/         # ssh-keygen/
│       ├── image/       # favicon/
│       ├── text/        # regex/ diff/ word-count/
│       ├── ai/          # ai-api-tester/
│       ├── common/      # license-selector/
│       └── virtualization/ # virtio-download/
│
│   每个工具子目录（如 fragment/tool/codec/base64/）内拆分为多个「哑组件」：
│   接收 props、发 emit 事件，不持有业务状态；典型如 ModeSelect/InputPanel/
│   ActionBar/OutputPanel/ResultList/AboutPanel 等（按工具实际结构增减）。
│   业务状态与逻辑集中在对应的 view 中，由 view 组装这些小组件。
├── layout/              # 布局框架
│   └── AppLayout.vue    # 侧边栏 + 内容区 + 页脚（n-layout 结构）
├── view/                # 最终访问的页面（所有路由只指向这里）
│   ├── Home.vue         # 工具分组展示，顶部搜索 + 快捷导航
│   ├── ToolPage.vue     # 工具外层框架（面包屑 + 标题 + 嵌套 <router-view>）
│   ├── Settings.vue     # 站点配置编辑（需登录）
│   ├── Login.vue        # 登录表单
│   └── tool/            # 工具页薄包装（每个 *View.vue 组合对应 fragment，子目录分类与 fragment/tool 一致）
│       ├── codec/       # Base64View, UrlEncodeView, UnicodeView, EncodingView
│       ├── formatter/   # JsonFormatterView, SqlFormatterView
│       ├── converter/   # TimestampView, ColorView
│       ├── generator/   # UuidView, HashView, QrcodeView, PasswordView, Faker*View
│       ├── ssh/         # SshKeyGenView
│       ├── image/       # FaviconView
│       ├── text/        # RegexView, DiffView, WordCountView
│       ├── ai/          # AiApiTesterView
│       ├── common/      # LicenseSelectorView
│       └── virtualization/ # VirtioDownloadView
├── router/index.ts      # Vue Router 配置（含 /tool 嵌套子路由）+ beforeEach 守卫
├── assets/
│   ├── theme/index.ts   # Naive UI 蓝色主题覆盖（含 Message 等组件主题）
│   ├── license/         # 开源许可证全文 .txt（LicenseSelector 用 import.meta.glob 加载）
│   ├── TKU.png / TKU-U.png  # 站点 Logo（完整 / 折叠图标）
└── App.vue              # 入口：Provider 包装 + <AppLayout />（AppLayout 含路由出口）
```

### 添加新工具

工具通过 **嵌套路由**注册（已重构，不再是 `ToolPage.vue` 双 script 块 + v-if 链模式），添加新工具的完整步骤：

1. **在 `src/data/tools.ts` 对应分组中添加 Tool 条目：**

   ```ts
   { id: 'my-tool', name: '我的工具', description: '工具描述', icon: icons.someIcon }
   ```

   `icon` 字段使用 `src/data/icons.ts` 中的 Iconify 图标名（`mdi:` 前缀），而不是 emoji。

2. **在 `src/fragment/tool/<分组>/<工具id>/` 下创建工具片段小组件：**
    - 每个工具一个子目录（以工具 id 命名，如 `fragment/tool/codec/base64/`），内部拆分为多个「哑组件」
    - 哑组件只接收 props、发 emit 事件，不持有业务状态；典型如 `ModeSelect.vue` / `InputPanel.vue` /
      `ActionBar.vue` / `OutputPanel.vue` / `ResultList.vue` / `AboutPanel.vue`（按工具实际结构增减）
   - 表单控件使用 Naive UI（NButton, NInput, NSelect 等）
   - 布局/间距使用 Tailwind 工具类
   - 图标显示用 `<TkuIcon :name="icons.xxx" :size="16" />`
    - 小组件命名使用 PascalCase 描述性名称（非 `*Tool.vue` 后缀）

3. **在 `src/view/tool/<分组>/` 下创建组装 view（如 `MyToolView.vue`，子目录与 fragment/tool 分组一致）：**
    - view 持有全部业务状态（ref）与逻辑函数（process/generate/copy 等）
    - 组装对应 fragment 子目录下的小组件，通过 props / v-model / @事件 交互
   - **子组件的作用/功能注释写在 `<template>` 中组件标签上方**（`<!-- 组件名：说明 -->` 形式），而不是写在
     `<script>` 的 import 处

   ```vue
   <script lang="ts" setup>
   	import { ref } from 'vue';
   	import ModeSelect from '@/fragment/tool/<分组>/<工具id>/ModeSelect.vue';
   	// ... 其他小组件
   </script>

   <template>
   	<!-- ModeSelect：编码 / 解码 操作模式切换 -->
   	<ModeSelect :mode="mode" @update:mode="(v) => (mode = v)" />
   	<!-- ... 组装其余小组件，每个组件标签上方带 `<!-- 组件名：说明 -->` 注释 -->
   </template>
   ```

4. **在 `src/router/index.ts` 的 `/tool` 路由 `children` 数组中添加子路由：**

   ```ts
   { path: 'my-tool', component: () => import('@/view/tool/<分组>/MyToolView.vue') }
   ```

   路由 path 与 `tools.ts` 中的工具 `id` 一致（`/tool/my-tool`）。子路由懒加载，工具片段无需在 `ToolPage.vue` 中注册。
   所有路由只能指向 `src/view/` 目录下的内容。

### 样式：Tailwind CSS v4 + Naive UI

- **布局、间距、容器、排版** → Tailwind 工具类
- **表单控件、选择器、开关、标签、按钮** → Naive UI 组件
- `src/style.css` 包含 CSS 重置，阻止 Tailwind preflight 破坏 Naive UI 的 button/image 默认样式
- Naive UI 主题：`src/assets/theme/index.ts` 导出 `themeOverrides`（蓝色系）。`App.vue` 用
  `<n-config-provider :theme-overrides="themeOverrides">` 包裹整个应用
- 不要编写自定义 CSS 类；使用 Tailwind 工具类或 Naive UI 组件属性
- Tailwind v4 使用 `@import 'tailwindcss'`（无 `tailwind.config.js`）
- **图标**：统一用 `TkuIcon` 组件（`@iconify/vue` 封装），图标名从 `src/data/icons.ts` 的 `icons` 对象取（`mdi:` 前缀），
  **不直接写裸 SVG 或 emoji**
- `themeOverrides` 含 `Message` 等组件主题（浅色背景 + 主色图标/文字），`copyToClipboard` 内部的 `createDiscreteApi` 也复用同一
  `themeOverrides`，与全局视觉一致

### 状态管理

- **无 Pinia / Vuex** — 项目保持简单
- `reactive()` 用于全局共享状态：`siteConfig`（`src/composable/siteConfig.ts`）
- `ref()` 用于所有组件本地状态
- **Composable 模式**（`use*` 前缀）用于共享逻辑：`useAuth()`（`src/composable/auth.ts`）、`useFaker()`（
  `src/composable/useFaker.ts`）
- `localStorage` 用于客户端持久化：auth token（`tku-auth-token`）、AI 测试器历史（`ai-api-tester-history`）

### 复制交互

- 所有复制统一走 `src/utils/clipboard.ts` 的 `copyToClipboard(text, successText?)`：成功复制后自动弹 message
  提示（第二参数可自定义文案，默认「复制成功」）
- 工具组件支持 **点击文本即复制**：readonly 输出框、结果卡片、哈希结果等可点击文本元素直接绑定 `@click="copy"`
  （同时保留复制按钮），批量复制按钮（如「复制全部」）不受影响
- 可交互元素（可编辑 input、日期选择器等） **不加**点击复制，避免干扰编辑

### 结果区展示约定

- **结果 / 输出区域必须默认展示**：页面加载时就渲染出结果表单区域，而不是用 `v-if` 等结果出现后才生成 DOM，
  保持工具页面在执行操作前后的结构一致（避免执行后布局跳变）
- 结果区内容为空时显示 **占位文案**（如「结果将显示在这里」），有结果时显示实际内容；复制按钮等操作控件用
  `:disabled="!output"` 禁用而非 `v-if` 隐藏（参考 `Base64Tool.vue` 的输出区实现）
- 生成类工具（UUID、密码等）在初始化时 **立即生成默认结果**，无需等待点击
- 输入即出结果类工具（Base64、编码探测、正则等）可实时响应输入，但结果区本身始终渲染
- **例外场景**：需要前置条件才有意义的工具可豁免——上传型（FaviconTool 需先传图）、问答流程型 （LicenseSelector
  需先回答问题）、外部异步调用型（AiApiTester 仍需在结果区保留占位而非消失）

### 配置与数据库系统（仅开发模式）

- `site.config.json` — 人类可读的默认配置（纳入版本控制）
- `site.db` — better-sqlite3 管理的运行时数据库（已 gitignore），单表 `config(id=1, value)` 存整个配置 JSON
- `server/config.shared.ts` — 存储层（`createStore`/`resolvePassword`），被 `server/index.ts`（生产 API）与 `vite-plugin-config.ts`（dev 中间件）共享
- `vite-plugin-config.ts` — Vite 插件，提供以下 API 端点：

| 端点          | 方法 | 说明                                                                                           |
|---------------|------|------------------------------------------------------------------------------------------------|
| `/api/config` | GET  | 从 site.db 读取完整配置                                                                       |
| `/api/config` | POST | 覆写配置，保存到 site.db                                                                      |
| `/api/auth`   | POST | 校验密码，返回 token                                                                           |
| `/api/proxy`  | POST | 服务端转发外部 HTTP 请求以绕过 CORS。Body: `{url, method, headers, body}`。由 AiApiTester 使用 |

密码读取优先级：运行时 `site.db` → 默认 `site.config.json` → `"admin"`。

### 编码规范

- 系统中不要在目录名称中出现多个单词组成的文件夹名称，尽可能的使用单个单词作为文件夹名称
- 系统中使用 pnpm 而不是 npm
- 新增的文件，及时添加到 git 中，add即可，不用commit
- 使用 naive-ui 中的组件 + tailwindcss 进行样式设计，确保一致性和可维护性
- **所有 `type` / `interface` 声明一律提取到 `src/types/` 下按领域分文件管理，禁止在组件或工具文件（`.vue` / `src/` 下非
  types 的 `.ts`）中内联定义命名类型**（仅允许 `import type` 引入）
- 新增工具涉及领域类型时，先在 `src/types/` 下按领域建立文件（如 `uuid.ts`、`regex.ts`），并以 `export type` /
  `export interface` 导出；组件内只 `import type { ... } from '@/types/...'`
- 组件内反复出现的匿名对象字面量类型（如 `{ label: string; pattern: string }`）也应命名后提取到 `src/types/`，保持组件只关注
  UI 与逻辑
- 原有的导出文件（如 `src/data/tools.ts`）通过 `export type { ... } from '@/types/...'` 重导出以保持向后兼容
- 重复的静态方法提取到 `src/utils` 中，不要散落在各个组件中
- 新增的工具组件统一使用 `*Tool.vue` 命名后缀
- 共享状态/逻辑使用 `src/composable/` 下的 composable 导出（`use*` 前缀）
- **view 中描述子组件作用/功能的注释写在 `<template>` 中组件标签上方**（`<!-- 组件名：说明 -->`），不要写在
  `<script>` 的 import 处；同一组件多次使用时只在第一次出现处注释
- **禁止使用已弃用的 JavaScript API**（如 `escape` / `unescape`、`String.prototype.substr`、`document.write`、
  `new Buffer()`、`fs.exists()`、`Function.caller` 等），一律改用现代等价 API：
    - 字符串编码/解码（UTF-8 ↔ Base64）使用 `TextEncoder` / `TextDecoder`，封装统一走 `src/utils/base64.ts` 的
      `encodeBase64` / `decodeBase64`（禁止 `btoa(unescape(encodeURIComponent(...)))` 旧写法）
    - 字符串截取使用 `slice` / `substring` 代替 `substr`
    - Node 端 Buffer 使用 `Buffer.from` / `Buffer.alloc`；文件存在性检查使用 `fs.access` / `fs.stat`

### TypeScript 配置说明

- `tsconfig.app.json` 覆盖 `src/**`（应用代码），继承自 `@vue/tsconfig/tsconfig.dom.json`
- `tsconfig.node.json` 覆盖 `vite.config.ts` + `vite-plugin-config.ts`（Node 端代码）
- 路径别名：`@/` 映射到 `src/`（在 `tsconfig.app.json` 和 `vite.config.ts` 中均配置）
- Node 端文件使用 `module: "nodenext"`，import 需显式写 `.ts` 扩展名
- 两者均启用 `erasableSyntaxOnly: true`：限制为仅类型擦除的特性（import、interface、type alias），禁止 enums 和 namespace

### CI/CD 与 DevOps

- **部署文件**：集中在 `docker/`（`Dockerfile`、`nginx.conf`）。CI 用 `docker build -f docker/Dockerfile .`（build context 为仓库根）
- **Dockerfile**：多阶段构建（node:24-alpine 构建 → node:24-alpine 运行时，只跑 `server/index.ts` API，端口 8080；nginx 由外部 compose 编排）
- **nginx.conf**：compose 编排参考模板。SPA 回退（`try_files ... /index.html`），gzip 开启，`/api/` 反代到 API 服务（`proxy_pass http://api:8080`）
- **GitLab CI**（`.gitlab-ci.yml`）：仅 Git Tag 触发，构建 dist 压缩包 + 多标签 Docker 镜像推送至私有 Nexus 仓库
- 项目目前 **没有配置任何测试框架**
