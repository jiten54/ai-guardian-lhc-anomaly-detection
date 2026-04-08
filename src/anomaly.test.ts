import { describe, it, expect } from "vitest";
import { IsolationForest } from "ml-isolation-forest";

describe("Anomaly Detection Logic", () => {
  it("should detect a clear outlier", () => {
    const model = new IsolationForest({ nEstimators: 50 });
    const trainingData = [];
    for (let i = 0; i < 100; i++) {
      trainingData.push([0.001, 12000, 1.9]);
    }
    model.train(trainingData);

    const normalPoint = [0.001, 12000, 1.9];
    const anomalyPoint = [0.5, 10000, 12.0];

    const normalScore = model.predict([normalPoint])[0];
    const anomalyScore = model.predict([anomalyPoint])[0];

    expect(anomalyScore).toBeGreaterThan(normalScore);
  });
});
