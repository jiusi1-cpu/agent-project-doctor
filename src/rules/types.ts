import type {
  Finding,
  FindingCategory,
  ProjectInventory,
  Severity,
} from "../reports/model.js";

export interface RuleContext {
  inventory: ProjectInventory;
}

export interface Rule {
  id: string;
  title: string;
  category: FindingCategory;
  severity: Severity;
  evaluate(context: RuleContext): Finding[];
}
