# Greenfield Rebuild — Tasks

## Phase 0: Scaffold + Repository Setup

- [ ] Create `publieople/brain-game` repository on GitHub
- [ ] `git init` and push initial commit
- [ ] Create `backend/pyproject.toml` with FastAPI + SQLAlchemy + pyserial deps
- [ ] Run `uv sync` for backend
- [ ] Create `frontend/` with `npm create vite@latest` (React + TS template)
- [ ] Install frontend deps: Tailwind v4, React Router v7, Zustand, ECharts
- [ ] Configure Tailwind v4 with fluid-glass design tokens
- [ ] Create `.gitignore` (Python + Node)
- [ ] Create `docker-compose.yml` (PostgreSQL service)
- [ ] **Verify**: `uv run uvicorn` starts, `npm run dev` starts

## Phase 1: Backend Modularization

- [ ] Split `main.py` into module structure: `api/`, `ws/`, `device/`, `processors/`, `models/`
- [ ] Write Pydantic v2 schemas (TelemetryData, SessionData, Thresholds, etc.)
- [ ] Write SQLAlchemy 2.0 async models (GameSession, EventLog, TelemetryLog)
- [ ] Implement App factory pattern in `main.py`
- [ ] Refactor WebSocket Manager into `ws/manager.py`
- [ ] Create REST API endpoints: sessions CRUD, telemetry, thresholds, reports
- [ ] Create TGAM device reader module in `device/tgam.py`
- [ ] Create EEG simulator in `device/simulator.py`
- [ ] Port fusion engine to `processors/fusion.py`
- [ ] Port attention processing to `processors/attention.py`
- [ ] **Verify**: all 81 existing tests pass

## Phase 2: Frontend Scaffold + Design System

- [ ] Set up Vite 8 + React 19 + TS 5 + Tailwind v4
- [ ] Configure Tailwind with fluid-glass tokens (colors, glass layers, blur, radius, shadows)
- [ ] Implement `<FluidBg>` animated background component
- [ ] Implement `<GlassPanel>` / `<GlassPanelElevated>` / `<GlassPanelSubtle>` components
- [ ] Implement `<Button>` with variants: primary, accent, danger, ghost
- [ ] Implement `<Badge>` with variants: active, recommended, focus
- [ ] Implement `<FormInput>`, `<Slider>`, `<Modal>` components
- [ ] Implement `<Sidebar>` with collapse/expand animation
- [ ] Set up React Router (`/`, `/play/star_raid`, `/play/archery`, `/play/reading`, `/dashboard`)
- [ ] Create `useWebSocket` hook (auto-reconnect, JSON parse, connection state)
- [ ] Create API client module (`lib/api.ts`)
- [ ] **Verify**: all components render, router works, sidebar toggles

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
