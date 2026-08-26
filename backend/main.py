
# Force Reload: v4 (Vision Enhancement)
import datetime 
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import pandas as pd
import numpy as np
import json
import random
import sys
import os

from dotenv import load_dotenv
from google import genai

load_dotenv()
try:
    genai_api_key = os.environ.get("GEMINI_API_KEY")
    if genai_api_key and genai_api_key != "YOUR_GEMINI_API_KEY_HERE":
        genai_client = genai.Client(api_key=genai_api_key)
    else:
        genai_client = None
        print("Warning: GEMINI_API_KEY not found or is default.")
except Exception as e:
    print(f"Warning: Failed to initialize Gemini Client: {e}")
    genai_client = None

# Add current directory to path to allow absolute imports when running as a script
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from ml.inference import Predictor
except ImportError:
    # Fallback for different execution contexts
    from .ml.inference import Predictor

app = FastAPI(title="NeuroShield API", description="AI Backend for Seizure Prediction")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ML
predictor = Predictor()

# Load Medical Terms
base_dir = os.path.dirname(os.path.abspath(__file__))
try:
    with open(os.path.join(base_dir, "medical_terms.json"), "r") as f:
        medical_terms = json.load(f)
except FileNotFoundError:
    print("WARNING: medical_terms.json not found")
    medical_terms = {}
except json.JSONDecodeError:
    print("WARNING: medical_terms.json is not valid JSON")
    medical_terms = {}

# Models
class ChatRequest(BaseModel):
    query: str
    context: Optional[str] = None # Detailed context from the current report

class SummarizeRequest(BaseModel):
    analysis_result: dict

class LoginRequest(BaseModel):
    username: str
    password: str
    role: str # 'admin' or 'user'

@app.post("/login")
async def login(request: LoginRequest):
    current_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    if request.username == "admin" and request.password == "admin123" and request.role == "admin":
        print(f"[AUTH] Admin login successful: {request.username} at {current_time}")
        return {
            "status": "success", 
            "user": {
                "name": "Administrator", 
                "role": "admin",
                "loginTime": current_time
            }
        }
    elif request.username == "user" and request.password == "user123" and request.role == "user":
        print(f"[AUTH] User login successful: {request.username} at {current_time}")
        return {
            "status": "success", 
            "user": {
                "name": "EEG Technician", 
                "role": "user",
                "loginTime": current_time
            }
        }
    else:
        print(f"[AUTH] Login FAILED: {request.username} (Role: {request.role}) at {current_time}")
        raise HTTPException(status_code=401, detail="Invalid credentials for the selected role.")

@app.post("/analyze/csv")
async def analyze_csv(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a CSV.")
    
    try:
        # Read with no header initially to check content
        df = pd.read_csv(file.file, header=None)
        
        # Robust signal extraction:
        # 1. Check if it's wide format (many columns) or long format (many rows, few columns)
        
        # Read a few rows to determine format
        file.file.seek(0)
        df_peek = pd.read_csv(file.file, nrows=5)
        
        if df_peek.shape[1] >= 178:
            # Wide format (Original/Synthetic)
            file.file.seek(0)
            df = pd.read_csv(file.file)
            # Find first numeric row and take first 178 numeric columns
            signal_data = df.select_dtypes(include=[np.number]).iloc[0].values[:178].astype(float)
        else:
            # Long format (Raw recordings: time, channel_1)
            file.file.seek(0)
            df = pd.read_csv(file.file)
            
            # Find a column that looks like signal (usually the second column or named channel_*)
            signal_col = None
            for col in df.columns:
                if 'channel' in col.lower() or 'signal' in col.lower() or 'val' in col.lower():
                    signal_col = col
                    break
            
            if signal_col is None:
                # Fallback: find first numeric column that isn't 'time' or 'id'
                numeric_cols = df.select_dtypes(include=[np.number]).columns
                for col in numeric_cols:
                    if 'time' not in col.lower() and 'id' not in col.lower():
                        signal_col = col
                        break
            
            if signal_col is None and not df.select_dtypes(include=[np.number]).empty:
                 signal_col = df.select_dtypes(include=[np.number]).columns[0]

            if signal_col:
                signal_data = df[signal_col].values[:178].astype(float)
            else:
                raise HTTPException(status_code=400, detail="Could not find numeric signal column in CSV.")

        if len(signal_data) < 178:
             raise HTTPException(status_code=400, detail=f"Insufficient data points. Need 178, found {len(signal_data)}")
             
        prediction = predictor.predict_csv(signal_data)
        
        print(f"[ANALYSIS] CSV Processed: {file.filename}")
        print(f" > Result: {prediction.get('label')} (Risk: {prediction.get('risk_score'):.2f}%)")
        
        return {
            "filename": file.filename,
            "prediction": prediction,
            "raw_signal": signal_data.tolist(),
            "message": "Analysis complete."
        }
            
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error processing CSV: {str(e)}")

@app.post("/analyze/image")
async def analyze_image(file: UploadFile = File(...)):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image.")
    
    try:
        contents = await file.read()
        prediction = predictor.predict_image(contents)
        
        print(f"[ANALYSIS] Image Processed: {file.filename}")
        print(f" > Result: {prediction.get('label')} (Risk: {prediction.get('risk_score'):.2f}%)")
        
        return {
            "filename": file.filename,
            "prediction": prediction,
            "raw_signal": prediction.get("raw_signal", []),
            "message": "Image Analysis complete."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@app.get("/health")
async def health_check():
    lstm_status = "Online" if predictor.lstm_model else "Offline"
    rf_status = "Online" if predictor.rf_model else "Offline"
    cnn_status = "Online" if predictor.cnn_model else "Offline"
    
    # Get absolute paths for diagnostics
    base_dir = os.path.dirname(os.path.abspath(__file__))
    rf_path = os.path.join(base_dir, "ml", "models", "rf_model.pkl")
    
    return {
        "status": "Running",
        "models": {
            "lstm": lstm_status,
            "random_forest": rf_status,
            "cnn": cnn_status
        },
        "diagnostics": {
            "cwd": os.getcwd(),
            "base_dir": base_dir,
            "rf_model_expected_path": rf_path,
            "rf_model_exists": os.path.exists(rf_path)
        }
    }


@app.post("/summarize")
async def summarize_report(request: SummarizeRequest):
    if not genai_client:
        return {"summary": "Gemini API is not configured. Please set GEMINI_API_KEY in backend/.env file."}
    
    try:
        prompt = f"""
        Act as a clinical neurologist assistant. Analyze the following EEG analysis report and provide a clear, professional summary.
        Make it readable for a clinician. Use markdown formatting with bullet points and bold text where appropriate.

        Report Data:
        {json.dumps(request.analysis_result, indent=2)}

        Include:
        - A brief overview of the diagnosis (the label and risk score).
        - An explanation of the current neural oscillation bands (which band is dominant and what it means).
        - Clinical recommendations or next steps based on the risk score (e.g., routine monitoring vs. urgent care).
        """
        response = genai_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        return {"summary": response.text}
    except Exception as e:
        print(f"[SUMMARIZE] Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate summary via Gemini API.")

@app.post("/chat")
async def chat(request: ChatRequest):
    query = request.query.lower()
    
    if genai_client:
        try:
            prompt = f"You are NeuroShield, an AI assistant specializing in EEG analysis. "
            if request.context:
                prompt += f"Here is the context of the user's current EEG report: {request.context}. "
            prompt += f"Answer the user's query professionally and concisely.\n\nUser: {query}"
            
            response = genai_client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt
            )
            ans = response.text
            print(f"[CHAT] Query: {query} (Gemini handled)")
            return {"answer": ans.strip()}
        except Exception as e:
            print(f"[CHAT] Gemini Error: {e}")
            # Fallback to simple matching if Gemini fails
            pass
            
    # --- STATIC FALLBACK IF GEMINI OFFLINE OR FAILS ---
    response_text = ""
    greetings = ["Hello!", "Greetings.", "Hi there!", "Welcome back.", "Hello. I'm ready to assist."]
    support_phrases = ["I'm here to help you understand this data.", "Let me look into that for you.", "Great question.", "I'm analyzing the clinical patterns now."]
    
    if any(greet in query for greet in ["hello", "hi", "hey", "good morning", "good evening"]):
        response_text += f"{random.choice(greetings)} I am the NeuroShield AI Assistant. {random.choice(support_phrases)}\n\n"

    # Medical terms
    found_terms = []
    for term, definition in medical_terms.items():
        if term in query:
            found_terms.append(f"**{term.capitalize()}**: {definition}")
            
    if found_terms:
        response_text += "I found some medical terms in your query:\n" + "\n\n".join(found_terms) + "\n\n"
            
    if any(word in query for word in ["risk", "status", "result", "report", "happen", "wrong", "analyze", "explain"]):
        if request.context:
            try:
                import json as py_json
                ctx = py_json.loads(request.context)
                label = ctx.get('label', 'Unknown')
                risk = ctx.get('risk_score', 0)
                acc = ctx.get('model_accuracy', 0)
                bands = ctx.get('bands', {})
                
                analysis = f"Looking at your report, I see a **{label}** classification with a **{risk:.1f}% risk score**.\n\n"
                analysis += f"The system reliability for this specific analysis is **{acc}%**. "
                
                if risk > 60:
                    analysis += "The higher risk score is likely driven by characteristic ictal power shifts. "
                else:
                    analysis += "The neural patterns currently suggest a more stable state. "
                
                if bands:
                    dominant_band = max(bands, key=bands.get)
                    analysis += f"The dominant neural oscillation detected is in the **{dominant_band.capitalize()}** range ({bands[dominant_band]:.1f}% relative power)."
                
                response_text += analysis + "\n\n"
            except:
                response_text += f"Based on the clinical report: {request.context}. This indicates the current neural status processed by our models.\n\n"
        else:
            response_text += "I don't see an active analysis report yet. Please upload an EEG signal (CSV) or a Spectrogram (IMG) so I can give you a detailed breakdown!\n\n"
    
    if "model" in query or "accuracy" in query or "reliable" in query:
        status = "Our neural models are fully synchronized and calibrated for clinical accuracy." if (predictor.rf_model is not None and predictor.cnn_model is not None) else "Warning: Neural models are currently offline. Please check system connectivity."
        response_text += f"{status}\n\n"

    if not response_text:
        if "help" in query:
             response_text = "I can analyze your uploaded telemetry to detect seizure indicators or explain complex neurology terms like 'ictal', 'delta waves', or 'nyquist frequency'."
        else:
             response_text = "I'm specializing in EEG analysis and seizure prediction. I can explain specific terms or analyze your current report if you ask me to 'explain my results'."
             
    print(f"[CHAT] Query: {query} (Fallback)")
    return {"answer": response_text.strip()}
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)