"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

/* ─── Supported Locales ─── */
export type Locale = "en" | "ar";

/* ─── Translation Dictionary ─── */
const translations: Record<string, Record<Locale, string>> = {
  // ── Navbar ──
  "nav.home": { en: "Home", ar: "الرئيسية" },
  "nav.services": { en: "Services", ar: "الخدمات" },
  "nav.bookNow": { en: "Book Now", ar: "احجز الآن" },
  "nav.gallery": { en: "Gallery", ar: "المعرض" },
  "nav.reviews": { en: "Reviews", ar: "التقييمات" },
  "nav.carCare": { en: "Car Care", ar: "العناية بالسيارات" },

  // ── Hero ──
  "hero.badge": { en: "Premium Car Care in Alexandria", ar: "عناية فاخرة بالسيارات في الإسكندرية" },
  "hero.care": { en: "Care. ", ar: "عناية. " },
  "hero.shine": { en: "Shine. ", ar: "لمعان. " },
  "hero.defend": { en: "Defend.", ar: "حماية." },
  "hero.subtitle": {
    en: "Professional car wash, detailing, ceramic coating, PPF & window tinting — with transparent pricing for your exact vehicle.",
    ar: "غسيل سيارات، تلميع، طلاء سيراميك، حماية الطلاء (PPF) وتظليل — بأسعار واضحة حسب سيارتك.",
  },
  "hero.vehiclePrompt": { en: "Select your vehicle type to see pricing:", ar: "اختر نوع سيارتك لمعرفة الأسعار:" },
  "hero.bookSession": { en: "Book Your Session", ar: "احجز جلستك" },
  "hero.browseServices": { en: "Browse Services", ar: "تصفح الخدمات" },
  "hero.swillNSpin": { en: "Swill N Spin", ar: "سويل أن سبين" },
  "hero.estAlexandria": { en: "Est. Alexandria", ar: "الإسكندرية" },
  "hero.premium": { en: "PREMIUM", ar: "فاخر" },

  // ── Services Section ──
  "services.title": { en: "Our Services", ar: "خدماتنا" },
  "services.subtitle": {
    en: "Everything your car needs — from a quick wash to full paint protection. Prices shown for your selected vehicle type.",
    ar: "كل ما تحتاجه سيارتك — من غسيل سريع إلى حماية كاملة للطلاء. الأسعار معروضة حسب نوع سيارتك.",
  },
  "services.from": { en: "From", ar: "من" },
  "services.viewDetails": { en: "View details", ar: "عرض التفاصيل" },
  "services.installments": { en: "Installments Available", ar: "تقسيط متاح" },

  // ── Service Categories ──
  "service.wash.title": { en: "Car Wash", ar: "غسيل سيارات" },
  "service.wash.desc": { en: "Inside & outside wash, chemical wiping, motor cleaning", ar: "غسيل داخلي وخارجي، مسح كيميائي، تنظيف المحرك" },
  "service.detailing.title": { en: "Interior Detailing", ar: "تلميع داخلي" },
  "service.detailing.desc": { en: "Deep interior cleaning, leather care, dashboard restoration", ar: "تنظيف داخلي عميق، العناية بالجلد، ترميم التابلوه" },
  "service.ceramic.title": { en: "Ceramic Coating", ar: "طلاء سيراميك" },
  "service.ceramic.desc": { en: "Long-lasting paint protection with a brilliant shine", ar: "حماية طويلة الأمد للطلاء مع لمعان مذهل" },
  "service.ppf.title": { en: "Paint Protection Film", ar: "فيلم حماية الطلاء" },
  "service.ppf.desc": { en: "Invisible shield against scratches, chips & road debris", ar: "درع خفي ضد الخدوش والرقائق وحطام الطريق" },
  "service.tinting.title": { en: "Window Tinting", ar: "تظليل النوافذ" },
  "service.tinting.desc": { en: "UV protection, privacy, and a sleek appearance", ar: "حماية من الأشعة فوق البنفسجية، خصوصية، ومظهر أنيق" },

  // ── Why S.N.S Section ──
  "why.title": { en: "Why Choose S.N.S?", ar: "لماذا تختار S.N.S؟" },
  "why.subtitle": {
    en: "We're not just another car wash — we're paint protection experts with the polish of a high-end brand.",
    ar: "لسنا مجرد مغسلة سيارات — نحن خبراء حماية الطلاء بجودة العلامات الفاخرة.",
  },
  "why.ppfExperts": { en: "PPF Experts", ar: "خبراء PPF" },
  "why.ppfExpertsDesc": { en: "Professional paint protection film installation by certified technicians", ar: "تركيب فيلم حماية الطلاء بواسطة فنيين معتمدين" },
  "why.transparentPricing": { en: "Transparent Pricing", ar: "أسعار واضحة" },
  "why.transparentPricingDesc": { en: "Clear prices by vehicle size — no hidden fees, no surprises", ar: "أسعار واضحة حسب حجم السيارة — بدون رسوم خفية" },
  "why.easyBooking": { en: "Easy Booking", ar: "حجز سهل" },
  "why.easyBookingDesc": { en: "Pick a time slot online, no WhatsApp back-and-forth needed", ar: "اختر موعدك أونلاين، بدون رسائل واتساب" },
  "why.smouhaLocation": { en: "Smouha Location", ar: "موقع سموحة" },
  "why.smouhaLocationDesc": { en: "Conveniently located in Smouha, Alexandria — open 2PM to midnight", ar: "موقع مميز في سموحة، الإسكندرية — مفتوح من ٢ ظهراً حتى منتصف الليل" },

  // ── Reviews Section ──
  "reviews.title": { en: "What Our Customers Say", ar: "ماذا يقول عملاؤنا" },
  "reviews.verified": { en: "Verified reviews from Google", ar: "تقييمات موثقة من جوجل" },
  "reviews.seeAll": { en: "See all reviews on Google", ar: "شاهد كل التقييمات على جوجل" },

  // ── CTA Section ──
  "cta.title1": { en: "Ready to give your car", ar: "هل أنت مستعد لتمنح سيارتك" },
  "cta.title2": { en: "the care it deserves?", ar: "العناية التي تستحقها؟" },
  "cta.subtitle": { en: "Book your session now — pick your service, choose a time, and show up. It's that simple.", ar: "احجز جلستك الآن — اختر خدمتك، حدد الوقت، وتعال. بهذه البساطة." },

  // ── Gallery Page ──
  "gallery.badge": { en: "Showcase & Portfolio", ar: "معرض الأعمال" },
  "gallery.title": { en: "Our Work Gallery", ar: "معرض أعمالنا" },
  "gallery.subtitle": {
    en: "Real transformations on premium vehicles. Select categories or watch our interactive video edits to see the S.N.S finish.",
    ar: "تحولات حقيقية على سيارات فاخرة. اختر الفئات أو شاهد مقاطع الفيديو لتعرف لمسة S.N.S.",
  },
  "gallery.allWork": { en: "All Work", ar: "كل الأعمال" },
  "gallery.videos": { en: "Videos", ar: "فيديو" },
  "gallery.carWash": { en: "Car Wash", ar: "غسيل" },
  "gallery.detailing": { en: "Detailing", ar: "تلميع" },
  "gallery.ceramicCoating": { en: "Ceramic Coating", ar: "سيراميك" },
  "gallery.ppf": { en: "PPF", ar: "حماية طلاء" },
  "gallery.tinting": { en: "Tinting", ar: "تظليل" },
  "gallery.watchProcess": { en: "Watch Our Process", ar: "شاهد عملنا" },
  "gallery.watchSubtitle": {
    en: "Hover on the screens below to preview our work or click to watch the full cinematic edit.",
    ar: "مرر الماوس على الشاشات أدناه لمعاينة عملنا أو اضغط لمشاهدة الفيديو الكامل.",
  },
  "gallery.hoverToPreview": { en: "Hover to Preview", ar: "مرر للمعاينة" },
  "gallery.noItems": { en: "No showcase items in this category yet.", ar: "لا توجد عناصر في هذه الفئة حتى الآن." },
  "gallery.comingSoon": { en: "High-resolution photo showcase coming soon", ar: "معرض صور عالية الدقة قريباً" },

  // ── Footer ──
  "footer.tagline": { en: "Care. Shine. Defend.", ar: "عناية. لمعان. حماية." },
  "footer.description": {
    en: "Premium car wash, detailing, ceramic coating, PPF & tinting in Alexandria, Egypt.",
    ar: "غسيل سيارات، تلميع، طلاء سيراميك، PPF وتظليل في الإسكندرية، مصر.",
  },
  "footer.quickLinks": { en: "Quick Links", ar: "روابط سريعة" },
  "footer.ourServices": { en: "Our Services", ar: "خدماتنا" },
  "footer.bookAppointment": { en: "Book Appointment", ar: "حجز موعد" },
  "footer.contact": { en: "Contact", ar: "تواصل معنا" },
  "footer.workingHours": { en: "Working Hours", ar: "ساعات العمل" },
  "footer.satToThu": { en: "Saturday – Thursday", ar: "السبت – الخميس" },
  "footer.hours": { en: "2:00 PM – 12:00 AM", ar: "٢:٠٠ م – ١٢:٠٠ ص" },
  "footer.closedFriday": { en: "Closed on Friday", ar: "مغلق يوم الجمعة" },
  "footer.viewOnMaps": { en: "View on Google Maps", ar: "عرض على خرائط جوجل" },
  "footer.allRights": { en: "All rights reserved.", ar: "جميع الحقوق محفوظة." },

  // ── Language Toggle ──
  "lang.switch": { en: "عربي", ar: "English" },
};

/* ─── Context ─── */
interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "en",
  setLocale: () => {},
  t: (key: string) => key,
  dir: "ltr",
});

export function useLanguage() {
  return useContext(LanguageContext);
}

/* ─── Provider ─── */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  // Persist locale preference
  useEffect(() => {
    const saved = localStorage.getItem("sns-locale") as Locale | null;
    if (saved && (saved === "en" || saved === "ar")) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("sns-locale", newLocale);
  }, []);

  // Set dir and lang on <html> reactively
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("dir", locale === "ar" ? "rtl" : "ltr");
    html.setAttribute("lang", locale);
  }, [locale]);

  const t = useCallback(
    (key: string): string => {
      return translations[key]?.[locale] ?? key;
    },
    [locale]
  );

  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}
