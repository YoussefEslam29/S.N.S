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

  // ── Booking Page ──
  "booking.title": { en: "Book Your Session", ar: "احجز جلستك" },
  "booking.subtitle": { en: "Choose your service, pick a time, and you're booked.", ar: "اختر خدمتك، حدد موعدك، وتم الحجز." },
  "booking.step.vehicle": { en: "Vehicle", ar: "المركبة" },
  "booking.step.service": { en: "Service", ar: "الخدمة" },
  "booking.step.datetime": { en: "Date & Time", ar: "التاريخ والوقت" },
  "booking.step.payment": { en: "Payment", ar: "الدفع" },
  "booking.step.info": { en: "Your Info", ar: "بياناتك" },
  "booking.step.confirm": { en: "Confirm", ar: "تأكيد" },
  "booking.vehiclePrompt": { en: "What type of vehicle do you have?", ar: "ما هو نوع سيارتك؟" },
  "booking.servicePrompt": { en: "Choose your service", ar: "اختر خدمتك" },
  "booking.datetimePrompt": { en: "Pick a date and time", ar: "اختر التاريخ والوقت" },
  "booking.availableDates": { en: "Available dates:", ar: "التواريخ المتاحة:" },
  "booking.availableTimes": { en: "Available times:", ar: "الأوقات المتاحة:" },
  "booking.selectDateFirst": { en: "Please select a date first to see available times.", ar: "يرجى اختيار التاريخ أولاً لرؤية الأوقات المتاحة." },
  "booking.paymentPrompt": { en: "How would you like to pay?", ar: "كيف ترغب في الدفع؟" },
  "booking.infoPrompt": { en: "Your information", ar: "معلوماتك الشخصية" },
  "booking.confirmPrompt": { en: "Confirm your booking", ar: "تأكيد الحجز" },
  "booking.successTitle": { en: "Booking Confirmed!", ar: "تم تأكيد الحجز بنجاح!" },
  "booking.successMsg": { en: "We've received your booking for {service} on {date} at {time}.", ar: "لقد استلمنا حجزك لـ {service} بتاريخ {date} الساعة {time}." },
  "booking.successNote": { en: "We'll confirm your appointment shortly. If you need to make changes, contact us at", ar: "سنقوم بتأكيد موعدك قريباً. إذا كنت بحاجة لإجراء تغييرات، تواصل معنا على" },
  "booking.backToHome": { en: "Back to Home", ar: "العودة للرئيسية" },
  "booking.name": { en: "Full Name", ar: "الاسم بالكامل" },
  "booking.phone": { en: "Phone Number", ar: "رقم الهاتف" },
  "booking.email": { en: "Email", ar: "البريد الإلكتروني" },
  "booking.vehicleMake": { en: "Vehicle Make", ar: "ماركة السيارة" },
  "booking.vehicleModel": { en: "Vehicle Model", ar: "موديل السيارة" },
  "booking.optional": { en: "optional", ar: "اختياري" },
  "booking.notes": { en: "Notes / Special Requests", ar: "ملاحظات / طلبات خاصة" },
  "booking.back": { en: "Back", ar: "رجوع" },
  "booking.next": { en: "Next", ar: "التالي" },
  "booking.confirmBtn": { en: "Confirm Booking", ar: "تأكيد الحجز" },
  "booking.loadingSlots": { en: "Loading available times...", ar: "جاري تحميل الأوقات المتاحة..." },
  "booking.noSlots": { en: "No slots available for this date. Please choose another date.", ar: "لا توجد مواعيد متاحة في هذا اليوم. يرجى اختيار تاريخ آخر." },
  "booking.closedFriday": { en: "Closed on Friday. Please select another day.", ar: "مغلق يوم الجمعة. يرجى اختيار يوم آخر." },

  // ── Payment Page & Options ──
  "payment.badge": { en: "Simple & Secure", ar: "بسيط وآمن" },
  "payment.title": { en: "Pay Your Way", ar: "ادفع بطريقتك" },
  "payment.subtitle": { en: "Choose how you'd like to settle your service — no online payment forms, no fuss.", ar: "اختر طريقة دفعك — بدون نماذج دفع إلكترونية، بدون تعقيد." },
  "payment.whatsapp": { en: "WhatsApp Payment", ar: "الدفع عبر واتساب" },
  "payment.whatsappDesc": { en: "Message the owner on WhatsApp, confirm your service, and send your transfer screenshot.", ar: "راسل المالك على واتساب، أكد خدمتك، وأرسل صورة التحويل." },
  "payment.cash": { en: "Cash at the Shop", ar: "نقداً في المركز" },
  "payment.cashDesc": { en: "Pay in full on the day of service at our Smouha location. No deposit needed.", ar: "ادفع كاملاً يوم الخدمة في مركزنا بسموحة. لا يوجد دفعة مقدمة." },
  "payment.whatsappCta": { en: "WhatsApp Us Now", ar: "راسلنا على واتساب" },
  "payment.cashCta": { en: "Get Directions", ar: "احصل على الاتجاهات" },
  "payment.infoTitle": { en: "Questions or Installments?", ar: "أسئلة أو تقسيط؟" },
  "payment.infoDesc": { en: "For PPF installment plans or any payment questions, message us on WhatsApp — the owner answers personally.", ar: "لخطط تقسيط PPF أو أي أسئلة عن الدفع، راسلنا على واتساب — المالك يرد شخصياً." },
  "payment.bookCta": { en: "Ready to Book?", ar: "جاهز للحجز؟" },
  "payment.learnMore": { en: "Learn more about payment options", ar: "اعرف المزيد عن خيارات الدفع" },
  "payment.payViaWhatsApp": { en: "Pay via WhatsApp Now", ar: "ادفع عبر واتساب الآن" },

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
