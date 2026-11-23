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
uv run uvicorn app.main:app --reload --port 8001
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

## KrishiSetu frontend

The frontend now includes the public landing, login and registration journeys plus separate farmer, government officer and administrator portals. Start it with `cd frontend && npm run dev`, then open `http://localhost:3000`.

Use the demo login to explore each role:

- Farmer: `/farmer/dashboard`
- Officer: `/officer/dashboard`
- Administrator: `/admin/dashboard`

## KrishiSetu demo backend

The FastAPI backend provides a runnable SQLite-backed demo API with explicit demo data.

```powershell
cd backend
Copy-Item .env.example .env
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

API documentation is available at `http://localhost:8001/docs`.

Demo login OTP:

- Mobile: `9876543210`
- OTP: `123456`
- Roles: `farmer`, `officer`, `admin`

Backend verification:

```powershell
cd backend
uv run pytest
```

The SQLite adapter is a hackathon demonstration adapter, not a production Supabase deployment. Supabase, RLS policies, live IVR/SMS, storage and external identity integrations remain to be configured.
### Languages

The public and portal navigation provides English (default), Hindi, and
Chhattisgarhi. The farmer settings page uses the same language preference.
Selections are saved in the browser's `localStorage` and apply without a page
reload. Translations are maintained in
[`frontend/lib/i18n/translations.ts`](./frontend/lib/i18n/translations.ts);
untranslated text falls back to English.
