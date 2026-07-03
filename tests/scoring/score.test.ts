import type { Finding } from "../../src/reports/model.js";
import { scoreFindings } from "../../src/scoring/score.js";

function finding(id: string, severity: Finding["severity"]): Finding {
  return {
    id,
    title: id,
    category: "safety",
    severity,
    message: id,
    recommendation: id,
    evidence: [id],
  };
}

describe("scoreFindings", () => {
  it("scores empty findings as 100/A", () => {
    expect(scoreFindings([])).toMatchObject({
      score: 100,
      grade: "A",
      severityCounts: { info: 0, low: 0, medium: 0, high: 0 },
    });
  });

  it("caps one generic high finding at grade B", () => {
    expect(
      scoreFindings([finding("safety.destructive.language", "high")]),
    ).toMatchObject({
      score: 85,
      grade: "B",
    });
  });

  it("caps two high findings at grade C", () => {
    expect(
      scoreFindings([finding("one", "high"), finding("two", "high")]),
    ).toMatchObject({
      score: 70,
      grade: "C",
    });
  });

  it("caps script execution and secret exposure findings at grade C", () => {
    expect(
      scoreFindings([finding("safety.secret.language", "medium")]),
    ).toMatchObject({
      score: 92,
      grade: "C",
    });
  });

  it("clamps score at zero and returns top risks", () => {
    const result = scoreFindings(
      Array.from({ length: 20 }, (_, index) =>
        finding(`risk.${index}`, "high"),
      ),
    );

    expect(result.score).toBe(0);
    expect(result.topRisks).toHaveLength(5);
  });
});
