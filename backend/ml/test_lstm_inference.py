import os
import sys
import torch
import numpy as np
import pandas as pd

# Add backend to path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

from ml.inference import Predictor

def test_inference():
    predictor = Predictor()
    
    # Create a dummy signal (178 points)
    # Let's create a sine wave to simulate some data
    t = np.linspace(0, 1, 178)
    dummy_signal = np.sin(2 * np.pi * 5 * t) + np.random.normal(0, 0.1, 178)
    
    print("\n--- Testing CSV Inference ---")
    result = predictor.predict_csv(dummy_signal.tolist())
    
    if "error" in result:
        print(f"Error: {result['error']}")
    else:
        print(f"Label: {result['label']}")
        print(f"Risk Score: {result['risk_score']}")
        print(f"Confidence: {result['confidence']:.2f}%")
        print(f"Interpretation: {result['interpretation']}")
        print(f"Model Accuracy: {result['model_accuracy']}%")

if __name__ == "__main__":
    test_inference()
