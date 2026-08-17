# Dravya AI Engine — Standalone Production Deployment Guide

> Complete reference for building, configuring, deploying, and operating the Dravya AI Engine FastAPI service on cloud container and PaaS hosting platforms (e.g. Render, Railway, AWS, Fly.io, Cloud Run).

---

## 1. Architecture Overview

The Dravya AI Engine is a standalone high-performance FastAPI microservice that powers:
1. **Dravya AI Assistant (`POST /chat`)**: Natural language inventory and traceability assistant with deterministic tool execution and multilingual (English / Hindi / Hinglish) support.
2. **Medicinal Plant Classification (`POST /predict`)**: PyTorch CPU-optimized deep learning inference with top-$k$ species predictions and confidence scores.
3. **Batch Organization & Verification (`/batches/*`)**: Automated Batch ID creation, aggregation, and AI quality classification.
4. **Blockchain Traceability (`GET /batches/{batch_id}/traceability`)**: Tamper-evident SHA-256 batch integrity verification for smart contracts.
5. **System Health & Observability (`GET /health`, `GET /docs`, `GET /openapi.json`)**: Zero-downtime monitoring and OpenAPI specs.

---

## 2. Prerequisites

- **Runtime**: Python 3.12+ (64-bit recommended)
- **Virtual Environment Tooling**: `venv` / `pip`
- **Memory Recommendation**: Minimum 512MB RAM for API & Assistant, 1GB+ RAM if loading PyTorch deep learning weights.

---

## 3. Environment Variables

Configure these variables in your deployment dashboard (e.g. Render/Railway Environment Settings):

| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `PORT` | **Yes** (Cloud-managed) | `8000` | Dynamic TCP port injected by PaaS/Cloud runtime. |
| `HOST` | No | `0.0.0.0` | Network binding interface (`0.0.0.0` for containers/cloud). |
| `DRAVYA_FRONTEND_ORIGIN` | **Recommended** | `""` | HTTPS origin of your deployed frontend (e.g. `https://dravya.vercel.app`). |
| `DRAVYA_CORS_ORIGINS` | No | `""` | Comma-separated list of additional allowed CORS origins. |
| `DRAVYA_CONFIG_PATH` | No | `configs/config.yaml` | Relative or absolute path to the YAML configuration file. |
| `DRAVYA_MODELS_DIR` | No | `models` | Directory path containing model version folders and `active_model.json`. |
| `DRAVYA_LLM_PROVIDER` | No | `mock` | LLM backend for assistant (`mock` = deterministic rule engine, `openai`, `generic_http`). |
| `DRAVYA_LLM_API_KEY` | No | `""` | API key if using an external LLM provider. |
| `DRAVYA_LLM_MODEL` | No | `gpt-4o-mini` | Model name when external LLM provider is active. |

> **Security Note**: Never commit actual secrets or `.env` files to version control. Use `.env.example` as a template.

---

## 4. Build & Installation

### Standard Python Environment
```bash
cd AI-Engine
python -m venv .venv
# On Linux / macOS:
source .venv/bin/activate
# On Windows:
.venv\Scripts\activate

pip install --upgrade pip
pip install -r requirements.txt
```

---

## 5. Startup Commands

### Production Startup (PaaS / Cloud Container)
The application dynamically binds to `$PORT` supplied by cloud platforms:

```bash
uvicorn src.api.app:app --host 0.0.0.0 --port $PORT
```

Or using `Procfile` (supported on Heroku, Railway, Render):
```text
web: uvicorn src.api.app:app --host 0.0.0.0 --port ${PORT:-8000}
```

### Local Development Startup
```bash
cd AI-Engine
uvicorn src.api.app:app --reload --host 127.0.0.1 --port 8000
```

---

## 6. Model Artifact Requirements

The AI Engine manages models via `ModelVersionManager` and `active_model.json`:

- **Default Active Model**: `v1-kaggle` (or configured version)
- **Model Checkpoint Files**: `models/<version>/best_model.pth` or `models/<version>/latest_checkpoint.pth`
- **Class Mapping**: `models/<version>/class_mapping.json`
- **Model Metadata**: `models/<version>/model_metadata.json`

### Lazy Loading & Graceful Degradation
- The service loads models **lazily on-demand**.
- If a `.pth` model weight is not present on the server:
  - The API **will NOT crash** on startup.
  - `GET /health` reports `"status": "degraded"` with `"model_loaded": false`.
  - `POST /chat`, `GET /inventory/summary`, and metadata batch endpoints continue functioning with 100% availability.
  - Only image inference endpoints (`POST /predict` and `POST /batches/create-from-image`) will return a clear HTTP 503 Service Unavailable error explaining that model weights must be supplied.

---

## 7. CORS Configuration

For production web clients, set:
```bash
DRAVYA_FRONTEND_ORIGIN=https://dravya.vercel.app
```
Multiple origins can be supplied separated by commas:
```bash
DRAVYA_FRONTEND_ORIGIN=https://dravya.vercel.app,https://admin.dravya.vercel.app
```
Local development origins (`http://localhost:3000`, `http://localhost:5173`, `http://127.0.0.1:3000`, `http://127.0.0.1:5173`) remain enabled by default so developer environments do not break.

---

## 8. API Verification Endpoints

Once deployed at `https://<deployed-ai-engine-domain>`:

| Endpoint | Method | Expected Status | Purpose |
| :--- | :---: | :---: | :--- |
| `/health` | `GET` | `200 OK` | Liveness and model resolution check. |
| `/docs` | `GET` | `200 OK` | Interactive Swagger UI API documentation. |
| `/openapi.json` | `GET` | `200 OK` | Machine-readable OpenAPI v3 schema. |
| `/chat` | `POST` | `200 OK` | Dravya AI Assistant conversational queries. |
| `/inventory/summary`| `GET` | `200 OK` | Global inventory aggregation. |
| `/batches/{batch_id}`| `GET` | `200 OK` | Single batch record lookup. |
| `/batches/{batch_id}/traceability`| `GET` | `200 OK` | Cryptographic batch traceability payload. |

### Health Check Example
```bash
curl -X GET https://<deployed-ai-engine-domain>/health
```
Response:
```json
{
  "status": "healthy",
  "service": "dravya-ai-engine",
  "model_version": "v1-kaggle",
  "model_loaded": true
}
```

---

## 9. PaaS Deployment Configs

### Render (`render.yaml`)
A `render.yaml` blueprint is pre-configured in `AI-Engine/render.yaml`:
```yaml
services:
  - type: web
    name: dravya-ai-engine
    runtime: python
    rootDir: AI-Engine
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn src.api.app:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PYTHON_VERSION
        value: "3.12"
      - key: DRAVYA_FRONTEND_ORIGIN
        sync: false
      - key: DRAVYA_LLM_PROVIDER
        value: "mock"
```

---

## 10. Troubleshooting

### 1. Port Binding Error (`$PORT`)
- **Symptom**: `Invalid value for '--port': '$PORT' is not a valid integer`
- **Cause**: Shell did not interpolate the `$PORT` environment variable.
- **Fix**: Ensure the start command uses shell substitution: `sh -c "uvicorn src.api.app:app --host 0.0.0.0 --port ${PORT:-8000}"` or use the provided `Procfile`.

### 2. CORS Blocked on Frontend
- **Symptom**: Browser error `Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource`.
- **Fix**: Verify `DRAVYA_FRONTEND_ORIGIN` matches your exact frontend HTTPS URL without a trailing slash (e.g. `https://dravya.vercel.app`).

### 3. Model Inference Degraded (HTTP 503)
- **Symptom**: `/health` shows `"model_loaded": false` or `/predict` returns HTTP 503.
- **Fix**: Ensure the model weights checkpoint `best_model.pth` is mounted or placed in `models/<active_version>/`.
