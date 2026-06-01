# Greenfield Rebuild — Proposal

## Problem

现有 `brain-game` 项目存在以下问题：

1. **单体后端**：1362 行的 `main.py` 混合了路由、WebSocket 管理、数据处理、业务逻辑
2. **无前端框架**：jQuery 1.4.1 + 原生 JS，难以维护和扩展
3. **CSS 无构建流程**：自定义 CSS 变量零散分布，缺乏组件化
4. **游戏引擎未模块化**：1130 行 JS 单体文件，高耦合
5. **无版本控制**：旧仓库在 Gitee/本地，无规范的代码管理
6. **平台限制**：Windows 优先，WSL 支持不完整

## Goal

将 brain-game 重构为**规范的现代化全栈项目**，保留原版 Fluid Glass 视觉设计 100%，代码质量升级到生产级。

## Scope

| 包含 | 不包含 |
|------|--------|
| 后端 FastAPI 模块化重构 | EEG 算法创新（保持现有算法） |
| 前端 Vite + React SPA | 新增游戏模式（保持现有 4 种） |
| Fluid Glass → Tailwind tokens | 用户管理系统（保持基础会话） |
| Canvas 游戏引擎 TS 翻译 | 移动端适配（保留桌面优先） |
| Comet 工作流驱动开发 | 数据库迁移（全新初始化） |
| CI/CD + GitHub 托管 | Windows 原生运行（WSL 优先） |

## Non-goals

- 不引入 Next.js（SPA 足够）
- 不替换 FastAPI（已够现代）
- 不改变游戏逻辑/算法
- 不添加新游戏模式（Phase 0-7 只做还原）
