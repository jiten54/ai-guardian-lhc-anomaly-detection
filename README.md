# 🧠 AI Guardian: Intelligent Anomaly Detection for LHC Magnet Circuits

> Real-time anomaly detection & failure prediction system inspired by superconducting magnet protection challenges in particle accelerators.

---

## 🚀 Overview

**AI Guardian** is a production-grade machine learning system designed to monitor superconducting magnet circuits and detect anomalies in real time.

Inspired by real-world challenges in Large Hadron Collider (LHC) systems, this project combines:

* Time-series anomaly detection
* Deep learning models
* Real-time data streaming
* Full-stack engineering (API + Dashboard)
* Secure and scalable architecture

---

## 🎯 Problem Statement

Superconducting magnet circuits operate under extreme conditions:

* Ultra-low temperatures (~1.9 K)
* High current (kA range)
* Complex interdependent systems

Failures such as **quenching** can lead to:

* Equipment damage
* System downtime
* Safety risks

Traditional threshold-based systems are limited.

👉 This project introduces an **AI-driven predictive monitoring system** to detect anomalies before failures occur.

---

## 🧠 Key Features

### ⚡ Real-Time Monitoring

* Live streaming of voltage, current, and temperature
* Continuous anomaly scoring

### 🤖 Multi-Model AI System

* Isolation Forest (outlier detection)
* LSTM Autoencoder (temporal anomalies)
* Transformer-based model (advanced patterns)

### 🚨 Intelligent Alerts

* Real-time anomaly alerts
* Critical event detection (e.g., quench simulation)

### 📊 Interactive Dashboard

* Live charts for system behavior
* Anomaly probability visualization
* Model performance metrics

### 🔐 Secure Backend

* FastAPI-based REST APIs
* JWT authentication (planned/implemented)
* Role-based access control

---

## 🏗️ System Architecture

```
Data Generator → Feature Engineering → ML Models → FastAPI Backend → Dashboard (React/Streamlit)
```

---

## 📂 Project Structure

```
ai-guardian-lhc-anomaly-detection/
│
├── data/                     # Synthetic & processed datasets
├── notebooks/                # Experimentation & analysis
├── src/
│   ├── data/                 # Data generation & preprocessing
│   ├── models/               # ML models (IF, LSTM, Transformer)
│   ├── api/                  # FastAPI backend
│   ├── utils/                # Helper functions
│
├── dashboard/                # Frontend (React/Streamlit)
├── tests/                    # Unit tests
├── docker/                   # Docker configuration
├── requirements.txt
└── README.md
```

---

## 📊 Data Description

Synthetic dataset simulates real magnet circuit behavior:

| Feature     | Description                   |
| ----------- | ----------------------------- |
| time        | Timestamp                     |
| voltage     | Circuit voltage               |
| current     | Current (kA range)            |
| temperature | Cryogenic temperature (~1.9K) |
| anomaly     | Binary anomaly label          |

Includes:

* Spike anomalies
* Drift patterns
* Pre-failure signals

---

## 🧪 Models Used

### 1. Isolation Forest

* Detects outliers in high-dimensional space
* Fast and efficient baseline

### 2. LSTM Autoencoder

* Learns normal temporal patterns
* Detects sequence anomalies

### 3. Transformer (Advanced)

* Captures long-range dependencies
* Handles complex time-series relationships

---

## 📈 Evaluation Metrics

* **Precision** → Accuracy of anomaly predictions
* **Recall** → Ability to detect all anomalies *(critical)*
* **F1 Score** → Balance between precision & recall
* **ROC-AUC** → Model discrimination capability

---

## ⚙️ Installation

```bash
git clone https://github.com/your-username/ai-guardian-lhc-anomaly-detection.git
cd ai-guardian-lhc-anomaly-detection

pip install -r requirements.txt
```

---

## ▶️ Running the Project

### 1. Generate Data

```bash
python src/data/generate_data.py
```

### 2. Start Backend

```bash
uvicorn src.api.main:app --reload
```

### 3. Launch Dashboard

```bash
streamlit run dashboard/app.py
```

---

## 🔐 Security Features

* API authentication (JWT)
* Input validation
* Secure data handling
* Logging and monitoring

---

## 🧪 Testing

```bash
pytest tests/
```

---

## 🚀 Deployment

* Dockerized application
* Compatible with:

  * AWS
  * Render
  * Railway

<img width="1920" height="860" alt="Screenshot 2026-04-08 183635" src="https://github.com/user-attachments/assets/aee80a1c-6f0d-4da3-bc90-aac8028eb6dd" />
<img width="1908" height="866" alt="Screenshot 2026-04-08 183726" src="https://github.com/user-attachments/assets/437721f7-ac17-43e7-b907-09a2cfd181ff" />
<img width="1898" height="847" alt="Screenshot 2026-04-08 183804" src="https://github.com/user-attachments/assets/eaf08613-ed0f-47e8-aa53-72ebf72c791f" />


## 📌 Future Improvements

* Real-time Kafka streaming
* Model ensemble optimization
* Explainable AI (SHAP/LIME)
* Edge deployment for low latency

---

## 🌍 Inspiration

Inspired by real-world challenges in superconducting magnet protection systems used in advanced particle accelerators.

---

## 👨‍💻 Author

**Jiten Moni Das**
Machine Learning Engineer | AI Developer

🔗 LinkedIn: https://www.linkedin.com/in/jiten-moni-3045b7265/
🔗 GitHub: https://github.com/jiten54

---

## ⭐ If you find this project interesting, consider giving it a star!
