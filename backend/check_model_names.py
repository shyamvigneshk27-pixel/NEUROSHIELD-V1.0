import joblib
import os

model_path = "d:/MINIPROJECT/midnight-eclipse/backend/ml/models/rf_model.pkl"
clf = joblib.load(model_path)
if hasattr(clf, "feature_names_in_"):
    print(f"Feature names at fit: {clf.feature_names_in_}")
else:
    print("Model has no feature_names_in_ (likely fit on NumPy array)")
