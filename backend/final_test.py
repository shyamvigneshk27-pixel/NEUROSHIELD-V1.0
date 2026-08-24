import sys
import os
import numpy as np

# Add backend directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ml.inference import Predictor

def test():
    predictor = Predictor()
    # 1. Test Normal
    sig_normal = np.random.normal(0, 5, 178)
    res_n = predictor.predict_csv(sig_normal)
    print(f"NORMAL_RISK: {res_n.get('risk_score')}%")
    
    # 2. Test Seizure
    t = np.linspace(0, 1, 178)
    sig_seizure = 60 * np.sin(2 * np.pi * 10 * t) + np.random.normal(0, 10, 178)
    res_s = predictor.predict_csv(sig_seizure)
    print(f"SEIZURE_RISK: {res_s.get('risk_score')}%")

if __name__ == "__main__":
    test()
