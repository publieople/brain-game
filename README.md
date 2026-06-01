# Brain-Game 🧠🎮

Brain-Controlled Game Platform — EEG + vision fusion control games.

A modernized rebuild of the original brain-controlled asteroid game, featuring:

- **EEG Control** — NeuroSky MindWave (TGAM) device support + built-in simulator
- **Vision Fusion** — Camera-based head tracking + EEG fusion (backend-ready)
- **4 Game Modes** — Star Raid (space shooter), Archery (focus aiming), Reading Training, Analytics Dashboard
- **Real-time WebSocket** — 10Hz EEG telemetry streaming
- **AI Reports** — LLM-generated performance analysis (OpenAI-compatible)
- **Fluid Glass UI** — Custom design system with glass morphism, dynamic gradients, neon glow

## Architecture

```
brain-game/
├── frontend/          # Vite 8 + React 19 + TypeScript 5 SPA
│   ├── src/
│   │   ├── pages/     # 5 game/analytics pages
│   │   ├── components/ # Fluid Glass design system components
│   │   ├── game/      # TypeScript game engines (Canvas 2D)
│   │   ├── hooks/     # useWebSocket, useEEG
│   │   └── lib/       # REST API client
│   └── dist/          # Build output (copied to backend/static/)
│
├── backend/           # FastAPI modular server
│   └── brain_game/
│       ├── api/       # REST: sessions, telemetry, thresholds, analytics
│       ├── ws/        # WebSocket: game control + EEG streaming
│       ├── device/    # TGAM protocol parser + EEG simulator
│       ├── processors/ # Attention metrics + fusion engine
│       ├── models/    # Pydantic v2 + SQLAlchemy 2.0 async ORM
│       └── services/  # LLM report generation
│
├── .github/           # GitHub Actions CI
└── docs/superpowers/  # Comet workflow artifacts
```

## Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | Vite 8 + React 19 + TypeScript 5 + Tailwind v4 |
| Backend | FastAPI + SQLAlchemy 2.0 async |
| Game Engine | Canvas 2D (TypeScript, no framework) |
| Charts | ECharts 5 |
| Communication | WebSocket (game control + EEG data) |
| Device | pyserial (NeuroSky MindWave TGAM protocol) |
| Database | PostgreSQL (prod) / SQLite (dev) |
| AI Reports | OpenAI-compatible API (DeepSeek, etc.) |

## Quick Start

### Prerequisites
- Python 3.11+ / uv
- Node.js 22+ / npm

### 1. Backend

```bash
cd backend
uv sync
uv run uvicorn brain_game.main:app --reload --port 8000
```

### 2. Frontend (development mode)

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` — Vite proxies API/WS to backend.

### 3. Production build

```bash
# Build frontend + copy to backend
./build.sh

# Start single-port server
cd backend
uv run uvicorn brain_game.main:app --host 0.0.0.0 --port 8000
```

Visit `http://localhost:8000` — everything served from one port.

### 4. EEG Simulator

The EEG simulator starts automatically when you open the Portal page.
You can switch between modes in the sidebar:

| Mode | Description |
|------|-------------|
| Steady | Stable ~50 attention |
| Fluctuating | Varies 20-80 |
| Focused | High ~75, stable attention |
| Distracted | Low ~25, erratic |

## API Overview

| Method | Path | Purpose |
|--------|------|---------|
| WS | `/ws` | Game control messages |
| WS | `/ws/eeg` | EEG telemetry stream (10Hz) |
| POST | `/api/session/start` | Start game session |
| POST | `/api/session/{id}/end` | End game session |
| POST | `/api/telemetry` | Submit EEG data |
| GET/PUT | `/api/thresholds` | Control thresholds |
| GET | `/api/analytics/summary` | Dashboard KPIs |
| GET | `/api/analytics/sessions` | Paginated session history |
| GET | `/api/analytics/session/{id}` | Session detail + metrics |

## Environment Variables

```bash
# Database (default: SQLite)
DATABASE_URL=postgresql+psycopg2://user:pass@localhost:5432/brain_game

# EEG device
EEG_COM_PORT=COM3

# LLM API (for AI performance reports)
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.deepseek.com/v1
LLM_MODEL=deepseek-chat
```

## License

MIT
