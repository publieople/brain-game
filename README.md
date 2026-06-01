# Brain-Game 🧠🎮

Brain-Controlled Game Platform — EEG + vision fusion control games.

A modernized rebuild of the original brain-controlled asteroid game, featuring:

- **EEG Control** — NeuroSky MindWave (TGAM) device support
- **Vision Fusion** — Camera-based head tracking + EEG fusion
- **4 Game Modes** — Star Raid, Archery, Reading Training, Dashboard
- **Real-time Analytics** — EEG telemetry with ECharts visualization
- **AI Reports** — LLM-generated performance analysis

## Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | Vite 8 + React 19 + TypeScript 5 + Tailwind v4 |
| Backend | FastAPI + SQLAlchemy 2.0 async + WebSocket |
| Game Engine | Canvas 2D (TypeScript) |
| Device | pyserial (TGAM MindWave protocol) |
| Database | PostgreSQL (prod) / SQLite (dev) |

## Quick Start

```bash
# Backend
cd backend
uv sync
uv run uvicorn brain_game.main:app --reload --port 8000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` (dev) or `http://localhost:8000` (production build).

## License

MIT
