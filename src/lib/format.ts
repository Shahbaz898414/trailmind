/**
 * Small presentation helpers shared by the dashboard UI.
 * Kept framework-free so they can be used in Server and Client Components.
 */

const MONTH_SHORT = "short" as const;
const YEAR = "numeric" as const;

/** Parses `YYYY-MM-DD` into a *local* Date (avoids UTC day-shift bugs). */
function parseIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** `12 Mar 2026` */
export function formatDate(value: string): string {
  const date = parseIsoDate(value);
  if (!date) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: MONTH_SHORT,
    year: YEAR,
  }).format(date);
}

/**
 * `12–19 Mar 2026`, or `28 Mar – 6 Apr 2026` when the range crosses months.
 */
export function formatDateRange(start: string, end: string): string {
  const startDate = parseIsoDate(start);
  const endDate = parseIsoDate(end);
  if (!startDate || !endDate) return `${start} – ${end}`;

  const day = { day: "numeric" } as const;
  const month = { month: MONTH_SHORT } as const;
  const full = { ...month, ...day, year: YEAR } as const;

  const sameYear = startDate.getFullYear() === endDate.getFullYear();
  const sameMonth =
    sameYear && startDate.getMonth() === endDate.getMonth();

  const fmt = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-GB", options);

  if (sameMonth) {
    return `${fmt(day).format(startDate)}–${fmt(full).format(endDate)}`;
  }

  if (sameYear) {
    return `${fmt({ ...day, ...month }).format(startDate)} – ${fmt(full).format(endDate)}`;
  }

  return `${fmt(full).format(startDate)} – ${fmt(full).format(endDate)}`;
}

/** `€1,450` / `¥320,000`. Falls back to the raw number for bad currency codes. */
export function formatCurrency(
  amount: number,
  currency: string,
  maximumFractionDigits = 0
): string {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      maximumFractionDigits,
    }).format(amount);
  } catch {
    return `${amount.toFixed(maximumFractionDigits)} ${currency}`;
  }
}

/** `48.2 MB` */
export function formatMegabytes(value: number): string {
  return `${value.toFixed(1)} MB`;
}

/** Whole number with a locale-aware separator: `1,250`. */
export function formatCount(value: number): string {
  return new Intl.NumberFormat("en-GB").format(value);
}
