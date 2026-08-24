import os
import torch
import numpy as np
import pandas as pd
import sys

# Define base directory correctly
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(BASE_DIR, "..")
PROJECT_ROOT = os.path.join(BACKEND_DIR, "..")

sys.path.append(BACKEND_DIR)

from ml.inference import Predictor

def debug_model():
    predictor = Predictor()
    if predictor.lstm_model is None:
        print("LSTM model not loaded!")
        return

    seizure_dir = os.path.join(PROJECT_ROOT, "dataset/seizure")
    normal_dir = os.path.join(PROJECT_ROOT, "dataset/non_seizure")
    
    def test_dir(directory, label):
        if not os.path.exists(directory):
            print(f"Directory {directory} not found!")
            return
        files = [f for f in os.listdir(directory) if f.endswith('.csv')][:10]
        print(f"\nTesting {label} samples from {directory}:")
        count_correct = 0
        for f in files:
            path = os.path.join(directory, f)
            df = pd.read_csv(path)
            if 'channel_1' in df.columns:
                signal = df['channel_1'].values[:178].tolist()
                res = predictor.predict_csv(signal)
                pred_label = res['label']
                is_correct = pred_label.lower() == label.lower()
                if is_correct: count_correct += 1
                status = "PASS" if is_correct else "FAIL"
                print(f"[{status}] File: {f} -> Predicted: {res['label']} (Conf: {res['confidence']:.2f}%, Risk: {res['risk_score']}%)")
            else:
                print(f"[-] File: {f} -> No channel_1 column")
        print(f"Result for {label}: {count_correct}/{len(files)}")

    test_dir(seizure_dir, "Seizure")
    test_dir(normal_dir, "Normal")

if __name__ == "__main__":
    debug_model()
