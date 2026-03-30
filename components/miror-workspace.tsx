"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Playfair_Display } from "next/font/google";
import { type ChangeEvent, useEffect, useState } from "react";
import { PricingGrid } from "@/components/pricing-grid";
import {
  getAreasToRefine,
  type AnalysisResult,
  type AnalyzeRequestBody,
  type Mode,
  type Occasion,
} from "@/lib/analysis";
import {
  appDictionaries,
  defaultLanguage,
  getLanguageDirection,
  isSupportedLanguage,
  type Language,
} from "@/lib/i18n";
import {
  AUTH_PROVIDERS,
  FIT_PREFERENCES,
  MIROR_SUPABASE_PLAN,
  WARDROBE_CATEGORIES,
  WORKSPACE_SECTIONS,
  createEmptyAccountState,
  createEmptyAppearanceAttributes,
  createEmptyPersonalPhotoSet,
  createEmptyTryOnDraft,
  createEmptyUserProfile,
  type AccountState,
  type AppearanceAttributes,
  type AuthProvider,
  type FitPreference,
  type PersonalPhotoSet,
  type TryOnDraft,
  type UserProfileInput,
  type WardrobeCategory,
  type WardrobeItemInput,
  type WorkspaceSection,
} from "@/lib/miror-data";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

type Theme = "dark" | "light";

const LANGUAGE_STORAGE_KEY = "miror-language";
const THEME_STORAGE_KEY = "miror-theme";
const ACCOUNT_STORAGE_KEY = "miror-account";
const SECTION_STORAGE_KEY = "miror-workspace-section";
const MAX_WARDROBE_ITEMS = 8;

const OCCASION_ORDER: Occasion[] = [
  "date",
  "party",
  "work",
  "wedding",
  "casual",
  "custom",
];

const APPEARANCE_FIELDS: Array<keyof Omit<AppearanceAttributes, "source">> = [
  "approximateSkinTone",
  "eyeColor",
  "hairColor",
  "faceShape",
  "bodyFrameImpression",
  "contrastLevel",
];

const LANGUAGE_OPTIONS: Array<{ value: Language; label: string }> = [
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
  { value: "ar", label: "Arabic" },
];

const workspaceCopy: Record<
  Language,
  {
    accountTitle: string;
    accountDescription: string;
    guestMode: string;
    signedIn: string;
    noSession: string;
    signOut: string;
    openAuth: string;
    tabs: Record<WorkspaceSection, string>;
    tabsDescription: Record<WorkspaceSection, string>;
    uploadLookFirst: string;
    uploadItemFirst: string;
    uploadLookOrWardrobeFirst: string;
    currentLookLabel: string;
    currentLookPlaceholder: string;
    remove: string;
    itemLabel: string;
    itemLabelPlaceholder: string;
    fitOptions: Record<string, string>;
    appearanceLabels: Record<string, string>;
    pendingValue: string;
    tryOnSourceLabel: string;
    tryOnSourceOptions: Record<TryOnDraft["personPhotoSource"], string>;
    tryOnMissingProfilePhoto: string;
    wardrobeQuickTitle: string;
    wardrobeQuickEmpty: string;
    futureReadyLabel: string;
    futureReadyText: string;
    tablesLabel: string;
    bucketsLabel: string;
  }
> = {
  en: {
    accountTitle: "Account access",
    accountDescription:
      "Supabase Auth is planned for Google, Facebook, email, and phone sign-in. Guest mode stays available for quick testing.",
    guestMode: "Guest session",
    signedIn: "Signed-in account",
    noSession: "No session selected",
    signOut: "Sign out",
    openAuth: "Open auth",
    tabs: {
      profile: "Profile",
      analyze: "Analyze",
      wardrobe: "Wardrobe",
      "try-on": "Try It On",
      pricing: "Pricing",
      settings: "Settings",
    },
    tabsDescription: {
      profile: "Store profile context, personal photos, and AI-ready appearance fields separately from outfit analysis.",
      analyze: "Run single-look analysis, outfit comparison, or buy-this-item checks with the right image category.",
      wardrobe: "Keep clothes-only uploads here and turn them into wardrobe-based combinations and suggestions.",
      "try-on": "Prepare a clean try-on flow with a person photo, garment choice, and future generation-ready state.",
      pricing: "Keep upgrade logic separate from coaching logic while leaving it inside the product flow.",
      settings: "Review theme, language, access mode, and the Supabase-ready storage structure.",
    },
    uploadLookFirst: "Upload an image first",
    uploadItemFirst: "Upload an item first",
    uploadLookOrWardrobeFirst: "Upload a look or wardrobe item first",
    currentLookLabel: "Current look photo",
    currentLookPlaceholder: "Upload the outfit you are wearing now.",
    remove: "Remove",
    itemLabel: "Item label",
    itemLabelPlaceholder: "Example: navy blazer",
    fitOptions: {
      tailored: "Tailored",
      regular: "Regular",
      relaxed: "Relaxed",
      slim: "Slim",
      oversized: "Oversized",
    },
    appearanceLabels: {
      approximateSkinTone: "Approximate skin tone",
      eyeColor: "Eye color",
      hairColor: "Hair color",
      faceShape: "Face shape",
      bodyFrameImpression: "Body frame impression",
      contrastLevel: "Contrast level",
    },
    pendingValue: "Pending analysis",
    tryOnSourceLabel: "Person photo source",
    tryOnSourceOptions: {
      upload: "Direct upload",
      "profile-selfie": "Use profile selfie",
      "profile-face-scan": "Use face scan",
      "profile-body-photo": "Use body photo",
    },
    tryOnMissingProfilePhoto:
      "Add that profile photo first if you want to reuse it for try-on.",
    wardrobeQuickTitle: "Quick wardrobe suggestions",
    wardrobeQuickEmpty:
      "Add a few wardrobe pieces to see suggested combinations for the selected occasion.",
    futureReadyLabel: "Future-ready",
    futureReadyText:
      "Prepared for a later image-generation API that can combine a person photo with a wardrobe item or uploaded garment.",
    tablesLabel: "Tables",
    bucketsLabel: "Buckets",
  },
  fr: {} as never,
  es: {} as never,
  ar: {} as never,
};

workspaceCopy.fr = workspaceCopy.en;
workspaceCopy.es = workspaceCopy.en;
workspaceCopy.ar = workspaceCopy.en;

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function isAuthProvider(value: string | null): value is AuthProvider {
  return value ? AUTH_PROVIDERS.includes(value as AuthProvider) : false;
}

function isWorkspaceSection(value: string | null): value is WorkspaceSection {
  return value ? WORKSPACE_SECTIONS.includes(value as WorkspaceSection) : false;
}

function isAnalysisResult(value: unknown): value is AnalysisResult {
  return Boolean(value && typeof value === "object" && "assessment" in value);
}

function readOriginalFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(reader.error ?? new Error("Unable to read file."));
    reader.readAsDataURL(file);
  });
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load image."));
    image.src = url;
  });
}

async function readFileAsDataUrl(file: File): Promise<string> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(objectUrl);
    const maxWidth = 1800;
    const scale = image.width > maxWidth ? maxWidth / image.width : 1;
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");

    if (!context) {
      return readOriginalFileAsDataUrl(file);
    }

    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", 0.84);
  } catch {
    return readOriginalFileAsDataUrl(file);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function inferWardrobeCategory(fileName: string): WardrobeCategory {
  const normalized = fileName.toLowerCase();

  if (/(shirt|tee|t-shirt|polo|blouse|top|hoodie|sweater|knit|cardigan)/.test(normalized)) {
    return "tops";
  }

  if (/(pant|trouser|jean|chino|short|skirt)/.test(normalized)) {
    return "pants";
  }

  if (/(shoe|sneaker|boot|loafer|heel|sandal)/.test(normalized)) {
    return "shoes";
  }

  if (/(jacket|blazer|coat|overcoat|bomber|outerwear)/.test(normalized)) {
    return "jackets";
  }

  if (/(belt|watch|bag|hat|cap|scarf|tie|ring|chain|necklace|glasses)/.test(normalized)) {
    return "accessories";
  }

  return "other";
}

function inferWardrobeLabel(fileName: string, index: number) {
  const cleaned = fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned ? cleaned.slice(0, 80) : `Wardrobe item ${index + 1}`;
}

function buildWardrobeSuggestions(wardrobeItems: WardrobeItemInput[], occasionLabel: string) {
  const tops = wardrobeItems.filter((item) => item.category === "tops");
  const pants = wardrobeItems.filter((item) => item.category === "pants");
  const shoes = wardrobeItems.filter((item) => item.category === "shoes");
  const jackets = wardrobeItems.filter((item) => item.category === "jackets");
  const accessories = wardrobeItems.filter((item) => item.category === "accessories");
  const suggestions: string[] = [];

  if (tops[0] && pants[0]) {
    suggestions.push(`Start with ${tops[0].label} and ${pants[0].label} for ${occasionLabel}.`);
  }

  if (jackets[0] && tops[0]) {
    suggestions.push(`Layer ${jackets[0].label} over ${tops[0].label} when you want a sharper finish.`);
  }

  if (shoes[0] && pants[0]) {
    suggestions.push(`${shoes[0].label} is the easiest anchor if ${pants[0].label} stays in rotation.`);
  }

  if (accessories[0]) {
    suggestions.push(`Use ${accessories[0].label} as the detail piece instead of adding visual noise elsewhere.`);
  }

  return suggestions.slice(0, 3);
}

function BackgroundDecor({ isDark }: { isDark: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? "radial-gradient(circle at 18% 12%, rgba(210,171,85,0.16), transparent 30%), radial-gradient(circle at 82% 22%, rgba(210,171,85,0.11), transparent 24%), linear-gradient(180deg, rgba(12,10,8,0.98), rgba(7,6,5,1))"
            : "radial-gradient(circle at 18% 12%, rgba(124,78,12,0.08), transparent 28%), radial-gradient(circle at 82% 22%, rgba(124,78,12,0.05), transparent 24%), linear-gradient(180deg, rgba(252,250,245,0.98), rgba(252,250,245,1))",
        }}
      />
    </div>
  );
}

function Score({
  isDark,
  label,
  value,
}: {
  isDark: boolean;
  label: string;
  value: number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className={isDark ? "text-[#d4c6b3]" : "text-[#6f6658]"}>{label}</span>
        <span className={isDark ? "text-[#d2ab55]" : "text-amber-800"}>{value}</span>
      </div>
      <div className={cx("h-1.5 rounded-full", isDark ? "bg-[#2f271e]" : "bg-[#dfd5c3]")}>
        <div className="h-1.5 rounded-full bg-[#d2ab55]" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function MirorWorkspace() {
  const searchParams = useSearchParams();
  const accessParam = searchParams.get("access");
  const providerParam = searchParams.get("provider");
  const sectionParam = searchParams.get("section");

  const [theme, setTheme] = useState<Theme>("light");
  const [language, setLanguage] = useState<Language>(defaultLanguage);
  const [account, setAccount] = useState<AccountState>(createEmptyAccountState());
  const [activeSection, setActiveSection] = useState<WorkspaceSection>("analyze");
  const [mode, setMode] = useState<Mode>("look");
  const [occasion, setOccasion] = useState<Occasion>("date");
  const [customOccasion, setCustomOccasion] = useState("");
  const [groupMode, setGroupMode] = useState(false);
  const [targetPersonNote, setTargetPersonNote] = useState("");
  const [userProfile, setUserProfile] = useState<UserProfileInput>(createEmptyUserProfile());
  const [appearanceAttributes] = useState<AppearanceAttributes>(createEmptyAppearanceAttributes());
  const [personalPhotos, setPersonalPhotos] = useState<PersonalPhotoSet>(createEmptyPersonalPhotoSet());
  const [currentLookImage, setCurrentLookImage] = useState<string | null>(null);
  const [outfits, setOutfits] = useState<Array<string | null>>([null, null, null]);
  const [itemCheckImage, setItemCheckImage] = useState<string | null>(null);
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItemInput[]>([]);
  const [tryOnDraft, setTryOnDraft] = useState<TryOnDraft>(createEmptyTryOnDraft());
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [followUpAnswer, setFollowUpAnswer] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    const storedAccount = window.localStorage.getItem(ACCOUNT_STORAGE_KEY);
    const storedSection = window.localStorage.getItem(SECTION_STORAGE_KEY);

    if (storedLanguage && isSupportedLanguage(storedLanguage)) {
      setLanguage(storedLanguage);
    }
    if (storedTheme === "dark" || storedTheme === "light") {
      setTheme(storedTheme);
    }
    if (storedAccount) {
      try {
        setAccount(JSON.parse(storedAccount) as AccountState);
      } catch {
        window.localStorage.removeItem(ACCOUNT_STORAGE_KEY);
      }
    }
    if (isWorkspaceSection(storedSection)) {
      setActiveSection(storedSection);
    }
  }, []);

  useEffect(() => {
    if (accessParam === "guest") {
      setAccount((currentAccount) => ({
        ...currentAccount,
        accessMode: "guest",
        authProvider: null,
      }));
    } else if (accessParam === "member" && isAuthProvider(providerParam)) {
      setAccount((currentAccount) => ({
        ...currentAccount,
        accessMode: "member",
        authProvider: providerParam,
      }));
    }
  }, [accessParam, providerParam]);

  useEffect(() => {
    if (isWorkspaceSection(sectionParam)) {
      setActiveSection(sectionParam);
    }
  }, [sectionParam]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(account));
  }, [account]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(SECTION_STORAGE_KEY, activeSection);
  }, [activeSection]);

  const dictionary = appDictionaries[language] ?? appDictionaries[defaultLanguage];
  const extra = workspaceCopy[language] ?? workspaceCopy.en;
  const isDark = theme === "dark";
  const direction = getLanguageDirection(language);
  const uploadedOutfitImages = outfits.filter((item): item is string => Boolean(item));
  const hasWardrobe = wardrobeItems.length > 0;
  const canAnalyze =
    mode === "look"
      ? Boolean(currentLookImage || uploadedOutfitImages.length > 0 || hasWardrobe)
      : Boolean(itemCheckImage);
  const previewImage = mode === "look" ? currentLookImage : itemCheckImage;
  const winningOutfitImage =
    mode === "look" && result && result.winningOutfitIndex > 0
      ? uploadedOutfitImages[result.winningOutfitIndex - 1] ?? null
      : null;
  const displayImage = winningOutfitImage ?? previewImage ?? wardrobeItems[0]?.image ?? null;
  const showWinningOutfit =
    Boolean(result) &&
    mode === "look" &&
    uploadedOutfitImages.length > 1 &&
    (result?.winningOutfitIndex ?? 0) > 0 &&
    Boolean(winningOutfitImage);
  const showFollowUp = Boolean(result?.followUpRequired && result.followUpQuestion.trim());
  const canSubmitFollowUp = followUpAnswer.trim().length > 0 && !loading;
  const visibleAreasToRefine = result ? getAreasToRefine(result, mode) : [];
  const selectedOccasionLabel =
    occasion === "custom"
      ? customOccasion.trim() || dictionary.demoSection.occasionLabels.custom
      : dictionary.demoSection.occasionLabels[occasion];
  const localWardrobeSuggestions = buildWardrobeSuggestions(wardrobeItems, selectedOccasionLabel);
  const profileSourcePhoto =
    tryOnDraft.personPhotoSource === "profile-selfie"
      ? personalPhotos.selfie
      : tryOnDraft.personPhotoSource === "profile-face-scan"
        ? personalPhotos.faceScan
        : tryOnDraft.personPhotoSource === "profile-body-photo"
          ? personalPhotos.bodyPhoto
          : null;
  const tryOnDisplayPhoto =
    tryOnDraft.personPhotoSource === "upload" ? tryOnDraft.personPhoto : profileSourcePhoto;
  const accountLabel =
    account.accessMode === "guest"
      ? extra.guestMode
      : account.accessMode === "member"
        ? extra.signedIn
        : extra.noSession;

  const wrapClass = cx(
    "relative min-h-screen overflow-x-hidden transition-colors duration-300",
    isDark ? "bg-[#090806] text-[#fff6eb]" : "bg-[#fcfaf5] text-[#17130e]",
  );
  const panelClass = cx(
    "border transition-colors duration-300",
    isDark ? "border-[#3a3025] bg-[#13100d]" : "border-[#ddd3c1] bg-[#fffdf8]",
  );
  const softPanelClass = cx(
    "rounded-2xl border transition-colors duration-300",
    isDark ? "border-[#43372a] bg-[#181411]" : "border-[#e3d9c7] bg-[#f7f1e8]",
  );
  const accentTextClass = isDark ? "text-[#d2ab55]" : "text-amber-800";
  const accentBorderClass = isDark ? "border-[#d2ab55]" : "border-amber-800";
  const accentButtonClass = cx(
    "transition-colors",
    isDark
      ? "border border-[#d2ab55] bg-[#d2ab55] text-[#1a140b] hover:border-[#e1bf68] hover:bg-[#e1bf68]"
      : "border border-amber-800 bg-amber-800 text-white hover:border-amber-900 hover:bg-amber-900",
  );
  const primaryTextClass = isDark ? "text-[#fff6eb]" : "text-[#17130e]";
  const mutedClass = isDark ? "text-[#cabdab]" : "text-[#6f6658]";
  const subduedClass = isDark ? "text-[#a89985]" : "text-[#8f8372]";
  const secondaryButtonClass = isDark
    ? "border-[#43372a] text-[#cabdab] hover:border-[#6a5842] hover:bg-[#1a1510] hover:text-[#fff6eb]"
    : "border-[#d7ccb7] text-[#6f6658] hover:border-amber-700/40 hover:text-amber-900";
  const inputShellClass = cx(softPanelClass, "border-dashed");
  const selectClass = cx(
    "rounded-sm border px-4 py-2 text-sm outline-none transition-colors",
    isDark
      ? "border-[#4a3d2f] bg-[#120f0b] text-[#fff6eb] focus:border-[#d2ab55]"
      : "border-[#d7ccb7] bg-[#fffdf8] text-[#17130e] focus:border-amber-700",
  );
  const logoClass = cx(playfair.className, "select-none text-[2rem] font-medium uppercase tracking-[0.32em]");
  const headingClass = playfair.className;
  const pillClass = (active: boolean) =>
    cx("rounded-full px-4 py-2 text-sm", active ? `${accentButtonClass} font-semibold` : cx("border", secondaryButtonClass));
  const squareButtonClass = (active: boolean) =>
    cx("rounded-sm border px-4 py-3 text-sm transition-colors", active ? `${accentButtonClass} font-semibold` : secondaryButtonClass);

  const pageStyle = { fontFamily: "var(--font-geist-sans), system-ui, sans-serif" };

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  const resetAnalysisFeedback = () => {
    setResult(null);
    setAnalysisError(null);
    setFollowUpAnswer("");
  };

  const updatePersonalPhoto = (field: keyof PersonalPhotoSet, value: string | null) => {
    setPersonalPhotos((currentPhotos) => ({ ...currentPhotos, [field]: value }));
    resetAnalysisFeedback();
  };

  const updateUserProfile = <Key extends keyof UserProfileInput>(
    field: Key,
    value: UserProfileInput[Key],
  ) => {
    setUserProfile((currentProfile) => ({ ...currentProfile, [field]: value }));
    setAccount((currentAccount) =>
      currentAccount.accessMode === "member"
        ? { ...currentAccount, onboardingComplete: true }
        : currentAccount,
    );
    resetAnalysisFeedback();
  };

  async function onSingleImage(
    event: ChangeEvent<HTMLInputElement>,
    setter: (value: string | null) => void,
  ) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setter(await readFileAsDataUrl(file));
    resetAnalysisFeedback();
    event.target.value = "";
  }

  async function onPersonalPhotoUpload(
    event: ChangeEvent<HTMLInputElement>,
    field: keyof PersonalPhotoSet,
  ) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    updatePersonalPhoto(field, await readFileAsDataUrl(file));
    event.target.value = "";
  }

  async function onOutfitImage(event: ChangeEvent<HTMLInputElement>, index: number) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const dataUrl = await readFileAsDataUrl(file);
    setOutfits((currentOutfits) =>
      currentOutfits.map((item, currentIndex) => (currentIndex === index ? dataUrl : item)),
    );
    resetAnalysisFeedback();
    event.target.value = "";
  }

  async function onWardrobeUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, MAX_WARDROBE_ITEMS - wardrobeItems.length);
    if (files.length === 0) {
      return;
    }

    const startingIndex = wardrobeItems.length;
    const nextItems = await Promise.all(
      files.map(async (file, index) => ({
        id: `${Date.now()}-${startingIndex + index}`,
        image: await readFileAsDataUrl(file),
        label: inferWardrobeLabel(file.name, startingIndex + index),
        category: inferWardrobeCategory(file.name),
      })),
    );

    setWardrobeItems((currentItems) => [...currentItems, ...nextItems]);
    resetAnalysisFeedback();
    event.target.value = "";
  }

  function updateWardrobeItem(
    itemId: string,
    field: "label" | "category",
    value: string,
  ) {
    setWardrobeItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId
          ? { ...item, [field]: field === "category" ? (value as WardrobeCategory) : value.slice(0, 80) }
          : item,
      ),
    );
    resetAnalysisFeedback();
  }

  function removeWardrobeItem(itemId: string) {
    setWardrobeItems((currentItems) => currentItems.filter((item) => item.id !== itemId));
    resetAnalysisFeedback();
  }

  async function onTryOnUpload(
    event: ChangeEvent<HTMLInputElement>,
    field: "personPhoto" | "uploadedGarmentImage",
  ) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const dataUrl = await readFileAsDataUrl(file);
    setTryOnDraft((currentDraft) => ({
      ...currentDraft,
      [field]: dataUrl,
      personPhotoSource: field === "personPhoto" ? "upload" : currentDraft.personPhotoSource,
    }));
    event.target.value = "";
  }

  function setTryOnPersonSource(source: TryOnDraft["personPhotoSource"]) {
    setTryOnDraft((currentDraft) => ({
      ...currentDraft,
      personPhotoSource: source,
      personPhoto:
        source === "upload"
          ? currentDraft.personPhoto
          : source === "profile-selfie"
            ? personalPhotos.selfie
            : source === "profile-face-scan"
              ? personalPhotos.faceScan
              : personalPhotos.bodyPhoto,
    }));
  }

  async function runAnalysis(clarification = "") {
    if (!canAnalyze) {
      return;
    }

    setLoading(true);
    setAnalysisError(null);
    if (!clarification) {
      setResult(null);
    }

    try {
      const requestBody: AnalyzeRequestBody = {
        language,
        mode,
        occasion,
        customOccasion,
        groupMode,
        targetPersonNote,
        followUpAnswer: clarification,
        profile: userProfile,
        appearanceAttributes,
        personalPhotos,
        currentLookImage,
        outfitImages: uploadedOutfitImages,
        itemCheckImage,
        wardrobeItems,
      };

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const data = (await response.json().catch(() => null)) as
        | AnalysisResult
        | { error?: string }
        | null;

      if (!response.ok || !data || ("error" in data && data.error) || !isAnalysisResult(data)) {
        throw new Error(
          data && "error" in data
            ? data.error || "Unable to analyze the image right now."
            : "Unable to analyze the image right now.",
        );
      }

      setResult(data);
      setFollowUpAnswer("");
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : "Unable to analyze the image right now.");
    } finally {
      setLoading(false);
    }
  }

  function renderLanguageSwitcher() {
    return (
      <label className="block">
        <span className="sr-only">{dictionary.common.language}</span>
        <select
          value={language}
          aria-label={dictionary.common.language}
          onChange={(event) => {
            if (isSupportedLanguage(event.target.value)) {
              setLanguage(event.target.value);
            }
          }}
          className={selectClass}
        >
          {LANGUAGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  function renderResultsPanel() {
    return (
      <div className={cx(panelClass, "rounded-[1.5rem] p-6")}>
        <div className={cx("text-[11px] uppercase tracking-[0.22em]", accentTextClass)}>
          {dictionary.common.results}
        </div>
        <h2 className={cx(headingClass, "mt-3 text-4xl")}>{dictionary.resultsSection.title}</h2>

        <div className="mt-8 grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
          <div className={cx("rounded-2xl p-4", isDark ? "bg-[#181411]" : "border border-[#e3d9c7] bg-[#f7f1e8]")}>
            {displayImage ? (
              <img
                src={displayImage}
                alt={
                  showWinningOutfit
                    ? result?.winningOutfitLabel ?? dictionary.resultsSection.winningOutfit
                    : mode === "look"
                      ? "Result preview"
                      : "Item preview"
                }
                className="h-[420px] w-full rounded-2xl object-cover"
              />
            ) : (
              <div className={cx("flex h-[420px] items-center justify-center rounded-2xl text-center text-sm", mutedClass)}>
                {mode === "buy" ? extra.uploadItemFirst : hasWardrobe ? extra.uploadLookOrWardrobeFirst : extra.uploadLookFirst}
              </div>
            )}

            {showWinningOutfit ? (
              <div className={cx("mt-4 rounded-xl border px-4 py-3 text-sm", isDark ? "border-[#4b3d2e] bg-[#120f0b]" : "border-[#e2d6c3] bg-[#fffaf1]")}>
                <div className={cx("text-[11px] uppercase tracking-[0.18em]", accentTextClass)}>
                  {dictionary.resultsSection.winningOutfit}
                </div>
                <div className={cx("mt-2 font-semibold", primaryTextClass)}>{result?.winningOutfitLabel}</div>
                <p className={cx("mt-2", mutedClass)}>{result?.winningReason}</p>
              </div>
            ) : null}
          </div>

          <div aria-live="polite">
            {!result ? (
              <div className="flex min-h-[420px] flex-col justify-center">
                <div className={cx("text-[11px] uppercase tracking-[0.22em]", accentTextClass)}>
                  {dictionary.resultsSection.emptyEyebrow}
                </div>
                <div className={cx(headingClass, "mt-4 text-3xl")}>{dictionary.resultsSection.emptyTitle}</div>
                <ul className={cx("mt-6 space-y-3 text-base", mutedClass)}>
                  {dictionary.resultsSection.emptyItems.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div>
                <div className={cx(softPanelClass, "p-5")}>
                  <div className={cx("text-[11px] uppercase tracking-[0.22em]", accentTextClass)}>
                    {dictionary.resultsSection.overallAssessment}
                  </div>
                  <h3 className={cx(headingClass, "mt-3 text-4xl leading-tight")}>{result.assessment}</h3>
                  <p className={cx("mt-3", mutedClass)}>{result.rationale}</p>
                </div>

                <div className="mt-6 space-y-4">
                  <Score
                    isDark={isDark}
                    label={mode === "buy" ? dictionary.resultsSection.scores.visualAppeal : dictionary.resultsSection.scores.confidence}
                    value={result.confidence}
                  />
                  <Score
                    isDark={isDark}
                    label={mode === "buy" ? dictionary.resultsSection.scores.worthBuying : dictionary.resultsSection.scores.outfitStrength}
                    value={result.outfit}
                  />
                  {mode === "look" ? (
                    <Score isDark={isDark} label={dictionary.resultsSection.scores.grooming} value={result.grooming} />
                  ) : null}
                  <Score isDark={isDark} label={dictionary.resultsSection.scores.colorHarmony} value={result.color} />
                  <Score
                    isDark={isDark}
                    label={mode === "buy" ? dictionary.resultsSection.scores.versatility : dictionary.resultsSection.scores.occasionFit}
                    value={result.occasion}
                  />
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  <div className={cx("rounded-2xl p-4", isDark ? "bg-[#181411]" : "border border-[#e3d9c7] bg-[#f7f1e8]")}>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-emerald-500">{dictionary.resultsSection.strongPoints}</div>
                    <ul className={cx("mt-3 space-y-2 text-sm", mutedClass)}>
                      {result.strongPoints.map((item) => (
                        <li key={item} className="flex gap-3">
                          <span className="text-emerald-500">+</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={cx("rounded-2xl p-4", isDark ? "bg-[#181411]" : "border border-[#e3d9c7] bg-[#f7f1e8]")}>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-red-500">{dictionary.resultsSection.areasToRefine}</div>
                    <ul className={cx("mt-3 space-y-2 text-sm", mutedClass)}>
                      {visibleAreasToRefine.map((item) => (
                        <li key={item} className="flex gap-3">
                          <span className="text-red-500">-</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className={cx("mt-4 rounded-2xl p-4", isDark ? "bg-[#221a13]" : "border border-amber-200 bg-amber-50")}>
                  <div className={cx("text-[11px] uppercase tracking-[0.18em]", accentTextClass)}>
                    {dictionary.resultsSection.recommendedImprovements}
                  </div>
                  <ul className={cx("mt-3 space-y-2 text-sm", mutedClass)}>
                    {result.recommendedImprovements.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className={accentTextClass}>&gt;</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {showFollowUp ? (
                  <div className={cx("mt-4 rounded-2xl p-4", isDark ? "bg-[#181411]" : "border border-[#e3d9c7] bg-[#f7f1e8]")}>
                    <div className={cx("text-[11px] uppercase tracking-[0.18em]", accentTextClass)}>
                      {dictionary.resultsSection.clarificationNeeded}
                    </div>
                    <p className={cx("mt-3 text-sm leading-7", mutedClass)}>{result.followUpQuestion}</p>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <input
                        type="text"
                        value={followUpAnswer}
                        onChange={(event) => setFollowUpAnswer(event.target.value)}
                        placeholder={dictionary.resultsSection.followUpPlaceholder}
                        className={cx(
                          "min-w-0 flex-1 rounded-xl border px-4 py-3 text-sm outline-none transition-colors",
                          isDark
                            ? "border-[#4a3d2f] bg-[#120f0b] text-[#fff6eb] placeholder:text-[#8f8170] focus:border-[#d2ab55]"
                            : "border-[#d7ccb7] bg-[#fffdf8] text-[#17130e] placeholder:text-[#8f8372] focus:border-amber-700",
                        )}
                      />
                      <button
                        type="button"
                        disabled={!canSubmitFollowUp}
                        onClick={() => runAnalysis(followUpAnswer)}
                        className={cx("rounded-sm px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] disabled:cursor-not-allowed disabled:opacity-50", accentButtonClass)}
                      >
                        {dictionary.resultsSection.submit}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  function renderProfileSection() {
    return (
      <div className="space-y-6">
        <div className={cx(panelClass, "rounded-[1.5rem] p-6")}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <div className={cx("text-[11px] uppercase tracking-[0.18em]", accentTextClass)}>
                {extra.accountTitle}
              </div>
              <h2 className={cx(headingClass, "mt-3 text-4xl")}>{accountLabel}</h2>
              <p className={cx("mt-3 text-sm leading-7", mutedClass)}>
                {extra.tabsDescription.profile}
              </p>
            </div>
            <div
              className={cx(
                "rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.16em]",
                accentBorderClass,
                accentTextClass,
              )}
            >
              {account.authProvider ?? extra.guestMode}
            </div>
          </div>
        </div>

        <div className={cx(panelClass, "rounded-[1.5rem] p-6")}>
          <div className={cx("text-[11px] uppercase tracking-[0.16em]", subduedClass)}>
            {dictionary.demoSection.currentLook}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className={cx("mb-2 block text-sm", mutedClass)}>Height (cm)</span>
              <input
                type="text"
                inputMode="numeric"
                value={userProfile.heightCm}
                onChange={(event) => updateUserProfile("heightCm", event.target.value)}
                className={cx(
                  "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors",
                  isDark
                    ? "border-[#4a3d2f] bg-[#120f0b] text-[#fff6eb] focus:border-[#d2ab55]"
                    : "border-[#d7ccb7] bg-[#fffdf8] text-[#17130e] focus:border-amber-700",
                )}
              />
            </label>
            <label className="block">
              <span className={cx("mb-2 block text-sm", mutedClass)}>Weight (kg)</span>
              <input
                type="text"
                inputMode="numeric"
                value={userProfile.weightKg}
                onChange={(event) => updateUserProfile("weightKg", event.target.value)}
                className={cx(
                  "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors",
                  isDark
                    ? "border-[#4a3d2f] bg-[#120f0b] text-[#fff6eb] focus:border-[#d2ab55]"
                    : "border-[#d7ccb7] bg-[#fffdf8] text-[#17130e] focus:border-amber-700",
                )}
              />
            </label>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className={cx("mb-2 block text-sm", mutedClass)}>Style goal</span>
              <input
                type="text"
                value={userProfile.styleGoal}
                placeholder="Example: sharper evening looks with cleaner proportions"
                onChange={(event) => updateUserProfile("styleGoal", event.target.value)}
                className={cx(
                  "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors",
                  isDark
                    ? "border-[#4a3d2f] bg-[#120f0b] text-[#fff6eb] placeholder:text-[#8f8170] focus:border-[#d2ab55]"
                    : "border-[#d7ccb7] bg-[#fffdf8] text-[#17130e] placeholder:text-[#8f8372] focus:border-amber-700",
                )}
              />
            </label>
            <label className="block">
              <span className={cx("mb-2 block text-sm", mutedClass)}>Preferred fit</span>
              <select
                value={userProfile.preferredFit}
                onChange={(event) => updateUserProfile("preferredFit", event.target.value as FitPreference)}
                className={cx(selectClass, "w-full")}
              >
                <option value="">{extra.pendingValue}</option>
                {FIT_PREFERENCES.map((fit) => (
                  <option key={fit} value={fit}>
                    {extra.fitOptions[fit]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4">
            <div className={cx("mb-3 text-sm", mutedClass)}>Preferred occasions</div>
            <div className="flex flex-wrap gap-2">
              {OCCASION_ORDER.map((option) => {
                const active = userProfile.preferredOccasions.includes(option);

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() =>
                      updateUserProfile(
                        "preferredOccasions",
                        active
                          ? userProfile.preferredOccasions.filter((item) => item !== option)
                          : [...userProfile.preferredOccasions, option],
                      )
                    }
                    className={pillClass(active)}
                  >
                    {dictionary.demoSection.occasionLabels[option]}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="mt-4 block">
            <span className={cx("mb-2 block text-sm", mutedClass)}>Notes</span>
            <textarea
              value={userProfile.notes}
              rows={3}
              maxLength={240}
              placeholder="Example: I like clean tailoring, darker neutrals, and minimal branding."
              onChange={(event) => updateUserProfile("notes", event.target.value)}
              className={cx(
                "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors placeholder:transition-colors",
                isDark
                  ? "border-[#4a3d2f] bg-[#120f0b] text-[#fff6eb] placeholder:text-[#8f8170] focus:border-[#d2ab55]"
                  : "border-[#d7ccb7] bg-[#fffdf8] text-[#17130e] placeholder:text-[#8f8372] focus:border-amber-700",
              )}
            />
          </label>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className={cx(panelClass, "rounded-[1.5rem] p-5")}>
            <div className={cx("font-semibold", accentTextClass)}>Personal profile photos</div>
            <p className={cx("mt-1 text-sm leading-7", mutedClass)}>
              Keep these separate from outfit analysis and use them only when explicitly selected.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {(
                [
                  ["selfie", "Profile selfie", personalPhotos.selfie],
                  ["faceScan", "Face scan", personalPhotos.faceScan],
                  ["bodyPhoto", "Body photo", personalPhotos.bodyPhoto],
                ] as Array<[keyof PersonalPhotoSet, string, string | null]>
              ).map(([field, label, value]) => (
                <label key={field} className={cx(inputShellClass, "cursor-pointer p-3")}>
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => onPersonalPhotoUpload(event, field)} />
                  {value ? (
                    <img src={value} alt={label} className="h-28 w-full rounded-xl object-cover" />
                  ) : (
                    <div className={cx("flex h-28 items-center justify-center text-center text-sm", mutedClass)}>{label}</div>
                  )}
                </label>
              ))}
            </div>
          </div>

          <div className={cx(panelClass, "rounded-[1.5rem] p-5")}>
            <div className={cx("font-semibold", accentTextClass)}>Prepared appearance attributes</div>
            <p className={cx("mt-1 text-sm leading-7", mutedClass)}>
              These stay ready for later AI extraction and database storage.
            </p>
            <div className="mt-4 space-y-2 text-sm">
              {APPEARANCE_FIELDS.map((key) => (
                <div
                  key={key}
                  className={cx(
                    "flex items-center justify-between gap-3 rounded-xl border px-3 py-2",
                    isDark ? "border-[#4a3d2f] bg-[#181411]" : "border-[#ddd3c1] bg-[#fcfaf5]",
                  )}
                >
                  <span className={mutedClass}>{extra.appearanceLabels[key]}</span>
                  <span className={accentTextClass}>{appearanceAttributes[key] || extra.pendingValue}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderWardrobeSection() {
    const suggestionItems = result?.wardrobeSuggestions.length ? result.wardrobeSuggestions : localWardrobeSuggestions;

    return (
      <div className="space-y-6">
        <div className={cx(panelClass, "rounded-[1.5rem] p-6")}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-xl">
              <div className={cx("font-semibold", accentTextClass)}>{dictionary.demoSection.wardrobeTitle}</div>
              <p className={cx("mt-1 text-sm leading-7", mutedClass)}>{dictionary.demoSection.wardrobeDescription}</p>
            </div>
            <label className={cx("cursor-pointer rounded-sm px-4 py-2 text-sm font-semibold", accentButtonClass)}>
              <input type="file" accept="image/*" multiple className="hidden" onChange={onWardrobeUpload} />
              {dictionary.demoSection.wardrobeUpload}
            </label>
          </div>
          <p className={cx("mt-3 text-xs leading-6", subduedClass)}>{dictionary.demoSection.wardrobeHint}</p>

          {wardrobeItems.length > 0 ? (
            <div className="mt-4 grid gap-3">
              {wardrobeItems.map((item) => (
                <div key={item.id} className={cx("rounded-2xl border p-3", isDark ? "border-[#4a3d2f] bg-[#120f0b]" : "border-[#ddd3c1] bg-[#fffdf8]")}>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <img src={item.image} alt={item.label} className="h-24 w-full rounded-xl object-cover sm:w-24" />
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className={cx("text-sm font-semibold", primaryTextClass)}>{item.label}</div>
                        <button type="button" onClick={() => removeWardrobeItem(item.id)} className={cx("text-xs uppercase tracking-[0.14em] transition-colors", mutedClass, "hover:text-inherit")}>
                          {extra.remove}
                        </button>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <input
                          type="text"
                          value={item.label}
                          placeholder={extra.itemLabelPlaceholder}
                          onChange={(event) => updateWardrobeItem(item.id, "label", event.target.value)}
                          className={cx(
                            "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors",
                            isDark
                              ? "border-[#4a3d2f] bg-[#181411] text-[#fff6eb] placeholder:text-[#8f8170] focus:border-[#d2ab55]"
                              : "border-[#d7ccb7] bg-[#fffdf8] text-[#17130e] placeholder:text-[#8f8372] focus:border-amber-700",
                          )}
                        />
                        <select value={item.category} onChange={(event) => updateWardrobeItem(item.id, "category", event.target.value)} className={cx(selectClass, "w-full")}>
                          {WARDROBE_CATEGORIES.map((category) => (
                            <option key={category} value={category}>
                              {dictionary.demoSection.wardrobeCategoryLabels[category]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={cx("mt-4 rounded-2xl border border-dashed px-4 py-5 text-sm", isDark ? "border-[#4a3d2f] bg-[#120f0b] text-[#cabdab]" : "border-[#ddd3c1] bg-[#fffdf8] text-[#6f6658]")}>
              {dictionary.demoSection.wardrobeSuggestionsEmpty}
            </div>
          )}
        </div>

        <div className={cx(panelClass, "rounded-[1.5rem] p-5")}>
          <div className={cx("text-[11px] uppercase tracking-[0.18em]", accentTextClass)}>{extra.wardrobeQuickTitle}</div>
          {suggestionItems.length > 0 ? (
            <ul className={cx("mt-4 space-y-2 text-sm", mutedClass)}>
              {suggestionItems.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className={accentTextClass}>+</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={cx("mt-4 text-sm leading-7", mutedClass)}>{extra.wardrobeQuickEmpty}</p>
          )}
        </div>
      </div>
    );
  }

  function renderTryOnSection() {
    return (
      <div className="space-y-6">
        <div className={cx(panelClass, "rounded-[1.5rem] p-6")}>
          <div className={cx("font-semibold", accentTextClass)}>{extra.tabs["try-on"]}</div>
          <p className={cx("mt-1 text-sm leading-7", mutedClass)}>{extra.tabsDescription["try-on"]}</p>

          <label className="mt-4 block">
            <span className={cx("mb-2 block text-sm", mutedClass)}>{extra.tryOnSourceLabel}</span>
            <select value={tryOnDraft.personPhotoSource} onChange={(event) => setTryOnPersonSource(event.target.value as TryOnDraft["personPhotoSource"])} className={cx(selectClass, "w-full")}>
              {Object.entries(extra.tryOnSourceOptions).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className={cx(inputShellClass, "flex cursor-pointer flex-col items-center justify-center p-4 text-center", tryOnDraft.personPhotoSource === "upload" ? "" : "cursor-default")}>
              <input type="file" accept="image/*" className="hidden" disabled={tryOnDraft.personPhotoSource !== "upload"} onChange={(event) => onTryOnUpload(event, "personPhoto")} />
              {tryOnDisplayPhoto ? (
                <img src={tryOnDisplayPhoto} alt="Try-on person" className="h-32 w-full rounded-xl object-cover" />
              ) : (
                <div className={cx("flex h-32 items-center justify-center text-center text-sm", mutedClass)}>
                  {tryOnDraft.personPhotoSource === "upload" ? "Person photo" : extra.tryOnMissingProfilePhoto}
                </div>
              )}
            </label>

            <label className={cx(inputShellClass, "flex cursor-pointer flex-col items-center justify-center p-4 text-center")}>
              <input type="file" accept="image/*" className="hidden" onChange={(event) => onTryOnUpload(event, "uploadedGarmentImage")} />
              {tryOnDraft.uploadedGarmentImage ? (
                <img src={tryOnDraft.uploadedGarmentImage} alt="Garment upload" className="h-32 w-full rounded-xl object-cover" />
              ) : (
                <div className={cx("flex h-32 items-center justify-center text-center text-sm", mutedClass)}>Garment upload</div>
              )}
            </label>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <select
              value={tryOnDraft.selectedWardrobeItemId ?? ""}
              onChange={(event) =>
                setTryOnDraft((currentDraft) => ({
                  ...currentDraft,
                  selectedWardrobeItemId: event.target.value || null,
                }))
              }
              className={cx(selectClass, "w-full")}
            >
              <option value="">No wardrobe item selected</option>
              {wardrobeItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={tryOnDraft.note}
              placeholder="Example: show this jacket over my profile photo"
              onChange={(event) => setTryOnDraft((currentDraft) => ({ ...currentDraft, note: event.target.value }))}
              className={cx(
                "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors",
                isDark
                  ? "border-[#4a3d2f] bg-[#120f0b] text-[#fff6eb] placeholder:text-[#8f8170] focus:border-[#d2ab55]"
                  : "border-[#d7ccb7] bg-[#fffdf8] text-[#17130e] placeholder:text-[#8f8372] focus:border-amber-700",
              )}
            />
          </div>

          <div className={cx("mt-4 rounded-xl border px-4 py-3 text-sm", isDark ? "border-[#4a3d2f] bg-[#120f0b] text-[#d9ccbc]" : "border-[#ddd3c1] bg-[#fffdf8] text-[#6f6658]")}>
            <span className={accentTextClass}>{extra.futureReadyLabel}:</span> {extra.futureReadyText}
          </div>
        </div>
      </div>
    );
  }

  function renderAnalyzeSection() {
    return (
      <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <div className={cx(panelClass, "overflow-hidden rounded-[1.5rem]")}>
          <div
            className={cx(
              "flex items-center justify-between border-b px-5 py-4",
              isDark ? "border-[#2b241b] bg-[#181411]" : "border-[#ddd3c1] bg-[#f7f1e8]",
            )}
          >
            <div className={cx(playfair.className, "text-sm uppercase tracking-[0.22em]")}>
              <span className={primaryTextClass}>MIR</span>
              <span className={accentTextClass}>O</span>
              <span className={primaryTextClass}>R</span>
            </div>
            <div className={mutedClass}>{dictionary.common.demo}</div>
          </div>

          <div className="space-y-6 p-6">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setMode("look");
                  resetAnalysisFeedback();
                }}
                className={pillClass(mode === "look")}
              >
                {dictionary.demoSection.currentLook}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("buy");
                  resetAnalysisFeedback();
                }}
                className={pillClass(mode === "buy")}
              >
                {dictionary.demoSection.buyThis}
              </button>
            </div>

            {mode === "look" ? (
              <>
                <label className={cx(inputShellClass, "flex cursor-pointer flex-col items-center justify-center p-6 text-center")}>
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => onSingleImage(event, setCurrentLookImage)} />
                  {currentLookImage ? (
                    <img src={currentLookImage} alt="Uploaded look" className="h-56 w-full rounded-xl object-cover" />
                  ) : (
                    <>
                      <div className={cx("text-[10px] uppercase tracking-[0.18em]", accentTextClass)}>{extra.currentLookLabel}</div>
                      <div className={cx("mt-3 text-base font-semibold", primaryTextClass)}>{extra.currentLookLabel}</div>
                      <div className={cx("mt-2 text-sm", mutedClass)}>{extra.currentLookPlaceholder}</div>
                    </>
                  )}
                </label>

                <div className={cx(softPanelClass, "p-4")}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className={cx("font-semibold", accentTextClass)}>{dictionary.demoSection.groupMode}</div>
                      <div className={cx("mt-1 text-sm", mutedClass)}>{dictionary.demoSection.groupModeDescription}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setGroupMode((currentValue) => !currentValue);
                        resetAnalysisFeedback();
                      }}
                      className={cx("rounded-sm px-4 py-2 text-sm", groupMode ? `${accentButtonClass} font-semibold` : cx("border", accentBorderClass, accentTextClass))}
                    >
                      {groupMode ? "On" : "Off"}
                    </button>
                  </div>

                  {groupMode ? (
                    <textarea
                      value={targetPersonNote}
                      onChange={(event) => {
                        setTargetPersonNote(event.target.value);
                        resetAnalysisFeedback();
                      }}
                      rows={3}
                      maxLength={240}
                      placeholder={dictionary.demoSection.targetPersonPlaceholder}
                      className={cx(
                        "mt-4 w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors",
                        isDark
                          ? "border-[#4a3d2f] bg-[#120f0b] text-[#fff6eb] placeholder:text-[#8f8170] focus:border-[#d2ab55]"
                          : "border-[#d7ccb7] bg-[#fffdf8] text-[#17130e] placeholder:text-[#8f8372] focus:border-amber-700",
                      )}
                    />
                  ) : null}
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {[0, 1, 2].map((index) => (
                    <label key={index} className={cx(inputShellClass, "cursor-pointer p-3")}>
                      <input type="file" accept="image/*" className="hidden" onChange={(event) => onOutfitImage(event, index)} />
                      {outfits[index] ? (
                        <img src={outfits[index] ?? ""} alt={`Outfit option ${index + 1}`} className="h-32 w-full rounded-xl object-cover" />
                      ) : (
                        <div className={cx("flex h-32 items-center justify-center text-center text-sm", mutedClass)}>Outfit {index + 1}</div>
                      )}
                    </label>
                  ))}
                </div>
              </>
            ) : (
              <label className={cx(inputShellClass, "flex cursor-pointer flex-col items-center justify-center p-6 text-center")}>
                <input type="file" accept="image/*" className="hidden" onChange={(event) => onSingleImage(event, setItemCheckImage)} />
                {itemCheckImage ? (
                  <img src={itemCheckImage} alt="Item to buy" className="h-56 w-full rounded-xl object-cover" />
                ) : (
                  <>
                    <div className={cx("text-[10px] uppercase tracking-[0.18em]", accentTextClass)}>{dictionary.demoSection.productImage}</div>
                    <div className={cx("mt-3 text-base font-semibold", primaryTextClass)}>{dictionary.demoSection.uploadItemTitle}</div>
                    <div className={cx("mt-2 text-sm", mutedClass)}>{dictionary.demoSection.uploadItemDescription}</div>
                  </>
                )}
              </label>
            )}

            <div className={cx(softPanelClass, "p-4")}>
              <div className={cx("text-[11px] uppercase tracking-[0.16em]", subduedClass)}>{extra.accountTitle}</div>
              <div className={cx("mt-2 font-semibold", primaryTextClass)}>{accountLabel}</div>
              <p className={cx("mt-2 text-sm leading-7", mutedClass)}>{extra.tabsDescription.analyze}</p>
            </div>

            <div>
              <div className={cx("mb-3 text-sm", mutedClass)}>
                {mode === "buy" ? dictionary.demoSection.intendedOccasion : dictionary.demoSection.occasion}
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {OCCASION_ORDER.map((key) => (
                  <button key={key} type="button" onClick={() => setOccasion(key)} className={squareButtonClass(occasion === key)}>
                    {dictionary.demoSection.occasionLabels[key]}
                  </button>
                ))}
              </div>
            </div>

            {occasion === "custom" ? (
              <input
                type="text"
                value={customOccasion}
                onChange={(event) => setCustomOccasion(event.target.value)}
                placeholder={dictionary.demoSection.customOccasionPlaceholder}
                className={cx(
                  "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors",
                  isDark
                    ? "border-[#4a3d2f] bg-[#120f0b] text-[#fff6eb] placeholder:text-[#8f8170] focus:border-[#d2ab55]"
                    : "border-[#d7ccb7] bg-[#fffdf8] text-[#17130e] placeholder:text-[#8f8372] focus:border-amber-700",
                )}
              />
            ) : null}

            <button
              type="button"
              disabled={!canAnalyze || loading}
              onClick={() => runAnalysis()}
              className={cx("w-full rounded-sm px-5 py-4 font-semibold uppercase tracking-[0.12em] disabled:cursor-not-allowed disabled:opacity-50", accentButtonClass)}
            >
              {loading ? "Analyzing..." : mode === "look" ? dictionary.demoSection.analyzeLook : dictionary.demoSection.analyzeItem}
            </button>

            {analysisError ? (
              <div className={cx("rounded-xl border px-4 py-3 text-sm", isDark ? "border-red-400/30 bg-red-400/10 text-red-200" : "border-red-200 bg-red-50 text-red-700")}>
                {analysisError}
              </div>
            ) : null}
          </div>
        </div>

        {renderResultsPanel()}
      </div>
    );
  }

  function renderPricingSection() {
    return (
      <div className="space-y-6">
        <div className={cx(panelClass, "rounded-[1.5rem] p-6")}>
          <div className={cx("text-[11px] uppercase tracking-[0.18em]", accentTextClass)}>{dictionary.common.pricing}</div>
          <h2 className={cx(headingClass, "mt-3 text-4xl")}>{extra.tabs.pricing}</h2>
          <p className={cx("mt-3 max-w-3xl text-sm leading-7", mutedClass)}>{extra.tabsDescription.pricing}</p>
        </div>
        <PricingGrid isDark={isDark} language={language} onFreePlanClick={() => setActiveSection("analyze")} />
      </div>
    );
  }

  function renderSettingsSection() {
    return (
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className={cx(panelClass, "rounded-[1.5rem] p-6")}>
          <div className={cx("text-[11px] uppercase tracking-[0.18em]", accentTextClass)}>{extra.tabs.settings}</div>
          <p className={cx("mt-3 text-sm leading-7", mutedClass)}>{extra.tabsDescription.settings}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={toggleTheme} className={cx("rounded-sm border px-4 py-2 text-sm", accentBorderClass, accentTextClass)}>
              {isDark ? dictionary.common.whiteMode : dictionary.common.blackMode}
            </button>
            <Link href="/auth" className={cx("rounded-sm px-4 py-2 text-sm font-semibold", accentButtonClass)}>
              {extra.openAuth}
            </Link>
            <button type="button" onClick={() => setAccount(createEmptyAccountState())} className={cx("rounded-sm border px-4 py-2 text-sm", secondaryButtonClass)}>
              {extra.signOut}
            </button>
          </div>
        </div>

        <div className={cx(panelClass, "rounded-[1.5rem] p-6")}>
          <div className={cx("text-[11px] uppercase tracking-[0.18em]", accentTextClass)}>Supabase</div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className={cx(softPanelClass, "p-4")}>
              <div className={cx("text-[11px] uppercase tracking-[0.16em]", subduedClass)}>{extra.tablesLabel}</div>
              <ul className={cx("mt-3 space-y-2 text-sm", mutedClass)}>
                {MIROR_SUPABASE_PLAN.tables.map((table) => (
                  <li key={table}>{table}</li>
                ))}
              </ul>
            </div>
            <div className={cx(softPanelClass, "p-4")}>
              <div className={cx("text-[11px] uppercase tracking-[0.16em]", subduedClass)}>{extra.bucketsLabel}</div>
              <ul className={cx("mt-3 space-y-2 text-sm", mutedClass)}>
                {MIROR_SUPABASE_PLAN.storageBuckets.map((bucket) => (
                  <li key={bucket}>{bucket}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const content =
    activeSection === "profile"
      ? renderProfileSection()
      : activeSection === "wardrobe"
        ? renderWardrobeSection()
        : activeSection === "try-on"
          ? renderTryOnSection()
          : activeSection === "pricing"
            ? renderPricingSection()
            : activeSection === "settings"
              ? renderSettingsSection()
              : renderAnalyzeSection();

  return (
    <div className={wrapClass} style={pageStyle} dir={direction} lang={language}>
      <BackgroundDecor isDark={isDark} />
      <header className={cx("sticky top-0 z-40 border-b backdrop-blur-xl transition-colors duration-300", isDark ? "border-[#2b241b] bg-[#090806]/92" : "border-[#ddd3c1] bg-[#fcfaf5]/90")}>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <Link href="/" className={logoClass}>
            <span className={primaryTextClass}>MIR</span>
            <span className={accentTextClass}>O</span>
            <span className={primaryTextClass}>R</span>
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            {renderLanguageSwitcher()}
            <button type="button" onClick={toggleTheme} className={cx("rounded-sm border px-4 py-2 text-sm", accentBorderClass, accentTextClass)}>
              {isDark ? dictionary.common.whiteMode : dictionary.common.blackMode}
            </button>
            <Link href="/auth" className={cx("rounded-sm px-5 py-2.5 text-sm font-semibold", accentButtonClass)}>
              {extra.openAuth}
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <div className={cx("inline-flex border px-4 py-2 text-[11px] uppercase tracking-[0.24em]", accentBorderClass, accentTextClass)}>
              {accountLabel}
            </div>
            <h1 className={cx(headingClass, "mt-6 text-5xl leading-[0.96] md:text-6xl")}>{extra.tabs[activeSection]}</h1>
            <p className={cx("mt-4 max-w-3xl text-lg leading-8", mutedClass)}>{extra.tabsDescription[activeSection]}</p>
          </div>

          <div className="grid gap-8 xl:grid-cols-[280px_1fr]">
            <aside className={cx(panelClass, "h-fit rounded-[1.5rem] p-5 xl:sticky xl:top-28")}>
              <div className={cx("text-[11px] uppercase tracking-[0.18em]", accentTextClass)}>{extra.accountTitle}</div>
              <div className={cx("mt-3 text-sm leading-7", mutedClass)}>{extra.accountDescription}</div>
              <div className="mt-6 space-y-2">
                {WORKSPACE_SECTIONS.map((section) => (
                  <button key={section} type="button" onClick={() => setActiveSection(section)} className={cx("w-full rounded-2xl border px-4 py-3 text-left text-sm transition-colors", activeSection === section ? accentButtonClass : secondaryButtonClass)}>
                    {extra.tabs[section]}
                  </button>
                ))}
              </div>
            </aside>
            <section>{content}</section>
          </div>
        </div>
      </main>
    </div>
  );
}
