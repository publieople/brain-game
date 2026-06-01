---
change: greenfield-rebuild
design-doc: docs/superpowers/specs/2026-06-01-brain-game-migration-design.md
base-ref: ""
---

# Phase 0: Scaffold + Repository Setup — Implementation Plan

> **Goal:** Initialize the repo, create backend and frontend scaffolds, install dependencies, verify both run.
>
> **Architecture:** Monorepo with `backend/` (FastAPI) and `frontend/` (Vite 8 + React 19 + TS 5). Independent package managers: uv for Python, npm for frontend.
>
> **Tech Stack:** Python 3.14 / FastAPI / uv / SQLAlchemy 2.0 async / Vite 8 / React 19 / Tailwind v4 / Zustand / ECharts

---

### Task 0.1: Create GitHub repository and initial commit

**Objective:** Create remote repo, git init locally, first commit

**Files:** `.gitignore`, `README.md`

**Step 1: Create GitHub repo**

```bash
gh repo create publieople/brain-game --public --description "Brain-Controlled Game Platform — EEG + vision fusion control games" --homepage "https://github.com/publieople/brain-game"
```

**Step 2: Write .gitignore**

```
# Python
__pycache__/
*.py[cod]
*.egg-info/
.venv/
uv.lock

# Node
node_modules/
dist/
.vite/

# IDE
.idea/
.vscode/
*.swp

# Environment
.env
.env.local

# OS
.DS_Store
Thumbs.db

# Project
outputs/
*.db
```

**Step 3: Write README.md** (minimal, will expand later)

**Step 4: git init + first commit**

```bash
git init
git add .
git commit -m "chore: initial scaffold"
git branch -M main
git remote add origin git@github.com:publieople/brain-game.git
git push -u origin main
```

**Verify:** `gh repo view publieople/brain-game` returns the repo

---

### Task 0.2: Backend scaffold

**Objective:** FastAPI modular structure with pyproject.toml

**Files:**
- Create: `backend/pyproject.toml`
- Create: `backend/brain_game/__init__.py`
- Create: `backend/brain_game/main.py` (minimal app factory)
- Create: `backend/.env.example`

**Step 1: pyproject.toml**

```toml
[project]
name = "brain-game-backend"
version = "0.2.0"
description = "Brain-Game Backend — EEG fusion control server"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.115.0",
    "uvicorn[standard]>=0.34.0",
    "sqlalchemy[asyncio]>=2.0.36",
    "aiosqlite>=0.20.0",
    "psycopg2-binary>=2.9.10",
    "pyserial>=3.5",
    "python-dotenv>=1.0.0",
    "openai>=1.12.0",
    "numpy>=1.24.0",
    "scipy>=1.10.0",
]
```

**Step 2: Minimal main.py** (app factory with CORS, lifespan)

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    yield
    # Shutdown


def create_app() -> FastAPI:
    app = FastAPI(title="Brain Game Server", version="0.2.0", lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    return app


app = create_app()
```

**Step 3: uv sync**

```bash
cd backend && uv sync
```

**Verify:** `uv run uvicorn brain_game.main:app --port 8000` starts and responds to GET /

---

### Task 0.3: Frontend scaffold

**Objective:** Vite 8 + React 19 + TS 5 + Tailwind v4 + Router + Zustand + ECharts

**Files:**
- Vite scaffold (auto-generated)
- `frontend/vite.config.ts` (with proxy to backend)
- `frontend/tailwind.config.ts` (fluid-glass tokens)
- `frontend/src/index.css` (Tailwind base + keyframes)
- `frontend/src/App.tsx` (router placeholder)
- `frontend/src/main.tsx` (entry point)

**Step 1: Create Vite project**

```bash
cd frontend && npm create vite@latest . -- --template react-ts
```

**Step 2: Install dependencies**

```bash
npm install react-router-dom zustand echarts echarts-for-react
npm install -D tailwindcss @tailwindcss/vite
```

**Step 3: Configure Tailwind v4**

Vite plugin in `vite.config.ts`:
```typescript
import tailwindcss from '@tailwindcss/vite'

plugins: [tailwindcss(), react()]
```

Add `@import "tailwindcss"` to `src/index.css` and define fluid-glass design tokens as CSS custom properties in `index.css`.

**Step 4: Vite proxy** (dev → backend)

```typescript
server: {
  proxy: {
    '/api': 'http://localhost:8000',
    '/ws': { target: 'ws://localhost:8000', ws: true },
  },
}
```

**Step 5: Minimal App.tsx with React Router**

**Verify:** `npm run dev` starts on :5173, page renders

---

### Task 0.4: Docker Compose + .gitignore + lint config

**Objective:** Optional PostgreSQL for production, ESLint for frontend

**Files:** `docker-compose.yml`

**Step 1: docker-compose.yml**

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: brain_game
      POSTGRES_USER: brain_game
      POSTGRES_PASSWORD: brain_game
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

**Step 2: ESLint config for TS**

**Verify:** `docker compose up -d` starts PostgreSQL (optional, only for production testing)

---

### Task 0.5: Create change branch and push

**Objective:** Codebase is ready, create phase branch

```bash
git checkout -b greenfield-rebuild
git add .
git commit -m "chore: Phase 0 scaffold — backend + frontnet + docker"
git push -u origin greenfield-rebuild
```

Record base-ref:
```bash
git rev-parse HEAD
```
