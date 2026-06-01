# Brain-Game Greenfield Rebuild — Design Document

> **Change:** greenfield-rebuild
> **Date:** 2026-06-01
> **Status:** Draft

---

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (SPA)                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React 19 App                                        │   │
│  │  ┌──────┐ ┌──────────┐ ┌─────────┐ ┌───────────┐   │   │
│  │  │Portal│ │Star Raid │ │ Archery │ │ Dashboard │   │   │
│  │  │Page  │ │Game Page │ │  Page   │ │   Page    │   │   │
│  │  └──────┘ └──────────┘ └─────────┘ └───────────┘   │   │
│  │       └──────────┬──────────┬──────────┘            │   │
│  │              ┌───┴────┐ ┌──┴─────┐                  │   │
│  │              │Shared  │ │Game    │                  │   │
│  │              │  UI    │ │Engine  │                  │   │
│  │              └───┬────┘ └──┬─────┘                  │   │
│  │          ┌───────┴──────────┴───────┐               │   │
│  │          │   Zustand Stores          │               │   │
│  │          │  (useGameStore / useEEG)  │               │   │
│  │          └───────┬──────────────────┘               │   │
│  │          ┌───────┴──────────────┐                   │   │
│  │          │  useWebSocket hook   │                   │   │
│  │          └───────┬──────────────┘                   │   │
│  └──────────────────┼──────────────────────────────────┘   │
└─────────────────────┼─────────────────────────────────────┘
                      │ WebSocket (ws://) + REST (http://)
                      │
┌─────────────────────┼─────────────────────────────────────┐
│  FastAPI (port 8000)                                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  brain_game/                                        │  │
│  │  ├── main.py          ← App factory                  │  │
│  │  ├── api/             ← REST: sessions/telemetry/...  │  │
│  │  ├── ws/              ← WebSocket manager + handlers  │  │
│  │  ├── device/          ← TGAM reader + simulators      │  │
│  │  ├── processors/      ← Fusion engine + EEG analysis   │  │
│  │  └── models/          ← Pydantic + SQLAlchemy          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Vite Build Integration

Vite 构建产物输出到 `backend/static/`，FastAPI 直接挂载：

```python
# backend/main.py
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    # React Router handles client-side routing
    return FileResponse("static/index.html")
```

### 1.3 Development Workflow

```bash
# Terminal 1: Backend
cd backend && uv run uvicorn brain_game.main:app --reload --port 8000

# Terminal 2: Frontend dev (Vite proxy → FastAPI)
cd frontend && npm run dev
# Vite dev server on :5173, proxies /api/* and /ws/* to :8000
```

---

## 2. Frontend Architecture

### 2.1 Directory Structure

```
frontend/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── src/
    ├── main.tsx                    # React entry
    ├── App.tsx                     # Router setup
    ├── index.css                   # Tailwind base + fluid-glass tokens
    ├── pages/
    │   ├── Portal.tsx              # Main menu
    │   ├── StarRaid.tsx            # Star Raid game
    │   ├── Archery.tsx             # Archery game
    │   ├── ReadingTraining.tsx     # Reading training
    │   └── Dashboard.tsx           # Analytics dashboard
    ├── components/
    │   ├── ui/
    │   │   ├── GlassPanel.tsx      # Glass morphism panel
    │   │   ├── Button.tsx          # Button with variants
    │   │   ├── Badge.tsx           # Status badge
    │   │   ├── Slider.tsx          # Threshold slider
    │   │   └── Modal.tsx           # Result modal
    │   ├── layout/
    │   │   ├── Sidebar.tsx         # Sidebar component
    │   │   ├── FluidBg.tsx         # Animated background
    │   │   └── TopHeader.tsx       # Navigation header
    │   ├── game/
    │   │   ├── Canvas.tsx          # Canvas wrapper
    │   │   ├── HUD.tsx             # Game HUD overlay
    │   │   └── ThresholdPanel.tsx  # Threshold controls
    │   └── dashboard/
    │       └── EChartWrapper.tsx   # ECharts wrapper
    ├── game/
    │   ├── types.ts                # Game types/interfaces
    │   ├── engine.ts               # GameEngine class
    │   ├── entities.ts             # Entity base class
    │   ├── player-ship.ts          # PlayerShip
    │   ├── enemies.ts              # Enemy + EnemyManager
    │   ├── bullets.ts              # Bullet + BulletManager
    │   ├── collision.ts            # CollisionSystem
    │   └── particles.ts            # Particle effects
    ├── hooks/
    │   ├── useWebSocket.ts         # WebSocket with auto-reconnect
    │   ├── useEEG.ts               # EEG data hook
    │   ├── useGameState.ts         # Game lifecycle hook
    │   └── useThreshold.ts         # Threshold sync hook
    ├── stores/
    │   ├── gameStore.ts            # Game state store
    │   └── eegStore.ts             # EEG data store
    └── lib/
        ├── api.ts                  # REST API client
        └── ws-client.ts            # WebSocket low-level client
```

### 2.2 Component Tree (Portal Page)

```
<FluidBg />
<TopHeader logo="NEURO FUSION PLATFORM" userStatus="unauthenticated" />
<Sidebar>
  <SidebarVideo />   ← Camera stream
  <SidebarEEG />     ← EEG realtime data
  <SidebarControls /> ← Game controls
</Sidebar>
<main>
  <UserCard>
    <Input placeholder="玩家名称" />
    <Button variant="primary">确认</Button>
  </UserCard>
  <section>
    <h2>游戏模式 <span className="text-accent">GAMES</span></h2>
    <div className="game-grid">
      <GameCard title="星际突袭" status="active" />
      <GameCard title="射箭训练" status="recommended" />
      <GameCard title="阅读训练" status="focus" />
      <GameCard title="数据面板" status="default" />
    </div>
  </section>
</main>
```

### 2.3 WebSocket Hook Design

```typescript
// useWebSocket hook API
const { status, lastMessage, send, reconnect } = useWebSocket({
  url: `${WS_BASE}/ws`,
  autoReconnect: true,
  maxRetries: 10,
  onMessage: (data) => {
    // Handle telemetry, control, reset_state messages
    switch (data.action) {
      case 'telemetry': eegStore.update(data.value); break;
      case 'keydown': case 'keyup': gameStore.handleInput(data); break;
      case 'reset_state': gameStore.reset(); break;
    }
  },
});
```

### 2.4 Zustand Stores

```typescript
// EEG Store
interface EEGStore {
  attention: number;       // 0-100
  meditation: number;      // 0-100
  signalQuality: number;   // 0-200
  attentionHistory: number[];  // rolling window
  update: (data: EEGData) => void;
}

// Game Store (per-game session)
interface GameStore {
  status: 'idle' | 'playing' | 'paused' | 'over';
  score: number;
  lives: number;
  shield: boolean;
  thresholds: ThresholdConfig;
  setThresholds: (t: Partial<ThresholdConfig>) => void;
  start: () => void;
  pause: () => void;
  end: () => void;
}
```

---

## 3. Backend Architecture

### 3.1 Module Structure

```
backend/
├── pyproject.toml
├── uv.lock
├── .env                        # DATABASE_URL, EEG_COM_PORT, etc.
└── brain_game/
    ├── __init__.py
    ├── main.py                 # App factory, lifespan, static mount
    │
    ├── api/
    │   ├── __init__.py
    │   ├── router.py           # API router aggregation
    │   ├── sessions.py         # POST/GET /api/sessions
    │   ├── telemetry.py        # POST/GET /api/telemetry
    │   ├── thresholds.py       # GET/PUT /api/thresholds
    │   └── reports.py          # POST /api/reports (LLM)
    │
    ├── ws/
    │   ├── __init__.py
    │   ├── manager.py          # ConnectionManager
    │   └── handlers.py         # WebSocket endpoint /ws
    │
    ├── device/
    │   ├── __init__.py
    │   ├── tgam.py             # TGAM serial protocol parser
    │   └── simulator.py        # EEG signal simulator
    │
    ├── processors/
    │   ├── __init__.py
    │   ├── fusion.py           # FusionControlEngine
    │   └── attention.py        # Attention metrics processor
    │
    ├── models/
    │   ├── __init__.py
    │   ├── database.py         # Async engine + session factory
    │   ├── schemas.py          # Pydantic v2 models
    │   └── orm.py              # SQLAlchemy ORM models
    │
    └── services/
        ├── __init__.py
        ├── llm_reports.py      # LLM report generation
        └── video_stream.py     # Video streaming service
```

### 3.2 Database Models (SQLAlchemy 2.0 Async)

```python
# GameSession
class GameSession(Base):
    __tablename__ = "game_sessions"
    id: Mapped[int] = mapped_column(primary_key=True)
    player_name: Mapped[str]
    game_mode: Mapped[str]          # star_raid | archery | reading
    start_time: Mapped[datetime]
    end_time: Mapped[datetime | None]
    score: Mapped[int | None]
    avg_attention: Mapped[float | None]
    avg_meditation: Mapped[float | None]
    llm_report: Mapped[str | None]
    created_at: Mapped[datetime] = field(default_factory=datetime.utcnow)

# TelemetryLog (raw EEG samples)
class TelemetryLog(Base):
    __tablename__ = "telemetry_logs"
    id: Mapped[int] = mapped_column(primary_key=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("game_sessions.id"))
    timestamp: Mapped[float]
    attention: Mapped[float]
    meditation: Mapped[float]
    signal_quality: Mapped[float]
    delta: Mapped[float | None]
    theta: Mapped[float | None]
    alpha: Mapped[float | None]
    beta: Mapped[float | None]
    gamma: Mapped[float | None]
```

### 3.3 WebSocket Message Protocol

All messages are JSON with `{ action, value }` structure:

| action | direction | value | purpose |
|--------|-----------|-------|---------|
| `telemetry` | server → client | `{ eeg, vision, timestamp }` | Real-time EEG data |
| `keydown` / `keyup` | both | `{ key: "left"\|"right"\|"up"\|"fire"\|"shield" }` | Control commands |
| `reset_state` | server → client | `true` | Reset all input states |
| `thresholds` | both | `{ attention_fire_on, ... }` | Threshold sync |
| `session:start` | server → client | `{ session_id }` | Game session started |
| `session:end` | client → server | `{ session_id }` | Game session completed |

### 3.4 REST API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/sessions` | Create new game session |
| GET | `/api/sessions` | List sessions (paginated) |
| GET | `/api/sessions/{id}` | Get session detail |
| POST | `/api/telemetry` | Submit EEG telemetry |
| GET | `/api/telemetry` | Get latest telemetry |
| GET | `/api/thresholds` | Get threshold config |
| PUT | `/api/thresholds` | Update threshold config |
| POST | `/api/reports` | Generate LLM report for session |
| POST | `/api/reset_state` | Reset all control states |
| GET | `/api/video/status` | Video stream status |
| POST | `/api/video/start` | Start video stream |
| POST | `/api/video/stop` | Stop video stream |

---

## 4. Game Engine Architecture (TypeScript)

### 4.1 Entity Class Hierarchy

```
BaseEntity
├── PlayerShip
│   ├── movement (keyboard/EEG controlled)
│   ├── shield (toggle via meditation threshold)
│   └── invincibility (post-hit grace period)
├── Enemy
│   ├── NormalEnemy
│   └── BossEnemy
├── Bullet
│   ├── PlayerBullet
│   └── EnemyBullet
└── Particle
    ├── ExplosionParticle
    └── TrailParticle

GameEngine
├── entities: BaseEntity[]
├── input: InputAdapter
├── collision: CollisionSystem
├── particles: ParticleSystem
├── state: 'ready' | 'running' | 'paused' | 'over'
├── score: number
├── lives: number
├── loop(timestamp): void    # RAF callback
├── start(): void
├── pause(): void
├── resume(): void
└── end(): void
```

### 4.2 InputAdapter Design

```typescript
class InputAdapter {
  private keys: Map<string, boolean>;    // Keyboard state
  private bcuState: BCUState;            // EEG-driven state
  private fireHysteresis: Hysteresis;    // attention fire on/off
  private shieldHysteresis: Hysteresis;  // meditation shield on/off

  // Input priority: keyboard > BCU
  // Keyboard keys directly set keys map
  // BCU updates based on threshold hysteresis
  
  get fire(): boolean;    // Space || attention > fire_on threshold
  get shield(): boolean;  // Shift || meditation > shield_on threshold
  get left(): boolean;    // ArrowLeft/A || gaze left
  get right(): boolean;   // ArrowRight/D || gaze right
  get up(): boolean;      // ArrowUp/W || gaze up
}
```

---

## 5. Design Token Migration

### 5.1 Tailwind v4 Theme Configuration

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',  100: '#e0e7ff',  200: '#c7d2fe',
          300: '#a5b4fc',  400: '#818cf8',  500: '#6366f1',
          600: '#4f46e5',  700: '#4338ca',  800: '#3730a3',
          900: '#312e81',
        },
        accent: {
          cyan: '#06b6d4',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
        },
        glass: {
          thin: 'hsla(0, 0%, 100%, 0.08)',
          medium: 'hsla(0, 0%, 100%, 0.12)',
          thick: 'hsla(0, 0%, 100%, 0.18)',
          heavy: 'hsla(0, 0%, 100%, 0.25)',
        },
        slate: { /* full palette */ },
      },
      backdropBlur: {
        xs: '4px', sm: '8px', md: '12px',
        lg: '16px', xl: '24px', '2xl': '40px',
      },
      borderRadius: {
        xs: '4px', sm: '8px', md: '12px',
        lg: '16px', xl: '20px', '2xl': '28px',
        full: '9999px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 hsla(0, 0%, 0%, 0.3), inset 0 1px 0 0 hsla(0, 0%, 100%, 0.1)',
        'glass-hover': '0 12px 48px 0 hsla(0, 0%, 0%, 0.4), inset 0 1px 0 0 hsla(0, 0%, 100%, 0.15)',
        'glow-primary': '0 0 20px hsla(228, 89%, 66%, 0.4), 0 0 60px hsla(228, 89%, 66%, 0.2)',
        'glow-accent': '0 0 20px hsla(189, 100%, 56%, 0.4), 0 0 60px hsla(189, 100%, 56%, 0.2)',
      },
      animation: {
        'mesh-flow': 'mesh-flow 20s ease-in-out infinite',
        'fluid-pulse': 'fluid-pulse 15s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'mesh-flow': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '25%': { backgroundPosition: '100% 0%' },
          '50%': { backgroundPosition: '0% 100%' },
          '75%': { backgroundPosition: '50% 0%' },
        },
        'fluid-pulse': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '33%': { opacity: '0.8', transform: 'scale(1.05)' },
          '66%': { opacity: '0.7', transform: 'scale(0.98)' },
        },
      },
    },
  },
};
```

### 5.2 CSS Keyframes (inline, for complex animations)

Complex animations like `mesh-flow` background-position patterns and glass panel `::before` pseudo-element effects that can't be expressed in Tailwind will be defined in `index.css` as standard CSS keyframes and referenced via Tailwind's `@apply` or inline `style=` for pseudo-elements.

---

## 6. Phase Execution Strategy

| Phase | Scope | Strategy |
|-------|-------|----------|
| 0 | scaffold + repo | Parallel: backend uv sync + frontend vite create |
| 1 | backend | Modularize existing code, no new logic |
| 2 | frontend scaffold + design system | All UI components, no game logic |
| 3 | portal page | Static page, no WebSocket |
| 4 | star raid game engine | Modular TS translation, verify each module |
| 5 | remaining pages | Archery, Reading, Dashboard |
| 6 | WebSocket integration | Connect backend ↔ frontend |
| 7 | CI/CD + polish | Tests, build, deploy |

Each phase is self-contained and testable. The user can verify after each phase before proceeding.

---

## 7. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Vite 8 Rolldown API mismatch | Medium | High | Pin Vite to latest stable; test build early |
| Canvas rendering perf regression | Low | Medium | Compare FPS with original; use performance.now() profiling |
| WebSocket latency in dev | Low | Low | Vite proxy for WS in dev; test with backend on same port |
| TGAM serial protocol port | Low | Medium | Keep existing tgam.py parser, wrap in async context |
| Tailwind pseudo-element glass effect | Medium | Low | Use `::before` via CSS module for complex glass border |


## 8. Open Questions

- LLM report generation: OpenAI-compatible API (DeepSeek) from original?
- Video streaming via WebSocket or separate endpoint?
- PWA support needed for offline/cache?
