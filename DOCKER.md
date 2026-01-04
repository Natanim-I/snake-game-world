# Snake Game World - Docker Setup

## Quick Start

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

## Services

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000
- **PostgreSQL**: localhost:5432

## Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ :8080
       ▼
┌─────────────┐
│    Nginx    │ ◄── Serves static files
│  (Frontend) │ ◄── Proxies /api/* to backend
└──────┬──────┘
       │
       │ /api/*
       ▼
┌─────────────┐
│   FastAPI   │
│  (Backend)  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ PostgreSQL  │
└─────────────┘
```

## Development

For local development without Docker:

```bash
# Backend
cd backend
make run

# Frontend
cd frontend
npm run dev
```

## Environment Variables

Backend environment variables are configured in `docker-compose.yml`:
- `DATABASE_URL`: PostgreSQL connection string

## Database Seeding

To seed the database with initial data:

```bash
# Access the backend container
docker-compose exec backend sh

# Run the seed script
uv run python -m app.seed_db

# Exit
exit
```

## Troubleshooting

### Backend can't connect to database
- Ensure PostgreSQL is healthy: `docker-compose ps`
- Check logs: `docker-compose logs postgres`

### Frontend can't reach backend
- Verify backend is running: `docker-compose ps`
- Check backend logs: `docker-compose logs backend`

### Rebuild after code changes
```bash
docker-compose up --build
```
