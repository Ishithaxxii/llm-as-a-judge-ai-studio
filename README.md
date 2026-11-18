# LLMAJ — LLM as a Judge

**A multi-model evaluation studio for AI-generated responses.**

LLMAJ evaluates an AI-generated answer using independent LLM judges, configurable rubrics, and measurable agreement signals. Instead of relying on a single model's opinion, it brings multiple evaluations together in one workspace.

- **Live app:** https://llmaj-studio.vercel.app
- **Backend API:** https://llmaj-backend.onrender.com
- **API health:** https://llmaj-backend.onrender.com/health

## Why LLMAJ?

LLM outputs can sound convincing while still being incorrect, incomplete, or misaligned with the user's request. LLMAJ provides a structured way to inspect response quality across multiple dimensions and compare independent judge assessments.

## Features

- **Multi-model judging:** evaluate responses with Groq- and Gemini-powered judges.
- **Rubric-based evaluation:** use rubric templates or create a custom rubric with weighted criteria.
- **Evaluation dimensions:** answer correctness, relevance, query alignment, semantic similarity, tone, and tool calling.
- **Context-aware scoring:** semantic similarity is not scored when no reference answer is supplied; tool-calling evaluation is not scored when no tool trace is supplied.
- **Judge comparison:** inspect individual scores, reasoning, confidence, and latency.
- **Aggregate metrics:** view aggregate score, judge agreement, score spread, and disagreement flags where enough judge results are available.
- **Partial-failure handling:** retain successful judge results when another provider fails, with failed judges reported separately.
- **Persistent storage:** SQLite for local development and PostgreSQL for production.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, Tailwind CSS, Framer Motion, Recharts |
| Backend | Python, FastAPI, Pydantic |
| Database | SQLAlchemy, SQLite (local), PostgreSQL with asyncpg (production) |
| LLM providers | Groq, Google Gemini |
| Deployment | Vercel (frontend), Render (backend), Neon (PostgreSQL) |

## Architecture

```text
Browser
  |
  v
React + Vite frontend (Vercel)
  |
  | HTTPS API requests
  v
FastAPI backend (Render)
  |                 |
  v                 v
Neon PostgreSQL   Groq / Gemini
(production data) (independent judges)
```

The frontend sends submissions and evaluation requests to the FastAPI service. The backend coordinates the configured judge providers, aggregates valid results, and stores application data in the configured database.

## Run Locally

### Prerequisites

- Python 3.12
- Node.js and npm
- API keys for the LLM providers you intend to use

### 1. Clone the repository

```bash
git clone https://github.com/Ishithaxxii/llm-as-a-judge-ai-studio.git
cd llm-as-a-judge-ai-studio
```

### 2. Configure the backend

```bash
cd backend
python -m venv .venv
```

Activate the environment:

**Windows PowerShell**
```powershell
.venv\Scripts\Activate.ps1
```

**macOS / Linux**
```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file inside `backend/`:

```env
DATABASE_URL=sqlite+aiosqlite:///./judgeai.db
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
DEFAULT_JUDGES=["groq:openai/gpt-oss-20b","gemini:gemini-flash-lite-latest"]
MAX_JUDGES_PER_REQUEST=4
JUDGE_TIMEOUT_SECONDS=30
CORS_ORIGINS=["http://localhost:5173"]
MOCK_JUDGES=false
```

Keep real API keys and database credentials private. Never commit your `.env` file.

Start the API from the `backend/` directory:

```bash
uvicorn app.main:app --reload
```

The API will be available at http://127.0.0.1:8000. Interactive API documentation is available at http://127.0.0.1:8000/docs.

### 3. Configure and run the frontend

In a second terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Start the Vite development server:

```bash
npm run dev
```

Open the local URL printed by Vite (typically http://localhost:5173).

## Main API Routes

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/submissions` | Create a submission to evaluate |
| `POST` | `/judge` | Run the configured LLM judges |
| `POST` | `/rubrics` | Create a custom rubric |
| `GET` | `/rubrics/templates` | List available rubric templates |
| `GET` | `/rubrics/{rubric_id}` | Retrieve a rubric |
| `GET` | `/health` | Check backend health |

## Production Deployment

The production deployment uses:

- **Vercel** for the React frontend.
- **Render** for the FastAPI backend.
- **Neon** for managed PostgreSQL.

Set the frontend environment variable `VITE_API_BASE_URL` to the deployed backend URL. Configure the backend's `DATABASE_URL`, provider API keys, and `CORS_ORIGINS` in the hosting provider's environment settings. Do not put secrets in source control or frontend environment variables.

## Evaluation Notes

- Optional criteria are marked unavailable when their required context is absent (for example, semantic similarity without a reference answer).
- Aggregate and agreement metrics are based on valid judge results; some metrics require a minimum number of successful judges or historical evaluations.
- Provider failures are surfaced separately so a partial evaluation can still be inspected when at least one judge succeeds.

## Repository

https://github.com/Ishithaxxii/llm-as-a-judge-ai-studio

---

Built by **Ishitha Sankarabhukta**.
