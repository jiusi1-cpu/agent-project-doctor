import { renderHtml } from "../../src/reports/renderHtml.js";
import { createTestReport } from "./testReport.js";

describe("renderHtml", () => {
  it("renders a self-contained escaped HTML report", () => {
    const html = renderHtml(createTestReport());

    expect(html).toContain("<!doctype html>");
    expect(html).toContain("Agent Project Doctor Report");
    expect(html).toContain("Grade");
    expect(html).toContain("Destructive &lt;command&gt; detected");
    expect(html).not.toContain("Destructive <command> detected");
    expect(html).not.toContain("<script");
    expect(html).not.toContain("https://");
  });
});
