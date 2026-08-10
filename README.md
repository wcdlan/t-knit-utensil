# TKU — T Knit Utensil

开发者常用在线工具集合，无需安装，即开即用。

> **声明：本项目由 AI 99% 负责开发，本人只负责小调整和提示词修改。**

## 技术栈

- Vue 3 + TypeScript
- Vite 8
- Tailwind CSS v4
- Vue Router 5

## 功能

5 个工具分组，共 14 个实用工具：

| 分组     | 工具                             |
|----------|----------------------------------|
| 编解码   | Base64、URL 编解码、Unicode 互转 |
| 格式化   | JSON 格式化、SQL 格式化          |
| 转换器   | 时间戳转换、颜色转换             |
| 生成器   | UUID、哈希计算、二维码、密码生成 |
| 文本工具 | 正则测试、文本对比、字数统计     |

所有工具纯前端运算，数据不离开浏览器。

## 开发

```bash
pnpm install
pnpm dev      # 启动开发服务器
pnpm build    # 生产构建
pnpm preview  # 预览构建结果
```
