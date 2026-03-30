import { NextRequest, NextResponse } from "next/server";
import {
  ANALYSIS_RESPONSE_JSON_SCHEMA,
  normalizeAnalysisResult,
  type AnalyzeRequestBody,
  type Mode,
  type Occasion,
} from "@/lib/analysis";
import {
  defaultLanguage,
  isSupportedLanguage,
  type Language,
} from "@/lib/i18n";
import {
  FIT_PREFERENCES,
  createEmptyAppearanceAttributes,
  createEmptyPersonalPhotoSet,
  createEmptyUserProfile,
  summarizePreferredOccasions,
  type AppearanceAttributes,
  type FitPreference,
  type PersonalPhotoSet,
  type UserProfileInput,
  type WardrobeCategory,
  type WardrobeItemInput,
} from "@/lib/miror-data";

export const runtime = "nodejs";

const GEMINI_MODEL = "gemini-2.5-flash-lite";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const VALID_OCCASIONS = new Set<Occasion>([
  "date",
  "party",
  "work",
  "wedding",
  "casual",
  "custom",
]);
const VALID_MODES = new Set<Mode>(["look", "buy"]);
const VALID_WARDROBE_CATEGORIES = new Set<WardrobeCategory>([
  "tops",
  "pants",
  "shoes",
  "jackets",
  "accessories",
  "other",
]);
const VALID_FIT_PREFERENCES = new Set<FitPreference | "">(FIT_PREFERENCES);

type GeminiTextPart = {
  text?: string;
};

type GeminiCandidate = {
  content?: {
    parts?: GeminiTextPart[];
  };
};

type GeminiSuccessResponse = {
  candidates?: GeminiCandidate[];
  promptFeedback?: {
    blockReason?: string;
  };
};

type GeminiErrorResponse = {
  error?: {
    message?: string;
  };
};

type GeminiInlineImagePart = {
  inline_data: {
    mime_type: string;
    data: string;
  };
};

type NormalizedPayload = {
  language: Language;
  mode: Mode;
  occasion: Occasion;
  customOccasion: string;
  effectiveOccasionLabel: string;
  groupMode: boolean;
  targetPersonNote: string;
  followUpAnswer: string;
  profile: UserProfileInput;
  appearanceAttributes: AppearanceAttributes;
  personalPhotos: PersonalPhotoSet;
  currentLookImage: string | null;
  outfitImages: string[];
  itemCheckImage: string | null;
  wardrobeItems: WardrobeItemInput[];
};

const OUTPUT_LANGUAGE_LABELS: Record<Language, string> = {
  en: "English",
  fr: "French",
  es: "Spanish",
  ar: "Arabic",
};

function isMode(value: unknown): value is Mode {
  return typeof value === "string" && VALID_MODES.has(value as Mode);
}

function isOccasion(value: unknown): value is Occasion {
  return typeof value === "string" && VALID_OCCASIONS.has(value as Occasion);
}

function isWardrobeCategory(value: unknown): value is WardrobeCategory {
  return (
    typeof value === "string" &&
    VALID_WARDROBE_CATEGORIES.has(value as WardrobeCategory)
  );
}

function isFitPreference(value: unknown): value is FitPreference | "" {
  return (
    typeof value === "string" &&
    VALID_FIT_PREFERENCES.has(value as FitPreference | "")
  );
}

function isDataUrl(value: unknown): value is string {
  return typeof value === "string" && /^data:image\/[-+.\w]+;base64,/.test(value);
}

function parseDataUrl(dataUrl: string): GeminiInlineImagePart | null {
  const match = dataUrl.match(/^data:(image\/[-+.\w]+);base64,(.+)$/);

  if (!match) {
    return null;
  }

  const [, mimeType, data] = match;

  return {
    inline_data: {
      mime_type: mimeType,
      data,
    },
  };
}

function getTextResponse(data: GeminiSuccessResponse) {
  return data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();
}

function stripCodeFence(text: string) {
  return text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
}

function normalizeWardrobeItems(items: unknown) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item, index) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const record = item as Record<string, unknown>;
      const image = isDataUrl(record.image) ? record.image : null;

      if (!image) {
        return null;
      }

      return {
        id:
          typeof record.id === "string" && record.id.trim()
            ? record.id.trim()
            : `wardrobe-${index + 1}`,
        image,
        label:
          typeof record.label === "string" && record.label.trim()
            ? record.label.trim().slice(0, 80)
            : `Wardrobe item ${index + 1}`,
        category: isWardrobeCategory(record.category)
          ? record.category
          : "other",
      } satisfies WardrobeItemInput;
    })
    .filter((item): item is WardrobeItemInput => Boolean(item))
    .slice(0, 8);
}

function normalizeProfile(profile: unknown): UserProfileInput {
  const fallback = createEmptyUserProfile();

  if (!profile || typeof profile !== "object") {
    return fallback;
  }

  const record = profile as Record<string, unknown>;
  const preferredOccasions = Array.isArray(record.preferredOccasions)
    ? record.preferredOccasions.filter(isOccasion).slice(0, 6)
    : [];

  return {
    heightCm:
      typeof record.heightCm === "string" ? record.heightCm.trim().slice(0, 10) : "",
    weightKg:
      typeof record.weightKg === "string" ? record.weightKg.trim().slice(0, 10) : "",
    styleGoal:
      typeof record.styleGoal === "string"
        ? record.styleGoal.trim().slice(0, 120)
        : "",
    preferredFit:
      isFitPreference(record.preferredFit) ? record.preferredFit : "",
    preferredOccasions,
    notes:
      typeof record.notes === "string" ? record.notes.trim().slice(0, 240) : "",
  };
}

function normalizeAppearanceAttributes(attributes: unknown): AppearanceAttributes {
  const fallback = createEmptyAppearanceAttributes();

  if (!attributes || typeof attributes !== "object") {
    return fallback;
  }

  const record = attributes as Record<string, unknown>;
  const source =
    record.source === "ai" || record.source === "manual" || record.source === "pending"
      ? record.source
      : "pending";

  return {
    approximateSkinTone:
      typeof record.approximateSkinTone === "string"
        ? record.approximateSkinTone.trim().slice(0, 60)
        : "",
    eyeColor:
      typeof record.eyeColor === "string" ? record.eyeColor.trim().slice(0, 40) : "",
    hairColor:
      typeof record.hairColor === "string" ? record.hairColor.trim().slice(0, 40) : "",
    faceShape:
      typeof record.faceShape === "string" ? record.faceShape.trim().slice(0, 40) : "",
    bodyFrameImpression:
      typeof record.bodyFrameImpression === "string"
        ? record.bodyFrameImpression.trim().slice(0, 40)
        : "",
    contrastLevel:
      typeof record.contrastLevel === "string"
        ? record.contrastLevel.trim().slice(0, 40)
        : "",
    source,
  };
}

function normalizePersonalPhotos(photos: unknown): PersonalPhotoSet {
  const fallback = createEmptyPersonalPhotoSet();

  if (!photos || typeof photos !== "object") {
    return fallback;
  }

  const record = photos as Record<string, unknown>;

  return {
    selfie: isDataUrl(record.selfie) ? record.selfie : null,
    faceScan: isDataUrl(record.faceScan) ? record.faceScan : null,
    bodyPhoto: isDataUrl(record.bodyPhoto) ? record.bodyPhoto : null,
  };
}

function buildProfileSummary(profile: UserProfileInput) {
  const lines: string[] = [];

  if (profile.heightCm) {
    lines.push(`Height: ${profile.heightCm} cm`);
  }

  if (profile.weightKg) {
    lines.push(`Weight: ${profile.weightKg} kg`);
  }

  if (profile.styleGoal) {
    lines.push(`Style goal: ${profile.styleGoal}`);
  }

  if (profile.preferredFit) {
    lines.push(`Preferred fit: ${profile.preferredFit}`);
  }

  const preferredOccasions = summarizePreferredOccasions(profile.preferredOccasions);

  if (preferredOccasions) {
    lines.push(`Preferred occasions: ${preferredOccasions}`);
  }

  if (profile.notes) {
    lines.push(`Profile notes: ${profile.notes}`);
  }

  return lines.length > 0 ? lines.join(" | ") : "No saved profile details provided.";
}

function buildAppearanceSummary(attributes: AppearanceAttributes) {
  const lines: string[] = [];

  if (attributes.approximateSkinTone) {
    lines.push(`Approximate skin tone: ${attributes.approximateSkinTone}`);
  }

  if (attributes.eyeColor) {
    lines.push(`Eye color: ${attributes.eyeColor}`);
  }

  if (attributes.hairColor) {
    lines.push(`Hair color: ${attributes.hairColor}`);
  }

  if (attributes.faceShape) {
    lines.push(`Face shape: ${attributes.faceShape}`);
  }

  if (attributes.bodyFrameImpression) {
    lines.push(`Body frame impression: ${attributes.bodyFrameImpression}`);
  }

  if (attributes.contrastLevel) {
    lines.push(`Contrast level: ${attributes.contrastLevel}`);
  }

  return lines.length > 0
    ? `${lines.join(" | ")} | Source: ${attributes.source}`
    : "No derived appearance attributes provided yet.";
}

function normalizePayload(payload: AnalyzeRequestBody | null): NormalizedPayload | null {
  if (!payload || !isMode(payload.mode) || !isOccasion(payload.occasion)) {
    return null;
  }

  const personalPhotos = normalizePersonalPhotos(payload.personalPhotos);
  const currentLookImage = isDataUrl(payload.currentLookImage)
    ? payload.currentLookImage
    : null;
  const itemCheckImage = isDataUrl(payload.itemCheckImage)
    ? payload.itemCheckImage
    : null;
  const outfitImages = Array.isArray(payload.outfitImages)
    ? payload.outfitImages.filter(isDataUrl).slice(0, 3)
    : [];
  const wardrobeItems = normalizeWardrobeItems(payload.wardrobeItems);
  const customOccasion =
    typeof payload.customOccasion === "string"
      ? payload.customOccasion.trim().slice(0, 120)
      : "";
  const followUpAnswer =
    typeof payload.followUpAnswer === "string"
      ? payload.followUpAnswer.trim().slice(0, 240)
      : "";
  const effectiveOccasionLabel =
    payload.occasion === "custom"
      ? customOccasion || followUpAnswer || "Custom occasion"
      : payload.occasion;

  return {
    language:
      typeof payload.language === "string" && isSupportedLanguage(payload.language)
        ? payload.language
        : defaultLanguage,
    mode: payload.mode,
    occasion: payload.occasion,
    customOccasion,
    effectiveOccasionLabel,
    groupMode: Boolean(payload.groupMode),
    profile: normalizeProfile(payload.profile),
    appearanceAttributes: normalizeAppearanceAttributes(payload.appearanceAttributes),
    personalPhotos,
    targetPersonNote:
      typeof payload.targetPersonNote === "string"
        ? payload.targetPersonNote.trim().slice(0, 240)
        : "",
    followUpAnswer,
    currentLookImage,
    outfitImages,
    itemCheckImage,
    wardrobeItems,
  };
}

function createClarificationResult(config: {
  mode: Mode;
  occasionLabel: string;
  assessment: string;
  rationale: string;
  question: string;
  strongPoints?: string[];
  recommendedImprovements?: string[];
}) {
  return normalizeAnalysisResult(
    {
      assessment: config.assessment,
      rationale: config.rationale,
      confidence: 0,
      outfit: 0,
      grooming: 0,
      color: 0,
      occasion: 0,
      occasionLabel: config.occasionLabel,
      strongPoints:
        config.strongPoints ?? [
          "The request reached the analyzer correctly.",
          "A small clarification is enough to continue with a real assessment.",
        ],
      areasToRefine: [],
      recommendedImprovements:
        config.recommendedImprovements ?? [
          "Answer the clarification prompt directly.",
          "Keep the uploaded images as they are unless the framing is unclear.",
        ],
      winningOutfitIndex: 0,
      winningOutfitLabel: "",
      winningReason: "",
      comparisonNotes: [],
      wardrobeSuggestions: [],
      followUpRequired: true,
      followUpQuestion: config.question,
    },
    config.mode,
  );
}

function buildPrompt(payload: NormalizedPayload) {
  const profileSummary = buildProfileSummary(payload.profile);
  const appearanceSummary = buildAppearanceSummary(payload.appearanceAttributes);
  const commonRules = [
    "You are MIROR, a premium AI appearance coach.",
    "Return only valid JSON that matches the provided schema. No markdown, no code fences, no extra text.",
    `Write every user-facing string in ${OUTPUT_LANGUAGE_LABELS[payload.language]}.`,
    "Be honest, selective, and useful.",
    "If the styling is genuinely strong, say so clearly.",
    "Do not invent flaws just to sound strict, and do not invent praise either.",
    "Do not recommend adding something that is already clearly visible in the image, such as makeup, accessories, layering, or color accents.",
    "Avoid generic filler like 'smile more', 'be confident', 'improve posture', or 'add makeup' unless the image clearly supports that recommendation.",
    "Make every recommendation image-aware, specific, and realistic.",
    "High scores above 85 must be rare and clearly earned.",
    "Average results should stay average. Do not inflate weak styling into excellence.",
    "Only include areasToRefine when there is a real refinement to mention. Leave it empty if nothing material needs improvement.",
    "Only ask a follow-up question when one small missing detail materially blocks a confident answer.",
    "If no clarification is needed, set followUpRequired to false and followUpQuestion to an empty string.",
    "If image quality limits certainty, say that clearly in the rationale and recommendations.",
    `Saved profile context: ${profileSummary}`,
    `Saved appearance attributes: ${appearanceSummary}`,
  ];

  if (payload.mode === "look") {
    const effectiveTargetNote =
      payload.targetPersonNote || payload.followUpAnswer || "none provided";
    const wardrobeOnly =
      !payload.currentLookImage &&
      payload.outfitImages.length === 0 &&
      payload.wardrobeItems.length > 0;

    return [
      ...commonRules,
      "This is LOOK mode.",
      "Judge outfit strength, color harmony, grooming, occasion fit, and confidence/presentation.",
      wardrobeOnly
        ? "Only wardrobe items are available. Focus on the strongest combinations for the occasion and set grooming based on what is actually visible, not imagined."
        : "If a person is visible, judge only what is actually visible. Do not hallucinate grooming or styling details that the image does not show.",
      "If 2 or more outfit option images are included, compare them properly instead of giving generic comparison text.",
      "Set winningOutfitIndex to the 1-based winning outfit number, set winningOutfitLabel, and explain specifically why it wins in winningReason.",
      "Use comparisonNotes to explain specifically why the other outfits lose. Mention real visual differences, not filler.",
      "If there is no real comparison, set winningOutfitIndex to 0, winningOutfitLabel to an empty string, winningReason to an empty string, and comparisonNotes to an empty array.",
      "If wardrobe item images are provided, use wardrobeSuggestions to recommend combinations or pairings that suit the selected occasion.",
      "When wardrobe items are present, rank the most useful combinations first when possible.",
      "Use saved profile details and optional personal profile photos only as supporting context. The actual look in front of you still matters most.",
      `Effective occasion: ${payload.effectiveOccasionLabel}.`,
      `Occasion type: ${payload.occasion}.`,
      `Group photo mode: ${payload.groupMode ? "enabled" : "disabled"}.`,
      `Target person note: ${effectiveTargetNote}.`,
      `Follow-up clarification from user: ${payload.followUpAnswer || "none provided"}.`,
      "Score meaning:",
      "- confidence = confidence / presentation",
      "- outfit = outfit strength",
      "- grooming = grooming quality",
      "- color = color harmony",
      "- occasion = occasion fit",
    ].join("\n");
  }

  return [
    ...commonRules,
    "This is BUY mode.",
    "Judge the item on visual appeal, versatility, whether it is worth buying, its weaknesses, and whether it deserves a place in a wardrobe.",
    "Use saved profile details, appearance attributes, and optional personal photos to judge whether the item suits this specific person, not just whether it looks good in isolation.",
    "If wardrobe item images are provided, use them to judge whether this new item actually fits the existing wardrobe.",
    "If height, weight, frame impression, fit preference, or color information are available, use them cautiously and only when they materially affect the recommendation.",
    "Use wardrobeSuggestions for concrete pairing ideas with uploaded wardrobe items when possible.",
    `Effective occasion: ${payload.effectiveOccasionLabel}.`,
    `Occasion type: ${payload.occasion}.`,
    `Follow-up clarification from user: ${payload.followUpAnswer || "none provided"}.`,
    "Be especially skeptical about whether the item is distinctive, wearable, and justified.",
    "Set winningOutfitIndex to 0, winningOutfitLabel to an empty string, winningReason to an empty string, and comparisonNotes to an empty array.",
    "Score meaning:",
    "- confidence = visual appeal / purchase confidence",
    "- outfit = wardrobe value / how worth buying it is",
    "- grooming = 0 unless grooming is genuinely relevant in the image",
    "- color = color harmony and wearability",
    "- occasion = versatility / ability to earn a place in a wardrobe",
  ].join("\n");
}

function buildParts(payload: NormalizedPayload) {
  const parts: Array<{ text: string } | GeminiInlineImagePart> = [
    {
      text:
        payload.mode === "look"
          ? "Analyze the following current look, supporting personal profile photos, optional outfit comparisons, and optional wardrobe images."
          : "Analyze the following item, personal profile context, and any optional wardrobe images.",
    },
  ];

  const personalPhotoEntries = [
    { label: "Saved profile selfie", image: payload.personalPhotos.selfie },
    { label: "Saved face scan", image: payload.personalPhotos.faceScan },
    { label: "Saved body photo", image: payload.personalPhotos.bodyPhoto },
  ];

  personalPhotoEntries.forEach((entry) => {
    if (!entry.image) {
      return;
    }

    const imagePart = parseDataUrl(entry.image);

    if (imagePart) {
      parts.push({ text: `${entry.label} for personal context:` });
      parts.push(imagePart);
    }
  });

  if (payload.mode === "look" && payload.currentLookImage) {
    const currentLookPart = parseDataUrl(payload.currentLookImage);

    if (currentLookPart) {
      parts.push({ text: "Current look image under review:" });
      parts.push(currentLookPart);
    }
  }

  if (payload.mode === "look") {
    payload.outfitImages.forEach((image, index) => {
      const imagePart = parseDataUrl(image);

      if (!imagePart) {
        return;
      }

      parts.push({ text: `Outfit option ${index + 1}:` });
      parts.push(imagePart);
    });

    if (payload.outfitImages.length > 1) {
      parts.push({
        text: `Comparison mode is active. Rank the ${payload.outfitImages.length} outfit options, choose one winner, and explain the real tradeoffs.`,
      });
    }
  }

  if (payload.mode === "buy" && payload.itemCheckImage) {
    const itemPart = parseDataUrl(payload.itemCheckImage);

    if (itemPart) {
      parts.push({ text: "Item under consideration:" });
      parts.push(itemPart);
    }
  }

  payload.wardrobeItems.forEach((item, index) => {
    const imagePart = parseDataUrl(item.image);

    if (!imagePart) {
      return;
    }

    parts.push({
      text: `Wardrobe item ${index + 1} (${item.category}) - ${item.label}:`,
    });
    parts.push(imagePart);
  });

  return parts;
}

function getGeminiErrorMessage(
  data: GeminiSuccessResponse | GeminiErrorResponse | null,
) {
  if (!data) {
    return null;
  }

  if ("error" in data && data.error?.message) {
    return data.error.message;
  }

  if ("promptFeedback" in data && data.promptFeedback?.blockReason) {
    return `Gemini blocked the request: ${data.promptFeedback.blockReason}.`;
  }

  return null;
}

export async function POST(request: NextRequest) {
  let payload: AnalyzeRequestBody | null = null;

  try {
    payload = (await request.json()) as AnalyzeRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid analysis request body." },
      { status: 400 },
    );
  }

  const normalizedPayload = normalizePayload(payload);

  if (!normalizedPayload) {
    return NextResponse.json(
      { error: "Invalid analysis parameters." },
      { status: 400 },
    );
  }

  if (
    normalizedPayload.mode === "look" &&
    !normalizedPayload.currentLookImage &&
    normalizedPayload.outfitImages.length === 0 &&
    normalizedPayload.wardrobeItems.length === 0
  ) {
    return NextResponse.json(
      {
        error:
          "Upload a current look, outfit option, or wardrobe item before starting the look analysis.",
      },
      { status: 400 },
    );
  }

  if (normalizedPayload.mode === "buy" && !normalizedPayload.itemCheckImage) {
    return NextResponse.json(
      { error: "An item image is required for buy mode." },
      { status: 400 },
    );
  }

  if (
    normalizedPayload.occasion === "custom" &&
    !normalizedPayload.customOccasion &&
    !normalizedPayload.followUpAnswer
  ) {
    return NextResponse.json(
      createClarificationResult({
        mode: normalizedPayload.mode,
        occasionLabel: "Custom occasion",
        assessment: "A small detail is missing before MIROR can anchor the recommendation correctly.",
        rationale:
          "Custom occasion mode is active, but the actual event has not been described yet.",
        question: "What is the custom occasion?",
      }),
    );
  }

  if (
    normalizedPayload.mode === "look" &&
    normalizedPayload.groupMode &&
    !normalizedPayload.targetPersonNote &&
    !normalizedPayload.followUpAnswer
  ) {
    return NextResponse.json(
      createClarificationResult({
        mode: "look",
        occasionLabel: normalizedPayload.effectiveOccasionLabel,
        assessment: "A quick clarification is needed before MIROR can score this group look confidently.",
        rationale:
          "Group photo mode is enabled, but the target person is still unclear.",
        question: "Who are you in the photo?",
      }),
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing GEMINI_API_KEY on the server." },
      { status: 500 },
    );
  }

  const parts = buildParts(normalizedPayload);

  if (parts.length < 2) {
    return NextResponse.json(
      { error: "No valid images were attached to the analysis request." },
      { status: 400 },
    );
  }

  try {
    const geminiResponse = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      cache: "no-store",
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: buildPrompt(normalizedPayload) }],
        },
        contents: [
          {
            parts,
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseJsonSchema: ANALYSIS_RESPONSE_JSON_SCHEMA,
          temperature: 0.4,
        },
      }),
    });

    const geminiData = (await geminiResponse.json().catch(() => null)) as
      | GeminiSuccessResponse
      | GeminiErrorResponse
      | null;

    if (!geminiResponse.ok) {
      const errorMessage =
        getGeminiErrorMessage(geminiData) ?? "Gemini failed to analyze the image.";

      console.error("Gemini analysis request failed.", errorMessage);

      return NextResponse.json(
        { error: "Gemini could not analyze the image right now." },
        { status: 502 },
      );
    }

    const textResponse =
      geminiData && "candidates" in geminiData ? getTextResponse(geminiData) : null;

    if (!textResponse) {
      const errorMessage =
        getGeminiErrorMessage(geminiData) ?? "Gemini returned an empty response.";

      console.error("Gemini analysis returned no structured text.", errorMessage);

      return NextResponse.json(
        { error: "Gemini returned an empty analysis response." },
        { status: 502 },
      );
    }

    const parsed = JSON.parse(stripCodeFence(textResponse));
    const result = normalizeAnalysisResult(parsed, normalizedPayload.mode);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Gemini image analysis failed.", error);

    return NextResponse.json(
      { error: "Unable to analyze the image right now." },
      { status: 500 },
    );
  }
}
