export type Occasion = "date" | "party" | "work" | "wedding" | "casual";
export type Mode = "look" | "buy";

export type AnalysisResult = {
  verdict: string;
  tone: string;
  confidence: number;
  outfit: number;
  grooming: number;
  color: number;
  occasion: number;
  positives: string[];
  negatives: string[];
  tips: string[];
};

export type AnalyzeRequestBody = {
  mode: Mode;
  occasion: Occasion;
  groupMode: boolean;
  targetPersonNote: string;
  selfie: string | null;
  outfitImages: string[];
  itemToBuy: string | null;
};

export const ANALYSIS_RESPONSE_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    verdict: {
      type: "string",
      description:
        "A short, direct verdict. If multiple outfit images were compared, mention which numbered outfit wins.",
    },
    tone: {
      type: "string",
      description:
        "Blunt but useful explanation. Mention image-quality issues or unclear group targeting when relevant.",
    },
    confidence: {
      type: "integer",
      minimum: 0,
      maximum: 100,
      description:
        "For look mode: confidence/presence score. For buy mode: visual appeal / purchase confidence score.",
    },
    outfit: {
      type: "integer",
      minimum: 0,
      maximum: 100,
      description:
        "For look mode: outfit strength. For buy mode: wardrobe value / how worth buying it is.",
    },
    grooming: {
      type: "integer",
      minimum: 0,
      maximum: 100,
      description:
        "For look mode: grooming quality. For buy mode: use 0 unless grooming is somehow relevant.",
    },
    color: {
      type: "integer",
      minimum: 0,
      maximum: 100,
      description: "Color harmony and how wearable the palette is.",
    },
    occasion: {
      type: "integer",
      minimum: 0,
      maximum: 100,
      description:
        "For look mode: occasion fit. For buy mode: versatility / ability to earn a place in a wardrobe.",
    },
    positives: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "string",
      },
      description: "Exactly 3 specific strengths.",
    },
    negatives: {
      type: "array",
      minItems: 2,
      maxItems: 2,
      items: {
        type: "string",
      },
      description: "Exactly 2 clear weaknesses. No fake praise.",
    },
    tips: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "string",
      },
      description: "Exactly 3 practical next-step recommendations.",
    },
  },
  required: [
    "verdict",
    "tone",
    "confidence",
    "outfit",
    "grooming",
    "color",
    "occasion",
    "positives",
    "negatives",
    "tips",
  ],
} as const;

const DEFAULT_POSITIVES: Record<Mode, string[]> = {
  look: [
    "The image gives Gemini enough context to judge the overall presentation.",
    "There is at least one workable foundation to build on instead of starting from zero.",
    "The current look shows some intentional choices, even if the finish is uneven.",
  ],
  buy: [
    "The item has enough visible detail to evaluate shape, color, and general appeal.",
    "The piece can be judged against real wardrobe use instead of only product-page hype.",
    "There is at least one styling direction where the item could work.",
  ],
};

const DEFAULT_NEGATIVES: Record<Mode, string[]> = {
  look: [
    "The look still has weak points that stop it from reading sharp or fully intentional.",
    "At least one detail in the photo lowers the overall impression and needs correcting.",
  ],
  buy: [
    "The item does not automatically earn a place in a wardrobe just because it looks decent online.",
    "Fit, fabric, or styling limitations could make this a forgettable purchase.",
  ],
};

const DEFAULT_TIPS: Record<Mode, string[]> = {
  look: [
    "Tighten one weak styling choice instead of changing everything at once.",
    "Improve lighting or framing if the photo quality is hiding important details.",
    "Use the verdict as a filter for what to keep, swap, or remove before leaving.",
  ],
  buy: [
    "Only buy it if you can name at least three outfits it improves immediately.",
    "Check the fabric, fit, and return policy before trusting the product image.",
    "Skip it if the item duplicates something you already own without upgrading it.",
  ],
};

function normalizeText(value: unknown, fallback: string) {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed || fallback;
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

function normalizeList(value: unknown, size: number, fallback: string[]) {
  const normalized = Array.isArray(value)
    ? value
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)
        .slice(0, size)
    : [];

  return [...normalized, ...fallback.slice(normalized.length)].slice(0, size);
}

export function normalizeAnalysisResult(
  value: unknown,
  mode: Mode,
): AnalysisResult {
  const record =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};

  return {
    verdict: normalizeText(
      record.verdict,
      mode === "buy"
        ? "This item is not convincing enough yet."
        : "This look needs work before it earns a strong score.",
    ),
    tone: normalizeText(
      record.tone,
      mode === "buy"
        ? "The verdict is based on visible design value, versatility, and whether the purchase is justified."
        : "The verdict is based on outfit strength, grooming, color harmony, and occasion fit.",
    ),
    confidence: normalizeScore(record.confidence),
    outfit: normalizeScore(record.outfit),
    grooming: normalizeScore(record.grooming),
    color: normalizeScore(record.color),
    occasion: normalizeScore(record.occasion),
    positives: normalizeList(record.positives, 3, DEFAULT_POSITIVES[mode]),
    negatives: normalizeList(record.negatives, 2, DEFAULT_NEGATIVES[mode]),
    tips: normalizeList(record.tips, 3, DEFAULT_TIPS[mode]),
  };
}
