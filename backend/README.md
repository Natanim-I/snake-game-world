# Snake Game World Backend

FastAPI backend for Snake Game World.

## Setup

1.  **Install `uv`** (if not installed):
    ```bash
    curl -LsSf https://astral.sh/uv/install.sh | sh
    ```

2.  **Install Dependencies**:
    ```bash
    cd backend
    uv sync
    ```

## Development

Run the development server:

```bash
uv run uvicorn app.main:app --reload
```

The API will be available at `http://localhost:3000`.
API Documentation (Swagger UI): `http://localhost:3000/docs`.

## Testing

Run integration tests:

```bash
uv run pytest
```
