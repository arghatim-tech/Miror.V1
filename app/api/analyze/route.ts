import { NextRequest, NextResponse } from "next/server";
import {
  ANALYSIS_RESPONSE_JSON_SCHEMA,
  normalizeAnalysisResult,
  type AnalysisResult,
  type AnalyzeRequestBody,
  type Mode,
  type Occasion,
} from "@/lib/analysis";

export const runtime = "nodejs";

const GEMINI_MODEL = "gemini-2.5-flash-lite";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const VALID_OCCASIONS = new Set<Occasion>([
  "date",
  "party",
  "work",
  "wedding",
  "casual",
]);
const VALID_MODES = new Set<Mode>(["look", "buy"]);

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
  mode: Mode;
  occasion: Occasion;
  groupMode: boolean;
  targetPersonNote: string;
  followUpAnswer: string;
  selfie: string | null;
  outfitImages: string[];
  itemToBuy: string | null;
};

function isMode(value: unknown): value is Mode {
  return typeof value === "string" && VALID_MODES.has(value as Mode);
}

function isOccasion(value: unknown): value is Occasion {
  return typeof value === "string" && VALID_OCCASIONS.has(value as Occasion);
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

function normalizePayload(payload: AnalyzeRequestBody | null): NormalizedPayload | null {
  if (!payload || !isMode(payload.mode) || !isOccasion(payload.occasion)) {
    return null;
  }

  const selfie = isDataUrl(payload.selfie) ? payload.selfie : null;
  const itemToBuy = isDataUrl(payload.itemToBuy) ? payload.itemToBuy : null;
  const outfitImages = Array.isArray(payload.outfitImages)
    ? payload.outfitImages.filter(isDataUrl).slice(0, 3)
    : [];

  return {
    mode: payload.mode,
    occasion: payload.occasion,
    groupMode: Boolean(payload.groupMode),
    targetPersonNote:
      typeof payload.targetPersonNote === "string"
        ? payload.targetPersonNote.trim().slice(0, 240)
        : "",
    followUpAnswer:
      typeof payload.followUpAnswer === "string"
        ? payload.followUpAnswer.trim().slice(0, 240)
        : "",
    selfie,
    outfitImages,
    itemToBuy,
  };
}

function createGroupTargetResult(occasion: Occasion): AnalysisResult {
  return normalizeAnalysisResult(
    {
      assessment: "A quick clarification is needed before MIROR can score this group look confidently.",
      rationale: `Group photo mode is enabled, but the target person is still unclear for this ${occasion} look. MIROR should not guess inside a crowded frame.`,
      confidence: 12,
      outfit: 10,
      grooming: 8,
      color: 10,
      occasion: 10,
      strongPoints: [
        "The photo reached the analyzer correctly, so the upload flow is working.",
        "The app correctly avoided scoring the wrong person in the group.",
      ],
      areasToRefine: [
        "The target person is not identified clearly enough to score fairly.",
      ],
      recommendedImprovements: [
        "Describe where you are standing in the photo or what you are wearing.",
        "If possible, upload a tighter crop or a solo image for better accuracy.",
        "Submit the clarification and MIROR can continue with a proper assessment.",
      ],
      winningOutfitIndex: 0,
      winningOutfitLabel: "",
      winningReason: "",
      comparisonNotes: [],
      followUpRequired: true,
      followUpQuestion: "Who are you in the photo?",
    },
    "look",
  );
}

function buildPrompt(payload: NormalizedPayload) {
  const commonRules = [
    "You are MIROR, a premium AI appearance coach.",
    "Return only valid JSON that matches the provided schema. No markdown, no code fences, no extra text.",
    "Be honest, selective, and useful.",
    "If the styling is genuinely strong, say so clearly.",
    "Do not invent flaws just to sound strict, and do not invent praise either.",
    "High scores above 85 must be rare and clearly earned.",
    "Average results should stay average. Do not inflate weak styling into excellence.",
    "Only include areasToRefine when there is a real refinement to mention. Leave it empty if nothing material needs improvement.",
    "Only ask a follow-up question when a small missing piece of context materially blocks a confident answer.",
    "If no clarification is needed, set followUpRequired to false and followUpQuestion to an empty string.",
    "If image quality limits certainty, say that clearly in the rationale and recommendations.",
  ];

  if (payload.mode === "look") {
    const effectiveTargetNote =
      payload.targetPersonNote || payload.followUpAnswer || "none provided";

    return [
      ...commonRules,
      "This is LOOK mode.",
      "Judge outfit strength, color harmony, grooming, occasion fit, and confidence/presentation.",
      "If 2 or more outfit option images are included, compare them properly instead of giving generic comparison text.",
      "Set winningOutfitIndex to the 1-based winning outfit number, set winningOutfitLabel, and explain specifically why it wins in winningReason.",
      "Use comparisonNotes to explain specifically why the other outfits lose. Mention actual visual differences, not generic filler.",
      "If there is no real comparison, set winningOutfitIndex to 0, winningOutfitLabel to an empty string, winningReason to an empty string, and comparisonNotes to an empty array.",
      "If the overall look is genuinely strong, acknowledge that clearly and do not force criticism.",
      "If the group photo target is still unclear after the provided notes, ask exactly who should be judged instead of guessing.",
      `Occasion: ${payload.occasion}.`,
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
    "If the item is genuinely strong for the intended use, say so directly instead of forcing negative filler.",
    `Primary intended occasion: ${payload.occasion}.`,
    `Follow-up clarification from user: ${payload.followUpAnswer || "none provided"}.`,
    "Be especially skeptical about whether the item is distinctive, wearable, and justified.",
    "Set winningOutfitIndex to 0, winningOutfitLabel to an empty string, winningReason to an empty string, and comparisonNotes to an empty array.",
    "Score meaning:",
    "- confidence = visual appeal / purchase confidence",
    "- outfit = wardrobe value / how worth buying it is",
    "- grooming = 0 unless grooming is somehow relevant in the image",
    "- color = color harmony and wearability",
    "- occasion = versatility / ability to earn a place in a wardrobe",
  ].join("\n");
}

function buildParts(payload: NormalizedPayload) {
  const parts: Array<{ text: string } | GeminiInlineImagePart> = [
    {
      text:
        payload.mode === "look"
          ? "Analyze the following self-image and optional outfit comparisons."
          : "Analyze the following clothing item and decide whether it is worth buying.",
    },
  ];

  if (payload.mode === "look" && payload.selfie) {
    const selfiePart = parseDataUrl(payload.selfie);

    if (selfiePart) {
      parts.push({ text: "Primary selfie / full-look image:" });
      parts.push(selfiePart);
    }

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

  if (payload.mode === "buy" && payload.itemToBuy) {
    const itemPart = parseDataUrl(payload.itemToBuy);

    if (itemPart) {
      parts.push({ text: "Item under consideration:" });
      parts.push(itemPart);
    }
  }

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

  if (normalizedPayload.mode === "look" && !normalizedPayload.selfie) {
    return NextResponse.json(
      { error: "A selfie or full-look image is required for look mode." },
      { status: 400 },
    );
  }

  if (normalizedPayload.mode === "buy" && !normalizedPayload.itemToBuy) {
    return NextResponse.json(
      { error: "An item image is required for buy mode." },
      { status: 400 },
    );
  }

  if (
    normalizedPayload.mode === "look" &&
    normalizedPayload.groupMode &&
    !normalizedPayload.targetPersonNote &&
    !normalizedPayload.followUpAnswer
  ) {
    return NextResponse.json(createGroupTargetResult(normalizedPayload.occasion));
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
          temperature: 0.35,
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
