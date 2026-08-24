import numpy as np
import pandas as pd

# 4096 points, 23.6 sec (~173.5 Hz)
t = np.linspace(0, 23.6, 4096)

# smooth alpha-like signal (10 Hz) + small noise
signal = 0.5 * np.sin(2 * np.pi * 10 * t) + 0.1 * np.random.randn(4096)

df = pd.DataFrame({"channel_1": signal})
df.to_csv("real_time_eeg.csv", index=False)

print("✅ real_time_eeg.csv created")