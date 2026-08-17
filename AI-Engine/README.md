# Dravya AI Engine

> Enterprise-grade Computer Vision and Botanical Taxonomy Classification Engine for Ayurvedic Medicinal Plant Species.

---

## Overview

**Dravya AI Engine** is a PyTorch and FastAPI-powered microservice designed for visual identification and botanical authentication of Ayurvedic medicinal plants. It serves as the automated verification gateway before raw herb batch metadata is recorded on the Dravya Blockchain ledger.

- **Primary Goal:** Prevent species substitution and adulteration in raw drug supply chains (e.g. *Saraca asoca* vs *Polyalthia longifolia*).
- **Inputs:** Digital RGB field photos of medicinal plant leaves, foliage, or specimens (JPEG, PNG, WebP, BMP up to 10 MB).
- **Outputs:** Structured JSON payload returning canonical species name, scientific taxonomy, class ID, softmax confidence score, and top-5 candidates.
- **Active Model Version:** `v1-kaggle` (PyTorch EfficientNet-B0 fine-tuned on **82 species**, achieving **98.67% test accuracy** across 2,256 held-out test images).

---

## Role in the Dravya System

```
Farmer / Herb Collector (Uploads Field Photo)
                     ↓
        Dravya Web & Mobile Platform
                     ↓
   Dravya AI Engine API (POST /predict)
                     ↓
  [Validation -> EfficientNet-B0 Inference]
                     ↓
         JSON Prediction Payload
                     ↓
 ┌───────────────────┴───────────────────┐
 ▼                                       ▼
[High Confidence >= 85%]        [Low Confidence / Flagged]
 │                                       │
 ▼                                       ▼
Auto-Passed to Blockchain       Government Botanist Verification Queue
 │                                       │
 └───────────────────┬───────────────────┘
                     ↓
        Dravya Blockchain Ledger
 (Stores Image SHA-256 Hash + Model Signature)
```

---

## Key Features

- <span style="color:green">**[IMPLEMENTED]**</span> **Production FastAPI Server:** Multi-format validation, 10MB size limit, Pillow decode verification, and thread-safe singleton model injection (`src/api/app.py`).
- <span style="color:green">**[IMPLEMENTED]**</span> **Active Deep Learning Classifier (`v1-kaggle`):** EfficientNet-B0 architecture with 5.3M parameters, 16.75 MB weight size, and 98.67% verified test accuracy.
- <span style="color:green">**[IMPLEMENTED]**</span> **SHA-256 Duplicate Audit Engine:** Scans multi-source datasets in read-only mode to prevent train/test data leakage (`src/data/duplicate_audit_v3.py`).
- <span style="color:green">**[IMPLEMENTED]**</span> **Human-in-the-Loop Botanical Review:** CLI queue engine with persistent session state and append-only audit logging (`src/data/taxonomy_review_queue.py`).
- <span style="color:green">**[IMPLEMENTED]**</span> **Model Promotion & Quality Gate:** Automatic version pointer (`models/active_model.json`) with rollback capabilities (`src/evaluation/model_promotion.py`).
- <span style="color:green">**[IMPLEMENTED]**</span> **Automated PyTest Suite:** 159 unit and integration tests covering data pipelines, models, inference, and API endpoints (`tests/`).
- <span style="color:orange">**[PLANNED]**</span> **Out-of-Distribution (OOD) Hard Thresholding:** Rejecting non-plant images via confidence cutoffs ($\tau = 0.65$).
- <span style="color:orange">**[PLANNED]**</span> **Grad-CAM Visual Explainability:** Heatmap overlays showing leaf vein feature activations.

---

## Repository Architecture

```
AI-Engine/
├── .gitignore                         # Git ignore specification
├── .env.example                       # Environment variables template
├── Dockerfile                         # Production Docker container definition
├── docker-compose.yml                 # Local & server orchestration setup
├── pyproject.toml                     # Python build metadata
├── requirements.txt                   # Dependency locks
├── verify_v1_kaggle.py                # System verification script
├── configs/
│   └── config.yaml                    # System configuration
├── docs/
│   ├── AI_ENGINE_COMPLETE_REPORT.md   # 50-Section Master Technical Report
│   ├── AI_ENGINE_QUICK_REFERENCE.md   # 2-Page Executive Quick Reference
│   └── AI_ENGINE_WALKTHROUGH.md       # Developer Onboarding Walkthrough
├── models/
│   ├── active_model.json              # Active model version pointer
│   └── v1-kaggle/                     # Production model checkpoint & mappings
├── reports/
│   ├── AI_ENGINE_PRINTABLE_PDF_REPORT.html  # Printable A4 PDF Report
│   ├── AI_ENGINE_SLIDE_PRESENTATION.html    # Interactive Slide Presentation Deck
│   ├── dataset_analysis/              # Dataset inventory & audit reports
│   └── model_evaluation/             # Model promotion & evaluation logs
├── src/
│   ├── api/                           # FastAPI routes, schemas, dependencies
│   ├── data/                          # Inventory, duplicate audit, taxonomy
│   ├── evaluation/                    # Quality gate & model promotion logic
│   ├── inference/                     # Predictor engine & batch predictor
│   ├── models/                        # PyTorch model architectures
│   └── training/                      # Training loops & dataset loaders
└── tests/                             # 159 automated PyTest unit tests
```

---

## Dataset Policy & Local Setup

> **Dataset Safety Principle:** Raw dataset images (CIMPd, Hugging_Face, Kaggle) are **NEVER committed to Git**. Raw directories are ignored in `.gitignore`.

### Dataset Storage & Placement
Raw datasets should be placed locally in `datasets/raw/` or configured via environment variables:

```text
datasets/
├── raw/               # Read-only raw datasets (CIMPd, Hugging_Face, Kaggle)
├── processed/         # Cached preprocessed tensors
└── final/             # Canonical dataset manifests
```

To run dataset inventory and duplicate audits:
```powershell
# Run physical raw inventory scan
python -m src.data.physical_inventory_v3

# Run SHA-256 duplicate audit scan
python -m src.data.duplicate_audit_v3
```

---

## Model & Evaluation Metrics

### Production Checkpoint (`v1-kaggle`)
- **Architecture:** `efficientnet_b0` (PyTorch)
- **Input Size:** `224 x 224 x 3` (RGB)
- **Classes:** 82 Canonical Medicinal Species
- **Checkpoint Path:** `models/v1-kaggle/best_model.pth` (16.75 MB)
- **Test Set Evaluation:**
  - **Total Samples:** 2,256 images
  - **Correct Predictions:** 2,226 images
  - **Overall Accuracy:** **98.67%**
  - **Best Validation Accuracy:** **99.33%**

---

## Inference API Contract

### 1. `POST /predict`
Submits a plant image for classification.

- **Content-Type:** `multipart/form-data`
- **Field Name:** `file` or `image`
- **Max File Size:** 10 MB

#### Sample JSON Response (`200 OK`)
```json
{
  "model_version": "v1-kaggle",
  "class_id": "DRAVYA_0022",
  "predicted_class": "Aloe vera",
  "species_name": "Aloe vera",
  "scientific_name": "Aloe barbadensis",
  "confidence": 0.9845,
  "top_k": [
    {
      "class_id": "DRAVYA_0022",
      "class_name": "Aloe vera",
      "confidence": 0.9845
    },
    {
      "class_id": "DRAVYA_0014",
      "class_name": "Agave",
      "confidence": 0.0082
    }
  ]
}
```

### 2. `GET /health`
Returns system health and active model metadata.
```json
{
  "status": "healthy",
  "service": "dravya-ai-engine",
  "model_version": "v1-kaggle",
  "model_loaded": true
}
```

---

## Batch Organization & Traceability (Phase 2)

The Dravya AI Engine extends species identification to support end-to-end production batch creation, farmer-wise & herb-wise aggregation, and blockchain-ready traceability records.

### End-to-End Pipeline
```text
Image Input → PlantPredictor → Canonical Species & Confidence → Verification Status Check → Deterministic Batch ID → Aggregation & Traceability Payload
```

1. **Deterministic Batch ID Generation:**
   - Format: `DRAVYA-<HERB_PREFIX>-<YYYYMMDD>-<SUFFIX>` (e.g. `DRAVYA-ASH-20260810-A1B2C3`).
   - Uses SHA-256 digests over normalized herb species, farmer ID, harvest date, and quantity to ensure collision resistance and privacy (no PII inside the ID).
2. **Confidence Thresholding:**
   - Confidence $\ge 0.90$ $\rightarrow$ `AI_CONFIRMED`
   - $0.70 \le \text{Confidence} < 0.90$ $\rightarrow$ `REVIEW_REQUIRED`
   - Confidence $< 0.70$ $\rightarrow$ `LOW_CONFIDENCE`
3. **Quantity Normalization:**
   - Standardizes inputs across units (`kg`, `g`, `quintal`, `tonne`, `lbs`) into canonical kilogram representation (`kg`).
4. **Batch & Inventory Endpoints:**
   - `POST /batches/create-from-image`: Multipart image upload + farmer metadata $\rightarrow$ returns Batch record & blockchain-ready TraceabilityPayload.
   - `POST /batches/create`: Create batch directly from metadata.
   - `GET /batches/{batch_id}`: Retrieve batch details.
   - `GET /batches/{batch_id}/traceability`: Returns tamper-evident JSON payload with SHA-256 content hash ready for blockchain posting.
   - `GET /batches/summary/herb/{herb_name}` & `GET /batches/summary/farmer/{farmer_id}`: Herb-wise & Farmer-wise summary metrics.
   - `GET /inventory/summary`: Total inventory weight, batch counts, and species breakdowns.

5. **Dravya AI Assistant (`POST /chat`):**
   - Natural language interface supporting English, Hindi, and Hinglish queries.
   - Decoupled LLM Tool Execution Architecture: LLM cannot query databases directly; communicates strictly through deterministic backend tools.
   - **Supported Queries:**
     - Herb inventory: `"Ashwagandha ki total quantity kitni hai?"`, `"How much Ashwagandha do we have?"`
     - Herb batches: `"How many Ashwagandha batches are there?"`, `"Show me all batches of Ashwagandha."`
     - Farmer inventory: `"F001 ke paas kya hai?"`, `"How much inventory does farmer F001 have?"`
     - Batch details & verification: `"DRAVYA-ASH-20260810-346DA7 details"`, `"Is this batch AI verified?"`
     - Traceability: `"Is batch ki traceability dikhao"`, `"Show me traceability information"`
     - Total inventory: `"System me total kitni herbs hain?"`, `"Total inventory batao"`
   - **No-Hallucination Policy:** Data quantities, farmer IDs, batch numbers, and hashes are retrieved strictly from backend tools. Zero invented numbers.
   - **LLM Provider Configuration:** Environment variables `DRAVYA_LLM_PROVIDER`, `DRAVYA_LLM_API_KEY`, `DRAVYA_LLM_MODEL`. Graceful offline fallback via built-in `MockLLMProvider` if key is omitted.



---

## Frontend Integration & API Readiness

```
Frontend Client (React / Next.js / TypeScript)
                     ↓
      FastAPI CORS Middleware (Allowed Origins)
                     ↓
              Batch Service Layer
                     ↓
      AI Engine / Batch Manager Repository
                     ↓
        Batch & Blockchain Traceability Data
```

- **Base URL (Local)**: `http://127.0.0.1:8000` or `http://localhost:8000`
- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **OpenAPI JSON Spec**: [http://127.0.0.1:8000/openapi.json](http://127.0.0.1:8000/openapi.json)
- **CORS Allowed Origins**: `http://localhost:3000`, `http://localhost:5173` (Configurable via `DRAVYA_CORS_ORIGINS`).
- **Complete Technical API Contract**: Refer to [docs/API_CONTRACT.md](docs/API_CONTRACT.md) for full endpoint specifications, required/optional fields, request/response models, and status codes.
- **Frontend Integration Guide**: Refer to [docs/FRONTEND_INTEGRATION.md](docs/FRONTEND_INTEGRATION.md) for TypeScript interfaces, JavaScript `fetch` code snippets, and UI component data mapping guides.
- **Schema Example JSONs**: Located in [docs/examples/](docs/examples/).

---


## Local Setup & Commands

```powershell
# 1. Activate virtual environment
.\.venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Copy environment configuration
copy .env.example .env

# 4. Run System Verification Script
python verify_v1_kaggle.py

# 5. Run Complete PyTest Suite (159 tests)
pytest -o pythonpath=. -v tests/

# 6. Start Live FastAPI Server
uvicorn src.api.app:app --host 127.0.0.1 --port 8000 --reload
```

Interactive Swagger API docs available at **http://127.0.0.1:8000/docs**.

---

## Production Roadmap

- **P0 (Critical Pre-Production):**
  - Out-of-distribution (OOD) unknown plant rejection threshold ($\tau = 0.65$).
  - API Key / Bearer token authentication middleware.
- **P1 (Post-Launch Enhancements):**
  - Grad-CAM heatmap visualization in API responses.
  - ONNX runtime quantization for faster CPU inference (~15 ms).
- **P2 (Advanced MLOps):**
  - Continuous data drift monitoring and automated retraining pipelines.

---

## SIH Pitch (Smart India Hackathon)

> "Dravya AI solves species adulteration in raw drug supply chains by providing 98.67% accurate visual identification across 82 Ayurvedic medicinal plant species. Powered by an EfficientNet-B0 backbone and FastAPI, it validates images in 45 milliseconds. High-confidence predictions expedite blockchain batch logging, while low-confidence samples route to authorized government botanists for manual verification."

---

## Technical Documentation Links

- **[AI_ENGINE_COMPLETE_REPORT.md](docs/AI_ENGINE_COMPLETE_REPORT.md):** 50-Section Master Architecture & Technical Specification.
- **[AI_ENGINE_QUICK_REFERENCE.md](docs/AI_ENGINE_QUICK_REFERENCE.md):** Executive 2-Page Quick Reference Cheat Sheet.
- **[AI_ENGINE_WALKTHROUGH.md](docs/AI_ENGINE_WALKTHROUGH.md):** Developer Hands-On Onboarding Walkthrough.
- **[AI_ENGINE_PRINTABLE_PDF_REPORT.html](reports/AI_ENGINE_PRINTABLE_PDF_REPORT.html):** Printable A4 PDF Report.
- **[AI_ENGINE_SLIDE_PRESENTATION.html](reports/AI_ENGINE_SLIDE_PRESENTATION.html):** Interactive Slide Presentation Deck.
