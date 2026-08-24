import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import os
import random

# Configuration
NUM_SAMPLES = 1000
SAMPLE_RATE = 178  # Hz (matches Bonn dataset sample size per sec roughly)
DURATION = 1       # Second
OUTPUT_CSV = "../dataset/train.csv"
OUTPUT_IMG_DIR = "../dataset/images"

os.makedirs(OUTPUT_IMG_DIR, exist_ok=True)

def generate_eeg_signal(is_seizure=False):
    t = np.linspace(0, DURATION, SAMPLE_RATE)
    
    if is_seizure:
        # Seizure: High amplitude, chaotic, spike-wave pattern (3-20 Hz)
        f1 = random.uniform(3, 8)
        f2 = random.uniform(10, 20)
        signal = (5 * np.sin(2 * np.pi * f1 * t) + 
                  3 * np.sin(2 * np.pi * f2 * t) + 
                  np.random.normal(0, 2, SAMPLE_RATE)) * random.uniform(1.5, 3.0)
        # Add random spikes
        num_spikes = random.randint(3, 10)
        for _ in range(num_spikes):
            spike_idx = random.randint(0, SAMPLE_RATE-1)
            signal[spike_idx] += random.choice([-15, 15])
            
    else:
        # Normal: Lower amplitude, Alpha/Beta waves (8-30 Hz) + noise
        f1 = random.uniform(8, 12)  # Alpha
        f2 = random.uniform(13, 30) # Beta
        signal = (1 * np.sin(2 * np.pi * f1 * t) + 
                  0.5 * np.sin(2 * np.pi * f2 * t) + 
                  np.random.normal(0, 0.5, SAMPLE_RATE))
    
    return signal

data = []
labels = []
ids = []

print(f"Generating {NUM_SAMPLES} synthetic samples...")

for i in range(NUM_SAMPLES):
    is_seizure = i % 2 == 0 # Balanced dataset
    signal = generate_eeg_signal(is_seizure)
    label = "seizure" if is_seizure else "normal"
    sample_id = f"sample_{i}"
    
    # Save Spectrogram Image
    plt.figure(figsize=(2, 2))
    plt.specgram(signal, Fs=SAMPLE_RATE, NFFT=128, noverlap=64, cmap='inferno')
    plt.axis('off')
    plt.savefig(os.path.join(OUTPUT_IMG_DIR, f"{sample_id}.png"), bbox_inches='tight', pad_inches=0)
    plt.close()
    
    # Append to list
    row = list(signal) + [label, sample_id]
    data.append(row)
    
    if (i+1) % 100 == 0:
        print(f"Generated {i+1}/{NUM_SAMPLES}")

# Save CSV
# Column names: 0..177, label, id
cols = [str(x) for x in range(SAMPLE_RATE)] + ["label", "id"]
df = pd.DataFrame(data, columns=cols)
df.to_csv(OUTPUT_CSV, index=False)

print("Data generation complete.")
print(f"CSV saved to {OUTPUT_CSV}")
print(f"Images saved to {OUTPUT_IMG_DIR}")
