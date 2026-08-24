import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib

from utils.eeg_processing import bandpass_filter, compute_band_powers

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SEIZURE_DIR = os.path.join(BASE_DIR, "../../dataset/seizure")
NON_SEIZURE_DIR = os.path.join(BASE_DIR, "../../dataset/non_seizure")
MODEL_PATH = os.path.join(BASE_DIR, "models/best_rf_model.pkl")
SAMPLE_RATE = 173

os.makedirs(os.path.join(BASE_DIR, "models"), exist_ok=True)

def extract_features_from_signal(signal, fs=173.61):
    filtered = bandpass_filter(signal, lowcut=0.5, highcut=40.0, fs=fs)
    stats = {
        "mean": float(np.mean(filtered)),
        "std": float(np.std(filtered)),
        "max": float(np.max(filtered)),
        "min": float(np.min(filtered)),
        "ptp": float(np.ptp(filtered)),
        "zero_crossings": int(np.sum(np.diff(np.signbit(filtered)).astype(int)))
    }
    bands = compute_band_powers(filtered, fs=fs)
    feat = [
        stats["mean"], stats["std"], stats["max"], stats["min"], stats["ptp"], stats["zero_crossings"],
        bands["delta"], bands["theta"], bands["alpha"], bands["beta"], bands["gamma"]
    ]
    return np.array(feat)

def load_raw_data():
    features = []
    labels = []
    # Process Seizure files
    seizure_files = [f for f in os.listdir(SEIZURE_DIR) if f.lower().endswith('.csv')]
    for fname in seizure_files:
        path = os.path.join(SEIZURE_DIR, fname)
        try:
            df = pd.read_csv(path)
            signal = df['channel_1'].values.astype(float)
            num_segments = len(signal) // SAMPLE_RATE
            for j in range(num_segments):
                segment = signal[j*SAMPLE_RATE : (j+1)*SAMPLE_RATE]
                features.append(extract_features_from_signal(segment))
                labels.append(1)
        except Exception as e:
            print(f"Skipping {path} (error: {e})")
    # Process Non-Seizure files
    non_seizure_files = [f for f in os.listdir(NON_SEIZURE_DIR) if f.lower().endswith('.csv')]
    for fname in non_seizure_files:
        path = os.path.join(NON_SEIZURE_DIR, fname)
        try:
            df = pd.read_csv(path)
            signal = df['channel_1'].values.astype(float)
            num_segments = len(signal) // SAMPLE_RATE
            for j in range(num_segments):
                segment = signal[j*SAMPLE_RATE : (j+1)*SAMPLE_RATE]
                features.append(extract_features_from_signal(segment))
                labels.append(0)
        except Exception as e:
            print(f"Skipping {path} (error: {e})")
    X = np.array(features)
    y = np.array(labels)
    return X, y

def main():
    X, y = load_raw_data()
    if len(X) == 0:
        print("No data found. Check dataset folder structure and file formats.")
        return
    print(f"Loaded {len(X)} samples.")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    clf = RandomForestClassifier(n_estimators=200, random_state=42)
    clf.fit(X_train, y_train)
    y_pred = clf.predict(X_test)
    print("Classification report:")
    print(classification_report(y_test, y_pred))
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    joblib.dump(clf, MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")

if __name__ == "__main__":
    main()
