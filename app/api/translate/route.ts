import { NextRequest, NextResponse } from "next/server";
import { defaultLanguage, isSupportedLanguage, type Language } from "@/lib/i18n";
import type { AnalysisResult } from "@/lib/analysis";

export const runtime = "nodejs";

type TranslateRequestBody = {
  language?: string;
  result?: AnalysisResult | null;
};

export async function POST(request: NextRequest) {
  let payload: TranslateRequestBody | null = null;

  try {
    payload = (await request.json()) as TranslateRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid translation request body." }, { status: 400 });
  }

  const language: Language =
    payload?.language && isSupportedLanguage(payload.language)
      ? payload.language
      : defaultLanguage;

  if (!payload?.result) {
    return NextResponse.json({ error: "Missing analysis result to translate." }, { status: 400 });
  }

  if (language === "en") {
    return NextResponse.json({ language, result: payload.result });
  }

  return NextResponse.json(
    {
      error:
        "Dynamic result translation is not configured yet. Connect Google Cloud Translation here when you are ready.",
      language,
      provider: "google-cloud-translation",
      readyForIntegration: true,
    },
    { status: 501 },
  );
}
