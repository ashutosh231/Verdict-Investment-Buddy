# Verdict — AI Investment Research Agent

Type a company name and Verdict's AI agent investigates the business, weighs the
risks, and returns a clear **invest or pass** call with full reasoning.

Verdict is a full-stack **MERN** application: a React SPA on the frontend, an
Express REST API on the backend, MongoDB for persistence, and AWS Bedrock
(DeepSeek V3.2) powering a LangGraph research pipeline.

---

## Features

- **AI research agent** — Enter any company name and receive a structured verdict
  with confidence score, risk level, bull/bear cases, and score breakdown
  (Moat, Growth, Financials, Valuation, Momentum).
- **Parallel research pipeline** — Profile, financials, risks, structured data,
  live quotes, and market data are gathered concurrently via LangGraph before a
  final synthesis step.
- **Live market data** — US stock quotes (Finnhub), Indian market data, trending
  gainers/losers, news, and commodity prices (Indian Stock API).
- **Verdict history** — Signed-in users can revisit past research runs stored in
  MongoDB.
- **PDF export** — Download a verdict report from the dashboard.
- **JWT authentication** — Sign up, sign in, and protect research endpoints.
- **Neo-brutalist UI** — Landing page, auth flow, and a dashboard with live
  market widgets, research input, and detailed report views.

---

## Tech stack

| Layer | Technologies |
| ----- | ------------ |
| **Frontend** | React 19, Vite, React Router, Axios, Tailwind CSS v4, Radix UI, Framer Motion, Recharts |
| **Backend** | Node.js, Express, Mongoose |
| **Database** | MongoDB Atlas |
| **Auth** | JWT + bcrypt |
| **AI** | AWS Bedrock (DeepSeek V3.2), LangGraph.js, LangChain |
| **Market data** | Finnhub API, Indian Stock API |

---

## How it works

When a user submits a company name, the backend runs a LangGraph workflow:

```text
                    ┌─ profile analysis
                    ├─ financial analysis
                    ├─ risk & moat analysis
START ──────────────┼─ structured data (overview, financials, news)
                    ├─ live US quote (Finnhub)
                    └─ Indian market data
                              │
                              ▼
                         decide node
                              │
                              ▼
                    INVEST / PASS verdict
                    + thesis, scores, metrics
```

The final verdict includes:

- **Decision** — `INVEST` or `PASS`
- **Confidence** — 0–100 score
- **Risk level** — `LOW`, `MEDIUM`, or `HIGH`
- **Thesis** — Short investment rationale
- **Bull / bear cases** — Key arguments on each side
- **Score breakdown** — Moat, Growth, Financials, Valuation, Momentum
- **Company overview** — Sector, HQ, CEO, employees, etc.
- **Financial series** — Revenue and net income over time
- **News** — Recent headlines with sentiment
- **Live quote** — Current price when available

Authenticated research runs are saved to the `verdicts` collection in MongoDB.

---

## Project structure

```text
alpha-scout/
├── frontend/                   React SPA (Vite)
│   ├── public/                 Static assets (favicon, robots.txt)
│   └── src/
│       ├── pages/              Index, Auth, Dashboard, NotFound
│       ├── components/
│       │   ├── site/           Header, ResearchAgent, VerdictReport, market widgets
│       │   └── ui/             Reusable UI primitives (shadcn-style)
│       ├── lib/                api (Axios), auth-context, report helpers
│       └── hooks/
├── backend/                    Express REST API (MVC)
│   ├── config/                 db.js, env.js
│   ├── controllers/            auth, research, market
│   ├── middleware/             JWT auth, validation, error handling
│   ├── models/                 User, Verdict (Mongoose)
│   ├── routes/                 auth, research, market
│   ├── services/               investmentAgent, aiService, finnhub, indianStock
│   ├── utils/                  token, asyncHandler
│   ├── validators/             Zod request schemas
│   ├── app.js
│   └── server.js
├── dist/                       Production frontend build output (generated)
└── package.json                Workspace root scripts
```

---

## Prerequisites

Before running locally or deploying, you will need:

| Service | Purpose |
| ------- | ------- |
| [MongoDB Atlas](https://www.mongodb.com/atlas) | User accounts and verdict history |
| [AWS IAM](https://aws.amazon.com/iam/) | Bedrock access for the AI agent |
| [Finnhub](https://finnhub.io/) | US live stock quotes (optional) |
| [Indian Stock API](https://indianapi.in/) | BSE/NSE data, news, commodities (optional) |

Generate a strong `JWT_SECRET` for production, for example:

```bash
openssl rand -hex 32
```

---

## Environment variables

### Backend (`backend/.env`)

Copy `backend/.env.example` to `backend/.env`:

```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:8080,https://verdict-investment-buddy.vercel.app

MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-long-random-secret

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
BEDROCK_MODEL_ID=deepseek.v3.2

FINNHUB_API_KEY=
INDIAN_STOCK_API_KEY=
```

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Secret for signing auth tokens |
| `AWS_ACCESS_KEY_ID` | Yes | AWS credentials with Bedrock invoke permissions |
| `AWS_SECRET_ACCESS_KEY` | Yes | AWS secret key |
| `AWS_REGION` | No | AWS region (default: `us-east-1`) |
| `BEDROCK_MODEL_ID` | No | Bedrock model ID (default: `deepseek.v3.2`) |
| `CORS_ORIGIN` | Yes (prod) | Allowed frontend origin(s), comma-separated |
| `FINNHUB_API_KEY` | No | Enables US live quotes |
| `INDIAN_STOCK_API_KEY` | No | Enables Indian market widgets and data enrichment |
| `PORT` | No | Server port (default: `5000`; Render sets this automatically) |

### Frontend (`frontend/.env`)

Copy `frontend/.env.example` to `frontend/.env`:

```env
# Optional in local dev — Vite proxies /api to the backend.
# Required in production.
VITE_API_URL=
```

For local development, leave `VITE_API_URL` empty. The Vite dev server proxies
`/api/*` to the backend. If your backend runs on a non-default port, set:

```env
VITE_API_PROXY=http://localhost:5000
```

In production, set `VITE_API_URL` to your deployed backend URL (no trailing slash),
for example `https://verdict-api.onrender.com`.

---

## Running locally

### 1. Backend

```bash
cd backend
cp .env.example .env    # fill in your keys
npm install
npm run dev             # http://localhost:5000
```

Verify the API is up:

```bash
curl http://localhost:5000/api/health
# {"ok":true}
```

### 2. Frontend

In a second terminal:

```bash
cd frontend
cp .env.example .env    # optional
npm install
npm run dev             # http://localhost:8080
```

Open [http://localhost:8080](http://localhost:8080).

### Root workspace scripts

From the repo root you can also run:

```bash
npm run dev      # starts the frontend dev server
npm run build    # production frontend build → dist/
npm run server   # starts the backend
npm run lint     # ESLint on the frontend
```

---

## API reference

Base URL: `http://localhost:5000` locally, or your Render URL in production.

### Health

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| GET | `/api/health` | — | Health check |

### Auth

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| POST | `/api/auth/signup` | — | Create an account |
| POST | `/api/auth/login` | — | Sign in, returns JWT |
| GET | `/api/auth/me` | JWT | Current user profile |

### Research

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| POST | `/api/research` | JWT | Run a verdict for a company |
| GET | `/api/research/history` | JWT | Last 20 verdicts for the user |

**POST `/api/research` body:**

```json
{ "company": "Apple" }
```

**Response:** `{ "verdict": { ... } }` — full structured verdict object.

### Public market data

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| GET | `/api/public/market/trending` | — | Top gainers and losers |
| GET | `/api/public/market/news` | — | Market news headlines |
| GET | `/api/public/market/commodities` | — | Gold, silver, crude, gas, copper prices |

Market endpoints return empty arrays gracefully when `INDIAN_STOCK_API_KEY` is not set.

---

## Deployment

Recommended setup: **backend on Render**, **frontend on Vercel**.

```text
User → Vercel (React SPA) → Render (Express API) → MongoDB Atlas + AWS Bedrock
```

Deploy the backend first, then wire the frontend to its URL.

### Backend — Render

1. [render.com](https://render.com) → **New → Web Service** → connect your repo.
2. Configure:

| Setting | Value |
| ------- | ----- |
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `npm start` |

3. Add environment variables from `backend/.env.example`. Set `NODE_ENV=production`
   and `CORS_ORIGIN` to your Vercel URL (no trailing slash). Do **not** set `PORT`
   — Render provides it.
4. In MongoDB Atlas → **Network Access**, allow Render to connect (`0.0.0.0/0` or
   Render IP ranges).
5. Deploy and test:

```text
https://your-service.onrender.com/api/health
```

### Frontend — Vercel

1. [vercel.com](https://vercel.com) → **Add New → Project** → import your repo.
2. Configure:

| Setting | Value |
| ------- | ----- |
| Framework Preset | Vite |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `../dist` |

The Vite config writes the production build to the repo-root `dist/` folder, not
`frontend/dist/`, so `../dist` is required when the root directory is `frontend`.

3. Add environment variable:

```env
VITE_API_URL=https://your-service.onrender.com
```

4. Add `frontend/vercel.json` for React Router client-side routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

5. Deploy.

### Final wiring

After Vercel gives you a URL (e.g. `https://verdict.vercel.app`):

1. Update Render → `CORS_ORIGIN=https://verdict-investment-buddy.vercel.app`
   (comma-separate multiple origins if needed; no trailing slash)
2. Redeploy or restart the backend.
3. Confirm `VITE_API_URL` on Vercel points to the Render backend URL.

### Deployment checklist

- [ ] `GET /api/health` returns `{ "ok": true }` on Render
- [ ] Landing page loads on Vercel
- [ ] Sign up and sign in work
- [ ] Dashboard loads after login
- [ ] Running a verdict succeeds (Bedrock + MongoDB)
- [ ] Market widgets load (if API keys are set)
- [ ] Refreshing `/dashboard` works (SPA rewrite)

---

## Troubleshooting

| Problem | Likely cause | Fix |
| ------- | ------------ | --- |
| CORS errors in browser | Frontend origin not allowed | Set `CORS_ORIGIN` on Render to match your Vercel URL exactly |
| API calls hit Vercel instead of Render | Missing backend URL | Set `VITE_API_URL` and redeploy the frontend |
| 404 on page refresh | Missing SPA rewrite | Add `frontend/vercel.json` rewrites |
| Backend won't start | MongoDB connection | Check `MONGODB_URI` and Atlas IP allowlist |
| Research fails | Bedrock permissions | Verify AWS credentials and model access in your region |
| Empty market widgets | Missing API keys | Set `FINNHUB_API_KEY` and/or `INDIAN_STOCK_API_KEY` |
| Slow first request on Render free tier | Cold start | Normal on free tier; service wakes after idle time |

---

## License

Private project — all rights reserved.
