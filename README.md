# [PropScope](https://propscope.ca/)

A real-time NBA player prop odds comparison dashboard. Displays no-vig probabilities from Sports Interaction against FanDuel's sharp line, tracking line movements over time.

## What It Does

- Displays player prop odds from Sports Interaction and FanDuel with the vig removed
- Highlights the gap between the two books — positive means SIA is offering better value than FanDuel suggests
- Tracks 8 markets: Points, Rebounds, Assists, Threes, Pts+Reb+Ast, Pts+Ast, Pts+Reb, Reb+Ast
- Receives real-time updates via Server-Sent Events (SSE) from a separate backend
- Visualizes line movement over time using odds snapshots stored in PostgreSQL

## Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS, Recharts
- **Database:** PostgreSQL with connection pooling via `pg`

## Getting Started

### Prerequisites

- Node.js
- PostgreSQL database with the `oddsdb` schema set up
- A running backend that scrapes odds and exposes an SSE endpoint

### Environment Variables

| Variable      | Default     | Description                      |
|---------------|-------------|----------------------------------|
| `DB_HOST`     | `localhost` | PostgreSQL host                  |
| `DB_PORT`     | `5432`      | PostgreSQL port                  |
| `DB_NAME`     | `oddsdb`    | Database name                    |
| `DB_USER`     | `user`      | Database user                    |
| `DB_PASSWORD` | `user`      | Database password                |
| `BACKEND_URL` |             | URL of the odds scraper backend  |

### Run
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Disclaimer

For informational purposes only. Not financial advice.
