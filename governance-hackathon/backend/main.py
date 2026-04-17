"""
OPS GUARD Backend — FastAPI + Groq AI Integration
Menjalankan: uvicorn main:app --reload --port 8000
"""

import os
import json
from datetime import datetime
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq

# Load environment variables from .env file
load_dotenv()

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Model untuk request
class AnalyzeRequest(BaseModel):
    asset_id: str
    location: str
    maintenance_type: str
    technician: str
    maintenance_note: str

# Model untuk response
class RiskItem(BaseModel):
    keyword: str
    severity: str

class RecommendationItem(BaseModel):
    action: str
    priority: str

# FastAPI app
app = FastAPI(
    title="OPS GUARD API",
    description="AI-powered maintenance operations backend",
    version="1.0.0"
)

# CORS — agar frontend bisa akses
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# System prompt untuk AI analyzer
SYSTEM_PROMPT = """You are an AI maintenance governance analyst. Your role is to analyze maintenance records and provide structured risk assessment, classification, and recommendations.

Analyze the maintenance record and respond EXACTLY in this JSON format (no extra text, no markdown):
{
    "risk_level": "low" | "medium" | "high" | "critical",
    "risk_score": 0-100,
    "risk_reasons": ["reason 1", "reason 2"],
    "flagged_keywords": ["keyword1", "keyword2"],
    "suggested_classification": "Routine" | "Priority" | "Emergency",
    "recommendations": ["recommendation 1", "recommendation 2"],
    "anomalies": ["anomaly 1"] | [],
    "summary": "one sentence summary of the overall assessment"
}

Rules:
- risk_level "critical" only if immediate danger or severe safety hazard
- risk_level "high" if significant operational impact
- risk_level "medium" if moderate concern
- risk_level "low" if routine maintenance
- Provide 2-4 specific risk_reasons
- Provide 1-3 actionable recommendations
- flagged_keywords should capture concerning terms found in the note
- anomalies should detect unusual patterns (e.g., similar issues in short timeframe, inconsistent data)
- summary should be a single clear sentence usable for audit trail"""

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "OPS GUARD AI Backend",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/api/analyze")
async def analyze_maintenance(data: AnalyzeRequest):
    """
    Terima maintenance record → return AI analysis
    """
    try:
        # Buat prompt dari data yang dikirim user
        user_prompt = f"""Asset ID: {data.asset_id}
Location: {data.location}
Maintenance Type: {data.maintenance_type}
Technician: {data.technician}
Maintenance Note: {data.maintenance_note}

Analyze this maintenance record:"""

        # Panggil Groq
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,
            max_tokens=1024,
        )

        # Parse response dari AI
        raw_response = response.choices[0].message.content.strip()

        # Bersihkan kalau ada backtick atau json wrapper
        if raw_response.startswith("```"):
            lines = raw_response.split("\n")
            raw_response = "\n".join(lines[1:-1])

        # Parse JSON
        try:
            analysis = json.loads(raw_response)
        except json.JSONDecodeError:
            # Fallback kalau AI balas di luar format
            analysis = {
                "risk_level": "medium",
                "risk_score": 50,
                "risk_reasons": ["AI response parsing failed — manual review recommended"],
                "flagged_keywords": [],
                "suggested_classification": "Routine",
                "recommendations": ["Verify data manually"],
                "anomalies": [],
                "summary": raw_response[:200]
            }

        # Timestamp analisis
        analysis["analyzed_at"] = datetime.now().isoformat()
        analysis["asset_id"] = data.asset_id

        return {
            "success": True,
            "data": analysis
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")

@app.post("/api/batch-analyze")
async def batch_analyze(records: list[AnalyzeRequest]):
    """
    Analyze multiple records in batch
    """
    results = []
    for record in records:
        try:
            user_prompt = f"""Asset ID: {record.asset_id}
Location: {record.location}
Maintenance Type: {record.maintenance_type}
Technician: {record.technician}
Maintenance Note: {record.maintenance_note}

Analyze this maintenance record:"""

            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                max_tokens=1024,
            )

            raw = response.choices[0].message.content.strip()
            if raw.startswith("```"):
                lines = raw.split("\n")
                raw = "\n".join(lines[1:-1])

            analysis = json.loads(raw)
            analysis["analyzed_at"] = datetime.now().isoformat()
            analysis["asset_id"] = record.asset_id

            results.append({"success": True, "data": analysis})

        except Exception as e:
            results.append({"success": False, "asset_id": record.asset_id, "error": str(e)})

    return {"results": results}

# --- Run info ---
# Untuk menjalankan: uvicorn main:app --reload --port 8000
# Docs: http://localhost:8000/docs