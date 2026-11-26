import { REVIEW, countStats, emitEntry, validateReview, writeEntry } from "./src/review.ts";

const KNOWN_FLAGS = new Set(["--print", "--stats", "--check-only"]);
const flags = new Set(process.argv.slice(2));

const unknown = [...flags].filter((flag) => !KNOWN_FLAGS.has(flag));
if (unknown.length > 0) {
  process.stderr.write(`unknown flag(s): ${unknown.join(", ")}\n`);
  process.exit(2);
}

const errors = validateReview(REVIEW);
if (errors.length > 0) {
  process.stderr.write(`invalid review:\n- ${errors.join("\n- ")}\n`);
  process.exit(1);
}

const entry = emitEntry(REVIEW);
const { chars, bytes } = countStats(entry.slice(0, -1));
if (!entry.endsWith("\n") || entry.indexOf("\n") !== entry.length - 1) {
  process.stderr.write("entry must be exactly one line ending in a single newline\n");
  process.exit(1);
}

if (flags.has("--stats")) {
  process.stderr.write(`chars=${chars} bytes=${bytes}\n`);
}

if (flags.has("--print")) {
  process.stdout.write(entry);
}

if (flags.has("--check-only")) {
  process.stderr.write("check-only: review valid, nothing written\n");
} else {
  writeEntry(process.env.ENTRY_OUTPUT_PATH || "/output/entry.txt", entry);
}
