# Greenfield Rebuild — Tasks

## Phase 0: Scaffold + Repository Setup ✅

- [x] Create `publieople/brain-game` repository on GitHub
- [x] `git init` and push initial commit
- [x] Create `backend/pyproject.toml` with FastAPI + SQLAlchemy + pyserial deps
- [x] Run `uv sync` for backend
- [x] Create `frontend/` with Vite 8 + React 19 + TS 5 scaffold
- [x] Install frontend deps: Tailwind v4, React Router v7, Zustand, ECharts
- [x] Configure Tailwind v4 with fluid-glass design tokens
- [x] Create `.gitignore` + `docker-compose.yml` (PostgreSQL)
- [x] **Verify**: `uv run uvicorn` import works, `vite build` succeeds

## Phase 1: Backend Modularization ✅

- [x] Split old main.py into module structure: `api/`, `ws/`, `device/`, `processors/`, `models/`, `services/`
- [x] Write Pydantic v2 schemas (TelemetryData, SessionData, Thresholds, etc.)
- [x] Write SQLAlchemy 2.0 async models (GameSession, EventLog, TelemetryLog, ProcessedMetric)
- [x] Implement async app factory in `__init__.py`
- [x] Refactor WebSocket Manager into `ws/__init__.py` + `ws/handlers.py`
- [x] Create REST API endpoints: sessions CRUD, telemetry, thresholds, analytics
- [x] Create TGAM device reader module in `device/tgam.py`
- [x] Create EEG simulator in `device/simulator.py`
- [x] Port fusion engine to `processors/fusion.py`
- [x] Port attention processing to `processors/attention.py` + `processors/__init__.py`
- [x] Create LLM report service in `services/llm_reports.py`
- [x] **Verify**: 23 routes registered, database init works

## Phase 2: Frontend Scaffold + Design System ✅

- [x] Set up Vite 8 + React 19 + TS 5 + Tailwind v4
- [x] Configure Tailwind with fluid-glass tokens (colors, glass layers, blur, radius, shadows)
- [x] Implement `<FluidBg>` animated background component
- [x] Implement `<GlassPanel>` / `<GlassPanelElevated>` / `<GlassPanelSubtle>` components
- [x] Implement `<Button>` with variants: primary, accent, danger, ghost
- [x] Implement `<Badge>` with variants: active, recommended, focus
- [x] Implement `<FormInput>`, `<Slider>`, `<Modal>` components
- [x] Implement `<Sidebar>` with collapse/expand animation
- [x] Set up React Router (`/`, `/play/star_raid`, `/play/archery`, `/play/reading`, `/dashboard`)
- [x] Create `useWebSocket` hook (auto-reconnect, JSON parse, connection state)
- [x] Create API client module (`lib/api.ts`)
- [x] **Verify**: `vite build` succeeds, Portal renders all components

## Phase 3: Portal Page ✅

- [x] Top nav bar: "NEURO FUSION PLATFORM" + user status
- [x] User identity card (player name input + confirm button)
- [x] Game card grid (Star Raid, Archery, Reading Training, Dashboard)
- [x] Status badges on each game card
- [x] Fluid background animation
- [x] Mobile responsive layout
- [x] **Verify**: matches original `portal.html` layout

## Phase 4: Star Raid Game Engine ✅

- [x] Translate `star_raid_rebuild.js` → TypeScript modules
- [x] `GameEngine` class (RAF loop, state machine: ready/running/paused/over)
- [x] `InputAdapter` class (WebSocket + keyboard dual-source)
- [x] Player movement, enemy spawning, bullet system, collision detection
- [x] Particle explosion system
- [x] HUD overlay (score, lives, shield, attention, meditation)
- [x] Threshold tuning panel (4 sliders: fire on/off, shield on/off)
- [x] Result modal (score, avg attention)
- [x] Game session lifecycle (start → play → end → save)
- [x] WebSocket telemetry integration
- [x] **Verify**: `vite build` succeeds, game page renders

## Phase 5: Remaining Pages ✅

- [x] Archery page + game logic (Canvas target shooting with charge mechanics)
- [x] Reading Training page (focus-based progress tracking)
- [x] Dashboard page with ECharts (KPI cards, realtime/session charts, session list, thresholds)
- [x] **Verify**: vite build succeeds, all pages navigable

## Phase 6: WebSocket + EEG Integration ✅

- [x] Backend EEG simulator WebSocket stream (`/ws/eeg`)
- [x] `useEEG` hook with auto-reconnect
- [x] Portal Sidebar shows realtime EEG data + simulator mode selector
- [x] StarRaid game engine receives EEG data via InputAdapter.feedEEG()
- [x] Threshold config → REST API (GET/PUT `/api/thresholds`)
- [x] Game session lifecycle (start → play → end → save)
- [x] **Verify**: backend 25 routes, frontend build succeeds

## Phase 7: CI/CD + Polish ✅

- [x] GitHub Actions (backend + frontend parallel build)
- [x] Vite build → FastAPI static serving (single-port production)
- [x] `build.sh` script for one-command deployment
- [x] Comprehensive README (architecture, quick start, API reference)
- [x] **Verify**: `./build.sh` succeeds, backend 28 routes, static files served
