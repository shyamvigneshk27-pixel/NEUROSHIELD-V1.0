import requests
import json

BASE_URL = "http://localhost:8000"

def test_chat(query, context=None):
    print(f"\n--- Testing Query: '{query}' ---")
    payload = {"query": query}
    if context:
        payload["context"] = json.dumps(context)
        
    try:
        response = requests.post(f"{BASE_URL}/chat", json=payload)
        response.raise_for_status()
        print(f"Response: {response.json()['answer']}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Test Greeting
    test_chat("Hello!")
    
    # Test Medical Term
    test_chat("What are Gamma waves?")
    
    # Test Report Analysis with high risk
    mock_context = {
        "label": "Seizure",
        "risk_score": 95.0,
        "model_accuracy": 94.2,
        "bands": {"gamma": 45.0, "beta": 20.0, "alpha": 15.0, "theta": 10.0, "delta": 10.0}
    }
    test_chat("Explain my report", mock_context)
    
    # Test Report Analysis with low risk
    mock_context_low = {
        "label": "Normal",
        "risk_score": 5.0,
        "model_accuracy": 94.2,
        "bands": {"alpha": 50.0, "beta": 30.0, "theta": 10.0, "delta": 5.0, "gamma": 5.0}
    }
    test_chat("Tell me about my results", mock_context_low)
