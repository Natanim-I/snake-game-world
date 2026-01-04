# Integration Tests

This directory contains integration tests for the Snake Game World backend API.

## Running Tests

```bash
# Run all integration tests
uv run pytest tests_integration/

# Run with verbose output
uv run pytest tests_integration/ -v

# Run specific test file
uv run pytest tests_integration/test_auth.py

# Run with coverage
uv run pytest tests_integration/ --cov=app
```

## Test Structure

- `conftest.py` - Test fixtures and configuration
- `test_auth.py` - Authentication endpoint tests
- `test_leaderboard.py` - Leaderboard endpoint tests
- `test_games.py` - Game endpoint tests
- `test_users.py` - User endpoint tests

## Test Database

Tests use an in-memory SQLite database that is created fresh for each test, ensuring test isolation.
