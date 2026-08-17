# Dravya AI Engine — Technical API Contract

> Complete OpenAPI-compliant technical API reference for frontend, client, and dashboard integration.

---

## Base URLs & Documentation

| Parameter | Local Development URL | Production / Staging URL |
| :--- | :--- | :--- |
| **API Base URL** | `http://127.0.0.1:8000` or `http://localhost:8000` | Configurable per environment |
| **Interactive Swagger UI** | `http://127.0.0.1:8000/docs` | `/docs` |
| **ReDoc Documentation** | `http://127.0.0.1:8000/redoc` | `/redoc` |
| **OpenAPI Schema (JSON)** | `http://127.0.0.1:8000/openapi.json` | `/openapi.json` |

---

## General Request & Response Standards

- **Authentication**: Currently `None` (Public REST endpoints for internal microservice / dashboard integration).
- **Default Content Type**: `application/json` (except `POST /batches/create-from-image` which uses `multipart/form-data`).
- **CORS Allowed Origins**: Default `http://localhost:3000`, `http://localhost:5173`, `http://127.0.0.1:3000`, `http://127.0.0.1:5173` (configurable via `DRAVYA_CORS_ORIGINS`).
- **Standard Error Response Format**:
  ```json
  {
    "error": "Error Category / Title",
    "detail": "Human-readable error explanation."
  }
  ```

---

## 1. Health & System Status

### `GET /health`

- **Purpose**: Microservice health check and active deep learning model checkpoint status.
- **HTTP Method**: `GET`
- **URL Path**: `/health`
- **Authentication**: None
- **Request Headers**: `Accept: application/json`
- **Request Parameters**: None

#### HTTP Status Codes
| Status Code | Description |
| :--- | :--- |
| `200 OK` | Service is healthy and operational. |
| `503 Service Unavailable` | Model version or checkpoint missing/degraded. |

#### Example Request
```http
GET /health HTTP/1.1
Host: 127.0.0.1:8000
Accept: application/json
```

#### Example Response (`200 OK`)
```json
{
  "status": "healthy",
  "service": "dravya-ai-engine",
  "model_version": "v1-kaggle",
  "model_loaded": true
}
```

---

## 2. Batch Creation APIs

### `POST /batches/create`

- **Purpose**: Creates a new Ayurvedic herb batch directly from farmer metadata.
- **HTTP Method**: `POST`
- **URL Path**: `/batches/create`
- **Authentication**: None
- **Request Headers**: `Content-Type: application/json`

#### Request Parameters
| Field Name | Type | Location | Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| `herb_species` | `string` | Body | **Yes** | Common or canonical herb species name (e.g. `"Ashwagandha"`). |
| `farmer_id` | `string` | Body | **Yes** | Unique farmer identifier (e.g. `"F001"`). |
| `quantity` | `number` (float) | Body | **Yes** | Harvest weight value (> 0). |
| `quantity_unit` | `string` | Body | No (Default: `"kg"`) | Measurement unit (e.g. `"kg"`, `"g"`, `"tonne"`). |
| `harvest_date` | `string` | Body | **Yes** | Harvest date in `YYYY-MM-DD` format. |
| `farmer_name` | `string` | Body | No | Optional display name of farmer. |
| `source` | `string` | Body | No (Default: `"MANUAL"`) | Data source identifier (e.g. `"MANUAL"`, `"FARMER_PORTAL"`). |
| `metadata` | `object` | Body | No | Additional key-value pairs (e.g., moisture, location). |

#### Example Request
```http
POST /batches/create HTTP/1.1
Host: 127.0.0.1:8000
Content-Type: application/json

{
  "herb_species": "Ashwagandha",
  "farmer_id": "F001",
  "quantity": 150.0,
  "quantity_unit": "kg",
  "harvest_date": "2026-08-10",
  "farmer_name": "Ramesh Kumar",
  "source": "MANUAL",
  "metadata": {
    "moisture_content": "8.5%",
    "location": "Madhya Pradesh, India"
  }
}
```

#### Example Response (`201 Created`)
```json
{
  "batch_id": "DRAVYA-ASH-20260810-346DA7",
  "herb_species": "Ashwagandha",
  "canonical_species": "Ashwagandha",
  "scientific_name": "Withania somnifera",
  "farmer_id": "F001",
  "farmer_name": "Ramesh Kumar",
  "quantity": 150.0,
  "quantity_unit": "kg",
  "original_quantity": 150.0,
  "original_unit": "kg",
  "harvest_date": "2026-08-10",
  "creation_timestamp": "2026-08-10T10:30:00.000000+00:00",
  "source": "MANUAL",
  "ai_prediction": null,
  "verification_status": "AI_PREDICTED",
  "metadata": {
    "moisture_content": "8.5%",
    "location": "Madhya Pradesh, India"
  }
}
```

#### HTTP Status Codes
| Status Code | Description |
| :--- | :--- |
| `201 Created` | Batch created and registered successfully. |
| `400 Bad Request` | Invalid quantity (<= 0), invalid date format, or duplicate batch ID. |
| `422 Unprocessable Entity` | Validation error for missing required body fields. |

---

### `POST /batches/create-from-image`

- **Purpose**: Uploads a field photo, runs AI species identification, calculates confidence score, resolves canonical taxonomy, generates a deterministic Batch ID, and builds a blockchain traceability payload.
- **HTTP Method**: `POST`
- **URL Path**: `/batches/create-from-image`
- **Authentication**: None
- **Request Headers**: `Content-Type: multipart/form-data`

#### Multipart Form Parameters
| Field Name | Type | Location | Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| `file` or `image` | `file` (binary) | Form Data | **Yes** | JPEG, PNG, WebP, or BMP image file (Max: 10 MB). |
| `farmer_id` | `string` | Form Data | **Yes** | Farmer identifier code (e.g. `"F001"`). |
| `quantity` | `number` (float) | Form Data | **Yes** | Harvest weight value (> 0). |
| `quantity_unit` | `string` | Form Data | No (Default: `"kg"`) | Unit of weight (`"kg"`, `"g"`, etc.). |
| `harvest_date` | `string` | Form Data | No (Default: `"2026-08-10"`) | Harvest date in `YYYY-MM-DD`. |
| `farmer_name` | `string` | Form Data | No | Optional display name of farmer. |

#### Example Request Snippet (cURL)
```bash
curl -X POST "http://127.0.0.1:8000/batches/create-from-image" \
  -F "file=@ashwagandha_field.jpg;type=image/jpeg" \
  -F "farmer_id=F001" \
  -F "quantity=250.0" \
  -F "quantity_unit=kg" \
  -F "harvest_date=2026-08-10" \
  -F "farmer_name=Ramesh Kumar"
```

#### Example Response (`201 Created`)
```json
{
  "batch": {
    "batch_id": "DRAVYA-ASH-20260810-8F92A1",
    "herb_species": "Ashwagandha",
    "canonical_species": "Ashwagandha",
    "scientific_name": "Withania somnifera",
    "farmer_id": "F001",
    "farmer_name": "Ramesh Kumar",
    "quantity": 250.0,
    "quantity_unit": "kg",
    "original_quantity": 250.0,
    "original_unit": "kg",
    "harvest_date": "2026-08-10",
    "creation_timestamp": "2026-08-10T11:15:00.000000+00:00",
    "source": "AI_CAMERA",
    "ai_prediction": {
      "predicted_class": "Ashwagandha",
      "canonical_species": "Ashwagandha",
      "scientific_name": "Withania somnifera",
      "confidence": 0.965,
      "model_version": "v1-kaggle",
      "class_id": "DRAVYA_0004"
    },
    "verification_status": "AI_CONFIRMED",
    "metadata": {}
  },
  "traceability_payload": {
    "batch_id": "DRAVYA-ASH-20260810-8F92A1",
    "herb": {
      "common_name": "Ashwagandha",
      "canonical_species": "Ashwagandha",
      "scientific_name": "Withania somnifera"
    },
    "origin": {
      "farmer_id": "F001",
      "farmer_name": "Ramesh Kumar"
    },
    "quantity": {
      "value": 250.0,
      "unit": "kg",
      "original_value": 250.0,
      "original_unit": "kg"
    },
    "ai_verification": {
      "prediction": "Ashwagandha",
      "canonical_species": "Ashwagandha",
      "confidence": 0.965,
      "model_version": "v1-kaggle",
      "class_id": "DRAVYA_0004"
    },
    "verification_status": "AI_CONFIRMED",
    "timestamps": {
      "created_at": "2026-08-10T11:15:00.000000+00:00",
      "harvest_date": "2026-08-10"
    },
    "metadata": {},
    "payload_hash": "a4f8d29b1e3c5a706249e8d1720853fa8921e40c6183a992e5f3089452a11bf7"
  }
}
```

#### HTTP Status Codes
| Status Code | Description |
| :--- | :--- |
| `201 Created` | Image processed and batch created successfully. |
| `400 Bad Request` | Corrupted image file, missing form fields, or invalid quantity. |
| `533 Service Unavailable` | Deep learning predictor engine offline or model checkpoint missing. |

---

## 3. Batch Retrieval & Traceability APIs

### `GET /batches/{batch_id}`

- **Purpose**: Fetches complete record for a specific batch by unique Batch ID.
- **HTTP Method**: `GET`
- **URL Path**: `/batches/{batch_id}`
- **Path Parameters**: `batch_id` (string, e.g. `"DRAVYA-ASH-20260810-346DA7"`).

#### Example Response (`200 OK`)
```json
{
  "batch_id": "DRAVYA-ASH-20260810-346DA7",
  "herb_species": "Ashwagandha",
  "canonical_species": "Ashwagandha",
  "scientific_name": "Withania somnifera",
  "farmer_id": "F001",
  "farmer_name": "Ramesh Kumar",
  "quantity": 150.0,
  "quantity_unit": "kg",
  "original_quantity": 150.0,
  "original_unit": "kg",
  "harvest_date": "2026-08-10",
  "creation_timestamp": "2026-08-10T10:30:00.000000+00:00",
  "source": "AI_CAMERA",
  "ai_prediction": {
    "predicted_class": "Ashwagandha",
    "canonical_species": "Ashwagandha",
    "scientific_name": "Withania somnifera",
    "confidence": 0.942,
    "model_version": "v1-kaggle",
    "class_id": "DRAVYA_0004"
  },
  "verification_status": "AI_CONFIRMED",
  "metadata": {}
}
```

#### HTTP Status Codes
| Status Code | Description |
| :--- | :--- |
| `200 OK` | Batch record returned. |
| `404 Not Found` | Specified Batch ID does not exist. |

---

### `GET /batches/{batch_id}/traceability`

- **Purpose**: Generates a tamper-evident, blockchain-ready JSON traceability payload with SHA-256 hash.
- **HTTP Method**: `GET`
- **URL Path**: `/batches/{batch_id}/traceability`
- **Path Parameters**: `batch_id` (string).

#### Example Response (`200 OK`)
```json
{
  "batch_id": "DRAVYA-ASH-20260810-346DA7",
  "herb": {
    "common_name": "Ashwagandha",
    "canonical_species": "Ashwagandha",
    "scientific_name": "Withania somnifera"
  },
  "origin": {
    "farmer_id": "F001",
    "farmer_name": "Ramesh Kumar"
  },
  "quantity": {
    "value": 150.0,
    "unit": "kg",
    "original_value": 150.0,
    "original_unit": "kg"
  },
  "ai_verification": {
    "prediction": "Ashwagandha",
    "canonical_species": "Ashwagandha",
    "confidence": 0.942,
    "model_version": "v1-kaggle",
    "class_id": "DRAVYA_0004"
  },
  "verification_status": "AI_CONFIRMED",
  "timestamps": {
    "created_at": "2026-08-10T10:30:00.000000+00:00",
    "harvest_date": "2026-08-10"
  },
  "metadata": {},
  "payload_hash": "c3ab8ff13720e8ad9047dd39466b3c8974e592c2fa383d4a3960714caef0c4f2"
}
```

---

## 4. Herb & Farmer Organization APIs

### `GET /batches/herb/{herb_name}`

- **Purpose**: Lists all batches matching a specific herb species.
- **HTTP Method**: `GET`
- **URL Path**: `/batches/herb/{herb_name}`
- **Path Parameters**: `herb_name` (string, e.g., `"Ashwagandha"`).

#### Example Response (`200 OK`)
```json
[
  {
    "batch_id": "DRAVYA-ASH-20260810-346DA7",
    "herb_species": "Ashwagandha",
    "canonical_species": "Ashwagandha",
    "farmer_id": "F001",
    "quantity": 150.0,
    "quantity_unit": "kg",
    "verification_status": "AI_CONFIRMED"
  }
]
```

---

### `GET /batches/farmer/{farmer_id}`

- **Purpose**: Lists all batches supplied by a specific farmer ID.
- **HTTP Method**: `GET`
- **URL Path**: `/batches/farmer/{farmer_id}`
- **Path Parameters**: `farmer_id` (string, e.g., `"F001"`).

#### Example Response (`200 OK`)
```json
[
  {
    "batch_id": "DRAVYA-ASH-20260810-346DA7",
    "herb_species": "Ashwagandha",
    "farmer_id": "F001",
    "quantity": 150.0,
    "quantity_unit": "kg",
    "verification_status": "AI_CONFIRMED"
  }
]
```

---

## 5. Aggregated Summaries & Analytics

### `GET /batches/summary/herb/{herb_name}`

- **Purpose**: Returns aggregated metrics summary for a specific herb species across all batches.
- **HTTP Method**: `GET`
- **URL Path**: `/batches/summary/herb/{herb_name}`

#### Example Response (`200 OK`)
```json
{
  "herb": "Ashwagandha",
  "canonical_species": "Ashwagandha",
  "total_batches": 12,
  "total_quantity": 1850.5,
  "quantity_unit": "kg",
  "farmers_count": 5,
  "farmers": ["F001", "F002", "F005", "F009", "F012"],
  "verification_breakdown": {
    "AI_CONFIRMED": 10,
    "REVIEW_REQUIRED": 2
  }
}
```

---

### `GET /batches/summary/farmer/{farmer_id}`

- **Purpose**: Returns aggregated inventory metrics summary for a farmer ID.
- **HTTP Method**: `GET`
- **URL Path**: `/batches/summary/farmer/{farmer_id}`

#### Example Response (`200 OK`)
```json
{
  "farmer_id": "F001",
  "farmer_name": "Ramesh Kumar",
  "total_batches": 4,
  "total_quantity": 620.0,
  "quantity_unit": "kg",
  "herbs_supplied": ["Ashwagandha", "Tulsi", "Shatavari"],
  "batches_by_herb": {
    "Ashwagandha": ["DRAVYA-ASH-20260810-346DA7"],
    "Tulsi": ["DRAVYA-TUL-20260809-551AC4"]
  }
}
```

---

### `GET /inventory/summary`

- **Purpose**: Returns platform-wide inventory metrics across all herbs, batches, and farmers.
- **HTTP Method**: `GET`
- **URL Path**: `/inventory/summary`

#### Example Response (`200 OK`)
```json
{
  "total_batches": 48,
  "total_quantity_kg": 7450.25,
  "quantity_unit": "kg",
  "unique_herbs_count": 14,
  "unique_farmers_count": 18,
  "herbs_summary": [
    {
      "herb": "Ashwagandha",
      "canonical_species": "Ashwagandha",
      "total_batches": 12,
      "total_quantity": 1850.5,
      "quantity_unit": "kg",
      "farmers_count": 5,
      "farmers": ["F001", "F002", "F005"],
      "verification_breakdown": {
        "AI_CONFIRMED": 10,
        "REVIEW_REQUIRED": 2
      }
    }
  ],
  "verification_breakdown": {
    "AI_CONFIRMED": 40,
    "REVIEW_REQUIRED": 6,
    "AI_PREDICTED": 2
  }
}
```

---

## 6. Dravya AI Assistant Chat API

### `POST /chat`

- **Purpose**: Executes natural-language queries in English, Hindi, or Hinglish via LLM tool execution.
- **HTTP Method**: `POST`
- **URL Path**: `/chat`
- **Request Headers**: `Content-Type: application/json`

#### Request Body
```json
{
  "message": "Ashwagandha ki total quantity kitni hai?",
  "conversation_id": "session-102"
}
```

#### Example Response (`200 OK`)
```json
{
  "answer": "Dravya system me Ashwagandha ki total recorded quantity 1850.50 kg hai. Isme total 12 batches aur 5 farmers registered hain.",
  "intent": "herb_summary",
  "data": {
    "herb": "Ashwagandha",
    "canonical_species": "Ashwagandha",
    "total_batches": 12,
    "total_quantity": 1850.5,
    "quantity_unit": "kg",
    "farmers_count": 5,
    "farmers": ["F001", "F002", "F005", "F009", "F012"],
    "verification_breakdown": {
      "AI_CONFIRMED": 10,
      "REVIEW_REQUIRED": 2
    }
  },
  "tool_used": "get_herb_summary"
}
```
