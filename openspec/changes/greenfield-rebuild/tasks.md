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

## Phase 3: Portal Page

- [ ] Top nav bar: "NEURO FUSION PLATFORM" + user status
- [ ] User identity card (player name input + confirm button)
- [ ] Game card grid (Star Raid, Archery, Reading Training, Dashboard)
- [ ] Status badges on each game card
- [ ] Fluid background animation
- [ ] Mobile responsive layout
- [ ] **Verify**: matches original `portal.html` layout

## Phase 4: Star Raid Game Engine

- [ ] Translate `star_raid_rebuild.js` → TypeScript modules
- [ ] `GameEngine` class (RAF loop, state machine: ready/running/paused/over)
- [ ] `PlayerShip` class (movement, rotation, shield, invincibility)
- [ ] `EnemyManager` class (spawn waves, BOSS mode, difficulty scaling)
- [ ] `BulletManager` class (fire, recycle, collision)
- [ ] `CollisionSystem` class (ship-enemy, bullet-enemy)
- [ ] `ParticleSystem` (explosions, engine trail)
- [ ] `InputAdapter` class (WebSocket + keyboard dual-source, hysteresis)
- [ ] HUD component (score, lives, attention, shield bar)
- [ ] Threshold tuning panel (4 sliders: fire on/off, shield on/off)
- [ ] Result modal (score, avg attention, duration, stats)
- [ ] Immersive mode toggle (HUD auto-hide)
- [ ] WebSocket telemetry integration
- [ ] **Verify**: game runs, controls work (keyboard + WS), HUD updates, result modal shows

## Phase 5: Remaining Pages

- [ ] Archery page + game logic (from `archery.html` + `archery_game.js`)
- [ ] Reading Training page (from `reading_training.html`)
- [ ] Dashboard page with ECharts (from `dashboard.html` + ECharts integration)
- [ ] **Verify**: all pages navigable, content matches originals

## Phase 6: WebSocket + EEG Integration

- [ ] Backend WebSocket manager fully wired to frontend hooks
- [ ] `useEEGData` hook (realtime attention/meditation streaming)
- [ ] Threshold sync (frontend ↔ backend)
- [ ] Game session lifecycle (start → play → end → save)
- [ ] TGAM device connection from backend
- [ ] EEG simulator mode toggle
- [ ] **Verify**: end-to-end: simulator → WS → frontend → game reacts

## Phase 7: CI/CD + Polish

- [ ] GitHub Actions: lint, typecheck, build, test
- [ ] Frontend build output integrated into backend static serving
- [ ] Final visual comparison with original pages
- [ ] README with setup instructions
- [ ] **Verify**: fresh clone → install → run works
