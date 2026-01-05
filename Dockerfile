# Stage 1: Build Frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Backend and Final Image
FROM python:3.12-slim
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uv/bin/

WORKDIR /app

# Install system dependencies if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy backend dependency files
COPY backend/pyproject.toml backend/uv.lock ./backend/
WORKDIR /app/backend

# Install Python dependencies using uv
RUN /uv/bin/uv sync --frozen --no-cache

# Copy backend source code
COPY backend/ ./

# Copy built frontend assets to a static directory in the backend
# backend/app/main.py expects static files in ../static relative to itself
# which is /app/backend/static
COPY --from=frontend-builder /app/frontend/dist /app/backend/static

# Expose the API and Frontend port
EXPOSE 3000

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV DATABASE_URL=postgresql+asyncpg://snake_user:snake_password@postgres:5432/snake_game

# Run the application
CMD ["/uv/bin/uv", "run", "python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3000"]
