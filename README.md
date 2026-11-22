# Full-Stack Starter

A small monorepo-style starter with a Next.js App Router frontend and a FastAPI backend.

## Requirements

- Node.js 20.9 or newer and npm
- Python 3.12 or newer and [uv](https://docs.astral.sh/uv/)

## Start the backend

```powershell
cd backend
Copy-Item .env.example .env
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

The API is available at `http://localhost:8000`. Interactive OpenAPI documentation is at `http://localhost:8000/docs`; ReDoc is at `http://localhost:8000/redoc`.

## Start the frontend

In a second terminal:

```powershell
cd frontend
Copy-Item .env.local.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`. The home page requests `GET /api/v1/status` and displays loading, connected, and error states. The API base URL is configurable with `NEXT_PUBLIC_API_URL`.

## Verify

```powershell
cd backend
uv run pytest
```

The initial API includes `GET /`, `GET /health`, and `GET /api/v1/status`.