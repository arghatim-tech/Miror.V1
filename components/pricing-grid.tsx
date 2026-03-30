"use client";

import Link from "next/link";
import { Playfair_Display } from "next/font/google";
import { CheckoutButton } from "@/components/checkout-button";
import { pricingPlans, type PlanId } from "@/lib/pricing";
import type { Language } from "@/lib/i18n";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type PricingGridProps = {
  isDark: boolean;
  onFreePlanClick?: () => void;
  language?: Language;
};

const pricingCopy: Record<
  Language,
  Record<
    PlanId,
    {
      name: string;
      subtitle: string;
      features: string[];
      cta: string;
    }
  >
> = {
  en: {
    free: {
      name: "Free",
      subtitle: "For testing the product without commitment.",
      features: [
        "1 analysis after rewarded ad",
        "Basic look or item review",
        "Single photo upload",
        "No wardrobe memory",
        "No ads-free mode",
      ],
      cta: "Try Free",
    },
    "coach-monthly": {
      name: "Coach",
      subtitle: "Best starting plan for actual repeat use.",
      features: [
        "Unlimited analyses",
        "Up to 3 outfit comparisons",
        "Hair and grooming recommendations",
        "Current look and buy-this-item mode",
        "Ads removed",
        "History saved",
      ],
      cta: "Start Coach",
    },
    "pro-monthly": {
      name: "Pro",
      subtitle: "For power users and future premium features.",
      features: [
        "Everything in Coach",
        "Wardrobe memory",
        "Unlimited wardrobe uploads",
        "Priority processing",
        "Future haircut simulation",
        "Future profile-photo optimization",
      ],
      cta: "Go Pro",
    },
  },
  fr: {
    free: {
      name: "Gratuit",
      subtitle: "Pour tester le produit sans engagement.",
      features: [
        "1 analyse après publicité récompensée",
        "Analyse basique du look ou de l'article",
        "Téléchargement d'une seule photo",
        "Pas de mémoire dressing",
        "Pas de mode sans publicité",
      ],
      cta: "Essayer gratuitement",
    },
    "coach-monthly": {
      name: "Coach",
      subtitle: "Le meilleur point de départ pour un vrai usage régulier.",
      features: [
        "Analyses illimitées",
        "Jusqu'à 3 comparaisons de tenues",
        "Recommandations cheveux et grooming",
        "Mode look actuel et achat",
        "Publicités supprimées",
        "Historique enregistré",
      ],
      cta: "Commencer Coach",
    },
    "pro-monthly": {
      name: "Pro",
      subtitle: "Pour les utilisateurs intensifs et les futures options premium.",
      features: [
        "Tout ce qui est dans Coach",
        "Mémoire dressing",
        "Téléchargements dressing illimités",
        "Traitement prioritaire",
        "Future simulation de coupe",
        "Future optimisation de photo de profil",
      ],
      cta: "Passer Pro",
    },
  },
  es: {
    free: {
      name: "Gratis",
      subtitle: "Para probar el producto sin compromiso.",
      features: [
        "1 análisis tras anuncio recompensado",
        "Revisión básica de look o prenda",
        "Subida de una sola foto",
        "Sin memoria de armario",
        "Sin modo sin anuncios",
      ],
      cta: "Probar gratis",
    },
    "coach-monthly": {
      name: "Coach",
      subtitle: "La mejor opción inicial para un uso real y repetido.",
      features: [
        "Análisis ilimitados",
        "Hasta 3 comparaciones de outfits",
        "Recomendaciones de pelo y grooming",
        "Modo look actual y compra",
        "Sin anuncios",
        "Historial guardado",
      ],
      cta: "Empezar Coach",
    },
    "pro-monthly": {
      name: "Pro",
      subtitle: "Para usuarios avanzados y próximas funciones premium.",
      features: [
        "Todo lo de Coach",
        "Memoria de armario",
        "Subidas ilimitadas de armario",
        "Procesamiento prioritario",
        "Futura simulación de corte de pelo",
        "Futura optimización de foto de perfil",
      ],
      cta: "Hazte Pro",
    },
  },
  ar: {
    free: {
      name: "مجاني",
      subtitle: "لتجربة المنتج بدون التزام.",
      features: [
        "تحليل واحد بعد إعلان مُكافأ",
        "مراجعة أساسية للإطلالة أو القطعة",
        "رفع صورة واحدة فقط",
        "من دون ذاكرة للخزانة",
        "من دون وضع خالٍ من الإعلانات",
      ],
      cta: "جرّب مجاناً",
    },
    "coach-monthly": {
      name: "Coach",
      subtitle: "أفضل نقطة بداية للاستخدام الحقيقي المتكرر.",
      features: [
        "تحليلات غير محدودة",
        "حتى 3 مقارنات للإطلالات",
        "توصيات للشعر والعناية",
        "وضع الإطلالة الحالية ووضع الشراء",
        "إزالة الإعلانات",
        "حفظ السجل",
      ],
      cta: "ابدأ Coach",
    },
    "pro-monthly": {
      name: "Pro",
      subtitle: "للمستخدمين المتقدمين والميزات المستقبلية المميزة.",
      features: [
        "كل ما في Coach",
        "ذاكرة للخزانة",
        "رفع غير محدود لقطع الخزانة",
        "معالجة ذات أولوية",
        "محاكاة قصة شعر مستقبلاً",
        "تحسين صورة الملف الشخصي مستقبلاً",
      ],
      cta: "انتقل إلى Pro",
    },
  },
};

export function PricingGrid({
  isDark,
  onFreePlanClick,
  language = "en",
}: PricingGridProps) {
  const localizedPlans = pricingPlans.map((plan) => ({
    ...plan,
    ...pricingCopy[language][plan.id],
  }));
  const accentTextClass = isDark ? "text-[#d2ab55]" : "text-amber-800";
  const accentBorderClass = isDark ? "border-[#d2ab55]" : "border-amber-800";
  const accentButtonClass = cx(
    "transition-colors",
    isDark
      ? "border border-[#d2ab55] bg-[#d2ab55] text-[#1a140b] hover:border-[#e1bf68] hover:bg-[#e1bf68]"
      : "border border-amber-800 bg-amber-800 text-white hover:border-amber-900 hover:bg-amber-900",
  );
  const mutedClass = isDark ? "text-[#cabdab]" : "text-[#6f6658]";
  const panelClass = cx(
    "border p-8 transition-colors duration-300",
    isDark ? "border-[#3a3025] bg-[#13100d]" : "border-[#ddd3c1] bg-[#fffdf8]",
  );
  const sectionDividerClass = isDark ? "bg-[#2b241b]" : "bg-[#ddd3c1]";

  return (
    <div className={cx("mt-14 grid gap-px md:grid-cols-3", sectionDividerClass)}>
      {localizedPlans.map((plan) => (
        <div
          key={plan.id}
          className={cx(panelClass, plan.featured && "ring-1 ring-[#d2ab55]/40")}
        >
          <div className={cx("text-[11px] uppercase tracking-[0.22em]", accentTextClass)}>
            {plan.name}
          </div>
          <div className={cx(playfair.className, "mt-4 text-5xl")}>{plan.price}</div>
          <p className={cx("mt-4 leading-7", mutedClass)}>{plan.subtitle}</p>
          <ul className="mt-6 space-y-3 text-sm">
            {plan.features.map((feature) => (
              <li key={feature} className={cx("flex gap-3", mutedClass)}>
                <span className={accentTextClass}>+</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          {plan.kind === "paid" ? (
            <CheckoutButton
              planId={plan.id}
              className={
                plan.featured
                  ? accentButtonClass
                  : cx("border", accentBorderClass, accentTextClass)
              }
              errorClassName={isDark ? "text-red-300" : "text-red-700"}
            >
              {plan.cta}
            </CheckoutButton>
          ) : onFreePlanClick ? (
            <button
              type="button"
              onClick={onFreePlanClick}
              className={cx(
                "mt-8 w-full rounded-sm border px-5 py-3 font-semibold transition-colors",
                accentBorderClass,
                accentTextClass,
              )}
            >
              {plan.cta}
            </button>
          ) : (
            <Link
              href="/#demo"
              className={cx(
                "mt-8 flex w-full items-center justify-center rounded-sm border px-5 py-3 font-semibold transition-colors",
                accentBorderClass,
                accentTextClass,
              )}
            >
              {plan.cta}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
