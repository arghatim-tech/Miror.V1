export const OCCASIONS = [
  "date",
  "party",
  "work",
  "wedding",
  "casual",
  "custom",
] as const;

export type Occasion = (typeof OCCASIONS)[number];

export const WARDROBE_CATEGORIES = [
  "tops",
  "pants",
  "shoes",
  "jackets",
  "accessories",
  "other",
] as const;

export type WardrobeCategory = (typeof WARDROBE_CATEGORIES)[number];

export const AUTH_PROVIDERS = [
  "google",
  "facebook",
  "email",
  "phone",
] as const;

export type AuthProvider = (typeof AUTH_PROVIDERS)[number];

export const WORKSPACE_SECTIONS = [
  "profile",
  "analyze",
  "wardrobe",
  "try-on",
  "pricing",
  "settings",
] as const;

export type WorkspaceSection = (typeof WORKSPACE_SECTIONS)[number];

export const FIT_PREFERENCES = [
  "tailored",
  "regular",
  "relaxed",
  "slim",
  "oversized",
] as const;

export type FitPreference = (typeof FIT_PREFERENCES)[number] | "";

export type UserMeasurements = {
  heightCm: string;
  weightKg: string;
};

export type UserProfileInput = {
  heightCm: string;
  weightKg: string;
  styleGoal: string;
  preferredFit: FitPreference;
  preferredOccasions: Occasion[];
  notes: string;
};

export type AppearanceAttributes = {
  approximateSkinTone: string;
  eyeColor: string;
  hairColor: string;
  faceShape: string;
  bodyFrameImpression: string;
  contrastLevel: string;
  source: "pending" | "ai" | "manual";
};

export type PersonalPhotoSet = {
  selfie: string | null;
  faceScan: string | null;
  bodyPhoto: string | null;
};

export type WardrobeItemInput = {
  id: string;
  image: string;
  label: string;
  category: WardrobeCategory;
};

export type TryOnDraft = {
  personPhoto: string | null;
  personPhotoSource: "upload" | "profile-selfie" | "profile-face-scan" | "profile-body-photo";
  selectedWardrobeItemId: string | null;
  uploadedGarmentImage: string | null;
  note: string;
};

export type AccountState = {
  accessMode: "guest" | "member" | null;
  authProvider: AuthProvider | null;
  displayName: string;
  loginIdentifier: string;
  onboardingComplete: boolean;
};

export type MirorSupabasePlan = {
  tables: string[];
  storageBuckets: string[];
};

// This mirrors the intended future Supabase shape so the current local state
// can map to persistent records later without a redesign.
export const MIROR_SUPABASE_PLAN: MirorSupabasePlan = {
  tables: [
    "profiles",
    "user_measurements",
    "style_attributes",
    "wardrobe_items",
    "looks",
    "look_images",
    "analysis_results",
    "item_checks",
    "try_on_requests",
  ],
  storageBuckets: [
    "profile-images",
    "look-photos",
    "wardrobe-items",
    "item-checks",
    "try-on-assets",
  ],
};

export function createEmptyUserProfile(): UserProfileInput {
  return {
    heightCm: "",
    weightKg: "",
    styleGoal: "",
    preferredFit: "",
    preferredOccasions: [],
    notes: "",
  };
}

export function createEmptyAppearanceAttributes(): AppearanceAttributes {
  return {
    approximateSkinTone: "",
    eyeColor: "",
    hairColor: "",
    faceShape: "",
    bodyFrameImpression: "",
    contrastLevel: "",
    source: "pending",
  };
}

export function createEmptyPersonalPhotoSet(): PersonalPhotoSet {
  return {
    selfie: null,
    faceScan: null,
    bodyPhoto: null,
  };
}

export function createEmptyTryOnDraft(): TryOnDraft {
  return {
    personPhoto: null,
    personPhotoSource: "upload",
    selectedWardrobeItemId: null,
    uploadedGarmentImage: null,
    note: "",
  };
}

export function createEmptyAccountState(): AccountState {
  return {
    accessMode: null,
    authProvider: null,
    displayName: "",
    loginIdentifier: "",
    onboardingComplete: false,
  };
}

export function hasProfileContext(profile: UserProfileInput) {
  return Boolean(
    profile.heightCm ||
      profile.weightKg ||
      profile.styleGoal ||
      profile.preferredFit ||
      profile.preferredOccasions.length > 0 ||
      profile.notes,
  );
}

export function summarizePreferredOccasions(occasions: Occasion[]) {
  return occasions.length > 0 ? occasions.join(", ") : "";
}
