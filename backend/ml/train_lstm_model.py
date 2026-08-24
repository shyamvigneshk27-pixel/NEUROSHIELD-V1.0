import os
import glob
import pandas as pd
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

# Config
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SEIZURE_DIR = os.path.join(BASE_DIR, "../../dataset/seizure")
NON_SEIZURE_DIR = os.path.join(BASE_DIR, "../../dataset/non_seizure")
MODEL_SAVE_PATH = os.path.join(BASE_DIR, "models/lstm_model.pth")
SAMPLE_RATE = 178 # Length of each segment
BATCH_SIZE = 32
EPOCHS = 40
LEARNING_RATE = 0.0005

os.makedirs(os.path.join(BASE_DIR, "models"), exist_ok=True)

class EEGDataset(Dataset):
    def __init__(self, X, y):
        self.X = torch.tensor(X, dtype=torch.float32).unsqueeze(-1) # Add feature dimension: [batch, sequence, 1]
        self.y = torch.tensor(y, dtype=torch.long)
        
    def __len__(self):
        return len(self.X)
    
    def __getitem__(self, idx):
        return self.X[idx], self.y[idx]

class LSTMModel(nn.Module):
    def __init__(self, input_size=1, hidden_size=64, num_layers=2, num_classes=2):
        super(LSTMModel, self).__init__()
        # CNN layer to extract local patterns (features) from raw signal
        self.conv1 = nn.Conv1d(in_channels=1, out_channels=32, kernel_size=7, stride=2, padding=3)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(0.2)
        
        # LSTM layer to process sequences of extracted features
        # After conv1 with stride 2, sequence length 178 becomes 89
        self.lstm = nn.LSTM(input_size=32, hidden_size=hidden_size, num_layers=num_layers, batch_first=True, dropout=0.2)
        self.fc = nn.Linear(hidden_size, num_classes)
        
    def forward(self, x):
        # x shape: [batch, 178, 1] -> need [batch, 1, 178] for Conv1d
        x = x.transpose(1, 2)
        x = self.relu(self.conv1(x))
        x = self.dropout(x)
        
        # x shape: [batch, 32, 89] -> need [batch, 89, 32] for LSTM
        x = x.transpose(1, 2)
        
        out, _ = self.lstm(x)
        out = self.fc(out[:, -1, :]) # Take last time step
        return out

def load_data():
    X = []
    y = []
    
    # helper for processing files
    def process_files(directory, label):
        files = glob.glob(os.path.join(directory, "*.csv"))
        print(f"Processing {len(files)} files from {os.path.basename(directory)}...")
        for f_path in files:
            try:
                df = pd.read_csv(f_path)
                if 'channel_1' not in df.columns:
                    continue
                signal = df['channel_1'].values
                num_segments = len(signal) // SAMPLE_RATE
                for i in range(num_segments):
                    segment = signal[i*SAMPLE_RATE : (i+1)*SAMPLE_RATE]
                    # Simple normalization: mean 0, std 1
                    segment = (segment - np.mean(segment)) / (np.std(segment) + 1e-8)
                    X.append(segment)
                    y.append(label)
            except Exception as e:
                print(f"Error processing {f_path}: {e}")

    process_files(SEIZURE_DIR, 1) # 1 for seizure
    process_files(NON_SEIZURE_DIR, 0) # 0 for normal
    
    return np.array(X), np.array(y)

def train():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")
    
    X, y = load_data()
    print(f"Total segments: {len(X)}")
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    train_dataset = EEGDataset(X_train, y_train)
    test_dataset = EEGDataset(X_test, y_test)
    
    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
    test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE, shuffle=False)
    
    # Calculate class weights for imbalance
    class_counts = [np.sum(y_train == 0), np.sum(y_train == 1)]
    weights = 1.0 / torch.tensor(class_counts, dtype=torch.float32)
    weights = weights / weights.sum()
    
    model = LSTMModel().to(device)
    criterion = nn.CrossEntropyLoss(weight=weights.to(device))
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)
    
    print("Starting training...")
    for epoch in range(EPOCHS):
        model.train()
        total_loss = 0
        for batch_X, batch_y in train_loader:
            batch_X, batch_y = batch_X.to(device), batch_y.to(device)
            
            optimizer.zero_grad()
            outputs = model(batch_X)
            loss = criterion(outputs, batch_y)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
            
        print(f"Epoch [{epoch+1}/{EPOCHS}], Loss: {total_loss/len(train_loader):.4f}")
        
    # Evaluation
    model.eval()
    all_preds = []
    all_labels = []
    with torch.no_grad():
        for batch_X, batch_y in test_loader:
            batch_X = batch_X.to(device)
            outputs = model(batch_X)
            _, predicted = torch.max(outputs.data, 1)
            all_preds.extend(predicted.cpu().numpy())
            all_labels.extend(batch_y.numpy())
            
    print("\nEvaluation Results:")
    print(f"Accuracy: {accuracy_score(all_labels, all_preds):.4f}")
    print(classification_report(all_labels, all_preds, target_names=["Normal", "Seizure"]))
    
    # Save model
    torch.save(model.state_dict(), MODEL_SAVE_PATH)
    print(f"Model saved to {MODEL_SAVE_PATH}")

if __name__ == "__main__":
    train()
