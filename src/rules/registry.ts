import { agentRules } from "./agentRules.js";
import { ciRules } from "./ciRules.js";
import { documentationRules } from "./documentationRules.js";
import { environmentRules } from "./environmentRules.js";
import { safetyRules } from "./safetyRules.js";
import { testingRules } from "./testingRules.js";
import type { Rule } from "./types.js";

export const rules: Rule[] = [
  ...documentationRules,
  ...testingRules,
  ...agentRules,
  ...environmentRules,
  ...safetyRules,
  ...ciRules,
];

export function runRules(
  context: Parameters<Rule["evaluate"]>[0],
  activeRules: Rule[] = rules,
) {
  return activeRules.flatMap((rule) => rule.evaluate(context));
}
