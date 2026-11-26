import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { REVIEW, countStats, emitEntry, validateReview, writeEntry } from "../src/review.ts";

const tempDir = mkdtempSync(join(tmpdir(), "dog-review-verify-"));
const tempFile = join(tempDir, "entry.txt");

try {
  const entry = emitEntry();
  assert.equal(entry, `${REVIEW}\n`, "entry is the review plus one newline");
  assert.equal(entry.indexOf("\n"), entry.length - 1, "exactly one newline, at the end");
  assert.ok(entry.length > 1, "entry is not empty");

  const first = Buffer.from(emitEntry(), "utf8");
  const second = Buffer.from(emitEntry(), "utf8");
  assert.ok(first.equals(second), "emitEntry is deterministic byte-for-byte");

  assert.deepEqual(validateReview(REVIEW), [], "shipped review is valid");
  assert.ok(validateReview("").length > 0, "empty rejected");
  assert.ok(validateReview("   ").length > 0, "whitespace-only rejected");
  assert.ok(validateReview("line one\nline two").length > 0, "newline rejected");
  assert.ok(validateReview("x".repeat(201)).length > 0, "201 characters rejected");
  assert.ok(validateReview("A mailman with nothing to report.").length > 0, "no dog-world detail rejected");

  assert.deepEqual(countStats("abc"), { chars: 3, bytes: 3 }, "ASCII counts");
  assert.deepEqual(countStats("é"), { chars: 1, bytes: 2 }, "two-byte counts");
  assert.deepEqual(countStats("🐶"), { chars: 1, bytes: 4 }, "emoji counts as one char, four bytes");
  const shipped = countStats(REVIEW);
  assert.ok(shipped.chars >= 1 && shipped.chars <= 200, "shipped review is 1-200 characters");
  assert.ok(shipped.bytes <= 800, "shipped review fits in bytes");

  writeEntry(tempFile, entry);
  assert.equal(readFileSync(tempFile, "utf8"), entry, "temp file holds the emitted entry");
  assert.notEqual(tempFile, "/output/entry.txt", "never touches /output/entry.txt");
  assert.ok(existsSync(tempFile), "temp file exists");

  console.log(`verify: all checks passed (${shipped.chars} chars, ${shipped.bytes} bytes, deterministic)`);
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}
