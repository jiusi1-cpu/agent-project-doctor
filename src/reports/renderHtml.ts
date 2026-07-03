import { htmlTemplate } from "./htmlTemplate.js";
import type { ScanReport } from "./model.js";

export function renderHtml(report: ScanReport): string {
  return htmlTemplate(report);
}
