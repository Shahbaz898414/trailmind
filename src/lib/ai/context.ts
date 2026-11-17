/**
 * Compact saved-trip context for AI requests.
 *
 * On-device models have small context windows and cloud requests should stay
 * cheap, so context is aggressively bounded: short labels, capped field
 * lengths, and a fixed number of activity titles. The result is plain text
 * that can be interpolated into any capability prompt.
 */

export type TripContextTrip = {
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  durationDays?: number;
  status?: string;
  summary?: string;
};

export type TripContextActivity = {
  day: number;
  title: string;
  timeSlot?: string;
};

const MAX_TITLE = 80;
const MAX_DESTINATION = 80;
const MAX_SUMMARY = 240;
const MAX_ACTIVITIES = 12;
const MAX_ACTIVITY_TITLE = 60;
/** Hard cap on the whole context block. */
export const MAX_TRIP_CONTEXT_CHARS = 1200;

function clamp(value: string | undefined, max: number): string {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return "";
  return trimmed.length > max ? `${trimmed.slice(0, max - 1)}…` : trimmed;
}

/**
 * Builds a bounded plain-text summary of a saved trip plus (optionally) its
 * itinerary highlights. Returns `"No saved trip context."` when nothing usable
 * is provided, so prompts always make clear whether context exists.
 */
export function buildTripContext(
  trip: TripContextTrip | null | undefined,
  activities: TripContextActivity[] = []
): string {
  if (!trip) return "No saved trip context.";

  const lines: string[] = [];
  lines.push(`Trip: ${clamp(trip.title, MAX_TITLE)}`);
  lines.push(`Destination: ${clamp(trip.destination, MAX_DESTINATION)}`);
  lines.push(`Dates: ${trip.startDate} to ${trip.endDate}`);
  if (trip.durationDays && trip.durationDays > 0) {
    lines.push(`Duration: ${trip.durationDays} day${trip.durationDays > 1 ? "s" : ""}`);
  }
  if (trip.status) lines.push(`Status: ${trip.status}`);
  const summary = clamp(trip.summary, MAX_SUMMARY);
  if (summary) lines.push(`Summary: ${summary}`);

  if (activities.length > 0) {
    lines.push("Itinerary highlights:");
    for (const activity of activities.slice(0, MAX_ACTIVITIES)) {
      const title = clamp(activity.title, MAX_ACTIVITY_TITLE);
      const time = activity.timeSlot ? ` (${activity.timeSlot})` : "";
      lines.push(`- Day ${activity.day}: ${title}${time}`);
    }
    if (activities.length > MAX_ACTIVITIES) {
      lines.push(`- …and ${activities.length - MAX_ACTIVITIES} more activities`);
    }
  }

  const context = lines.join("\n");
  return context.length > MAX_TRIP_CONTEXT_CHARS
    ? `${context.slice(0, MAX_TRIP_CONTEXT_CHARS - 1)}…`
    : context;
}
