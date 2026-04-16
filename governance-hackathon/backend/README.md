# GovernanceFlow Backend

FastAPI backend dengan Groq AI integration untuk maintenance governance analysis.

## Setup

### 1. Install dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure API Key

Copy `.env.example` ke `.env`:
```bash
cp .env.example .env
```

Edit `.env` dan isi Groq API key kamu:
```
GROQ_API_KEY=gsk_your_actual_key_here
```

### 3. Jalankan server

```bash
uvicorn main:app --reload --port 8000
```

Server akan berjalan di `http://localhost:8000`

## Endpoints

### `GET /`
Health check — return status dan service info.

### `GET /health`
Simple health check.

### `POST /api/analyze`
Analyze single maintenance record.

**Request body:**
```json
{
    "asset_id": "TRK-PLT-204",
    "location": "Warehouse Bekasi 2",
    "maintenance_type": "Preventive Maintenance",
    "technician": "Budi Santoso",
    "maintenance_note": "Oil change dan inspeksi brake system. Brake pad mulai menipis."
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "risk_level": "medium",
        "risk_score": 45,
        "risk_reasons": [
            "Brake pad menipis — potential safety hazard",
            "Preventive maintenance terlambat 2 minggu"
        ],
        "flagged_keywords": ["menipis", "brake"],
        "suggested_classification": "Priority",
        "recommendations": [
            "Replace brake pad segera sebelum deadline",
            "Schedule ulang preventive maintenance"
        ],
        "anomalies": [],
        "summary": "Maintenance ini butuh prioritas tinggi karena brake system impact ke safety.",
        "analyzed_at": "2026-04-17T00:10:00",
        "asset_id": "TRK-PLT-204"
    }
}
```

### `POST /api/batch-analyze`
Analyze multiple records in one request.

**Request body:** Array of maintenance records.

## API Docs

Setelah server berjalan, buka:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | ✅ | API key dari console.groq.com |

## Model yang Dipakai

- **Model:** `llama-3.3-70b-versatile`
- **Provider:** Groq (free tier available)
- **Temperature:** 0.3 (cukup stabil, tidak terlalu random)
- **Max tokens:** 1024