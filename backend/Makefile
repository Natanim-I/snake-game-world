.PHONY: install run test clean

install:
	uv sync

run:
	uv run uvicorn app.main:app --host 0.0.0.0 --port 3000 --reload

test:
	uv run pytest

clean:
	rm -rf .venv
	rm -rf __pycache__
	rm -rf app/__pycache__
	rm -rf tests/__pycache__
	rm -rf .pytest_cache
