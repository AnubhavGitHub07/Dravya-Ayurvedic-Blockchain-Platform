# Dravya AI Engine — Frontend Integration & Developer Guide

> Quick-start guide for frontend engineers integrating Next.js, React, or TypeScript clients with the Dravya AI Engine REST API.

---

## 1. Environment & Base URLs

Set your frontend environment variable in `.env.local` (Next.js / Vite):

```bash
# Production:
NEXT_PUBLIC_DRAVYA_AI_API_URL=https://<deployed-ai-engine-domain>

# Local Development:
# NEXT_PUBLIC_DRAVYA_AI_API_URL=http://127.0.0.1:8000
```

| Asset | Production HTTPS | Local Development |
| :--- | :--- | :--- |
| **API Base URL** | `https://<deployed-ai-engine-domain>` | `http://127.0.0.1:8000` |
| **Interactive Swagger Docs** | `https://<deployed-ai-engine-domain>/docs` | `http://127.0.0.1:8000/docs` |
| **OpenAPI Specification (JSON)** | `https://<deployed-ai-engine-domain>/openapi.json` | `http://127.0.0.1:8000/openapi.json` |
| **Health Check** | `https://<deployed-ai-engine-domain>/health` | `http://127.0.0.1:8000/health` |

### Production CORS Preflight Configuration
The API backend responds to CORS preflight requests from the origin configured via `DRAVYA_FRONTEND_ORIGIN` (and default localhost development origins).


---

## 2. TypeScript Data Types & Interfaces

You can copy these strongly-typed TypeScript interfaces directly into your client codebase (`types/dravya.ts`):

```typescript
export type VerificationStatus =
  | 'AI_PREDICTED'
  | 'AI_CONFIRMED'
  | 'REVIEW_REQUIRED'
  | 'LOW_CONFIDENCE'
  | 'FIELD_VERIFIED'
  | 'REJECTED';

export interface AIPredictionDetails {
  predicted_class: string;
  canonical_species: string;
  scientific_name?: string | null;
  confidence: number;
  model_version: string;
  class_id?: string | null;
}

export interface Batch {
  batch_id: string;
  herb_species: string;
  canonical_species: string;
  scientific_name?: string | null;
  farmer_id: string;
  farmer_name?: string | null;
  quantity: number;
  quantity_unit: string;
  original_quantity: number;
  original_unit: string;
  harvest_date: string;
  creation_timestamp: string;
  source: string;
  ai_prediction?: AIPredictionDetails | null;
  verification_status: VerificationStatus;
  metadata: Record<string, any>;
}

export interface TraceabilityPayload {
  batch_id: string;
  herb: {
    common_name: string;
    canonical_species: string;
    scientific_name?: string | null;
  };
  origin: {
    farmer_id: string;
    farmer_name?: string | null;
  };
  quantity: {
    value: number;
    unit: string;
    original_value: number;
    original_unit: string;
  };
  ai_verification?: Record<string, any> | null;
  verification_status: string;
  timestamps: {
    created_at: string;
    harvest_date: string;
  };
  metadata: Record<string, any>;
  payload_hash: string;
}

export interface HerbSummary {
  herb: string;
  canonical_species: string;
  total_batches: number;
  total_quantity: number;
  quantity_unit: string;
  farmers_count: number;
  farmers: string[];
  verification_breakdown: Record<string, number>;
}

export interface FarmerSummary {
  farmer_id: string;
  farmer_name?: string | null;
  total_batches: number;
  total_quantity: number;
  quantity_unit: string;
  herbs_supplied: string[];
  batches_by_herb: Record<string, string[]>;
}

export interface InventorySummary {
  total_batches: number;
  total_quantity_kg: number;
  quantity_unit: string;
  unique_herbs_count: number;
  unique_farmers_count: number;
  herbs_summary: HerbSummary[];
  verification_breakdown: Record<string, number>;
}

export interface ChatResponse {
  answer: string;
  intent: string;
  data?: any;
  tool_used?: string | null;
}
```

---

## 3. Integration Fetch Examples

### A. Fetch Overall Inventory Summary (Dashboard)
```typescript
const API_BASE = process.env.NEXT_PUBLIC_DRAVYA_AI_API_URL || 'http://127.0.0.1:8000';

export async function getInventorySummary(): Promise<InventorySummary> {
  const response = await fetch(`${API_BASE}/inventory/summary`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch inventory summary: ${response.statusText}`);
  }

  return response.json();
}
```

### B. Upload Herb Field Photo for AI Identification & Batch Creation
```typescript
export async function createBatchFromImage(
  imageFile: File,
  farmerId: string,
  quantityKg: number,
  harvestDate: string,
  farmerName?: string
): Promise<{ batch: Batch; traceability_payload: TraceabilityPayload }> {
  const formData = new FormData();
  formData.append('file', imageFile);
  formData.append('farmer_id', farmerId);
  formData.append('quantity', quantityKg.toString());
  formData.append('quantity_unit', 'kg');
  formData.append('harvest_date', harvestDate);
  if (farmerName) formData.append('farmer_name', farmerName);

  const response = await fetch(`${API_BASE}/batches/create-from-image`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to create batch from image');
  }

  return response.json();
}
```

### C. Create Batch via Metadata (Manual Registration)
```typescript
export async function createBatch(data: {
  herb_species: string;
  farmer_id: string;
  quantity: number;
  harvest_date: string;
  farmer_name?: string;
}): Promise<Batch> {
  const response = await fetch(`${API_BASE}/batches/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...data,
      quantity_unit: 'kg',
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Failed to create batch');
  }

  return response.json();
}
```

### D. Fetch Single Batch Details
```typescript
export async function getBatchById(batchId: string): Promise<Batch> {
  const response = await fetch(`${API_BASE}/batches/${encodeURIComponent(batchId)}`);
  if (!response.ok) throw new Error('Batch not found');
  return response.json();
}
```

### E. Fetch Blockchain Traceability Payload
```typescript
export async function getBatchTraceability(batchId: string): Promise<TraceabilityPayload> {
  const response = await fetch(`${API_BASE}/batches/${encodeURIComponent(batchId)}/traceability`);
  if (!response.ok) throw new Error('Traceability data not found');
  return response.json();
}
```

### F. Query Dravya AI Assistant (Chat Interface)
```typescript
export async function sendChatMessage(
  message: string,
  conversationId?: string
): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message, // e.g. "Ashwagandha ki total quantity kitni hai?"
      conversation_id: conversationId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to communicate with Dravya AI Assistant');
  }

  return response.json();
}
```

#### Example Request:
```json
{
  "message": "Ashwagandha ki total quantity kitni hai?"
}
```

#### Example Response:
```json
{
  "answer": "Dravya system me Withania somnifera ki total recorded quantity 1850.50 kg hai. Isme total 8 batches aur 4 farmers registered hain.",
  "intent": "herb_summary",
  "data": {
    "herb": "Ashwagandha",
    "canonical_species": "Withania somnifera",
    "total_batches": 8,
    "total_quantity": 1850.5,
    "quantity_unit": "kg",
    "farmers_count": 4,
    "farmers": ["F001", "F002", "F003", "F004"],
    "verification_breakdown": {
      "AI_CONFIRMED": 6,
      "REVIEW_REQUIRED": 2
    }
  },
  "tool_used": "get_herb_summary"
}
```


---

## 4. Frontend Component Data Mapping

### 1. Dashboard Component
- **Data Source**: `GET /inventory/summary`
- **Field Mappings**:
  - `total_quantity_kg` $\rightarrow$ Total Inventory Weight Metric Card.
  - `total_batches` $\rightarrow$ Active Batches Metric Card.
  - `unique_herbs_count` $\rightarrow$ Species Diversity Metric Card.
  - `unique_farmers_count` $\rightarrow$ Registered Farmers Count Card.
  - `verification_breakdown.AI_CONFIRMED` $\rightarrow$ Quality Pass Ratio Chart.

### 2. Herb Inventory Page
- **Data Source**: `GET /batches/summary/herb/{herb_name}` & `GET /batches/herb/{herb_name}`
- **Field Mappings**:
  - `herb` & `canonical_species` $\rightarrow$ Page Title & Botanical Subtitle.
  - `total_quantity` $\rightarrow$ Stock Availability Header (`1850.5 kg`).
  - `farmers_count` $\rightarrow$ Farmer Count Badge.
  - `farmers` $\rightarrow$ Supplier Filter Dropdown.

### 3. Farmer Inventory Page
- **Data Source**: `GET /batches/summary/farmer/{farmer_id}` & `GET /batches/farmer/{farmer_id}`
- **Field Mappings**:
  - `farmer_name` & `farmer_id` $\rightarrow$ Farmer Profile Header.
  - `total_quantity` $\rightarrow$ Cumulative Harvest Supplied.
  - `herbs_supplied` $\rightarrow$ Herb Badges Array (`["Ashwagandha", "Tulsi"]`).

### 4. Traceability & Integrity Page
- **Data Source**: `GET /batches/{batch_id}/traceability`
- **Field Mappings**:
  - `batch_id` $\rightarrow$ Unique QR Code & Header.
  - `payload_hash` $\rightarrow$ SHA-256 Tamper Validation Badge (`0x...` or hex hash display).
  - `ai_verification.confidence` $\rightarrow$ AI Species Confidence Rating (e.g. `96.5%`).
  - `timestamps.harvest_date` $\rightarrow$ Farm Harvest Date Display.
