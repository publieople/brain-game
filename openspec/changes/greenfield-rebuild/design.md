# Greenfield Rebuild — Design

## Architecture

```
Monorepo:
brain-game/
├── frontend/               # Vite 8 + React 19 + TS 5 SPA
│   └── src/
│       ├── pages/          # Portal / StarRaid / Archery / Reading / Dashboard
│       ├── components/     # GlassPanel, Button, Badge, Slider, Modal, Sidebar
│       ├── game/           # GameEngine, PlayerShip, EnemyManager, etc.
│       ├── hooks/          # useWebSocket, useEEG, useGameState
│       ├── lib/            # api, ws-client, utils
│       └── styles/         # tailwind.config, fluid-glass tokens
│
├── backend/                # FastAPI 模块化
│   └── brain_game/
│       ├── api/            # REST routes (sessions, telemetry, thresholds, reports)
│       ├── ws/             # WebSocket manager + handlers
│       ├── device/         # TGAM reader, EEG simulator
│       ├── processors/     # EEG fusion engine, attention processing
│       ├── models/         # Pydantic schemas + SQLAlchemy
│       └── main.py         # App factory
│
└── openspec/               # Comet workflow artifacts
    └── changes/
        └── greenfield-rebuild/
```

## Data Flow

```
TGAM Device / EEG Simulator
    ↓ serial
Python Controller  ──→  FastAPI WS /api/telemetry  ──→  WebSocket Manager
    ↓ (WebSocket)                                           ↓ broadcast
FusionEngine  ←─────────── ─── ───  ─── ───                 ↓
    ↓ decision                                BrainGame Frontend (React)
Canvas Game Engine  ←───  InputAdapter   ←───  useWebSocket hook
    ↓                                                      ↓
HUD / Sidebar / Dashboard ←──── Zustand stores ────  attention/telemetry
```

## Key Decisions

### 1. SPA over SSR
游戏页面全屏 Canvas 操作，不需要 SSR。Vite 8 开发快，构建产物由 FastAPI 托管同一端口。

### 2. Tailwind v4 for styling
Fluid Glass 设计系统映射为 Tailwind 主题 token。复杂动画（mesh-flow, fluid-pulse）保留为内联 CSS keyframes。

### 3. Zustand for state
每个游戏模式独立 store，WebSocket 数据通过 hook 写入 store，组件响应式更新。

### 4. Canvas 游戏引擎 → TypeScript classes
每个游戏实体独立类文件（PlayerShip, Enemy, Bullet, CollisionSystem），继承 BaseEntity。

### 5. SQLite for dev, PostgreSQL for prod
环境变量切换 `DATABASE_URL`，SQLAlchemy 2.0 async ORM 统一接口。

### 6. Monorepo without workspace tooling
两个独立的包管理（uv for Python, npm for frontend），无需 monorepo 工具。

## Design Token Migration

| CSS Variable | Tailwind Token |
|-------------|----------------|
| `--color-primary-500` | `primary-500: #6366f1` |
| `--color-accent-cyan` | `accent-cyan: #06b6d4` |
| `--bg-base` | `bg-base: linear-gradient(...)` |
| `--glass-thin` | `glass/thin: hsla(0,0%,100%,0.08)` |
| `--glass-medium` | `glass/medium: hsla(...)` |
| `--blur-xl` | `blur/xl: 24px` |
| `--radius-xl` | `radius/xl: 20px` |
| ... | others mapped similarly |
