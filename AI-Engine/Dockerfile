# Production Dockerfile for Dravya AI Engine
FROM python:3.12-slim

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app

WORKDIR /app

# Install system utilities (curl for container healthchecks)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency specifications first to leverage Docker layer caching
COPY requirements.txt pyproject.toml /app/

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code and default configurations
COPY src/ /app/src/
COPY configs/ /app/configs/
COPY README.md /app/

# Create placeholder directories for runtime mounts
RUN mkdir -p /app/models /app/reports/model_evaluation /app/datasets/raw

# Expose FastAPI server port
EXPOSE 8000

# Docker native healthcheck using /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

# Launch FastAPI Uvicorn server listening on all network interfaces with dynamic PORT
CMD ["sh", "-c", "uvicorn src.api.app:app --host 0.0.0.0 --port ${PORT:-8000}"]
