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
    selfie,
    outfitImages,
    itemToBuy,
  };
}

function createGroupTargetResult(occasion: Occasion): AnalysisResult {
  return normalizeAnalysisResult(
    {
      verdict: "Select yourself before MIROR scores the group photo.",
      tone: `Group photo mode is enabled, but the target person is still unclear. Add a short note describing which person should be judged for this ${occasion} look, then run the analysis again. MIROR should not guess in a crowd.`,
      confidence: 12,
      outfit: 10,
      grooming: 8,
      color: 10,
      occasion: 10,
      positives: [
        "The photo reached the analyzer, so the upload flow is working.",
        "Group mode correctly stopped the app from scoring the wrong person.",
        "A short target note is enough to unlock a real analysis on the next try.",
      ],
      negatives: [
        "The target person is not identified clearly enough to score fairly.",
        "Any verdict right now would be a guess, which MIROR should avoid.",
      ],
      tips: [
        "Describe where you are standing in the photo or what you are wearing.",
        "If possible, upload a tighter crop or a solo image for better accuracy.",
        "Run the scan again after adding the target-person note.",
      ],
    },
    "look",
  );
}

function buildPrompt(payload: NormalizedPayload) {
  const commonRules = [
    "You are MIROR, a strict AI appearance coach.",
    "Return only valid JSON that matches the provided schema. No markdown, no code fences, no extra text.",
    "Be honest and demanding. Do not flatter average looks or mediocre products.",
    "High scores above 85 must be rare and clearly earned.",
    "Average results should stay average. Do not inflate weak styling into excellence.",
    "Always include exactly 3 positives, exactly 2 negatives, and exactly 3 practical tips.",
    "Always identify at least 2 weaknesses if they are visible. If image quality limits certainty, say that clearly in tone and negatives.",
  ];

  if (payload.mode === "look") {
    return [
      ...commonRules,
      "This is LOOK mode.",
      "Judge outfit strength, color harmony, grooming, occasion fit, and confidence/presentation.",
      "If multiple outfit option images are included, compare them and identify the best one by number in the verdict or tone.",
      "If the group photo target is unclear, say the user must select the person and keep scores low instead of guessing.",
      `Occasion: ${payload.occasion}.`,
      `Group photo mode: ${payload.groupMode ? "enabled" : "disabled"}.`,
      `Target person note: ${payload.targetPersonNote || "none provided"}.`,
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
    `Primary intended occasion: ${payload.occasion}.`,
    "Be especially skeptical about whether the item is distinctive, wearable, and justified.",
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

  if (normalizedPayload.mode === "look" && normalizedPayload.groupMode && !normalizedPayload.targetPersonNote) {
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
