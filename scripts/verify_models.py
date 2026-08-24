import sys
import os
import pandas as pd
import numpy as np
import glob

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), "../backend"))
from ml.inference import Predictor

def verify():
    print("Initializing Predictor...")
    predictor = Predictor()
    
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    SEIZURE_DIR = os.path.join(BASE_DIR, "../dataset/seizure")
    NON_SEIZURE_DIR = os.path.join(BASE_DIR, "../dataset/non_seizure")
    SAMPLE_RATE = 178

    print("Checking model status...")
    if predictor.rf_model is None:
        print("ERROR: RF Model is offline!")
    else:
        print("RF Model is ONLINE.")

    if predictor.cnn_model is None:
        print("ERROR: CNN Model is offline!")
    else:
        print("CNN Model is ONLINE.")

    # Test with a few raw files
    files = []
    s_files = glob.glob(os.path.join(SEIZURE_DIR, "*.csv"))[:1]
    n_files = glob.glob(os.path.join(NON_SEIZURE_DIR, "*.csv"))[:1]
    
    for f in s_files: files.append((f, "seizure"))
    for f in n_files: files.append((f, "normal"))

    print("\n--- Testing Raw Inference ---")
    for f_path, actual in files:
        try:
            df = pd.read_csv(f_path)
            signal = df['channel_1'].values[:SAMPLE_RATE].astype(float)
            
            res = predictor.predict_csv(signal)
            print(f"File: {os.path.basename(f_path)} (Actual: {actual})")
            print(f"  Prediction: {res.get('label')} (Confidence: {res.get('confidence'):.2f}%)")
            print(f"  Risk Score: {res.get('risk_score'):.2f}%")
        except Exception as e:
            print(f"  Error testing {f_path}: {e}")

if __name__ == "__main__":
    verify()
