import numpy as np
from scipy.signal import butter, filtfilt

def bandpass_filter(signal, lowcut=0.5, highcut=70.0, fs=173.61, order=4):
    nyq = 0.5 * fs
    low = lowcut / nyq
    high = highcut / nyq
    b, a = butter(order, [low, high], btype='band')
    return filtfilt(b, a, signal)

def compute_band_powers(signal, fs=173.61):
    from scipy.signal import welch
    # nperseg should be less than or equal to signal length
    n = len(signal)
    nperseg = min(n, int(fs * 2)) if n > 0 else 0
    
    if nperseg < 1:
        return {'delta': 20, 'theta': 20, 'alpha': 20, 'beta': 20, 'gamma': 20}
        
    freqs, psd = welch(signal, fs, nperseg=nperseg)
    bands = {
        'delta': (0.5, 4),
        'theta': (4, 8),
        'alpha': (8, 13),
        'beta': (13, 30),
        'gamma': (30, 80)
    }
    band_powers = {}
    total_power = 1e-10
    
    for band, (low, high) in bands.items():
        idx = np.logical_and(freqs >= low, freqs < high)
        if np.any(idx):
             # Handle numpy 2.0 compatibility (trapz -> trapezoid)
             if hasattr(np, 'trapezoid'):
                 power = float(np.trapezoid(psd[idx], freqs[idx]))
             else:
                 power = float(np.trapz(psd[idx], freqs[idx]))
             band_powers[band] = power
             total_power += power
        else:
             band_powers[band] = 0.0
             
    # Normalize to percentages for the UI
    for band in band_powers:
        band_powers[band] = (band_powers[band] / total_power) * 100
        
    return band_powers
