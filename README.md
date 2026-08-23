# Smart Expense Tracker with Insights

A portfolio-quality React expense tracker with a modern dashboard, transactions, budgets, analytics, AI-insight architecture, and an optional Node.js/PostgreSQL backend.

## What works immediately

The frontend runs in **browser demo mode** without Supabase, PostgreSQL, or an AI key. It includes:

- Dashboard with live calculations
- Income/expense tracking
- Add/edit/delete transactions
- Search and filters
- Monthly budgets
- Budget status indicators
- Analytics charts
- AI-style insight screen
- Settings
- JSON export
- Dark mode
- Responsive mobile layout
- Demo data reset

Browser data is stored in localStorage so the app is usable without a database.

## Run it

Requirements: Node.js 18+.

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

## Optional PostgreSQL + Node backend

1. Start PostgreSQL:

```bash
docker compose up -d
```

2. Copy:

```text
server/.env.example -> server/.env
```

3. Add your DATABASE_URL.

4. Install dependencies:

```bash
npm install
```

5. Start:

```bash
npm run dev
```

The API health endpoint is:

`http://localhost:5000/api/health`

The starter backend also includes a secure server-side AI endpoint at:

`POST /api/ai/insights`

It supports OpenAI or Gemini through environment variables. API keys are never placed in React.

## Important architecture note

The supplied frontend is deliberately usable without cloud services so you can preview the complete UI immediately. The optional backend is the integration boundary for PostgreSQL and AI. For a production multi-user deployment, connect authentication and transaction CRUD to PostgreSQL (or Supabase PostgreSQL) and use proper user/session authorization before exposing it publicly.

## Portfolio description

**Smart Expense Tracker with Insights** — Built a responsive personal-finance web application using React, Node.js, PostgreSQL-ready architecture, Recharts, and an AI-provider abstraction for OpenAI/Gemini. Implemented transaction management, budgeting, analytics, responsive dashboard UI, and spending insights with secure server-side AI integration.
