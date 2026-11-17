import type { ZodType } from "zod";

/**
 * Structured-output handling: extract JSON from a model reply and
 * Zod-validate it, with typed failures for every honest outcome.
 *
 * Models frequently wrap JSON in markdown fences or add a sentence of
 * commentary — extraction tolerates all of that, but NEVER invents missing
 * fields: if the payload doesn't satisfy the schema, the caller gets
 * `AiInvalidResponseError("schema-mismatch")`.
 */

export type ExtractOutcome =
  | { ok: true; value: unknown }
  | { ok: false; reason: "no-json" | "parse-failed"; detail: string };

const FENCE_RE = /```(?:json)?\s*([\s\S]*?)```/i;

/** Attempts to locate a balanced JSON object/array inside `text`. */
function findBalancedJson(text: string): string | null {
  const starts: Array<[number, string]> = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "{" || ch === "[") starts.push([i, ch]);
    else if (ch === "}" || ch === "]") {
      const start = starts.pop();
      if (!start) continue;
      const expected = start[1] === "{" ? "}" : "]";
      if (ch !== expected) return null;
      if (starts.length === 0) return text.slice(start[0], i + 1);
    }
  }
  // Unbalanced: if we have one top-level opener, try the greedy tail slice.
  if (starts.length === 1) {
    const [index, opener] = starts[0];
    const closer = opener === "{" ? "}" : "]";
    const last = text.lastIndexOf(closer);
    if (last > index) return text.slice(index, last + 1);
  }
  return null;
}

/**
 * Extracts the first parseable JSON value from a model reply.
 *
 * Order of attempts (all real-world shapes observed from LLMs):
 *   1. fenced ```json blocks
 *   2. balanced top-level object/array in the raw text
 *   3. the whole trimmed text as-is
 */
export function extractJson(text: string): ExtractOutcome {
  const trimmed = text.trim();
  if (!trimmed) {
    return { ok: false, reason: "no-json", detail: "empty response" };
  }

  const candidates: string[] = [];
  const fenced = FENCE_RE.exec(text);
  if (fenced?.[1]) candidates.push(fenced[1].trim());

  const balanced = findBalancedJson(text);
  if (balanced) candidates.push(balanced);

  candidates.push(trimmed);

  const seen = new Set<string>();
  let lastDetail = "no JSON found";
  for (const candidate of candidates) {
    if (!candidate || seen.has(candidate)) continue;
    seen.add(candidate);
    try {
      return { ok: true, value: JSON.parse(candidate) };
    } catch (error) {
      lastDetail = error instanceof Error ? error.message : String(error);
    }
  }
  return { ok: false, reason: "parse-failed", detail: lastDetail };
}

export type StructuredOutcome<T> =
  | { ok: true; data: T; raw: unknown }
  | { ok: false; reason: "no-json" | "parse-failed" | "schema-mismatch"; detail: string };

/**
 * Extracts + validates in one step. The schema is the single source of truth
 * for what the app accepts — extra JSON fields are stripped by Zod, missing
 * fields are a `schema-mismatch`.
 */
export function parseStructured<T>(
  schema: ZodType<T>,
  text: string
): StructuredOutcome<T> {
  const extracted = extractJson(text);
  if (!extracted.ok) {
    return { ok: false, reason: extracted.reason, detail: extracted.detail };
  }
  const parsed = schema.safeParse(extracted.value);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const path = issue?.path.join(".") || "(root)";
    return {
      ok: false,
      reason: "schema-mismatch",
      detail: `${path}: ${issue?.message ?? "does not match the expected shape"}`,
    };
  }
  return { ok: true, data: parsed.data, raw: extracted.value };
}
