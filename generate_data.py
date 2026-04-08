import pandas as pd
import numpy as np
import os

def generate_synthetic_data(n_samples=10000, anomaly_ratio=0.05):
    np.random.seed(42)
    
    # Time index
    time = pd.date_range(start='2026-01-01', periods=n_samples, freq='1s')
    
    # Base signals (Normal operation)
    # Current: Steady with slight noise
    current = 12000 + np.random.normal(0, 5, n_samples)
    
    # Voltage: Near zero in superconducting state
    voltage = np.random.normal(0, 0.001, n_samples)
    
    # Temperature: Steady at 1.9K
    temperature = 1.9 + np.random.normal(0, 0.01, n_samples)
    
    # Labels
    labels = np.zeros(n_samples)
    
    # Inject Anomalies (Quenches)
    n_anomalies = int(n_samples * anomaly_ratio)
    anomaly_starts = np.random.choice(range(100, n_samples - 100), n_anomalies // 20, replace=False)
    
    for start in anomaly_starts:
        duration = np.random.randint(10, 30)
        end = start + duration
        labels[start:end] = 1
        
        # Quench physics: 
        # 1. Voltage spike
        voltage[start:end] += np.linspace(0, 0.5, duration) + np.random.normal(0, 0.05, duration)
        # 2. Temperature rise
        temperature[start:end] += np.linspace(0, 10, duration)
        # 3. Current drop
        current[start:end] -= np.linspace(0, 2000, duration)

    df = pd.DataFrame({
        'timestamp': time,
        'voltage': voltage,
        'current': current,
        'temperature': temperature,
        'anomaly': labels.astype(int)
    })
    
    return df

if __name__ == "__main__":
    df = generate_synthetic_data()
    df.to_csv('sensor_data.csv', index=False)
    print(f"Dataset generated with {len(df)} samples.")
    print(df.head())
