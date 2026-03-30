export type Language = "en" | "fr" | "es" | "ar";

export const defaultLanguage: Language = "en";

export const languageOptions: Array<{ value: Language; label: string }> = [
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "es", label: "Español" },
  { value: "ar", label: "العربية" },
];

export function isSupportedLanguage(value: string): value is Language {
  return languageOptions.some((option) => option.value === value);
}

export function getLanguageDirection(language: Language) {
  return language === "ar" ? "rtl" : "ltr";
}

type AppDictionary = {
  common: {
    language: string;
    blackMode: string;
    whiteMode: string;
    backToHome: string;
    pricing: string;
    demo: string;
    results: string;
    hostedCheckout: string;
    getStarted: string;
  };
  nav: {
    howItWorks: string;
    features: string;
    tryIt: string;
    pricing: string;
  };
  hero: {
    eyebrow: string;
    titleStart: string;
    titleAccent: string;
    description: string;
    analyze: string;
    seeProcess: string;
  };
  showcase: {
    uploadPreview: string;
    selfieOrLook: string;
    keepItClear: string;
    appearanceScore: string;
    mostlyReady: string;
    quickNote: string;
    quickNoteText: string;
    mirorReads: string;
    readsList: string[];
  };
  stats: string[];
  process: {
    eyebrow: string;
    titleStart: string;
    titleAccent: string;
    description: string;
    steps: Array<{
      step: string;
      token: string;
      title: string;
      description: string;
    }>;
  };
  featuresSection: {
    eyebrow: string;
    titleStart: string;
    titleAccent: string;
    description: string;
    cards: Array<{
      title: string;
      description: string;
    }>;
  };
  demoSection: {
    currentLook: string;
    buyThis: string;
    primaryImage: string;
    uploadLookTitle: string;
    uploadLookDescription: string;
    groupMode: string;
    groupModeDescription: string;
    targetPerson: string;
    targetPersonPlaceholder: string;
    outfitOptions: string;
    upToThreeLooks: string;
    productImage: string;
    uploadItemTitle: string;
    uploadItemDescription: string;
    occasion: string;
    intendedOccasion: string;
    customOccasion: string;
    customOccasionLabel: string;
    customOccasionPlaceholder: string;
    wardrobeTitle: string;
    wardrobeDescription: string;
    wardrobeUpload: string;
    wardrobeHint: string;
    wardrobeSuggestions: string;
    wardrobeSuggestionsEmpty: string;
    category: string;
    analyzeLook: string;
    analyzeItem: string;
    occasionLabels: Record<string, string>;
    wardrobeCategoryLabels: Record<string, string>;
  };
  resultsSection: {
    title: string;
    emptyEyebrow: string;
    emptyTitle: string;
    emptyItems: string[];
    overallAssessment: string;
    winningOutfit: string;
    strongPoints: string;
    areasToRefine: string;
    recommendedImprovements: string;
    clarificationNeeded: string;
    followUpPlaceholder: string;
    submit: string;
    scores: {
      confidence: string;
      visualAppeal: string;
      outfitStrength: string;
      worthBuying: string;
      grooming: string;
      colorHarmony: string;
      occasionFit: string;
      versatility: string;
    };
  };
  pricingState: {
    title: string;
    description: string;
    hostedCheckout: string;
    hostedCheckoutDescription: string;
  };
};

export const appDictionaries: Record<Language, AppDictionary> = {
  en: {
    common: {
      language: "Language",
      blackMode: "Black mode",
      whiteMode: "White mode",
      backToHome: "Back to home",
      pricing: "Pricing",
      demo: "Demo",
      results: "Results",
      hostedCheckout: "Hosted checkout",
      getStarted: "Get Started",
    },
    nav: {
      howItWorks: "How it works",
      features: "Features",
      tryIt: "Try it",
      pricing: "Pricing",
    },
    hero: {
      eyebrow: "Private AI appearance coach",
      titleStart: "Look your",
      titleAccent: "absolute best.",
      description:
        "Upload a selfie, choose the occasion, and get sharp guidance on outfit harmony, grooming, colors, and whether the whole thing actually works before you leave.",
      analyze: "Analyze my look",
      seeProcess: "See how it works",
    },
    showcase: {
      uploadPreview: "Upload preview",
      selfieOrLook: "Selfie or full look",
      keepItClear: "Keep it clear. MIROR does the judging after the upload.",
      appearanceScore: "Appearance score",
      mostlyReady: "Mostly ready",
      quickNote: "Quick note",
      quickNoteText: "Sharper collar. Better balance.",
      mirorReads: "MIROR reads",
      readsList: [
        "Suitability for the setting",
        "Color discipline near the face",
        "Whether the look feels intentional",
      ],
    },
    stats: [
      "Looks analyzed",
      "Said it helped",
      "Average analysis time",
      "Occasion types",
    ],
    process: {
      eyebrow: "The process",
      titleStart: "Four steps to",
      titleAccent: "knowing you look good.",
      description:
        "No opinions from friends. No guessing in the mirror. Just fast, private, honest feedback.",
      steps: [
        {
          step: "01 /",
          token: "Upload",
          title: "Upload your photo",
          description:
            "Take a clear selfie or use a recent full-look shot. Better input gives better coaching.",
        },
        {
          step: "02 /",
          token: "Context",
          title: "Choose your occasion",
          description:
            "Date, party, work, wedding, or casual. The same outfit can succeed or fail depending on context.",
        },
        {
          step: "03 /",
          token: "Analysis",
          title: "AI reads the full picture",
          description:
            "Outfit harmony, grooming, color balance, and occasion fit are scored together rather than in isolation.",
        },
        {
          step: "04 /",
          token: "Action",
          title: "Get useful next steps",
          description:
            "What to keep, what to swap, what to buy, and what to stop pretending works.",
        },
      ],
    },
    featuresSection: {
      eyebrow: "What we analyze",
      titleStart: "Your complete",
      titleAccent: "appearance picture.",
      description:
        "More than a photo filter. A coaching system built around the decisions people actually struggle with.",
      cards: [
        {
          title: "Skin Tone and Color Matching",
          description:
            "Identifies your approximate tone category and points toward colors that flatter instead of draining you.",
        },
        {
          title: "Face Shape and Haircut Advice",
          description:
            "Suggests better framing, haircut direction, and beard balance so the face and outfit stop fighting each other.",
        },
        {
          title: "Outfit Scoring and Comparison",
          description:
            "Upload up to 3 looks. MIROR ranks them and explains why one wins for the moment you are dressing for.",
        },
        {
          title: "Occasion-Based Context",
          description:
            "A look that works casually can fail on a date. Recommendations adapt to the setting instead of staying generic.",
        },
        {
          title: "Presence and Confidence Cues",
          description:
            "Presentation matters. Posture, polish, and overall sharpness are treated as part of the final impression.",
        },
        {
          title: "Wardrobe Memory",
          description:
            "Upload wardrobe pieces, compare options, and build combinations without restarting the decision process from zero.",
        },
      ],
    },
    demoSection: {
      currentLook: "Current look",
      buyThis: "Should I buy this?",
      primaryImage: "Primary image",
      uploadLookTitle: "Upload selfie or full look",
      uploadLookDescription: "Real upload preview here. Gemini reads the image after you submit it.",
      groupMode: "Group photo mode",
      groupModeDescription:
        "Add a short note so MIROR knows exactly which person to judge.",
      targetPerson: "Who are you in the photo?",
      targetPersonPlaceholder:
        "Example: I am the person in the middle wearing the black jacket.",
      outfitOptions: "Outfit options",
      upToThreeLooks: "Up to 3 looks",
      productImage: "Product image",
      uploadItemTitle: "Upload clothing item",
      uploadItemDescription:
        "MIROR checks visual appeal, versatility, and whether it deserves the money.",
      occasion: "Occasion",
      intendedOccasion: "Intended occasion",
      customOccasion: "Custom occasion",
      customOccasionLabel: "Custom occasion details",
      customOccasionPlaceholder: "Example: dinner with family",
      wardrobeTitle: "Wardrobe upload",
      wardrobeDescription:
        "Optional: upload wardrobe pieces so MIROR can suggest combinations that suit the occasion.",
      wardrobeUpload: "Add wardrobe items",
      wardrobeHint:
        "Category is estimated automatically, and you can adjust it item by item.",
      wardrobeSuggestions: "Wardrobe suggestions",
      wardrobeSuggestionsEmpty:
        "Upload wardrobe pieces to unlock occasion-based outfit suggestions.",
      category: "Category",
      analyzeLook: "Analyze my look",
      analyzeItem: "Analyze this item",
      occasionLabels: {
        date: "Date",
        party: "Party",
        work: "Work",
        wedding: "Wedding",
        casual: "Casual",
        custom: "Custom occasion",
      },
      wardrobeCategoryLabels: {
        tops: "Tops",
        pants: "Pants",
        shoes: "Shoes",
        jackets: "Jackets",
        accessories: "Accessories",
        other: "Other",
      },
    },
    resultsSection: {
      title: "Professional analysis, same MIROR layout.",
      emptyEyebrow: "Structured output",
      emptyTitle: "What MIROR returns every single time",
      emptyItems: [
        "Overall assessment",
        "Winning outfit when comparison is active",
        "Strong points",
        "Areas to refine",
        "Recommended improvements",
        "Scores that are not ridiculously generous",
        "Best outfit or buy/skip decision",
      ],
      overallAssessment: "Overall assessment",
      winningOutfit: "Winning outfit",
      strongPoints: "Strong points",
      areasToRefine: "Areas to refine",
      recommendedImprovements: "Recommended improvements",
      clarificationNeeded: "Clarification needed",
      followUpPlaceholder: "Add a short answer",
      submit: "Submit",
      scores: {
        confidence: "Confidence / Presence",
        visualAppeal: "Visual appeal",
        outfitStrength: "Outfit strength",
        worthBuying: "Worth buying",
        grooming: "Grooming",
        colorHarmony: "Color harmony",
        occasionFit: "Occasion fit",
        versatility: "Versatility",
      },
    },
    pricingState: {
      title: "Make money without making it feel cheap.",
      description:
        "Free users unlock a limited analysis by watching an ad. Paid plans remove ads and open the serious features.",
      hostedCheckout: "Coach and Pro now open in Stripe Checkout.",
      hostedCheckoutDescription:
        "The first billing version stays intentionally small: Stripe handles the payment page now, and subscription syncing lands in the backend phase next.",
    },
  },
  fr: {
    common: {
      language: "Langue",
      blackMode: "Mode noir",
      whiteMode: "Mode clair",
      backToHome: "Retour à l'accueil",
      pricing: "Tarifs",
      demo: "Démo",
      results: "Résultats",
      hostedCheckout: "Paiement hébergé",
      getStarted: "Commencer",
    },
    nav: {
      howItWorks: "Fonctionnement",
      features: "Fonctionnalités",
      tryIt: "Essayer",
      pricing: "Tarifs",
    },
    hero: {
      eyebrow: "Coach d'apparence IA privé",
      titleStart: "Affichez votre",
      titleAccent: "meilleure version.",
      description:
        "Téléchargez un selfie, choisissez l'occasion et obtenez une analyse précise de l'harmonie de la tenue, du grooming, des couleurs et de la cohérence globale.",
      analyze: "Analyser mon look",
      seeProcess: "Voir le fonctionnement",
    },
    showcase: {
      uploadPreview: "Aperçu du téléchargement",
      selfieOrLook: "Selfie ou tenue complète",
      keepItClear: "Gardez une image nette. MIROR juge après le téléchargement.",
      appearanceScore: "Score d'apparence",
      mostlyReady: "Presque prêt",
      quickNote: "Note rapide",
      quickNoteText: "Col plus net. Meilleur équilibre.",
      mirorReads: "MIROR analyse",
      readsList: [
        "L'adéquation au contexte",
        "La discipline des couleurs près du visage",
        "Le caractère intentionnel du look",
      ],
    },
    stats: [
      "Looks analysés",
      "Ont trouvé cela utile",
      "Temps moyen d'analyse",
      "Types d'occasion",
    ],
    process: {
      eyebrow: "Le processus",
      titleStart: "Quatre étapes pour",
      titleAccent: "savoir que vous êtes au point.",
      description:
        "Pas d'avis approximatifs. Pas de doute devant le miroir. Juste un retour rapide, privé et honnête.",
      steps: [
        {
          step: "01 /",
          token: "Téléchargement",
          title: "Téléchargez votre photo",
          description:
            "Prenez un selfie net ou une photo récente en pied. Un meilleur input donne un meilleur coaching.",
        },
        {
          step: "02 /",
          token: "Contexte",
          title: "Choisissez votre occasion",
          description:
            "Rendez-vous, soirée, travail, mariage ou casual. Une même tenue peut réussir ou échouer selon le contexte.",
        },
        {
          step: "03 /",
          token: "Analyse",
          title: "L'IA lit l'ensemble",
          description:
            "L'harmonie de la tenue, le grooming, les couleurs et l'adéquation à l'occasion sont évalués ensemble.",
        },
        {
          step: "04 /",
          token: "Action",
          title: "Obtenez des actions utiles",
          description:
            "Ce qu'il faut garder, changer, acheter, et ce qui ne fonctionne plus réellement.",
        },
      ],
    },
    featuresSection: {
      eyebrow: "Ce que nous analysons",
      titleStart: "Votre",
      titleAccent: "image complète.",
      description:
        "Plus qu'un filtre photo. Un système de coaching centré sur les vraies décisions de style.",
      cards: [
        {
          title: "Teint et couleurs",
          description:
            "Identifie votre tonalité approximative et les couleurs qui vous mettent en valeur au lieu de vous fatiguer.",
        },
        {
          title: "Visage et coupe",
          description:
            "Suggère de meilleurs cadrages, directions de coupe et équilibre de barbe.",
        },
        {
          title: "Comparaison de tenues",
          description:
            "Téléchargez jusqu'à 3 looks. MIROR les classe et explique clairement lequel gagne.",
        },
        {
          title: "Contexte de l'occasion",
          description:
            "Un look peut marcher en casual et rater en rendez-vous. Les recommandations s'adaptent au contexte.",
        },
        {
          title: "Présence et impact",
          description:
            "La présentation compte. Le niveau de finition fait partie de l'impression finale.",
        },
        {
          title: "Mémoire du dressing",
          description:
            "Téléchargez vos pièces, comparez-les et construisez des combinaisons sans repartir de zéro.",
        },
      ],
    },
    demoSection: {
      currentLook: "Look actuel",
      buyThis: "Dois-je acheter cet article ?",
      primaryImage: "Image principale",
      uploadLookTitle: "Télécharger un selfie ou un look complet",
      uploadLookDescription:
        "L'aperçu s'affiche ici. Gemini lit l'image après l'envoi.",
      groupMode: "Mode photo de groupe",
      groupModeDescription:
        "Ajoutez une courte note pour que MIROR sache exactement qui analyser.",
      targetPerson: "Qui êtes-vous sur la photo ?",
      targetPersonPlaceholder:
        "Exemple : je suis la personne au milieu avec la veste noire.",
      outfitOptions: "Options de tenue",
      upToThreeLooks: "Jusqu'à 3 looks",
      productImage: "Image produit",
      uploadItemTitle: "Télécharger un vêtement",
      uploadItemDescription:
        "MIROR évalue l'attrait visuel, la polyvalence et si la pièce mérite l'achat.",
      occasion: "Occasion",
      intendedOccasion: "Occasion visée",
      customOccasion: "Occasion personnalisée",
      customOccasionLabel: "Détail de l'occasion",
      customOccasionPlaceholder: "Exemple : dîner en famille",
      wardrobeTitle: "Téléchargement du dressing",
      wardrobeDescription:
        "Optionnel : ajoutez des pièces de votre dressing pour obtenir des suggestions adaptées à l'occasion.",
      wardrobeUpload: "Ajouter des pièces",
      wardrobeHint:
        "La catégorie est estimée automatiquement, puis ajustable pièce par pièce.",
      wardrobeSuggestions: "Suggestions dressing",
      wardrobeSuggestionsEmpty:
        "Ajoutez des pièces pour débloquer des propositions de tenues adaptées.",
      category: "Catégorie",
      analyzeLook: "Analyser mon look",
      analyzeItem: "Analyser cet article",
      occasionLabels: {
        date: "Rendez-vous",
        party: "Soirée",
        work: "Travail",
        wedding: "Mariage",
        casual: "Décontracté",
        custom: "Occasion personnalisée",
      },
      wardrobeCategoryLabels: {
        tops: "Hauts",
        pants: "Pantalons",
        shoes: "Chaussures",
        jackets: "Vestes",
        accessories: "Accessoires",
        other: "Autre",
      },
    },
    resultsSection: {
      title: "Analyse professionnelle, même mise en page MIROR.",
      emptyEyebrow: "Sortie structurée",
      emptyTitle: "Ce que MIROR renvoie à chaque fois",
      emptyItems: [
        "Évaluation globale",
        "Tenue gagnante si comparaison",
        "Points forts",
        "Axes à affiner",
        "Améliorations recommandées",
        "Scores crédibles",
        "Décision finale achat / tenue",
      ],
      overallAssessment: "Évaluation globale",
      winningOutfit: "Tenue gagnante",
      strongPoints: "Points forts",
      areasToRefine: "Axes à affiner",
      recommendedImprovements: "Améliorations recommandées",
      clarificationNeeded: "Clarification nécessaire",
      followUpPlaceholder: "Ajoutez une réponse courte",
      submit: "Envoyer",
      scores: {
        confidence: "Présence / assurance",
        visualAppeal: "Impact visuel",
        outfitStrength: "Force de la tenue",
        worthBuying: "Mérite l'achat",
        grooming: "Grooming",
        colorHarmony: "Harmonie des couleurs",
        occasionFit: "Adéquation à l'occasion",
        versatility: "Polyvalence",
      },
    },
    pricingState: {
      title: "Monétiser sans que cela paraisse cheap.",
      description:
        "Les utilisateurs gratuits débloquent une analyse limitée via une publicité. Les offres payantes suppriment les pubs et ouvrent les fonctions sérieuses.",
      hostedCheckout: "Coach et Pro ouvrent maintenant Stripe Checkout.",
      hostedCheckoutDescription:
        "La première version du paiement reste volontairement simple : Stripe gère la page de paiement, puis la synchronisation backend viendra ensuite.",
    },
  },
  es: {
    common: {
      language: "Idioma",
      blackMode: "Modo negro",
      whiteMode: "Modo claro",
      backToHome: "Volver al inicio",
      pricing: "Precios",
      demo: "Demo",
      results: "Resultados",
      hostedCheckout: "Checkout alojado",
      getStarted: "Empezar",
    },
    nav: {
      howItWorks: "Cómo funciona",
      features: "Funciones",
      tryIt: "Probar",
      pricing: "Precios",
    },
    hero: {
      eyebrow: "Coach de imagen con IA",
      titleStart: "Luce tu",
      titleAccent: "mejor versión.",
      description:
        "Sube una selfie, elige la ocasión y recibe una guía precisa sobre armonía del look, grooming, color y si todo realmente funciona.",
      analyze: "Analizar mi look",
      seeProcess: "Ver cómo funciona",
    },
    showcase: {
      uploadPreview: "Vista previa",
      selfieOrLook: "Selfie o look completo",
      keepItClear: "Mantén la imagen clara. MIROR juzga después de la subida.",
      appearanceScore: "Puntuación visual",
      mostlyReady: "Casi listo",
      quickNote: "Nota rápida",
      quickNoteText: "Cuello más limpio. Mejor equilibrio.",
      mirorReads: "MIROR analiza",
      readsList: [
        "Adecuación al contexto",
        "Disciplina del color cerca del rostro",
        "Si el look se siente intencional",
      ],
    },
    stats: [
      "Looks analizados",
      "Dijeron que ayudó",
      "Tiempo medio de análisis",
      "Tipos de ocasión",
    ],
    process: {
      eyebrow: "El proceso",
      titleStart: "Cuatro pasos para",
      titleAccent: "saber que te ves bien.",
      description:
        "Sin opiniones vagas. Sin adivinar frente al espejo. Solo feedback rápido, privado y honesto.",
      steps: [
        {
          step: "01 /",
          token: "Subida",
          title: "Sube tu foto",
          description:
            "Haz una selfie clara o usa una foto reciente del look completo. Mejor entrada, mejor análisis.",
        },
        {
          step: "02 /",
          token: "Contexto",
          title: "Elige la ocasión",
          description:
            "Cita, fiesta, trabajo, boda o casual. El mismo look puede funcionar o fallar según el contexto.",
        },
        {
          step: "03 /",
          token: "Análisis",
          title: "La IA lee el conjunto",
          description:
            "La armonía del look, el grooming, el color y la adecuación a la ocasión se evalúan en conjunto.",
        },
        {
          step: "04 /",
          token: "Acción",
          title: "Recibe pasos útiles",
          description:
            "Qué mantener, qué cambiar, qué comprar y qué dejar de fingir que funciona.",
        },
      ],
    },
    featuresSection: {
      eyebrow: "Qué analizamos",
      titleStart: "Tu imagen",
      titleAccent: "completa.",
      description:
        "Mucho más que un filtro. Un sistema de coaching pensado para decisiones reales de estilo.",
      cards: [
        {
          title: "Tono de piel y color",
          description:
            "Identifica tu tono aproximado y propone colores que favorecen en lugar de apagarte.",
        },
        {
          title: "Rostro y corte",
          description:
            "Sugiere mejor encuadre, dirección de corte y equilibrio de barba.",
        },
        {
          title: "Comparación de outfits",
          description:
            "Sube hasta 3 looks. MIROR los clasifica y explica claramente cuál gana.",
        },
        {
          title: "Contexto de ocasión",
          description:
            "Un look puede funcionar en casual y fallar en una cita. Las recomendaciones se adaptan al contexto.",
        },
        {
          title: "Presencia e impacto",
          description:
            "La presentación importa. El nivel de acabado forma parte de la impresión final.",
        },
        {
          title: "Memoria de armario",
          description:
            "Sube piezas de tu armario, compáralas y arma combinaciones sin empezar de cero.",
        },
      ],
    },
    demoSection: {
      currentLook: "Look actual",
      buyThis: "¿Debería comprar esto?",
      primaryImage: "Imagen principal",
      uploadLookTitle: "Sube una selfie o look completo",
      uploadLookDescription:
        "La vista previa aparece aquí. Gemini lee la imagen después del envío.",
      groupMode: "Modo foto grupal",
      groupModeDescription:
        "Agrega una nota corta para que MIROR sepa exactamente a quién evaluar.",
      targetPerson: "¿Quién eres en la foto?",
      targetPersonPlaceholder:
        "Ejemplo: soy la persona del medio con la chaqueta negra.",
      outfitOptions: "Opciones de outfit",
      upToThreeLooks: "Hasta 3 looks",
      productImage: "Imagen del producto",
      uploadItemTitle: "Sube la prenda",
      uploadItemDescription:
        "MIROR revisa atractivo visual, versatilidad y si realmente merece el dinero.",
      occasion: "Ocasión",
      intendedOccasion: "Ocasión prevista",
      customOccasion: "Ocasión personalizada",
      customOccasionLabel: "Detalle de la ocasión",
      customOccasionPlaceholder: "Ejemplo: cena familiar",
      wardrobeTitle: "Subida de armario",
      wardrobeDescription:
        "Opcional: sube piezas de tu armario para que MIROR sugiera combinaciones según la ocasión.",
      wardrobeUpload: "Agregar prendas",
      wardrobeHint:
        "La categoría se estima automáticamente y puedes ajustarla pieza por pieza.",
      wardrobeSuggestions: "Sugerencias de armario",
      wardrobeSuggestionsEmpty:
        "Sube prendas para desbloquear sugerencias de combinaciones según la ocasión.",
      category: "Categoría",
      analyzeLook: "Analizar mi look",
      analyzeItem: "Analizar este artículo",
      occasionLabels: {
        date: "Cita",
        party: "Fiesta",
        work: "Trabajo",
        wedding: "Boda",
        casual: "Casual",
        custom: "Ocasión personalizada",
      },
      wardrobeCategoryLabels: {
        tops: "Tops",
        pants: "Pantalones",
        shoes: "Zapatos",
        jackets: "Chaquetas",
        accessories: "Accesorios",
        other: "Otro",
      },
    },
    resultsSection: {
      title: "Análisis profesional, mismo diseño MIROR.",
      emptyEyebrow: "Salida estructurada",
      emptyTitle: "Lo que MIROR devuelve siempre",
      emptyItems: [
        "Evaluación general",
        "Outfit ganador si hay comparación",
        "Puntos fuertes",
        "Áreas a refinar",
        "Mejoras recomendadas",
        "Puntuaciones creíbles",
        "Decisión final de compra o look",
      ],
      overallAssessment: "Evaluación general",
      winningOutfit: "Outfit ganador",
      strongPoints: "Puntos fuertes",
      areasToRefine: "Áreas a refinar",
      recommendedImprovements: "Mejoras recomendadas",
      clarificationNeeded: "Se necesita aclaración",
      followUpPlaceholder: "Agrega una respuesta breve",
      submit: "Enviar",
      scores: {
        confidence: "Presencia / confianza",
        visualAppeal: "Atractivo visual",
        outfitStrength: "Fuerza del outfit",
        worthBuying: "Vale la compra",
        grooming: "Grooming",
        colorHarmony: "Armonía de color",
        occasionFit: "Ajuste a la ocasión",
        versatility: "Versatilidad",
      },
    },
    pricingState: {
      title: "Monetiza sin que se sienta barato.",
      description:
        "Los usuarios gratis desbloquean un análisis limitado viendo un anuncio. Los planes de pago eliminan anuncios y abren las funciones serias.",
      hostedCheckout: "Coach y Pro ahora abren Stripe Checkout.",
      hostedCheckoutDescription:
        "La primera versión de pagos sigue siendo deliberadamente simple: Stripe gestiona el pago y la sincronización llegará después en el backend.",
    },
  },
  ar: {
    common: {
      language: "اللغة",
      blackMode: "الوضع الأسود",
      whiteMode: "الوضع الفاتح",
      backToHome: "العودة إلى الرئيسية",
      pricing: "الأسعار",
      demo: "تجربة",
      results: "النتائج",
      hostedCheckout: "دفع مستضاف",
      getStarted: "ابدأ الآن",
    },
    nav: {
      howItWorks: "كيف يعمل",
      features: "المزايا",
      tryIt: "جرّبه",
      pricing: "الأسعار",
    },
    hero: {
      eyebrow: "مدرب مظهر خاص بالذكاء الاصطناعي",
      titleStart: "اظهر بأفضل",
      titleAccent: "نسخة منك.",
      description:
        "ارفع صورة سيلفي، اختر المناسبة، واحصل على تقييم واضح لتناسق الإطلالة، العناية، الألوان، وهل الشكل كله يعمل فعلاً أم لا.",
      analyze: "حلل إطلالتي",
      seeProcess: "اعرف كيف يعمل",
    },
    showcase: {
      uploadPreview: "معاينة الرفع",
      selfieOrLook: "سيلفي أو إطلالة كاملة",
      keepItClear: "اجعل الصورة واضحة. MIROR يحكم بعد الرفع.",
      appearanceScore: "تقييم المظهر",
      mostlyReady: "جاهز تقريباً",
      quickNote: "ملاحظة سريعة",
      quickNoteText: "ياقة أنظف. توازن أفضل.",
      mirorReads: "MIROR يقرأ",
      readsList: [
        "مدى ملاءمة الإطلالة للمناسبة",
        "انضباط الألوان قرب الوجه",
        "هل تبدو الإطلالة مقصودة",
      ],
    },
    stats: [
      "إطلالات تم تحليلها",
      "قالوا إنها مفيدة",
      "متوسط وقت التحليل",
      "أنواع المناسبات",
    ],
    process: {
      eyebrow: "العملية",
      titleStart: "أربع خطوات لكي",
      titleAccent: "تعرف أنك تبدو جيداً.",
      description:
        "بدون آراء عشوائية. بدون تخمين أمام المرآة. فقط ملاحظات سريعة وخاصة وصادقة.",
      steps: [
        {
          step: "01 /",
          token: "رفع",
          title: "ارفع صورتك",
          description:
            "خذ سيلفي واضحة أو استخدم صورة حديثة للإطلالة الكاملة. كلما كانت الصورة أفضل، كان التقييم أدق.",
        },
        {
          step: "02 /",
          token: "سياق",
          title: "اختر المناسبة",
          description:
            "موعد، حفلة، عمل، زفاف أو كاجوال. نفس الإطلالة قد تنجح أو تفشل حسب السياق.",
        },
        {
          step: "03 /",
          token: "تحليل",
          title: "الذكاء الاصطناعي يقرأ الصورة كاملة",
          description:
            "يتم تقييم تناسق الإطلالة، العناية، الألوان، وملاءمة المناسبة معاً وليس بشكل منفصل.",
        },
        {
          step: "04 /",
          token: "تنفيذ",
          title: "احصل على خطوات عملية",
          description:
            "ما الذي يستحق أن يبقى، ما الذي يجب تغييره، ما الذي يستحق الشراء، وما الذي لا يعمل فعلاً.",
        },
      ],
    },
    featuresSection: {
      eyebrow: "ما الذي نحلله",
      titleStart: "صورتك",
      titleAccent: "الكاملة.",
      description:
        "أكثر من مجرد فلتر. نظام توجيه مبني على قرارات المظهر الحقيقية التي يحتار فيها الناس.",
      cards: [
        {
          title: "تناسق الألوان والبشرة",
          description:
            "يحدد فئة لونك التقريبية ويقترح الألوان التي ترفع مظهرك بدل أن تطفئه.",
        },
        {
          title: "شكل الوجه والقصّة",
          description:
            "يقترح إطاراً أفضل للوجه واتجاهاً أنسب للشعر أو اللحية.",
        },
        {
          title: "مقارنة الإطلالات",
          description:
            "ارفع حتى 3 إطلالات. MIROR يرتبها ويشرح بوضوح لماذا إحداها هي الأفضل.",
        },
        {
          title: "سياق المناسبة",
          description:
            "قد تنجح الإطلالة بشكل يومي وتفشل في موعد. التوصيات تتغير حسب المناسبة.",
        },
        {
          title: "الحضور والانطباع",
          description:
            "طريقة الظهور مهمة. مستوى الإتقان جزء من الانطباع النهائي.",
        },
        {
          title: "ذاكرة خزانة الملابس",
          description:
            "ارفع قطع خزانتك، قارن بينها، وابنِ تركيبات مناسبة دون البدء من الصفر.",
        },
      ],
    },
    demoSection: {
      currentLook: "الإطلالة الحالية",
      buyThis: "هل أشتري هذا؟",
      primaryImage: "الصورة الرئيسية",
      uploadLookTitle: "ارفع سيلفي أو إطلالة كاملة",
      uploadLookDescription:
        "تظهر المعاينة هنا. Gemini يقرأ الصورة بعد الإرسال.",
      groupMode: "وضع صورة جماعية",
      groupModeDescription:
        "أضف ملاحظة قصيرة حتى يعرف MIROR من الشخص الذي يجب تقييمه.",
      targetPerson: "من أنت في الصورة؟",
      targetPersonPlaceholder:
        "مثال: أنا الشخص في المنتصف الذي يرتدي جاكيت أسود.",
      outfitOptions: "خيارات الإطلالة",
      upToThreeLooks: "حتى 3 إطلالات",
      productImage: "صورة المنتج",
      uploadItemTitle: "ارفع قطعة الملابس",
      uploadItemDescription:
        "MIROR يقيم الجاذبية البصرية، المرونة، وهل القطعة تستحق السعر فعلاً.",
      occasion: "المناسبة",
      intendedOccasion: "المناسبة المقصودة",
      customOccasion: "مناسبة مخصصة",
      customOccasionLabel: "تفاصيل المناسبة",
      customOccasionPlaceholder: "مثال: عشاء عائلي",
      wardrobeTitle: "رفع خزانة الملابس",
      wardrobeDescription:
        "اختياري: ارفع قطعاً من خزانتك ليقترح MIROR تركيبات مناسبة للمناسبة.",
      wardrobeUpload: "أضف قطع الخزانة",
      wardrobeHint:
        "يتم تقدير الفئة تلقائياً ويمكن تعديلها لكل قطعة.",
      wardrobeSuggestions: "اقتراحات من الخزانة",
      wardrobeSuggestionsEmpty:
        "ارفع قطعاً من الخزانة لفتح اقتراحات تركيبات مناسبة للمناسبة.",
      category: "الفئة",
      analyzeLook: "حلل إطلالتي",
      analyzeItem: "حلل هذه القطعة",
      occasionLabels: {
        date: "موعد",
        party: "حفلة",
        work: "عمل",
        wedding: "زفاف",
        casual: "كاجوال",
        custom: "مناسبة مخصصة",
      },
      wardrobeCategoryLabels: {
        tops: "أعلى الجسم",
        pants: "بنطال",
        shoes: "أحذية",
        jackets: "جاكيتات",
        accessories: "إكسسوارات",
        other: "أخرى",
      },
    },
    resultsSection: {
      title: "تحليل احترافي بنفس تخطيط MIROR.",
      emptyEyebrow: "مخرجات منظمة",
      emptyTitle: "ما الذي يعيده MIROR في كل مرة",
      emptyItems: [
        "تقييم عام",
        "الإطلالة الفائزة عند المقارنة",
        "النقاط القوية",
        "النقاط التي تحتاج ضبطاً",
        "التحسينات المقترحة",
        "درجات واقعية",
        "قرار نهائي للشراء أو الإطلالة",
      ],
      overallAssessment: "التقييم العام",
      winningOutfit: "الإطلالة الفائزة",
      strongPoints: "النقاط القوية",
      areasToRefine: "نقاط تحتاج ضبطاً",
      recommendedImprovements: "تحسينات مقترحة",
      clarificationNeeded: "توضيح مطلوب",
      followUpPlaceholder: "أضف إجابة قصيرة",
      submit: "إرسال",
      scores: {
        confidence: "الحضور / الثقة",
        visualAppeal: "الجاذبية البصرية",
        outfitStrength: "قوة الإطلالة",
        worthBuying: "هل تستحق الشراء",
        grooming: "العناية",
        colorHarmony: "انسجام الألوان",
        occasionFit: "ملاءمة المناسبة",
        versatility: "المرونة",
      },
    },
    pricingState: {
      title: "حقق الدخل دون أن يبدو الأمر رخيصاً.",
      description:
        "المستخدم المجاني يحصل على تحليل محدود بعد مشاهدة إعلان. الخطط المدفوعة تزيل الإعلانات وتفتح المزايا الجدية.",
      hostedCheckout: "Coach و Pro يفتحان الآن عبر Stripe Checkout.",
      hostedCheckoutDescription:
        "نسخة الدفع الأولى بسيطة عمداً: Stripe يدير صفحة الدفع الآن، أما مزامنة الاشتراك فستأتي لاحقاً في الخلفية.",
    },
  },
};
