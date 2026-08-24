import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import os
import glob
import time

# Configuration
SAMPLE_RATE = 178  # 178 points per sample (matches original dataset)
DATASET_DIR = "d:/MINIPROJECT/midnight-eclipse/dataset"
OUTPUT_CSV = os.path.join(DATASET_DIR, "train.csv")
OUTPUT_IMG_DIR = os.path.join(DATASET_DIR, "images")
SEIZURE_DIR = os.path.join(DATASET_DIR, "seizure")
NON_SEIZURE_DIR = os.path.join(DATASET_DIR, "non_seizure")

def clear_directory(directory):
    if not os.path.exists(directory):
        os.makedirs(directory)
        return
    for f in os.listdir(directory):
        file_path = os.path.join(directory, f)
        if os.path.isfile(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                print(f"Error removing {file_path}: {e}")

def process_files():
    start_time = time.time()
    print("Clearing old images and data...")
    if os.path.exists(OUTPUT_CSV):
        os.remove(OUTPUT_CSV)
    
    # Create subdirectories
    seizure_img_dir = os.path.join(OUTPUT_IMG_DIR, "seizure")
    normal_img_dir = os.path.join(OUTPUT_IMG_DIR, "normal")
    
    clear_directory(seizure_img_dir)
    clear_directory(normal_img_dir)
    
    sample_count = 0
    
    # Pre-create figure for performance
    fig = plt.figure(figsize=(2, 2))
    ax = fig.add_subplot(111)
    plt.axis('off')
    
    def save_sample(segment, label):
        nonlocal sample_count
        sample_id = f"sample_{sample_count}"
        target_dir = seizure_img_dir if label == "seizure" else normal_img_dir
        
        ax.clear()
        ax.specgram(segment, Fs=SAMPLE_RATE, NFFT=128, noverlap=64, cmap='inferno')
        ax.axis('off')
        fig.savefig(os.path.join(target_dir, f"{sample_id}.png"), bbox_inches='tight', pad_inches=0)
        sample_count += 1

    # Process Seizure files
    seizure_files = sorted(glob.glob(os.path.join(SEIZURE_DIR, "*.csv")))
    print(f"Processing {len(seizure_files)} seizure files...")
    for f_path in seizure_files:
        try:
            df = pd.read_csv(f_path)
            signal = df['channel_1'].values
            num_segments = len(signal) // SAMPLE_RATE
            for j in range(num_segments):
                segment = signal[j*SAMPLE_RATE : (j+1)*SAMPLE_RATE]
                save_sample(segment, "seizure")
            print(f"  Processed {os.path.basename(f_path)} -> total: {sample_count}")
        except Exception as e:
            print(f"  Error processing {f_path}: {e}")

    # Process Non-Seizure files
    non_seizure_files = sorted(glob.glob(os.path.join(NON_SEIZURE_DIR, "*.csv")))
    print(f"Processing {len(non_seizure_files)} non-seizure files...")
    for f_path in non_seizure_files:
        try:
            df = pd.read_csv(f_path)
            signal = df['channel_1'].values
            num_segments = len(signal) // SAMPLE_RATE
            for j in range(num_segments):
                segment = signal[j*SAMPLE_RATE : (j+1)*SAMPLE_RATE]
                save_sample(segment, "normal")
            if sample_count % 500 < 50:
                print(f"  Sample count: {sample_count}")
        except Exception as e:
            print(f"  Error processing {f_path}: {e}")

    plt.close(fig)
    print(f"\nDataset organization complete in {time.time() - start_time:.2f} seconds.")
    print(f"Total organized samples: {sample_count}")

if __name__ == "__main__":
    process_files()
