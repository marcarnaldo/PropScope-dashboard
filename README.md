# PropScope

A real-time NBA player prop odds comparison tool. Compares no-vig probabilities from Sports Interaction against FanDuel's sharp line, tracking line movements over time.

## What It Does

- Scrapes player prop odds from Sports Interaction and FanDuel every 5 minutes, starting 1 hour before tip-off
- Removes the vig from both books to show true implied probabilities
- Highlights the gap between the two books — positive means SIA is offering better value than FanDuel suggests
- Tracks 8 markets: Points, Rebounds, Assists, Threes, Pts+Reb+Ast, Pts+Ast, Pts+Reb, Reb+Ast
- Saves odds snapshots to a PostgreSQL database for line movement charts

## Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS, Recharts
- **Backend:** Node.js, PostgreSQL, Server-Sent Events (SSE)
- **Database:** PostgreSQL with connection pooling via `pg`

## Getting Started

### Prerequisites

- Node.js
- PostgreSQL database with the `oddsdb` schema set up

### Environment Variables

| Variable      | Default     | Description              |
|---------------|-------------|--------------------------|
| `DB_HOST`     | `localhost` | PostgreSQL host          |
| `DB_PORT`     | `5432`      | PostgreSQL port          |
| `DB_NAME`     | `oddsdb`    | Database name            |
| `DB_USER`     | `user`      | Database user            |
| `DB_PASSWORD` | `user`      | Database password        |
| `BACKEND_URL` |             | URL of the odds scraper backend |

### Run
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Disclaimer

For informational purposes only. Not financial advice.