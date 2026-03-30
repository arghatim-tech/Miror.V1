"use client";

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
  FIT_PREFERENCES,
  WARDROBE_CATEGORIES,
  createEmptyAppearanceAttributes,
  createEmptyPersonalPhotoSet,
  createEmptyTryOnDraft,
  createEmptyUserProfile,
  type AppearanceAttributes,
  type FitPreference,
  type PersonalPhotoSet,
  type TryOnDraft,
  type UserProfileInput,
  type WardrobeCategory,
  type WardrobeItemInput,
} from "@/lib/miror-data";
import { Playfair_Display } from "next/font/google";
import { type ChangeEvent, useEffect, useState } from "react";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

type Theme = "dark" | "light";
type PageState = "home" | "pricing";
const LANGUAGE_STORAGE_KEY = "miror-language";
const THEME_STORAGE_KEY = "miror-theme";
const MAX_WARDROBE_ITEMS = 8;
const OCCASION_ORDER: Occasion[] = [
  "date",
  "party",
  "work",
  "wedding",
  "casual",
  "custom",
];
const SHOWCASE_OCCASIONS: Occasion[] = ["date", "party", "work", "casual"];
const APPEARANCE_FIELDS: Array<
  keyof Omit<AppearanceAttributes, "source">
> = [
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
const extraCopy: Record<
  Language,
  {
    enable: string;
    enabled: string;
    remove: string;
    itemLabel: string;
    itemLabelPlaceholder: string;
    buyMode: string;
    uploadLookFirst: string;
    uploadItemFirst: string;
    uploadLookOrWardrobeFirst: string;
    currentLookLabel: string;
    currentLookPlaceholder: string;
    profileTitle: string;
    profileDescription: string;
    measurementsLabel: string;
    heightLabel: string;
    weightLabel: string;
    styleGoalLabel: string;
    styleGoalPlaceholder: string;
    preferredFitLabel: string;
    preferredOccasionsLabel: string;
    notesLabel: string;
    notesPlaceholder: string;
    profilePhotosTitle: string;
    profilePhotosDescription: string;
    profileSelfieLabel: string;
    faceScanLabel: string;
    bodyPhotoLabel: string;
    uploadPlaceholder: string;
    appearanceTitle: string;
    appearanceDescription: string;
    pendingValue: string;
    fitOptions: Record<string, string>;
    appearanceLabels: Record<string, string>;
    tryOnTitle: string;
    tryOnDescription: string;
    personPhotoLabel: string;
    garmentUploadLabel: string;
    wardrobeChoiceLabel: string;
    noWardrobeOption: string;
    tryOnNoteLabel: string;
    tryOnNotePlaceholder: string;
    futureReadyLabel: string;
    futureReadyText: string;
    storagePlanTitle: string;
    tablesLabel: string;
    bucketsLabel: string;
  }
> = {
  en: {
    enable: "Enable",
    enabled: "Enabled",
    remove: "Remove",
    itemLabel: "Item label",
    itemLabelPlaceholder: "Example: navy blazer",
    buyMode: "Buy mode",
    uploadLookFirst: "Upload an image first",
    uploadItemFirst: "Upload an item first",
    uploadLookOrWardrobeFirst: "Upload a look or wardrobe item first",
    currentLookLabel: "Current look photo",
    currentLookPlaceholder: "Upload the outfit you are wearing now.",
    profileTitle: "User profile",
    profileDescription: "Save physical and style context now so MIROR can personalize fit, color, and purchase advice later.",
    measurementsLabel: "Measurements",
    heightLabel: "Height (cm)",
    weightLabel: "Weight (kg)",
    styleGoalLabel: "Style goal",
    styleGoalPlaceholder: "Example: sharper evening looks with cleaner proportions",
    preferredFitLabel: "Preferred fit",
    preferredOccasionsLabel: "Preferred occasions",
    notesLabel: "Optional notes",
    notesPlaceholder: "Example: I like clean tailoring, darker neutrals, and minimal branding.",
    profilePhotosTitle: "Personal profile photos",
    profilePhotosDescription: "Optional support photos for later profile analysis and smarter item checks.",
    profileSelfieLabel: "Profile selfie",
    faceScanLabel: "Face scan",
    bodyPhotoLabel: "Body photo",
    uploadPlaceholder: "Upload image",
    appearanceTitle: "Prepared appearance attributes",
    appearanceDescription: "These fields are ready for future AI extraction and later database storage.",
    pendingValue: "Pending analysis",
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
    tryOnTitle: "Try it on me",
    tryOnDescription: "This is a clean placeholder for a future virtual try-on flow. The state is ready, but the image generation step is not connected yet.",
    personPhotoLabel: "Person photo",
    garmentUploadLabel: "Garment upload",
    wardrobeChoiceLabel: "Or choose a wardrobe item",
    noWardrobeOption: "No wardrobe item selected",
    tryOnNoteLabel: "Try-on note",
    tryOnNotePlaceholder: "Example: show this jacket over my current profile photo",
    futureReadyLabel: "Future-ready",
    futureReadyText: "Prepared for a later image-generation API that can combine a person photo with a wardrobe item or uploaded garment.",
    storagePlanTitle: "Supabase-ready structure",
    tablesLabel: "Tables",
    bucketsLabel: "Buckets",
  },
  fr: {
    enable: "Activer",
    enabled: "Activé",
    remove: "Retirer",
    itemLabel: "Nom de la pièce",
    itemLabelPlaceholder: "Exemple : blazer marine",
    buyMode: "Mode achat",
    uploadLookFirst: "Téléchargez d'abord une image",
    uploadItemFirst: "Téléchargez d'abord un article",
    uploadLookOrWardrobeFirst: "Téléchargez d'abord un look ou une pièce du dressing",
    currentLookLabel: "Photo du look actuel",
    currentLookPlaceholder: "Téléchargez la tenue que vous portez maintenant.",
    profileTitle: "Profil utilisateur",
    profileDescription: "Enregistrez votre contexte physique et stylistique pour personnaliser ensuite la coupe, les couleurs et les achats.",
    measurementsLabel: "Mesures",
    heightLabel: "Taille (cm)",
    weightLabel: "Poids (kg)",
    styleGoalLabel: "Objectif de style",
    styleGoalPlaceholder: "Exemple : looks du soir plus nets avec de meilleures proportions",
    preferredFitLabel: "Coupe préférée",
    preferredOccasionsLabel: "Occasions préférées",
    notesLabel: "Notes optionnelles",
    notesPlaceholder: "Exemple : j'aime les coupes nettes, les neutres foncés et peu de logos.",
    profilePhotosTitle: "Photos de profil personnel",
    profilePhotosDescription: "Photos de support optionnelles pour une future analyse du profil et des recommandations d'achat plus intelligentes.",
    profileSelfieLabel: "Selfie du profil",
    faceScanLabel: "Scan du visage",
    bodyPhotoLabel: "Photo du corps",
    uploadPlaceholder: "Télécharger une image",
    appearanceTitle: "Attributs d'apparence préparés",
    appearanceDescription: "Ces champs sont prêts pour une future extraction IA et un stockage en base.",
    pendingValue: "Analyse en attente",
    fitOptions: {
      tailored: "Ajusté",
      regular: "Standard",
      relaxed: "Décontracté",
      slim: "Près du corps",
      oversized: "Oversize",
    },
    appearanceLabels: {
      approximateSkinTone: "Teint approximatif",
      eyeColor: "Couleur des yeux",
      hairColor: "Couleur des cheveux",
      faceShape: "Forme du visage",
      bodyFrameImpression: "Impression de carrure",
      contrastLevel: "Niveau de contraste",
    },
    tryOnTitle: "Essaie-le sur moi",
    tryOnDescription: "Ceci est un placeholder propre pour un futur essayage virtuel. L'état est prêt, mais la génération d'image n'est pas encore connectée.",
    personPhotoLabel: "Photo de la personne",
    garmentUploadLabel: "Téléchargement du vêtement",
    wardrobeChoiceLabel: "Ou choisir une pièce du dressing",
    noWardrobeOption: "Aucune pièce sélectionnée",
    tryOnNoteLabel: "Note d'essayage",
    tryOnNotePlaceholder: "Exemple : montre cette veste sur ma photo de profil actuelle",
    futureReadyLabel: "Prêt pour la suite",
    futureReadyText: "Préparé pour une future API de génération d'image qui combinera une photo de personne avec une pièce du dressing ou un vêtement téléchargé.",
    storagePlanTitle: "Structure prête pour Supabase",
    tablesLabel: "Tables",
    bucketsLabel: "Buckets",
  },
  es: {
    enable: "Activar",
    enabled: "Activado",
    remove: "Quitar",
    itemLabel: "Nombre de la prenda",
    itemLabelPlaceholder: "Ejemplo: blazer azul marino",
    buyMode: "Modo compra",
    uploadLookFirst: "Sube primero una imagen",
    uploadItemFirst: "Sube primero una prenda",
    uploadLookOrWardrobeFirst: "Sube primero un look o prendas del armario",
    currentLookLabel: "Foto del look actual",
    currentLookPlaceholder: "Sube el outfit que llevas ahora.",
    profileTitle: "Perfil de usuario",
    profileDescription: "Guarda contexto físico y de estilo para que MIROR pueda personalizar mejor ajuste, color y decisiones de compra más adelante.",
    measurementsLabel: "Medidas",
    heightLabel: "Altura (cm)",
    weightLabel: "Peso (kg)",
    styleGoalLabel: "Objetivo de estilo",
    styleGoalPlaceholder: "Ejemplo: looks de noche más pulidos con mejores proporciones",
    preferredFitLabel: "Ajuste preferido",
    preferredOccasionsLabel: "Ocasiones preferidas",
    notesLabel: "Notas opcionales",
    notesPlaceholder: "Ejemplo: me gustan los cortes limpios, neutros oscuros y poco branding.",
    profilePhotosTitle: "Fotos personales de perfil",
    profilePhotosDescription: "Fotos opcionales de apoyo para un futuro análisis del perfil y revisiones de compra más inteligentes.",
    profileSelfieLabel: "Selfie de perfil",
    faceScanLabel: "Escaneo facial",
    bodyPhotoLabel: "Foto corporal",
    uploadPlaceholder: "Subir imagen",
    appearanceTitle: "Atributos de apariencia preparados",
    appearanceDescription: "Estos campos están listos para una futura extracción por IA y almacenamiento en base de datos.",
    pendingValue: "Análisis pendiente",
    fitOptions: {
      tailored: "Entallado",
      regular: "Regular",
      relaxed: "Relajado",
      slim: "Slim",
      oversized: "Oversize",
    },
    appearanceLabels: {
      approximateSkinTone: "Tono de piel aproximado",
      eyeColor: "Color de ojos",
      hairColor: "Color de pelo",
      faceShape: "Forma del rostro",
      bodyFrameImpression: "Impresión de estructura corporal",
      contrastLevel: "Nivel de contraste",
    },
    tryOnTitle: "Pruébalo en mí",
    tryOnDescription: "Esto es un placeholder limpio para una futura prueba virtual. El estado ya está preparado, pero la generación de imagen aún no está conectada.",
    personPhotoLabel: "Foto de la persona",
    garmentUploadLabel: "Subir prenda",
    wardrobeChoiceLabel: "O elige una prenda del armario",
    noWardrobeOption: "Sin prenda seleccionada",
    tryOnNoteLabel: "Nota para la prueba",
    tryOnNotePlaceholder: "Ejemplo: muestra esta chaqueta sobre mi foto de perfil actual",
    futureReadyLabel: "Listo para el futuro",
    futureReadyText: "Preparado para una futura API de generación de imágenes que combine una foto de la persona con una prenda del armario o una prenda subida.",
    storagePlanTitle: "Estructura lista para Supabase",
    tablesLabel: "Tablas",
    bucketsLabel: "Buckets",
  },
  ar: {
    enable: "تفعيل",
    enabled: "مفعّل",
    remove: "إزالة",
    itemLabel: "اسم القطعة",
    itemLabelPlaceholder: "مثال: بليزر كحلي",
    buyMode: "وضع الشراء",
    uploadLookFirst: "ارفع صورة أولاً",
    uploadItemFirst: "ارفع قطعة أولاً",
    uploadLookOrWardrobeFirst: "ارفع إطلالة أو قطعة من الخزانة أولاً",
    currentLookLabel: "صورة الإطلالة الحالية",
    currentLookPlaceholder: "ارفع الإطلالة التي ترتديها الآن.",
    profileTitle: "ملف المستخدم",
    profileDescription: "احفظ السياق الجسدي والأسلوبي الآن حتى يتمكن MIROR لاحقاً من تخصيص المقاس والألوان وقرارات الشراء.",
    measurementsLabel: "القياسات",
    heightLabel: "الطول (سم)",
    weightLabel: "الوزن (كغ)",
    styleGoalLabel: "هدف الأسلوب",
    styleGoalPlaceholder: "مثال: إطلالات مسائية أكثر حدة مع نسب أنظف",
    preferredFitLabel: "القصّة المفضلة",
    preferredOccasionsLabel: "المناسبات المفضلة",
    notesLabel: "ملاحظات اختيارية",
    notesPlaceholder: "مثال: أحب الخياطة النظيفة، الدرجات الداكنة، وأقل قدر من الشعارات.",
    profilePhotosTitle: "صور الملف الشخصي",
    profilePhotosDescription: "صور داعمة اختيارية لتحليل الملف لاحقاً وجعل فحص الشراء أذكى.",
    profileSelfieLabel: "سيلفي الملف الشخصي",
    faceScanLabel: "مسح الوجه",
    bodyPhotoLabel: "صورة الجسم",
    uploadPlaceholder: "ارفع صورة",
    appearanceTitle: "سمات المظهر الجاهزة",
    appearanceDescription: "هذه الحقول جاهزة لاستخراج مستقبلي بالذكاء الاصطناعي وللتخزين في قاعدة البيانات.",
    pendingValue: "بانتظار التحليل",
    fitOptions: {
      tailored: "مفصّل",
      regular: "عادي",
      relaxed: "مريح",
      slim: "ضيّق",
      oversized: "واسع",
    },
    appearanceLabels: {
      approximateSkinTone: "درجة البشرة التقريبية",
      eyeColor: "لون العينين",
      hairColor: "لون الشعر",
      faceShape: "شكل الوجه",
      bodyFrameImpression: "انطباع البنية الجسدية",
      contrastLevel: "مستوى التباين",
    },
    tryOnTitle: "جرّبه عليّ",
    tryOnDescription: "هذا placeholder نظيف لميزة تجربة افتراضية لاحقة. الحالة البرمجية جاهزة لكن توليد الصورة غير موصول بعد.",
    personPhotoLabel: "صورة الشخص",
    garmentUploadLabel: "رفع القطعة",
    wardrobeChoiceLabel: "أو اختر قطعة من الخزانة",
    noWardrobeOption: "لا توجد قطعة مختارة",
    tryOnNoteLabel: "ملاحظة التجربة",
    tryOnNotePlaceholder: "مثال: أظهر هذه الجاكيت فوق صورة ملفي الحالية",
    futureReadyLabel: "جاهز للمستقبل",
    futureReadyText: "مهيأ لواجهة توليد صور مستقبلية تجمع بين صورة الشخص وقطعة من الخزانة أو قطعة مرفوعة.",
    storagePlanTitle: "بنية جاهزة لـ Supabase",
    tablesLabel: "الجداول",
    bucketsLabel: "Buckets",
  },
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function isAnalysisResult(value: unknown): value is AnalysisResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  return (
    "assessment" in value &&
    "rationale" in value &&
    "confidence" in value &&
    "outfit" in value &&
    "grooming" in value &&
    "color" in value &&
    "occasion" in value &&
    "strongPoints" in value &&
    "areasToRefine" in value &&
    "recommendedImprovements" in value &&
    "winningOutfitIndex" in value &&
    "winningOutfitLabel" in value &&
    "winningReason" in value &&
    "comparisonNotes" in value &&
    "wardrobeSuggestions" in value &&
    "followUpRequired" in value &&
    "followUpQuestion" in value
  );
}

function readOriginalFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

async function readFileAsDataUrl(file: File): Promise<string> {
  if (typeof window === "undefined" || !file.type.startsWith("image/")) {
    return readOriginalFileAsDataUrl(file);
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(objectUrl);
    const maxDimension = 1400;
    const longestSide = Math.max(image.naturalWidth, image.naturalHeight);
    const scale = longestSide > maxDimension ? maxDimension / longestSide : 1;
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas is unavailable.");
    }

    canvas.width = width;
    canvas.height = height;

    const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";

    if (outputType === "image/jpeg") {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
    }

    context.drawImage(image, 0, 0, width, height);

    return canvas.toDataURL(outputType, outputType === "image/png" ? undefined : 0.84);
  } catch {
    return readOriginalFileAsDataUrl(file);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function inferWardrobeCategory(fileName: string): WardrobeCategory {
  const normalized = fileName.toLowerCase();

  if (
    /(shirt|tee|t-shirt|polo|blouse|top|hoodie|sweater|knit|cardigan)/.test(
      normalized,
    )
  ) {
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

function BackgroundDecor({ isDark }: { isDark: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? "radial-gradient(circle at 18% 12%, rgba(210,171,85,0.16), transparent 30%), radial-gradient(circle at 82% 22%, rgba(210,171,85,0.11), transparent 24%), radial-gradient(circle at 50% 0%, rgba(210,171,85,0.08), transparent 38%), linear-gradient(180deg, rgba(12,10,8,0.98), rgba(7,6,5,1))"
            : "radial-gradient(circle at 18% 12%, rgba(124,78,12,0.08), transparent 28%), radial-gradient(circle at 82% 22%, rgba(124,78,12,0.05), transparent 24%), linear-gradient(180deg, rgba(252,250,245,0.98), rgba(252,250,245,1))",
        }}
      />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: isDark
            ? "linear-gradient(rgba(210,171,85,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(210,171,85,0.08) 1px, transparent 1px)"
            : "linear-gradient(rgba(124,78,12,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(124,78,12,0.05) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(circle at center, rgba(0,0,0,0.8) 32%, rgba(0,0,0,0) 78%)",
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

export default function Page() {
  const [theme, setTheme] = useState<Theme>("light");
  const [page, setPage] = useState<PageState>("home");
  const [language, setLanguage] = useState<Language>(defaultLanguage);
  const [mode, setMode] = useState<Mode>("look");
  const [occasion, setOccasion] = useState<Occasion>("date");
  const [customOccasion, setCustomOccasion] = useState("");
  const [groupMode, setGroupMode] = useState(false);
  const [targetPersonNote, setTargetPersonNote] = useState("");
  const [userProfile, setUserProfile] = useState<UserProfileInput>(createEmptyUserProfile());
  const [appearanceAttributes] = useState<AppearanceAttributes>(
    createEmptyAppearanceAttributes(),
  );
  const [personalPhotos, setPersonalPhotos] = useState<PersonalPhotoSet>(
    createEmptyPersonalPhotoSet(),
  );
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

    if (storedLanguage && isSupportedLanguage(storedLanguage)) {
      setLanguage(storedLanguage);
    }

    if (storedTheme === "dark" || storedTheme === "light") {
      setTheme(storedTheme);
    }
  }, []);

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

  const dictionary = appDictionaries[language] ?? appDictionaries[defaultLanguage];
  const extra = extraCopy[language];
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
  const comparisonMode = mode === "look" && uploadedOutfitImages.length > 1;
  const showWinningOutfit =
    Boolean(result) &&
    mode === "look" &&
    comparisonMode &&
    (result?.winningOutfitIndex ?? 0) > 0 &&
    Boolean(winningOutfitImage);
  const showFollowUp =
    Boolean(result?.followUpRequired && result.followUpQuestion.trim());
  const canSubmitFollowUp = followUpAnswer.trim().length > 0 && !loading;
  const visibleAreasToRefine = result ? getAreasToRefine(result, mode) : [];
  const selectedOccasionLabel =
    occasion === "custom"
      ? customOccasion.trim() || dictionary.demoSection.occasionLabels.custom
      : dictionary.demoSection.occasionLabels[occasion];
  const statCards = [
    ["4.2K", dictionary.stats[0]],
    ["94%", dictionary.stats[1]],
    ["<30S", dictionary.stats[2]],
    ["6", dictionary.stats[3]],
  ] as const;

  const pageStyle = {
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
  };

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
  const sectionDividerClass = isDark ? "bg-[#2b241b]" : "bg-[#ddd3c1]";
  const sectionSurfaceClass = isDark ? "bg-[#0f0c09]" : "bg-[#f7f1e8]";
  const logoClass = cx(
    playfair.className,
    "select-none text-[2rem] font-medium uppercase tracking-[0.32em]",
  );
  const headingClass = playfair.className;
  const sectionEyebrowClass = cx("text-[11px] uppercase tracking-[0.24em]", accentTextClass);
  const inactivePillClass = cx("border", secondaryButtonClass);
  const inputShellClass = cx(softPanelClass, "border-dashed");
  const selectClass = cx(
    "rounded-sm border px-4 py-2 text-sm outline-none transition-colors",
    isDark
      ? "border-[#4a3d2f] bg-[#120f0b] text-[#fff6eb] focus:border-[#d2ab55]"
      : "border-[#d7ccb7] bg-[#fffdf8] text-[#17130e] focus:border-amber-700",
  );

  const pillClass = (active: boolean) =>
    cx(
      "rounded-full px-4 py-2 text-sm",
      active ? `${accentButtonClass} font-semibold` : inactivePillClass,
    );

  const squareButtonClass = (active: boolean) =>
    cx(
      "rounded-sm border px-4 py-3 text-sm transition-colors",
      active ? `${accentButtonClass} font-semibold` : secondaryButtonClass,
    );

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  const resetAnalysisFeedback = () => {
    setResult(null);
    setAnalysisError(null);
    setFollowUpAnswer("");
  };

  const updatePersonalPhoto = (field: keyof PersonalPhotoSet, value: string | null) => {
    setPersonalPhotos((currentPhotos) => ({
      ...currentPhotos,
      [field]: value,
    }));
    resetAnalysisFeedback();
  };

  const updateUserProfile = <Key extends keyof UserProfileInput>(
    field: Key,
    value: UserProfileInput[Key],
  ) => {
    setUserProfile((currentProfile) => ({
      ...currentProfile,
      [field]: value,
    }));
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

    const dataUrl = await readFileAsDataUrl(file);
    setter(dataUrl);
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

    const dataUrl = await readFileAsDataUrl(file);
    updatePersonalPhoto(field, dataUrl);
    event.target.value = "";
  }

  async function onOutfitImage(event: ChangeEvent<HTMLInputElement>, index: number) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const dataUrl = await readFileAsDataUrl(file);
    setOutfits((currentOutfits) =>
      currentOutfits.map((item, itemIndex) => (itemIndex === index ? dataUrl : item)),
    );
    resetAnalysisFeedback();
    event.target.value = "";
  }

  async function onWardrobeUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    const nextFiles = files.slice(0, Math.max(0, MAX_WARDROBE_ITEMS - wardrobeItems.length));

    if (nextFiles.length === 0) {
      event.target.value = "";
      return;
    }

    const startingIndex = wardrobeItems.length;
    const nextItems = await Promise.all(
      nextFiles.map(async (file, index) => ({
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `wardrobe-${Date.now()}-${index}`,
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
          ? {
              ...item,
              [field]:
                field === "category" ? (value as WardrobeCategory) : value.slice(0, 80),
            }
          : item,
      ),
    );
    resetAnalysisFeedback();
  }

  function removeWardrobeItem(itemId: string) {
    setWardrobeItems((currentItems) =>
      currentItems.filter((item) => item.id !== itemId),
    );
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
    }));
    resetAnalysisFeedback();
    event.target.value = "";
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

    const requestBody: AnalyzeRequestBody = {
      language,
      mode,
      occasion,
      customOccasion: customOccasion.trim(),
      groupMode,
      targetPersonNote,
      followUpAnswer: clarification.trim(),
      profile: userProfile,
      appearanceAttributes,
      personalPhotos,
      currentLookImage,
      outfitImages: uploadedOutfitImages,
      itemCheckImage,
      wardrobeItems,
    };

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      const data = (await response.json().catch(() => null)) as
        | AnalysisResult
        | { error?: string }
        | null;

      if (!response.ok || !data || ("error" in data && data.error) || !isAnalysisResult(data)) {
        throw new Error(
          data && "error" in data ? data.error || "Unable to analyze the image right now." : "Unable to analyze the image right now.",
        );
      }

      setResult(data);
      setFollowUpAnswer("");
    } catch (error) {
      setAnalysisError(
        error instanceof Error ? error.message : "Unable to analyze the image right now.",
      );
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

  if (page === "pricing") {
    return (
      <div className={wrapClass} style={pageStyle} dir={direction} lang={language}>
        <BackgroundDecor isDark={isDark} />
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setPage("home")}
              className={cx("text-sm transition-colors", mutedClass, "hover:text-inherit")}
            >
              {dictionary.common.backToHome}
            </button>
            <div className="flex flex-wrap items-center gap-3">
              {renderLanguageSwitcher()}
              <button
                type="button"
                onClick={toggleTheme}
                className={cx(
                  "rounded-sm border px-4 py-2 text-sm transition-colors",
                  accentBorderClass,
                  accentTextClass,
                )}
              >
                {isDark ? dictionary.common.whiteMode : dictionary.common.blackMode}
              </button>
            </div>
          </div>

          <div className="mt-16 text-center">
            <div className={cx("inline-flex border px-4 py-2 text-[11px] uppercase tracking-[0.24em]", accentBorderClass, accentTextClass)}>
              {dictionary.common.pricing}
            </div>
            <h1 className={cx(headingClass, "mt-6 text-5xl md:text-6xl")}>
              {dictionary.pricingState.title}
            </h1>
            <p className={cx("mx-auto mt-5 max-w-3xl text-lg leading-8", mutedClass)}>
              {dictionary.pricingState.description}
            </p>
          </div>

          <PricingGrid
            isDark={isDark}
            language={language}
            onFreePlanClick={() => setPage("home")}
          />

          <div className={cx(panelClass, "mt-10 p-8")}>
            <div className={cx("text-[11px] uppercase tracking-[0.22em]", accentTextClass)}>
              {dictionary.common.hostedCheckout}
            </div>
            <h2 className={cx(headingClass, "mt-3 text-3xl")}>
              {dictionary.pricingState.hostedCheckout}
            </h2>
            <p className={cx("mt-3", mutedClass)}>
              {dictionary.pricingState.hostedCheckoutDescription}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={wrapClass} style={pageStyle} dir={direction} lang={language}>
      <BackgroundDecor isDark={isDark} />

      <header
        className={cx(
          "sticky top-0 z-40 border-b backdrop-blur-xl transition-colors duration-300",
          isDark ? "border-[#2b241b] bg-[#090806]/92" : "border-[#ddd3c1] bg-[#fcfaf5]/90",
        )}
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div className={logoClass}>
            <span className={primaryTextClass}>MIR</span>
            <span className={accentTextClass}>O</span>
            <span className={primaryTextClass}>R</span>
          </div>

          <nav className="hidden items-center gap-10 md:flex">
            <a href="#process" className={cx("text-[11px] uppercase tracking-[0.16em] transition-colors", mutedClass, "hover:text-inherit")}>
              {dictionary.nav.howItWorks}
            </a>
            <a href="#features" className={cx("text-[11px] uppercase tracking-[0.16em] transition-colors", mutedClass, "hover:text-inherit")}>
              {dictionary.nav.features}
            </a>
            <a href="#demo" className={cx("text-[11px] uppercase tracking-[0.16em] transition-colors", mutedClass, "hover:text-inherit")}>
              {dictionary.nav.tryIt}
            </a>
            <button
              type="button"
              onClick={() => setPage("pricing")}
              className={cx("text-[11px] uppercase tracking-[0.16em] transition-colors", mutedClass, "hover:text-inherit")}
            >
              {dictionary.nav.pricing}
            </button>
          </nav>

          <div className="flex flex-wrap items-center gap-3">
            {renderLanguageSwitcher()}
            <button
              type="button"
              onClick={toggleTheme}
              className={cx(
                "rounded-sm border px-4 py-2 text-sm transition-colors",
                accentBorderClass,
                accentTextClass,
              )}
            >
              {isDark ? dictionary.common.whiteMode : dictionary.common.blackMode}
            </button>
            <button
              type="button"
              onClick={() => setPage("pricing")}
              className={cx("rounded-sm px-5 py-2.5 text-sm font-semibold", accentButtonClass)}
            >
              {dictionary.common.getStarted}
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="relative overflow-hidden px-6 pb-24 pt-24 md:pb-32 md:pt-32">
          <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.02fr_0.98fr]">
            <div className="relative">
              <div className={cx("inline-flex border px-4 py-2 text-[11px] uppercase tracking-[0.24em]", accentBorderClass, accentTextClass)}>
                {dictionary.hero.eyebrow}
              </div>
              <h1 className={cx(headingClass, "mt-8 max-w-5xl text-6xl leading-[0.92] md:text-[6.2rem]")}>
                {dictionary.hero.titleStart}{" "}
                <span className={cx(accentTextClass, "italic")}>{dictionary.hero.titleAccent}</span>
              </h1>
              <p className={cx("mt-8 max-w-xl text-lg leading-8", mutedClass)}>
                {dictionary.hero.description}
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  href="#demo"
                  className={cx(
                    "rounded-sm px-6 py-4 text-sm font-semibold uppercase tracking-[0.12em]",
                    accentButtonClass,
                  )}
                >
                  {dictionary.hero.analyze}
                </a>
                <a
                  href="#process"
                  className={cx(
                    "rounded-sm border px-6 py-4 text-sm uppercase tracking-[0.12em] transition-colors",
                    secondaryButtonClass,
                  )}
                >
                  {dictionary.hero.seeProcess}
                </a>
              </div>
            </div>

            <div className="relative ml-auto w-full max-w-[420px]">
              <div className={cx(panelClass, "rounded-[2rem] p-4 shadow-2xl shadow-black/25")}>
                <div
                  className={cx(
                    "rounded-[1.5rem] p-5",
                    isDark ? "bg-[#13100d]" : "bg-[#fffdf8]",
                  )}
                >
                  <div
                    className={cx(
                      "flex items-center justify-between border-b pb-4",
                      isDark ? "border-[#3b3228]" : "border-[#e3d9c7]",
                    )}
                  >
                    <div className={cx(playfair.className, "text-sm uppercase tracking-[0.22em]")}>
                      <span className={primaryTextClass}>MIR</span>
                      <span className={accentTextClass}>O</span>
                      <span className={primaryTextClass}>R</span>
                    </div>
                    <div className={cx("text-[10px] uppercase tracking-[0.18em]", accentTextClass)}>
                      {mode === "buy" ? extra.buyMode : selectedOccasionLabel}
                    </div>
                  </div>

                  <div
                    className={cx(
                      "mt-4 rounded-2xl border border-dashed p-8 text-center",
                      isDark ? "border-[#3b3228] bg-[#1b1713]" : "border-[#d9ceb9] bg-[#f8f3ea]",
                    )}
                  >
                    <div className={cx("text-[10px] uppercase tracking-[0.18em]", accentTextClass)}>
                      {dictionary.showcase.uploadPreview}
                    </div>
                    <div className={cx("mt-3 text-base font-semibold", primaryTextClass)}>
                      {dictionary.showcase.selfieOrLook}
                    </div>
                    <div className={cx("mt-2 text-sm", mutedClass)}>
                      {dictionary.showcase.keepItClear}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {SHOWCASE_OCCASIONS.map((option, index) => (
                      <span
                        key={option}
                        className={cx(
                          "rounded-full px-3 py-1.5 text-xs",
                          index === 0
                            ? accentButtonClass
                            : isDark
                              ? "bg-[#1b1713] text-[#cabdab]"
                              : "bg-[#eee5d8] text-[#6f6658]",
                        )}
                      >
                        {dictionary.demoSection.occasionLabels[option]}
                      </span>
                    ))}
                  </div>

                  <div
                    className={cx(
                      "mt-4 rounded-2xl p-4",
                      isDark ? "bg-[#1b1713]" : "border border-[#e3d9c7] bg-[#f8f3ea]",
                    )}
                  >
                    <div className={cx("text-[10px] uppercase tracking-[0.18em]", accentTextClass)}>
                      {dictionary.showcase.appearanceScore}
                    </div>
                    <div className="mt-4 space-y-3">
                      <Score isDark={isDark} label="Outfit harmony" value={82} />
                      <Score isDark={isDark} label="Color match" value={76} />
                      <Score isDark={isDark} label="Grooming" value={90} />
                      <Score isDark={isDark} label="Occasion fit" value={68} />
                    </div>
                    <div
                      className={cx(
                        "mt-4 inline-flex rounded-sm border px-3 py-2 text-[10px] uppercase tracking-[0.15em]",
                        isDark
                          ? "border-emerald-400/35 bg-emerald-400/12 text-emerald-300"
                          : "border-emerald-300 bg-emerald-50 text-emerald-700",
                      )}
                    >
                      {dictionary.showcase.mostlyReady}
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={cx(
                  panelClass,
                  "absolute -left-10 bottom-8 hidden w-48 rounded-[1.5rem] p-5 lg:block",
                )}
              >
                <div className={cx("text-[10px] uppercase tracking-[0.18em]", accentTextClass)}>
                  {dictionary.showcase.quickNote}
                </div>
                <div className={cx(headingClass, "mt-3 text-2xl leading-tight")}>
                  {dictionary.showcase.quickNoteText}
                </div>
              </div>

              <div
                className={cx(
                  panelClass,
                  "absolute -right-10 top-10 hidden w-56 rounded-[1.5rem] p-5 xl:block",
                )}
              >
                <div className={cx("text-[10px] uppercase tracking-[0.18em]", accentTextClass)}>
                  {dictionary.showcase.mirorReads}
                </div>
                <div className={cx("mt-3 space-y-2 text-sm", mutedClass)}>
                  {dictionary.showcase.readsList.map((item) => (
                    <div key={item}>{item}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className={cx(
            "border-y transition-colors duration-300",
            isDark ? "border-[#2b241b] bg-[#0f0c09]" : "border-[#ddd3c1] bg-[#f7f1e8]",
          )}
        >
          <div className="mx-auto grid max-w-7xl md:grid-cols-4">
            {statCards.map(([value, label]) => (
              <div
                key={label}
                className={cx(
                  "border-r px-8 py-8 last:border-r-0",
                  isDark ? "border-[#2b241b]" : "border-[#ddd3c1]",
                )}
              >
                <div className={cx(headingClass, "text-5xl leading-none")}>{value}</div>
                <div className={cx("mt-2 text-[11px] uppercase tracking-[0.14em]", subduedClass)}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="process" className="px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className={sectionEyebrowClass}>{dictionary.process.eyebrow}</div>
            <h2 className={cx(headingClass, "mt-6 max-w-4xl text-5xl leading-[1.02] md:text-7xl")}>
              {dictionary.process.titleStart}{" "}
              <span className={cx(accentTextClass, "italic")}>{dictionary.process.titleAccent}</span>
            </h2>
            <p className={cx("mt-5 max-w-xl text-lg leading-8", mutedClass)}>
              {dictionary.process.description}
            </p>

            <div className={cx("mt-16 grid gap-px md:grid-cols-4", sectionDividerClass)}>
              {dictionary.process.steps.map((step) => (
                <div
                  key={step.title}
                  className={cx(
                    "p-8 transition-colors duration-300",
                    isDark ? "bg-[#090806]" : "bg-[#fffdf8]",
                  )}
                >
                  <div className={cx("text-[10px] uppercase tracking-[0.18em]", subduedClass)}>
                    {step.step}
                  </div>
                  <div className={cx("mt-8 text-[10px] uppercase tracking-[0.18em]", accentTextClass)}>
                    {step.token}
                  </div>
                  <h3 className={cx(headingClass, "mt-4 text-[2rem] leading-tight")}>{step.title}</h3>
                  <p className={cx("mt-4 text-sm leading-8", mutedClass)}>{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className={cx("px-6 py-24 transition-colors duration-300", sectionSurfaceClass)}>
          <div className="mx-auto max-w-7xl">
            <div className={sectionEyebrowClass}>{dictionary.featuresSection.eyebrow}</div>
            <h2 className={cx(headingClass, "mt-6 max-w-4xl text-5xl leading-[1.02] md:text-7xl")}>
              {dictionary.featuresSection.titleStart}{" "}
              <span className={cx(accentTextClass, "italic")}>
                {dictionary.featuresSection.titleAccent}
              </span>
            </h2>
            <p className={cx("mt-5 max-w-xl text-lg leading-8", mutedClass)}>
              {dictionary.featuresSection.description}
            </p>

            <div className={cx("mt-16 grid gap-px md:grid-cols-3", sectionDividerClass)}>
              {dictionary.featuresSection.cards.map((card, index) => (
                <div
                  key={card.title}
                  className={cx(
                    "min-h-[260px] p-10 transition-colors duration-300",
                    isDark ? "bg-[#0f0c09]" : "bg-[#fffdf8]",
                  )}
                >
                  <div
                    className={cx(
                      "inline-flex h-12 w-12 items-center justify-center rounded-xl border text-sm",
                      isDark ? "border-[#5a4935] bg-[#211a13]" : "border-amber-200 bg-amber-50",
                      accentTextClass,
                    )}
                  >
                    0{index + 1}
                  </div>
                  <h3 className={cx(headingClass, "mt-8 text-[2rem] leading-tight")}>{card.title}</h3>
                  <p className={cx("mt-4 text-sm leading-8", mutedClass)}>{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="demo" className="px-6 py-24">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className={cx(panelClass, "overflow-hidden rounded-[1.5rem] lg:sticky lg:top-24 lg:h-fit")}>
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

              <div className="p-6">
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
                  <div className="mt-6 space-y-6">
                    <label className={cx(inputShellClass, "flex cursor-pointer flex-col items-center justify-center p-6 text-center")}>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => onSingleImage(event, setCurrentLookImage)}
                      />
                      {currentLookImage ? (
                        <img
                          src={currentLookImage}
                          alt="Uploaded look"
                          className="h-56 w-full rounded-xl object-cover"
                        />
                      ) : (
                        <>
                          <div className={cx("text-[10px] uppercase tracking-[0.18em]", accentTextClass)}>
                            {extra.currentLookLabel}
                          </div>
                          <div className={cx("mt-3 text-base font-semibold", primaryTextClass)}>
                            {extra.currentLookLabel}
                          </div>
                          <div className={cx("mt-2 text-sm", mutedClass)}>
                            {extra.currentLookPlaceholder}
                          </div>
                        </>
                      )}
                    </label>

                    <div className={cx(softPanelClass, "p-4")}>
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className={cx("font-semibold", accentTextClass)}>
                            {dictionary.demoSection.groupMode}
                          </div>
                          <div className={cx("mt-1 text-sm", mutedClass)}>
                            {dictionary.demoSection.groupModeDescription}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setGroupMode((currentValue) => !currentValue);
                            resetAnalysisFeedback();
                          }}
                          className={cx(
                            "rounded-sm px-4 py-2 text-sm",
                            groupMode
                              ? `${accentButtonClass} font-semibold`
                              : cx("border", accentBorderClass, accentTextClass),
                          )}
                        >
                          {groupMode ? extra.enabled : extra.enable}
                        </button>
                      </div>

                      {groupMode ? (
                        <div className="mt-4">
                          <div className={cx("mb-2 text-sm", mutedClass)}>
                            {dictionary.demoSection.targetPerson}
                          </div>
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
                              "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors placeholder:transition-colors",
                              isDark
                                ? "border-[#4a3d2f] bg-[#120f0b] text-[#fff6eb] placeholder:text-[#8f8170] focus:border-[#d2ab55]"
                                : "border-[#d7ccb7] bg-[#fffdf8] text-[#17130e] placeholder:text-[#8f8372] focus:border-amber-700",
                            )}
                          />
                        </div>
                      ) : null}
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <div className={cx("mb-3 text-sm", mutedClass)}>
                          {dictionary.demoSection.outfitOptions}
                        </div>
                        <div className={cx("mb-3 text-xs uppercase tracking-[0.14em]", subduedClass)}>
                          {dictionary.demoSection.upToThreeLooks}
                        </div>
                      </div>
                      <div className="grid gap-3 md:grid-cols-3">
                        {[0, 1, 2].map((index) => (
                          <label
                            key={index}
                            className={cx(inputShellClass, "cursor-pointer p-3")}
                          >
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(event) => onOutfitImage(event, index)}
                            />
                            {outfits[index] ? (
                              <img
                                src={outfits[index] ?? ""}
                                alt={`Outfit option ${index + 1}`}
                                className="h-32 w-full rounded-xl object-cover"
                              />
                            ) : (
                              <div className={cx("flex h-32 items-center justify-center text-center text-sm", mutedClass)}>
                                Outfit {index + 1}
                              </div>
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 space-y-6">
                    <label className={cx(inputShellClass, "flex cursor-pointer flex-col items-center justify-center p-6 text-center")}>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => onSingleImage(event, setItemCheckImage)}
                      />
                      {itemCheckImage ? (
                        <img
                          src={itemCheckImage}
                          alt="Item to buy"
                          className="h-56 w-full rounded-xl object-cover"
                        />
                      ) : (
                        <>
                          <div className={cx("text-[10px] uppercase tracking-[0.18em]", accentTextClass)}>
                            {dictionary.demoSection.productImage}
                          </div>
                          <div className={cx("mt-3 text-base font-semibold", primaryTextClass)}>
                            {dictionary.demoSection.uploadItemTitle}
                          </div>
                          <div className={cx("mt-2 text-sm", mutedClass)}>
                            {dictionary.demoSection.uploadItemDescription}
                          </div>
                        </>
                      )}
                    </label>
                  </div>
                )}

                <div className={cx(softPanelClass, "mt-6 p-4")}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="max-w-2xl">
                      <div className={cx("font-semibold", accentTextClass)}>
                        {extra.profileTitle}
                      </div>
                      <p className={cx("mt-1 text-sm leading-7", mutedClass)}>
                        {extra.profileDescription}
                      </p>
                    </div>
                  </div>

                  <div className={cx("mt-4 text-[11px] uppercase tracking-[0.16em]", subduedClass)}>
                    {extra.measurementsLabel}
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className={cx("mb-2 block text-sm", mutedClass)}>
                        {extra.heightLabel}
                      </span>
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
                      <span className={cx("mb-2 block text-sm", mutedClass)}>
                        {extra.weightLabel}
                      </span>
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
                      <span className={cx("mb-2 block text-sm", mutedClass)}>
                        {extra.styleGoalLabel}
                      </span>
                      <input
                        type="text"
                        value={userProfile.styleGoal}
                        placeholder={extra.styleGoalPlaceholder}
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
                      <span className={cx("mb-2 block text-sm", mutedClass)}>
                        {extra.preferredFitLabel}
                      </span>
                      <select
                        value={userProfile.preferredFit}
                        onChange={(event) =>
                          updateUserProfile("preferredFit", event.target.value as FitPreference)
                        }
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
                    <div className={cx("mb-3 text-sm", mutedClass)}>
                      {extra.preferredOccasionsLabel}
                    </div>
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
                    <span className={cx("mb-2 block text-sm", mutedClass)}>
                      {extra.notesLabel}
                    </span>
                    <textarea
                      value={userProfile.notes}
                      rows={3}
                      maxLength={240}
                      placeholder={extra.notesPlaceholder}
                      onChange={(event) => updateUserProfile("notes", event.target.value)}
                      className={cx(
                        "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors placeholder:transition-colors",
                        isDark
                          ? "border-[#4a3d2f] bg-[#120f0b] text-[#fff6eb] placeholder:text-[#8f8170] focus:border-[#d2ab55]"
                          : "border-[#d7ccb7] bg-[#fffdf8] text-[#17130e] placeholder:text-[#8f8372] focus:border-amber-700",
                      )}
                    />
                  </label>

                  <div className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                    <div className={cx("rounded-2xl p-4", isDark ? "bg-[#120f0b]" : "border border-[#ddd3c1] bg-[#fffdf8]")}>
                      <div className={cx("font-semibold", accentTextClass)}>
                        {extra.profilePhotosTitle}
                      </div>
                      <p className={cx("mt-1 text-sm leading-7", mutedClass)}>
                        {extra.profilePhotosDescription}
                      </p>
                      <div className="mt-4 grid gap-3 md:grid-cols-3">
                        {(
                          [
                            ["selfie", extra.profileSelfieLabel, personalPhotos.selfie],
                            ["faceScan", extra.faceScanLabel, personalPhotos.faceScan],
                            ["bodyPhoto", extra.bodyPhotoLabel, personalPhotos.bodyPhoto],
                          ] as Array<[keyof PersonalPhotoSet, string, string | null]>
                        ).map(([field, label, value]) => (
                          <label key={field} className={cx(inputShellClass, "cursor-pointer p-3")}>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(event) => onPersonalPhotoUpload(event, field)}
                            />
                            {value ? (
                              <img
                                src={value}
                                alt={label}
                                className="h-28 w-full rounded-xl object-cover"
                              />
                            ) : (
                              <div className={cx("flex h-28 items-center justify-center text-center text-sm", mutedClass)}>
                                {label}
                              </div>
                            )}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className={cx("rounded-2xl p-4", isDark ? "bg-[#120f0b]" : "border border-[#ddd3c1] bg-[#fffdf8]")}>
                      <div className={cx("font-semibold", accentTextClass)}>
                        {extra.appearanceTitle}
                      </div>
                      <p className={cx("mt-1 text-sm leading-7", mutedClass)}>
                        {extra.appearanceDescription}
                      </p>
                      <div className="mt-4 space-y-2 text-sm">
                        {APPEARANCE_FIELDS.map((key) => (
                          <div
                            key={key}
                            className={cx(
                              "flex items-center justify-between gap-3 rounded-xl border px-3 py-2",
                              isDark
                                ? "border-[#4a3d2f] bg-[#181411]"
                                : "border-[#ddd3c1] bg-[#fcfaf5]",
                            )}
                          >
                            <span className={mutedClass}>{extra.appearanceLabels[key]}</span>
                            <span className={accentTextClass}>
                              {appearanceAttributes[key] || extra.pendingValue}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={cx(softPanelClass, "mt-6 p-4")}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="max-w-xl">
                      <div className={cx("font-semibold", accentTextClass)}>
                        {dictionary.demoSection.wardrobeTitle}
                      </div>
                      <p className={cx("mt-1 text-sm leading-7", mutedClass)}>
                        {dictionary.demoSection.wardrobeDescription}
                      </p>
                    </div>
                    <label
                      className={cx(
                        "cursor-pointer rounded-sm px-4 py-2 text-sm font-semibold",
                        accentButtonClass,
                      )}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={onWardrobeUpload}
                      />
                      {dictionary.demoSection.wardrobeUpload}
                    </label>
                  </div>
                  <p className={cx("mt-3 text-xs leading-6", subduedClass)}>
                    {dictionary.demoSection.wardrobeHint}
                  </p>

                  {wardrobeItems.length > 0 ? (
                    <div className="mt-4 grid gap-3">
                      {wardrobeItems.map((item) => (
                        <div
                          key={item.id}
                          className={cx(
                            "rounded-2xl border p-3",
                            isDark
                              ? "border-[#4a3d2f] bg-[#120f0b]"
                              : "border-[#ddd3c1] bg-[#fffdf8]",
                          )}
                        >
                          <div className="flex flex-col gap-3 sm:flex-row">
                            <img
                              src={item.image}
                              alt={item.label}
                              className="h-24 w-full rounded-xl object-cover sm:w-24"
                            />
                            <div className="min-w-0 flex-1 space-y-3">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className={cx("text-sm font-semibold", primaryTextClass)}>
                                  {item.label}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeWardrobeItem(item.id)}
                                  className={cx(
                                    "text-xs uppercase tracking-[0.14em] transition-colors",
                                    mutedClass,
                                    "hover:text-inherit",
                                  )}
                                >
                                  {extra.remove}
                                </button>
                              </div>
                              <div className="grid gap-3 md:grid-cols-2">
                                <label className="block">
                                  <span className={cx("mb-1 block text-[11px] uppercase tracking-[0.16em]", subduedClass)}>
                                    {extra.itemLabel}
                                  </span>
                                  <input
                                    type="text"
                                    value={item.label}
                                    placeholder={extra.itemLabelPlaceholder}
                                    onChange={(event) =>
                                      updateWardrobeItem(item.id, "label", event.target.value)
                                    }
                                    className={cx(
                                      "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors",
                                      isDark
                                        ? "border-[#4a3d2f] bg-[#181411] text-[#fff6eb] placeholder:text-[#8f8170] focus:border-[#d2ab55]"
                                        : "border-[#d7ccb7] bg-[#fffdf8] text-[#17130e] placeholder:text-[#8f8372] focus:border-amber-700",
                                    )}
                                  />
                                </label>
                                <label className="block">
                                  <span className={cx("mb-1 block text-[11px] uppercase tracking-[0.16em]", subduedClass)}>
                                    {dictionary.demoSection.category}
                                  </span>
                                  <select
                                    value={item.category}
                                    onChange={(event) =>
                                      updateWardrobeItem(item.id, "category", event.target.value)
                                    }
                                    className={cx(selectClass, "w-full")}
                                  >
                                    {WARDROBE_CATEGORIES.map((category) => (
                                      <option key={category} value={category}>
                                        {dictionary.demoSection.wardrobeCategoryLabels[category]}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      className={cx(
                        "mt-4 rounded-2xl border border-dashed px-4 py-5 text-sm",
                        isDark
                          ? "border-[#4a3d2f] bg-[#120f0b] text-[#cabdab]"
                          : "border-[#ddd3c1] bg-[#fffdf8] text-[#6f6658]",
                      )}
                    >
                      {dictionary.demoSection.wardrobeSuggestionsEmpty}
                    </div>
                  )}
                </div>

                <div className={cx(softPanelClass, "mt-6 p-4")}>
                  <div className={cx("font-semibold", accentTextClass)}>
                    {extra.tryOnTitle}
                  </div>
                  <p className={cx("mt-1 text-sm leading-7", mutedClass)}>
                    {extra.tryOnDescription}
                  </p>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <label className={cx(inputShellClass, "flex cursor-pointer flex-col items-center justify-center p-4 text-center")}>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => onTryOnUpload(event, "personPhoto")}
                      />
                      {tryOnDraft.personPhoto ? (
                        <img
                          src={tryOnDraft.personPhoto}
                          alt={extra.personPhotoLabel}
                          className="h-32 w-full rounded-xl object-cover"
                        />
                      ) : (
                        <div className={cx("flex h-32 items-center justify-center text-center text-sm", mutedClass)}>
                          {extra.personPhotoLabel}
                        </div>
                      )}
                    </label>

                    <label className={cx(inputShellClass, "flex cursor-pointer flex-col items-center justify-center p-4 text-center")}>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => onTryOnUpload(event, "uploadedGarmentImage")}
                      />
                      {tryOnDraft.uploadedGarmentImage ? (
                        <img
                          src={tryOnDraft.uploadedGarmentImage}
                          alt={extra.garmentUploadLabel}
                          className="h-32 w-full rounded-xl object-cover"
                        />
                      ) : (
                        <div className={cx("flex h-32 items-center justify-center text-center text-sm", mutedClass)}>
                          {extra.garmentUploadLabel}
                        </div>
                      )}
                    </label>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className={cx("mb-2 block text-sm", mutedClass)}>
                        {extra.wardrobeChoiceLabel}
                      </span>
                      <select
                        value={tryOnDraft.selectedWardrobeItemId ?? ""}
                        onChange={(event) => {
                          setTryOnDraft((currentDraft) => ({
                            ...currentDraft,
                            selectedWardrobeItemId: event.target.value || null,
                          }));
                        }}
                        className={cx(selectClass, "w-full")}
                      >
                        <option value="">{extra.noWardrobeOption}</option>
                        {wardrobeItems.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className={cx("mb-2 block text-sm", mutedClass)}>
                        {extra.tryOnNoteLabel}
                      </span>
                      <input
                        type="text"
                        value={tryOnDraft.note}
                        placeholder={extra.tryOnNotePlaceholder}
                        onChange={(event) =>
                          setTryOnDraft((currentDraft) => ({
                            ...currentDraft,
                            note: event.target.value,
                          }))
                        }
                        className={cx(
                          "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors",
                          isDark
                            ? "border-[#4a3d2f] bg-[#120f0b] text-[#fff6eb] placeholder:text-[#8f8170] focus:border-[#d2ab55]"
                            : "border-[#d7ccb7] bg-[#fffdf8] text-[#17130e] placeholder:text-[#8f8372] focus:border-amber-700",
                        )}
                      />
                    </label>
                  </div>

                  <div
                    className={cx(
                      "mt-4 rounded-xl border px-4 py-3 text-sm",
                      isDark
                        ? "border-[#4a3d2f] bg-[#120f0b] text-[#d9ccbc]"
                        : "border-[#ddd3c1] bg-[#fffdf8] text-[#6f6658]",
                    )}
                  >
                    <span className={accentTextClass}>{extra.futureReadyLabel}:</span>{" "}
                    {extra.futureReadyText}
                  </div>
                </div>

                <div className="mt-6">
                  <div className={cx("mb-3 text-sm", mutedClass)}>
                    {mode === "buy"
                      ? dictionary.demoSection.intendedOccasion
                      : dictionary.demoSection.occasion}
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {OCCASION_ORDER.map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setOccasion(key);
                          resetAnalysisFeedback();
                        }}
                        className={squareButtonClass(occasion === key)}
                      >
                        {dictionary.demoSection.occasionLabels[key]}
                      </button>
                    ))}
                  </div>
                </div>

                {occasion === "custom" ? (
                  <div className="mt-4">
                    <div className={cx("mb-2 text-sm", mutedClass)}>
                      {dictionary.demoSection.customOccasionLabel}
                    </div>
                    <input
                      type="text"
                      value={customOccasion}
                      onChange={(event) => {
                        setCustomOccasion(event.target.value);
                        resetAnalysisFeedback();
                      }}
                      maxLength={120}
                      placeholder={dictionary.demoSection.customOccasionPlaceholder}
                      className={cx(
                        "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors",
                        isDark
                          ? "border-[#4a3d2f] bg-[#120f0b] text-[#fff6eb] placeholder:text-[#8f8170] focus:border-[#d2ab55]"
                          : "border-[#d7ccb7] bg-[#fffdf8] text-[#17130e] placeholder:text-[#8f8372] focus:border-amber-700",
                      )}
                    />
                  </div>
                ) : null}

                <button
                  type="button"
                  disabled={!canAnalyze || loading}
                  onClick={() => runAnalysis()}
                  className={cx(
                    "mt-6 w-full rounded-sm px-5 py-4 font-semibold uppercase tracking-[0.12em] disabled:cursor-not-allowed disabled:opacity-50",
                    accentButtonClass,
                  )}
                >
                  {loading
                    ? "Analyzing..."
                    : mode === "look"
                      ? dictionary.demoSection.analyzeLook
                      : dictionary.demoSection.analyzeItem}
                </button>

                {analysisError ? (
                  <div
                    className={cx(
                      "mt-4 rounded-xl border px-4 py-3 text-sm",
                      isDark
                        ? "border-red-400/30 bg-red-400/10 text-red-200"
                        : "border-red-200 bg-red-50 text-red-700",
                    )}
                  >
                    {analysisError}
                  </div>
                ) : null}
              </div>
            </div>

            <div className={cx(panelClass, "rounded-[1.5rem] p-6")}>
              <div className={cx("text-[11px] uppercase tracking-[0.22em]", accentTextClass)}>
                {dictionary.common.results}
              </div>
              <h2 className={cx(headingClass, "mt-3 text-4xl")}>
                {dictionary.resultsSection.title}
              </h2>

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
                      {mode === "buy"
                        ? extra.uploadItemFirst
                        : hasWardrobe
                          ? extra.uploadLookOrWardrobeFirst
                          : extra.uploadLookFirst}
                    </div>
                  )}

                  {showWinningOutfit ? (
                    <div className={cx("mt-4 rounded-xl border px-4 py-3 text-sm", isDark ? "border-[#4b3d2e] bg-[#120f0b]" : "border-[#e2d6c3] bg-[#fffaf1]")}>
                      <div className={cx("text-[11px] uppercase tracking-[0.18em]", accentTextClass)}>
                        {dictionary.resultsSection.winningOutfit}
                      </div>
                      <div className={cx("mt-2 font-semibold", primaryTextClass)}>
                        {result?.winningOutfitLabel}
                      </div>
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
                      <div className={cx(headingClass, "mt-4 text-3xl")}>
                        {dictionary.resultsSection.emptyTitle}
                      </div>
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
                        <h3 className={cx(headingClass, "mt-3 text-4xl leading-tight")}>
                          {result.assessment}
                        </h3>
                        <p className={cx("mt-3", mutedClass)}>{result.rationale}</p>
                      </div>

                      {showWinningOutfit ? (
                        <div className={cx("mt-4 rounded-2xl p-4", isDark ? "bg-[#181411]" : "border border-[#e3d9c7] bg-[#f7f1e8]")}>
                          <div className={cx("text-[11px] uppercase tracking-[0.18em]", accentTextClass)}>
                            {dictionary.resultsSection.winningOutfit}
                          </div>
                          <div className={cx("mt-2 text-xl font-semibold", primaryTextClass)}>
                            {result.winningOutfitLabel}
                          </div>
                          <p className={cx("mt-2 text-sm leading-7", mutedClass)}>
                            {result.winningReason}
                          </p>
                          {result.comparisonNotes.length > 0 ? (
                            <ul className={cx("mt-4 space-y-2 text-sm", mutedClass)}>
                              {result.comparisonNotes.map((item) => (
                                <li key={item} className="flex gap-3">
                                  <span className={accentTextClass}>+</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                      ) : null}

                      <div className="mt-6 space-y-4">
                        <Score
                          isDark={isDark}
                          label={
                            mode === "buy"
                              ? dictionary.resultsSection.scores.visualAppeal
                              : dictionary.resultsSection.scores.confidence
                          }
                          value={result.confidence}
                        />
                        <Score
                          isDark={isDark}
                          label={
                            mode === "buy"
                              ? dictionary.resultsSection.scores.worthBuying
                              : dictionary.resultsSection.scores.outfitStrength
                          }
                          value={result.outfit}
                        />
                        {mode === "look" ? (
                          <Score
                            isDark={isDark}
                            label={dictionary.resultsSection.scores.grooming}
                            value={result.grooming}
                          />
                        ) : null}
                        <Score
                          isDark={isDark}
                          label={dictionary.resultsSection.scores.colorHarmony}
                          value={result.color}
                        />
                        <Score
                          isDark={isDark}
                          label={
                            mode === "buy"
                              ? dictionary.resultsSection.scores.versatility
                              : dictionary.resultsSection.scores.occasionFit
                          }
                          value={result.occasion}
                        />
                      </div>

                      <div className="mt-8 grid gap-4 md:grid-cols-2">
                        <div className={cx("rounded-2xl p-4", isDark ? "bg-[#181411]" : "border border-[#e3d9c7] bg-[#f7f1e8]")}>
                          <div className="text-[11px] uppercase tracking-[0.18em] text-emerald-500">
                            {dictionary.resultsSection.strongPoints}
                          </div>
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
                          <div className="text-[11px] uppercase tracking-[0.18em] text-red-500">
                            {dictionary.resultsSection.areasToRefine}
                          </div>
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

                      <div
                        className={cx(
                          "mt-4 rounded-2xl p-4",
                          isDark ? "bg-[#221a13]" : "border border-amber-200 bg-amber-50",
                        )}
                      >
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

                      {result.wardrobeSuggestions.length > 0 || wardrobeItems.length > 0 ? (
                        <div className={cx("mt-4 rounded-2xl p-4", isDark ? "bg-[#181411]" : "border border-[#e3d9c7] bg-[#f7f1e8]")}>
                          <div className={cx("text-[11px] uppercase tracking-[0.18em]", accentTextClass)}>
                            {dictionary.demoSection.wardrobeSuggestions}
                          </div>
                          {result.wardrobeSuggestions.length > 0 ? (
                            <ul className={cx("mt-3 space-y-2 text-sm", mutedClass)}>
                              {result.wardrobeSuggestions.map((item) => (
                                <li key={item} className="flex gap-3">
                                  <span className={accentTextClass}>+</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className={cx("mt-3 text-sm leading-7", mutedClass)}>
                              {dictionary.demoSection.wardrobeSuggestionsEmpty}
                            </p>
                          )}
                        </div>
                      ) : null}

                      {showFollowUp ? (
                        <div className={cx("mt-4 rounded-2xl p-4", isDark ? "bg-[#181411]" : "border border-[#e3d9c7] bg-[#f7f1e8]")}>
                          <div className={cx("text-[11px] uppercase tracking-[0.18em]", accentTextClass)}>
                            {dictionary.resultsSection.clarificationNeeded}
                          </div>
                          <p className={cx("mt-3 text-sm leading-7", mutedClass)}>
                            {result.followUpQuestion}
                          </p>
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
                              className={cx(
                                "rounded-sm px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] disabled:cursor-not-allowed disabled:opacity-50",
                                accentButtonClass,
                              )}
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
          </div>
        </section>
      </main>
    </div>
  );
}
