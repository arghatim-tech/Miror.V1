import type { Language } from "@/lib/i18n";

export type Occasion =
  | "date"
  | "party"
  | "work"
  | "wedding"
  | "casual"
  | "custom";
export type Mode = "look" | "buy";
export type WardrobeCategory =
  | "tops"
  | "pants"
  | "shoes"
  | "jackets"
  | "accessories"
  | "other";

export type WardrobeItemInput = {
  id: string;
  image: string;
  label: string;
  category: WardrobeCategory;
};

export type AnalysisResult = {
  assessment: string;
  rationale: string;
  confidence: number;
  outfit: number;
  grooming: number;
  color: number;
  occasion: number;
  occasionLabel: string;
  strongPoints: string[];
  areasToRefine: string[];
  recommendedImprovements: string[];
  winningOutfitIndex: number;
  winningOutfitLabel: string;
  winningReason: string;
  comparisonNotes: string[];
  wardrobeSuggestions: string[];
  followUpRequired: boolean;
  followUpQuestion: string;
};

export type AnalyzeRequestBody = {
  language: Language;
  mode: Mode;
  occasion: Occasion;
  customOccasion: string;
  groupMode: boolean;
  targetPersonNote: string;
  followUpAnswer: string;
  selfie: string | null;
  outfitImages: string[];
  itemToBuy: string | null;
  wardrobeItems: WardrobeItemInput[];
};

export const ANALYSIS_RESPONSE_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    assessment: {
      type: "string",
      description:
        "A concise overall assessment written in modern, premium, professional language.",
    },
    rationale: {
      type: "string",
      description:
        "A brief explanation that is honest, image-aware, and specific. Acknowledge genuinely strong styling clearly when deserved.",
    },
    confidence: {
      type: "integer",
      minimum: 0,
      maximum: 100,
      description:
        "For look mode: confidence / presentation. For buy mode: visual appeal / purchase confidence.",
    },
    outfit: {
      type: "integer",
      minimum: 0,
      maximum: 100,
      description:
        "For look mode: outfit strength. For buy mode: overall purchase value / how worth buying it is.",
    },
    grooming: {
      type: "integer",
      minimum: 0,
      maximum: 100,
      description:
        "For look mode: grooming quality. For buy mode: use 0 unless grooming is truly relevant.",
    },
    color: {
      type: "integer",
      minimum: 0,
      maximum: 100,
      description: "Color harmony and overall visual wearability.",
    },
    occasion: {
      type: "integer",
      minimum: 0,
      maximum: 100,
      description:
        "For look mode: occasion fit. For buy mode: versatility and wardrobe usefulness.",
    },
    occasionLabel: {
      type: "string",
      description:
        "The effective occasion label used in the analysis, including a custom occasion when supplied.",
    },
    strongPoints: {
      type: "array",
      minItems: 2,
      maxItems: 4,
      items: { type: "string" },
      description:
        "Specific strengths. If the styling is genuinely strong, say that clearly instead of inventing flaws.",
    },
    areasToRefine: {
      type: "array",
      minItems: 0,
      maxItems: 3,
      items: { type: "string" },
      description:
        "Specific refinement points only when improvement is genuinely needed. Leave empty rather than forcing criticism.",
    },
    recommendedImprovements: {
      type: "array",
      minItems: 1,
      maxItems: 4,
      items: { type: "string" },
      description:
        "Practical next steps. If the look is already strong, focus on maintaining or subtly sharpening it.",
    },
    winningOutfitIndex: {
      type: "integer",
      minimum: 0,
      maximum: 3,
      description:
        "Use the 1-based winning outfit number when comparing outfit options. Use 0 when no comparison winner applies.",
    },
    winningOutfitLabel: {
      type: "string",
      description:
        "Use a human-friendly label such as 'Outfit 2' when comparison is active. Otherwise use an empty string.",
    },
    winningReason: {
      type: "string",
      description:
        "A concise explanation of why the winning outfit wins. Empty string when there is no comparison winner.",
    },
    comparisonNotes: {
      type: "array",
      minItems: 0,
      maxItems: 4,
      items: { type: "string" },
      description:
        "Specific reasons the other outfits lose. Avoid generic filler. Empty when no comparison is needed.",
    },
    wardrobeSuggestions: {
      type: "array",
      minItems: 0,
      maxItems: 4,
      items: { type: "string" },
      description:
        "Suggested wardrobe combinations or pairing ideas based on uploaded wardrobe items and occasion.",
    },
    followUpRequired: {
      type: "boolean",
      description:
        "Set to true only when one small missing detail materially blocks a confident answer.",
    },
    followUpQuestion: {
      type: "string",
      description:
        "A single controlled follow-up question. Empty when no clarification is needed.",
    },
  },
  required: [
    "assessment",
    "rationale",
    "confidence",
    "outfit",
    "grooming",
    "color",
    "occasion",
    "occasionLabel",
    "strongPoints",
    "areasToRefine",
    "recommendedImprovements",
    "winningOutfitIndex",
    "winningOutfitLabel",
    "winningReason",
    "comparisonNotes",
    "wardrobeSuggestions",
    "followUpRequired",
    "followUpQuestion",
  ],
} as const;

const DEFAULT_STRONG_POINTS: Record<Mode, string[]> = {
  look: [
    "The image provides enough visual information for a grounded assessment.",
    "There is a clear styling direction rather than visual noise.",
    "The presentation has at least one credible strength to build on.",
  ],
  buy: [
    "The item is visible clearly enough to judge shape, color, and overall appeal.",
    "The piece can be judged against real wardrobe use instead of product-page hype.",
    "There is at least one credible way this item could fit into a wardrobe.",
  ],
};

const DEFAULT_AREAS_TO_REFINE: Record<Mode, string[]> = {
  look: [
    "No major weakness was visible enough to justify forcing a negative point here.",
  ],
  buy: [
    "No major weakness was obvious enough to justify forcing a negative point here.",
  ],
};

const DEFAULT_RECOMMENDATIONS: Record<Mode, string[]> = {
  look: [
    "Keep the strongest elements in place and refine only the details that create a measurable improvement.",
    "Use cleaner lighting and framing when you want a higher-confidence read from the analysis.",
    "Treat the winning outfit as the baseline and only deviate when there is a clear gain.",
  ],
  buy: [
    "Buy it only if it fills a real wardrobe gap rather than duplicating what you already own.",
    "Check fit, fabric, and return options before trusting the product image alone.",
    "Prioritize items you can style into at least three strong outfits immediately.",
  ],
};

function normalizeText(value: unknown, fallback: string) {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed || fallback;
}

function normalizeOptionalText(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function normalizeScore(value: unknown) {
  const numericValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(numericValue)));
}

function normalizeList(value: unknown, maxSize: number, fallback: string[]) {
  const normalized = Array.isArray(value)
    ? value
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)
        .slice(0, maxSize)
    : [];

  if (normalized.length > 0) {
    return normalized;
  }

  return fallback.slice(0, maxSize);
}

function normalizeOptionalList(value: unknown, maxSize: number) {
  return Array.isArray(value)
    ? value
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)
        .slice(0, maxSize)
    : [];
}

function normalizeWinningOutfitIndex(value: unknown) {
  const numericValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.max(0, Math.min(3, Math.round(numericValue)));
}

export function normalizeAnalysisResult(
  value: unknown,
  mode: Mode,
): AnalysisResult {
  const record =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  const winningOutfitIndex = normalizeWinningOutfitIndex(record.winningOutfitIndex);
  const winningOutfitLabel = normalizeText(
    record.winningOutfitLabel,
    winningOutfitIndex > 0 ? `Outfit ${winningOutfitIndex}` : "",
  );
  const followUpRequired = Boolean(record.followUpRequired);

  return {
    assessment: normalizeText(
      record.assessment ?? record.verdict,
      mode === "buy"
        ? "This piece has some value, but it has not fully justified the purchase yet."
        : "The look is serviceable, but it is not fully resolved yet.",
    ),
    rationale: normalizeText(
      record.rationale ?? record.tone,
      mode === "buy"
        ? "The recommendation is based on visual appeal, wardrobe value, and whether the item earns repeated use."
        : "The recommendation is based on outfit strength, grooming, color harmony, and occasion fit.",
    ),
    confidence: normalizeScore(record.confidence),
    outfit: normalizeScore(record.outfit),
    grooming: normalizeScore(record.grooming),
    color: normalizeScore(record.color),
    occasion: normalizeScore(record.occasion),
    occasionLabel: normalizeText(
      record.occasionLabel,
      mode === "buy" ? "Purchase context" : "Selected occasion",
    ),
    strongPoints: normalizeList(
      record.strongPoints ?? record.positives,
      4,
      DEFAULT_STRONG_POINTS[mode],
    ),
    areasToRefine: normalizeOptionalList(
      record.areasToRefine ?? record.negatives,
      3,
    ),
    recommendedImprovements: normalizeList(
      record.recommendedImprovements ?? record.tips,
      4,
      DEFAULT_RECOMMENDATIONS[mode],
    ),
    winningOutfitIndex,
    winningOutfitLabel,
    winningReason: normalizeOptionalText(record.winningReason),
    comparisonNotes: normalizeOptionalList(record.comparisonNotes, 4),
    wardrobeSuggestions: normalizeOptionalList(record.wardrobeSuggestions, 4),
    followUpRequired,
    followUpQuestion: followUpRequired
      ? normalizeText(
          record.followUpQuestion,
          "Add one more detail so MIROR can finish the assessment with confidence.",
        )
      : "",
  };
}

export function getAreasToRefine(result: AnalysisResult, mode: Mode) {
  return result.areasToRefine.length > 0
    ? result.areasToRefine
    : DEFAULT_AREAS_TO_REFINE[mode];
}
