import express from "express";
import { createServer as createViteServer } from "vite";
import { Server } from "socket.io";
import http from "http";
import path from "path";
import { IsolationForest } from "ml-isolation-forest";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import fs from "fs";

const JWT_SECRET = process.env.JWT_SECRET || "cern-secret-key";
const LOG_FILE = "system_logs.txt";

// Mock User DB
const users = [
  { id: "1", email: "admin@cern.ch", password: bcrypt.hashSync("admin123", 10), role: "ADMIN" }
];

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server);
  const PORT = 3000;

  app.use(express.json());

  // Logging utility
  const logEvent = (message: string) => {
    const log = `[${new Date().toISOString()}] ${message}\n`;
    fs.appendFileSync(LOG_FILE, log);
  };

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  // --- Phase 2 & 3: Data Engineering & Model Building ---
  
  const model = new IsolationForest({ nEstimators: 100 });
  const trainingData: number[][] = [];
  for (let i = 0; i < 500; i++) {
    const voltage = Math.random() * 0.002 - 0.001;
    const current = 12000 + (Math.random() * 10 - 5);
    const temperature = 1.9 + (Math.random() * 0.02 - 0.01);
    trainingData.push([voltage, current, temperature]);
  }
  model.train(trainingData);
  logEvent("Model trained and initialized.");

  // --- Phase 4: Real-time Pipeline ---
  
  let isAnomalous = false;
  let anomalyCooldown = 0;

  const generateData = () => {
    let voltage = Math.random() * 0.002 - 0.001;
    let current = 12000 + (Math.random() * 10 - 5);
    let temperature = 1.9 + (Math.random() * 0.02 - 0.01);

    if (Math.random() < 0.02 && anomalyCooldown === 0) {
      isAnomalous = true;
      anomalyCooldown = 20;
    }

    if (isAnomalous && anomalyCooldown > 0) {
      const progress = (20 - anomalyCooldown) / 20;
      voltage += progress * 0.5 + Math.random() * 0.05;
      temperature += progress * 10;
      current -= progress * 2000;
      anomalyCooldown--;
      if (anomalyCooldown === 0) isAnomalous = false;
    }

    const sensorData = [voltage, current, temperature];
    const score = model.predict([sensorData])[0];
    const isAnomalyDetected = score > 0.55 || isAnomalous;

    const dataPoint = {
      timestamp: new Date().toISOString(),
      voltage,
      current,
      temperature,
      score,
      isAnomaly: isAnomalyDetected
    };

    io.emit("sensor_data", dataPoint);
    if (isAnomalyDetected) {
      const alert = {
        type: "CRITICAL",
        message: "Quench detected in Magnet Circuit B12",
        timestamp: dataPoint.timestamp,
        data: dataPoint
      };
      io.emit("alert", alert);
      logEvent(`ALERT: ${alert.message} | Score: ${score}`);
    }
  };

  setInterval(generateData, 1000);

  // --- Phase 5 & 7: APIs & Security ---

  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (user && bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
      logEvent(`User logged in: ${email}`);
      res.json({ token, user: { email: user.email, role: user.role } });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", system: "CERN AI Guardian" });
  });

  app.post("/api/predict", authenticate, (req, res) => {
    const { voltage, current, temperature } = req.body;
    const score = model.predict([[voltage, current, temperature]])[0];
    res.json({ score, isAnomaly: score > 0.55 });
  });

  app.get("/api/logs", authenticate, (req, res) => {
    if ((req as any).user.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });
    const logs = fs.readFileSync(LOG_FILE, "utf-8").split("\n").filter(Boolean).slice(-50);
    res.json(logs);
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Guardian Server running on http://localhost:${PORT}`);
  });
}

startServer();
