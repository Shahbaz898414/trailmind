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
