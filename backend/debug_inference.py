import sys
import os
import numpy as np
import traceback

# Add backend directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ml.inference import Predictor

def debug():
    try:
        print("Initializing Predictor...")
        predictor = Predictor()
        print("Predictor initialized.")
        
        signal = np.random.normal(0, 1, 178)
        print("Running prediction...")
        result = predictor.predict_csv(signal)
        print(f"Result: {result}")
        
    except Exception:
        print("--- TRACEBACK ---")
        traceback.print_exc()

if __name__ == "__main__":
    debug()
