import { z } from "zod";

/**
 * Zod helpers shared by every service.
 *
 * `parseOrThrow` converts validation failures into an `Error` whose message
 * is safe to render in the UI ("startDate: End date must be on or after the
 * start date.") — never a raw schema dump or internal stack.
 */

/** UI-safe message for the first schema issue. */
export function validationMessage(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "The provided information isn't valid.";
  const path = issue.path.join(".");
  return path ? `${path}: ${issue.message}` : issue.message;
}

/**
 * Validates `input` against `schema`, applying defaults, and throws an
 * Error with a UI-safe message when validation fails.
 *
 * Structurally typed on `safeParse` so it works with any Zod schema.
 */
export function parseOrThrow<T>(
  schema: {
    safeParse: (data: unknown) =>
      | { success: true; data: T }
      | { success: false; error: z.ZodError };
  },
  input: unknown
): T {
  const result = schema.safeParse(input);
  if (!result.success) throw new Error(validationMessage(result.error));
  return result.data;
}

/**
 * Narrows a parsed PATCH down to the fields the caller actually sent.
 *
 * Zod v4's `.partial()` still applies `.default()` values for absent keys,
 * so a patch parsed straight from a partial schema would silently RESET every
 * defaulted field on an update — `updateTrip({ title })` would rewrite
 * `status` back to `"draft"` and `budget` back to USD/0/0, and an empty
 * patch would look non-empty. Filtering against the raw input keeps updates
 * strictly additive: only keys the caller provided (with a defined value)
 * are written, and an empty patch stays genuinely empty.
 */
export function providedFields<I extends object, P extends Record<string, unknown>>(
  input: I,
  parsed: P
): Partial<P> {
  const raw = input as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(parsed)) {
    if (key in raw && raw[key] !== undefined && value !== undefined) {
      out[key] = value;
    }
  }
  return out as Partial<P>;
}
