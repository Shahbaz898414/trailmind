import { z } from "zod";

/**
 * AI capability catalogue — the 9 supported travel use cases.
 *
 * ---------------------------------------------------------------------------
 * Each capability declares:
 *   - deviceCapable: whether the request is designed to work with the
 *     on-device model's REAL limitations (small context window, no tool
 *     calling, no live APIs, no document processing). Cloud-only capabilities
 *     run ONLY_IN_CLOUD — never faked locally.
 *   - schema: the Zod contract for structured replies (null = free text).
 *   - prompt builder + system instruction: deterministic, no hidden state.
 * ---------------------------------------------------------------------------
 *
 * Structured prompts additionally demand a bare JSON object; extraction and
 * validation live in `structured.ts`, and honest failure handling in
 * `generate.ts`.
 */

export const CAPABILITY_IDS = [
  "trip-planning",
  "day-itinerary",
  "recommendations",
  "travel-qa",
  "packing-list",
  "guide-summary",
  "culture-tips",
  "trip-context-qa",
  "phrase-assist",
] as const;

export type CapabilityId = (typeof CAPABILITY_IDS)[number];

/* -------------------------------------------------------------------------- */
/* Response schemas                                                            */
/* -------------------------------------------------------------------------- */

/** Shared category enum — mirrors the itinerary service so output can be saved directly. */
const activityCategorySchema = z.enum([
  "Culture",
  "Nature",
  "Dining",
  "Transit",
  "Lodging",
  "Heritage",
]);

export const tripPlanSchema = z.object({
  overview: z.string().min(1),
  days: z.array(
    z.object({
      day: z.number().int().min(1),
      focus: z.string().min(1),
      highlights: z.array(z.string().min(1)).min(1),
    })
  ).min(1),
  practicalTips: z.array(z.string().min(1)),
});
export type TripPlan = z.output<typeof tripPlanSchema>;

export const dayItinerarySchema = z.object({
  theme: z.string().min(1),
  activities: z.array(
    z.object({
      timeSlot: z.string(),
      title: z.string().min(1),
      category: activityCategorySchema,
      location: z.string(),
      description: z.string(),
      duration: z.string(),
    })
  ).min(1),
});
export type DayItinerary = z.output<typeof dayItinerarySchema>;

export const recommendationsSchema = z.object({
  recommendations: z.array(
    z.object({
      name: z.string().min(1),
      location: z.string(),
      reason: z.string().min(1),
      bestFor: z.string(),
    })
  ).min(1),
});
export type Recommendations = z.output<typeof recommendationsSchema>;

export const packingListSchema = z.object({
  categories: z.array(
    z.object({
      category: z.string().min(1),
      items: z.array(
        z.object({
          item: z.string().min(1),
          quantity: z.string().optional(),
          note: z.string().optional(),
        })
      ).min(1),
    })
  ).min(1),
});
export type PackingList = z.output<typeof packingListSchema>;

export const cultureTipsSchema = z.object({
  tips: z.array(
    z.object({
      title: z.string().min(1),
      detail: z.string().min(1),
    })
  ).min(1),
});
export type CultureTips = z.output<typeof cultureTipsSchema>;

export const phraseAssistSchema = z.object({
  phrases: z.array(
    z.object({
      phrase: z.string().min(1),
      pronunciation: z.string(),
      english: z.string().min(1),
      usageNote: z.string(),
    })
  ).min(1),
});
export type PhraseAssist = z.output<typeof phraseAssistSchema>;

/* -------------------------------------------------------------------------- */
/* Capability inputs                                                           */
/* -------------------------------------------------------------------------- */

export type TripPlanningInput = {
  destination: string;
  startDate?: string;
  endDate?: string;
  travelers?: number;
  interests?: string;
  pace?: string;
  /** Bounded trip context (see `context.ts`), when the user has saved trips. */
  tripContext?: string;
};

export type DayItineraryInput = {
  dayNumber: number;
  date?: string;
  destination: string;
  themesOrNotes?: string;
  tripContext?: string;
};

export type RecommendationsInput = {
  destination: string;
  category?: string;
  tripContext?: string;
};

export type TravelQaInput = {
  question: string;
  tripContext?: string;
};

export type PackingListInput = {
  destination: string;
  durationDays?: number;
  activities?: string;
  season?: string;
  tripContext?: string;
};

export type GuideSummaryInput = {
  destination: string;
  /** The guide/document text to summarise (cloud-only — see deviceCapable). */
  sourceText: string;
};

export type CultureTipsInput = {
  destination: string;
  tripContext?: string;
};

export type TripContextQaInput = {
  question: string;
  /** Required — this capability exists specifically to answer FROM saved data. */
  tripContext: string;
};

export type PhraseAssistInput = {
  intent: string;
  language?: string;
  tripContext?: string;
};

/* -------------------------------------------------------------------------- */
/* Chat reply schema (the assistant page's structured output)                  */
/* -------------------------------------------------------------------------- */

export const chatReplySchema = z.object({
  reply: z.string().min(1),
  flashcard: z
    .object({
      japanese: z.string().min(1),
      romaji: z.string(),
      english: z.string().min(1),
    })
    .nullish(),
  contingency: z.string().nullish(),
});
export type ChatReply = z.output<typeof chatReplySchema>;

/* -------------------------------------------------------------------------- */
/* Definitions                                                                 */
/* -------------------------------------------------------------------------- */

const JSON_CONTRACT =
  "Respond with ONLY a single JSON object matching the requested shape. " +
  "No markdown fences, no commentary before or after.";

const ASSISTANT_PERSONA =
  "You are TrailMind, a practical travel assistant for independent travelers. " +
  "Be concise, accurate and specific. When uncertain, say so — never invent " +
  "facts, prices, opening hours or translations. If the user asks for a " +
  "phrase in a foreign language, provide the phrase with a romanized " +
  "pronunciation. Structure replies as JSON when a shape is requested.";

export type CapabilityDefinition<In, Out> = {
  id: CapabilityId;
  title: string;
  /** Why this is (or isn't) feasible on-device — shown in docs/AI_ARCHITECTURE.md. */
  rationale: string;
  deviceCapable: boolean;
  /** true → response must satisfy `schema`. */
  structured: boolean;
  schema: z.ZodType<Out> | null;
  systemInstruction: string;
  buildPrompt: (input: In) => string;
};

const structuredDef = <In, Out>(
  base: Omit<CapabilityDefinition<In, Out>, "structured" | "schema">,
  schema: z.ZodType<Out>
): CapabilityDefinition<In, Out> => ({ ...base, structured: true, schema });

/* -------------------------------------------------------------------------- */
/* The 9 capabilities                                                          */
/* -------------------------------------------------------------------------- */

export const capabilities = {
  "trip-planning": structuredDef<TripPlanningInput, TripPlan>(
    {
      id: "trip-planning",
      title: "Trip planning",
      rationale:
        "Planning is prompt-driven reasoning over user-provided details — feasible within the on-device context window.",
      deviceCapable: true,
      systemInstruction: `${ASSISTANT_PERSONA} ${JSON_CONTRACT} Shape: {"overview": string, "days": [{"day": number, "focus": string, "highlights": string[]}], "practicalTips": string[]}. Keep plans realistic and grounded in the given dates.`,
      buildPrompt: (input) =>
        [
          `Plan a trip to ${input.destination}.`,
          input.startDate ? `Start date: ${input.startDate}.` : "",
          input.endDate ? `End date: ${input.endDate}.` : "",
          input.travelers ? `Travelers: ${input.travelers}.` : "",
          input.interests ? `Interests: ${input.interests}.` : "",
          input.pace ? `Preferred pace: ${input.pace}.` : "",
          input.tripContext ? `Saved trip context:\n${input.tripContext}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
    },
    tripPlanSchema
  ),

  "day-itinerary": structuredDef<DayItineraryInput, DayItinerary>(
    {
      id: "day-itinerary",
      title: "Day-wise itinerary generation",
      rationale:
        "Generates one day's activities in a bounded JSON shape — small output, on-device friendly.",
      deviceCapable: true,
      systemInstruction: `${ASSISTANT_PERSONA} ${JSON_CONTRACT} Shape: {"theme": string, "activities": [{"timeSlot": string, "title": string, "category": "Culture"|"Nature"|"Dining"|"Transit"|"Lodging"|"Heritage", "location": string, "description": string, "duration": string}]}. Time slots use a human format like "09:00 – 10:30".`,
      buildPrompt: (input) =>
        [
          `Create the itinerary for day ${input.dayNumber} of a trip to ${input.destination}.`,
          input.date ? `Date: ${input.date}.` : "",
          input.themesOrNotes ? `Requirements/notes: ${input.themesOrNotes}.` : "",
          input.tripContext ? `Saved trip context:\n${input.tripContext}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
    },
    dayItinerarySchema
  ),

  recommendations: structuredDef<RecommendationsInput, Recommendations>(
    {
      id: "recommendations",
      title: "Destination recommendations",
      rationale:
        "Reasoning over the destination and user interests — no live data required, so on-device works.",
      deviceCapable: true,
      systemInstruction: `${ASSISTANT_PERSONA} ${JSON_CONTRACT} Shape: {"recommendations": [{"name": string, "location": string, "reason": string, "bestFor": string}]}. Give 4-6 concrete, real places — never invent attractions that don't exist.`,
      buildPrompt: (input) =>
        [
          `Recommend places and experiences in ${input.destination}.`,
          input.category ? `Focus: ${input.category}.` : "",
          input.tripContext ? `Saved trip context:\n${input.tripContext}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
    },
    recommendationsSchema
  ),

  "travel-qa": {
    id: "travel-qa",
    title: "Travel questions",
    rationale:
      "Free-text Q&A over the user's question (optionally with trip context) — the core chat capability, on-device capable.",
    deviceCapable: true,
    structured: false,
    schema: null,
    systemInstruction: ASSISTANT_PERSONA,
    buildPrompt: (input: TravelQaInput) =>
      [
        input.tripContext ? `Saved trip context:\n${input.tripContext}` : "",
        `Question: ${input.question}`,
      ]
        .filter(Boolean)
        .join("\n\n"),
  } satisfies CapabilityDefinition<TravelQaInput, string>,

  "packing-list": structuredDef<PackingListInput, PackingList>(
    {
      id: "packing-list",
      title: "Packing list generation",
      rationale:
        "Deterministic structured output bounded by trip parameters — fine on-device.",
      deviceCapable: true,
      systemInstruction: `${ASSISTANT_PERSONA} ${JSON_CONTRACT} Shape: {"categories": [{"category": string, "items": [{"item": string, "quantity": string, "note": string}]}]}.`,
      buildPrompt: (input) =>
        [
          `Build a packing list for a trip to ${input.destination}.`,
          input.durationDays ? `Duration: ${input.durationDays} days.` : "",
          input.activities ? `Planned activities: ${input.activities}.` : "",
          input.season ? `Season: ${input.season}.` : "",
          input.tripContext ? `Saved trip context:\n${input.tripContext}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
    },
    packingListSchema
  ),

  "guide-summary": {
    id: "guide-summary",
    title: "Destination guide summarization",
    rationale:
      "CLOUD-ONLY: summarizing an attached guide/document is document-sized input that exceeds what the on-device model's small context window can hold reliably. No local document processing is assumed.",
    deviceCapable: false,
    structured: false,
    schema: null,
    systemInstruction: `${ASSISTANT_PERSONA} Summarize the provided source text faithfully; do not add facts that are not in it.`,
    buildPrompt: (input: GuideSummaryInput) =>
      `Summarize this travel guide content for ${input.destination} (key facts, logistics, cautions):\n\n---\n${input.sourceText}`,
  } satisfies CapabilityDefinition<GuideSummaryInput, string>,

  "culture-tips": structuredDef<CultureTipsInput, CultureTips>(
    {
      id: "culture-tips",
      title: "Local culture & travel tips",
      rationale:
        "Static-knowledge reasoning delivered as a bounded JSON list — on-device capable.",
      deviceCapable: true,
      systemInstruction: `${ASSISTANT_PERSONA} ${JSON_CONTRACT} Shape: {"tips": [{"title": string, "detail": string}]}. Give 5-8 concrete, respectful, practical tips.`,
      buildPrompt: (input) =>
        [
          `Give local culture and travel tips for ${input.destination}.`,
          input.tripContext ? `Saved trip context:\n${input.tripContext}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
    },
    cultureTipsSchema
  ),

  "trip-context-qa": {
    id: "trip-context-qa",
    title: "Questions about saved trips",
    rationale:
      "Answers strictly from the bounded trip context (≤1200 chars by construction) — deliberately small so it fits on-device.",
    deviceCapable: true,
    structured: false,
    schema: null,
    systemInstruction: `${ASSISTANT_PERSONA} Answer ONLY from the saved trip context provided. If the answer is not in the context, say so plainly — do not guess.`,
    buildPrompt: (input: TripContextQaInput) =>
      `Saved trip context:\n${input.tripContext}\n\nQuestion: ${input.question}`,
  } satisfies CapabilityDefinition<TripContextQaInput, string>,

  "phrase-assist": structuredDef<PhraseAssistInput, PhraseAssist>(
    {
      id: "phrase-assist",
      title: "Travel phrase assistance",
      rationale:
        "Short structured phrase output — small enough for the on-device model.",
      deviceCapable: true,
      systemInstruction: `${ASSISTANT_PERSONA} ${JSON_CONTRACT} Shape: {"phrases": [{"phrase": string, "pronunciation": string, "english": string, "usageNote": string}]}. "phrase" is in the target language (romanized pronunciation in "pronunciation"). Provide natural, commonly understood phrases.`,
      buildPrompt: (input) =>
        [
          `Provide travel phrases for: ${input.intent}.`,
          input.language ? `Target language: ${input.language}.` : "",
          input.tripContext ? `Saved trip context:\n${input.tripContext}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
    },
    phraseAssistSchema
  ),
} as const satisfies Record<CapabilityId, unknown>;

/** Input type for each capability. */
export type CapabilityInput<K extends CapabilityId> = Parameters<
  (typeof capabilities)[K]["buildPrompt"]
>[0];

/** Output type for each capability (`string` for free-text capabilities). */
export type CapabilityOutput<K extends CapabilityId> =
  (typeof capabilities)[K]["schema"] extends z.ZodType<infer Out>
    ? Out
    : string;

export function getCapability<K extends CapabilityId>(
  id: K
): (typeof capabilities)[K] {
  return capabilities[id];
}
