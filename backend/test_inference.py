import sys
import os
import numpy as np

# Add backend directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ml.inference import Predictor

def test_varied_scores():
    print("Initializing Predictor...")
    predictor = Predictor()
    print("Predictor initialized.")
    
    # Simulate a "normal" signal (low amplitude noise)
    print("Testing normal signal...")
    normal_signal = np.random.normal(0, 1, 178)
    res_normal = predictor.predict_csv(normal_signal)
    
    # Simulate a "seizure-like" signal (high amplitude oscillation)
    print("Testing seizure signal...")
    t = np.linspace(0, 1, 178)
    seizure_signal = 50 * np.sin(2 * np.pi * 10 * t) + np.random.normal(0, 5, 178)
    res_seizure = predictor.predict_csv(seizure_signal)
    
    print("\n--- INFERENCE TEST RESULTS ---")
    print(f"Normal Result: {res_normal}")
    print(f"Seizure Result: {res_seizure}")
    
    risk_n = res_normal.get('risk_score')
    risk_s = res_seizure.get('risk_score')
    
    print(f"Normal Signal -> Label: {res_normal.get('label')}, Risk: {risk_n}%")
    print(f"Seizure Signal -> Label: {res_seizure.get('label')}, Risk: {risk_s}%")
    
    # Check ranges
    if risk_n is not None and 5 <= risk_n <= 50:
        print("PASS: Normal signal risk is in expected low range (5-50%).")
    else:
        print(f"FAIL: Normal signal risk {risk_n} is problematic or out of range.")
        
    if risk_s is not None and 51 <= risk_s <= 99:
        print("PASS: Seizure signal risk is in expected high range (51-99%).")
    else:
        print(f"FAIL: Seizure signal risk {risk_s} is problematic or out of range.")

if __name__ == "__main__":
    test_varied_scores()
