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

## 配置与认证

开发模式下提供配置管理 API：

| 端点          | 方法 | 说明                     |
|---------------|------|--------------------------|
| `/api/config` | GET  | 读取完整站点配置         |
| `/api/config` | POST | 覆写配置                 |
| `/api/auth`   | POST | 校验密码，返回认证 token |

密码读取优先级：运行时 `site.db.json` → 默认 `site.config.json` → `"admin"`。

访问 `/settings` 需先登录，无 token 时自动重定向到 `/login`。

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
- [node-json-db](https://github.com/Belphemur/node-json-db) — 轻量 JSON 数据库

## 许可证

[Apache 2.0](LICENSE)