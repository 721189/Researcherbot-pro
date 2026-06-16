# ResearchBot Pro 🤖🔬

> **AI-Powered Multi-Agent Research Platform** — Autonomous research workflow using three specialized AI agents that search, extract, and synthesize comprehensive reports with citations.

![ResearchBot Pro](https://img.shields.io/badge/ResearchBot-Pro-6366f1?style=for-the-badge&logo=robot&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)

---

## ✨ Features

### Multi-Agent Pipeline
| Agent | Role | Function |
|-------|------|----------|
| 🔍 **Searcher** | Research Analyst | Searches the web via Serper API for comprehensive results |
| 📊 **Extractor** | Data Scientist | Extracts key facts, statistics, quotes, and entities using GPT-4o-mini |
| 📝 **Synthesizer** | Report Writer | Generates a markdown report with inline citations |

### Core Capabilities
- **Self-Healing** — Automatic retry (3×, exponential backoff) with fallback chains
- **Immutable Audit Trail** — Every agent action logged, append-only, exportable as JSON
- **Full Observability** — LangSmith tracing, p50/p95/p99 latency, cost-per-request metrics
- **Real-Time Streaming** — SSE-powered live progress updates during research

### Premium UI
- 🌙 Dark theme with glassmorphism effects
- 📱 Fully responsive (mobile, tablet, desktop)
- ⌨️ Keyboard shortcuts (Ctrl+N, Ctrl+Enter)
- 📊 Live metrics dashboard with animated counters
- 📋 Agent timeline with expandable logs

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                    │
│   Dashboard │ New Query │ Results │ Logs │ History │ Settings │
└──────────────────────┬───────────────────────────────────────┘
                       │  REST API + SSE
┌──────────────────────▼───────────────────────────────────────┐
│                   Backend (FastAPI + Python)                   │
│  ┌─────────┐   ┌───────────┐   ┌──────────────┐              │
│  │ Searcher │──▶│ Extractor │──▶│ Synthesizer  │              │
│  └─────────┘   └───────────┘   └──────────────┘              │
│       │              │               │                        │
│  ┌────▼──────────────▼───────────────▼────┐                   │
│  │  Self-Healing │ Audit Logger │ Metrics  │                   │
│  └────────────────────────────────────────┘                   │
└──────────────────────┬───────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   ┌─────────┐   ┌──────────┐   ┌──────────┐
   │ Supabase │   │  Serper  │   │ LangSmith│
   │ (DB/Auth)│   │ (Search) │   │ (Tracing)│
   └─────────┘   └──────────┘   └──────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- [OpenAI API Key](https://platform.openai.com/api-keys)
- [Serper API Key](https://serper.dev) (free tier: 2,500 searches)

### 1. Clone & Configure

```bash
git clone <repo-url> researchbot-pro
cd researchbot-pro

# Copy environment template and fill in your API keys
cp .env.example .env
```

Edit `.env` with your actual API keys:
```env
OPENAI_API_KEY=sk-...
SERPER_API_KEY=...
```

### 2. Start with Docker Compose

```bash
docker-compose up --build
```

This starts:
- **Backend** at `http://localhost:8000` (FastAPI + Swagger UI at `/docs`)
- **Frontend** at `http://localhost:5173` (Vite dev server)

### 3. (Optional) Set Up Supabase

For persistent storage and authentication:

1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the contents of `backend/app/db/migrations.sql`
3. Add your Supabase URL and anon key to `.env`

> **Note:** The app works without Supabase using in-memory storage — perfect for local development and testing.

---

## 🛠️ Development (Without Docker)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/research` | Start a new research query |
| `GET` | `/api/research` | List all queries |
| `GET` | `/api/research/{id}` | Get query + results |
| `GET` | `/api/research/{id}/stream` | SSE stream for live progress |
| `DELETE` | `/api/research/{id}` | Delete a query |
| `GET` | `/api/logs/{result_id}` | Get agent logs |
| `GET` | `/api/logs/{result_id}/export` | Export logs as JSON |
| `GET` | `/api/metrics` | Get latency + cost metrics |
| `GET` | `/api/metrics/health` | Health check |

Full interactive documentation: `http://localhost:8000/docs`

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | ✅ | OpenAI API key for GPT-4o-mini |
| `SERPER_API_KEY` | ✅ | Serper.dev API key for web search |
| `SUPABASE_URL` | ❌ | Supabase project URL |
| `SUPABASE_KEY` | ❌ | Supabase anon/public key |
| `LANGSMITH_API_KEY` | ❌ | LangSmith API key for tracing |
| `LANGSMITH_PROJECT` | ❌ | LangSmith project name (default: `researchbot-pro`) |
| `MAX_RETRIES` | ❌ | Max retry attempts per agent (default: `3`) |
| `RETRY_BASE_DELAY` | ❌ | Base delay for exponential backoff in seconds (default: `1.0`) |

---

## 🧪 Testing

```bash
# Backend tests
cd backend && pytest tests/ -v

# Frontend type checking
cd frontend && npx tsc --noEmit

# Frontend linting
cd frontend && npm run lint
```

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.
