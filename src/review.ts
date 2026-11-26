import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

export const MIN_CHARS = 1;
export const MAX_CHARS = 200;

export const REVIEW =
  "2/5 stars: I bark the mailman off my porch every day and he always leaves, so I am undefeated, yet he returns smelling like other dogs. Zero biscuits. Traitor.";

export const CANDIDATE_NOTES = [
  "v1: liver-scent grievance plus empty-pockets denial; turn was 'called it a tip', too soft.",
  "v2: junk mail reframed as the dog's tax, final turn on dessert.",
  "v3: trimmed 'still' and 'the sharp'; kept 'Tuesday' as the specific beat and 'levy a tax' as the setup for 'dessert'.",
  "v4: star-rating frame, porch-barking win loop, other-dog ankle smell, biscuit grievance; final turn on Traitor.",
];

export function emitEntry(review: string = REVIEW): string {
  return `${review}\n`;
}

export function countStats(line: string): { chars: number; bytes: number } {
  return { chars: [...line].length, bytes: Buffer.byteLength(line, "utf8") };
}

export function validateReview(line: string): string[] {
  const errors: string[] = [];
  const { chars } = countStats(line);
  if (line.trim().length === 0) errors.push("review is empty or whitespace-only");
  if (chars < MIN_CHARS || chars > MAX_CHARS) {
    errors.push(`review is ${chars} characters, must be ${MIN_CHARS}-${MAX_CHARS}`);
  }
  if (/[\r\n]/.test(line)) errors.push("review contains a newline");
  if (!/mailman/i.test(line)) errors.push("review does not name the mailman");
  if (!/\b(treat|envelope|pocket|bag|gate|porch|scent|bark)/i.test(line)) {
    errors.push("review lacks a dog-world detail (treat, envelope, pocket, bag, gate, porch, scent, bark)");
  }
  return errors;
}

export function writeEntry(outputPath: string, entry: string): void {
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, entry, "utf8");
}
