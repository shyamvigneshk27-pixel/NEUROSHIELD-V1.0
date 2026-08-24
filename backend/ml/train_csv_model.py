import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os
import glob

# Config
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SEIZURE_DIR = os.path.join(BASE_DIR, "../../dataset/seizure")
NON_SEIZURE_DIR = os.path.join(BASE_DIR, "../../dataset/non_seizure")
MODEL_PATH = os.path.join(BASE_DIR, "models/rf_model.pkl")
SAMPLE_RATE = 178

os.makedirs(os.path.join(BASE_DIR, "models"), exist_ok=True)

def extract_features_from_signal(signal):
    return {
        "mean": np.mean(signal),
        "std": np.std(signal),
        "max": np.max(signal),
        "min": np.min(signal),
        "ptp": np.ptp(signal),
        "zero_crossings": np.sum(np.diff(np.signbit(signal)).astype(int))
    }

def load_raw_data():
    features = []
    labels = []
    
    # Process Seizure files
    seizure_files = glob.glob(os.path.join(SEIZURE_DIR, "*.csv"))
    print(f"Processing {len(seizure_files)} seizure files...")
    for f_path in seizure_files:
        try:
            df = pd.read_csv(f_path)
            signal = df['channel_1'].values
            num_segments = len(signal) // SAMPLE_RATE
            for j in range(num_segments):
                segment = signal[j*SAMPLE_RATE : (j+1)*SAMPLE_RATE]
                features.append(extract_features_from_signal(segment))
                labels.append("seizure")
        except Exception as e:
            print(f"Error processing {f_path}: {e}")
            
    # Process Non-Seizure files
    non_seizure_files = glob.glob(os.path.join(NON_SEIZURE_DIR, "*.csv"))
    print(f"Processing {len(non_seizure_files)} non-seizure files...")
    for f_path in non_seizure_files:
        try:
            df = pd.read_csv(f_path)
            signal = df['channel_1'].values
            num_segments = len(signal) // SAMPLE_RATE
            for j in range(num_segments):
                segment = signal[j*SAMPLE_RATE : (j+1)*SAMPLE_RATE]
                features.append(extract_features_from_signal(segment))
                labels.append("normal")
        except Exception as e:
            print(f"Error processing {f_path}: {e}")
            
    return pd.DataFrame(features), pd.Series(labels)

def train_model():
    print("Loading data directly from raw folders...")
    X, y = load_raw_data()
    print(f"Total samples: {len(X)}")

    # Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Train
    print("Training Random Forest on raw data features...")
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X_train, y_train)

    # Evaluate
    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"Accuracy: {acc:.4f}")
    print(classification_report(y_test, y_pred))

    # Save
    joblib.dump(clf, MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")

if __name__ == "__main__":
    train_model()
