"use client";

import Link from "next/link";
import { 
  MessageCircle, 
  Banknote, 
  CheckCircle2, 
  MapPin, 
  ExternalLink, 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft,
  ShieldCheck,
  Smartphone,
  CreditCard
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function PaymentPage() {
  const { locale, t } = useLanguage();
  const isRTL = locale === "ar";

  const ownerWhatsapp = "201285476014";
  const defaultWhatsappMsg = encodeURIComponent(
    isRTL
      ? "مرحباً! أود الاستفسار عن تفاصيل الدفع والحجز لدى S.N.S."
      : "Hello! I would like to inquire about payment details and booking at S.N.S."
  );

  const whatsappUrl = `https://wa.me/${ownerWhatsapp}?text=${defaultWhatsappMsg}`;
  const mapsUrl = "https://maps.google.com/?q=Smouha+Alexandria+Egypt";

  return (
    <div className="py-12 md:py-24">
      <div className="container-sns max-w-4xl space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>{t("payment.badge")}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-text-primary">
            {t("payment.title")}
          </h1>
          <p className="text-text-secondary text-base leading-relaxed">
            {t("payment.subtitle")}
          </p>
        </div>

        {/* Payment Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Option 1: WhatsApp Payment */}
          <div className="glass-card p-6 md:p-8 flex flex-col justify-between space-y-6 hover:border-primary/50 transition-all duration-300 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors pointer-events-none" />
            
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-[4px] bg-success/10 border border-success/20 flex items-center justify-center text-success">
                <MessageCircle className="w-6 h-6" />
              </div>

              <h2 className="text-xl md:text-2xl font-heading font-semibold text-text-primary flex items-center justify-between">
                <span>{t("payment.whatsapp")}</span>
                <span className="text-xs font-normal px-2.5 py-0.5 rounded bg-success/10 text-success border border-success/20">
                  {isRTL ? "فودافون كاش / إنستا باي" : "Digital Wallet"}
                </span>
              </h2>

              <p className="text-text-secondary text-sm leading-relaxed">
                {t("payment.whatsappDesc")}
              </p>

              <ul className="space-y-2.5 pt-2">
                {[
                  isRTL ? "فودافون كاش (Vodafone Cash)" : "Vodafone Cash transfer",
                  isRTL ? "إنستا باي (InstaPay)" : "InstaPay instant transfer",
                  isRTL ? "أي محفظة إلكترونية في مصر" : "Any Egyptian mobile wallet",
                  isRTL ? "بدون إدخال بيانات كارتك على الموقع" : "No credit card entry on site"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-text-primary">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-border">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 h-11 px-6 bg-success hover:bg-success/90 text-white font-semibold rounded-[4px] text-sm transition-colors shadow-lg shadow-success/10"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{t("payment.whatsappCta")}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            </div>
          </div>

          {/* Option 2: Cash at Store */}
          <div className="glass-card p-6 md:p-8 flex flex-col justify-between space-y-6 hover:border-primary/50 transition-all duration-300 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors pointer-events-none" />

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-[4px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Banknote className="w-6 h-6" />
              </div>

              <h2 className="text-xl md:text-2xl font-heading font-semibold text-text-primary flex items-center justify-between">
                <span>{t("payment.cash")}</span>
                <span className="text-xs font-normal px-2.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  {isRTL ? "في الفرع" : "In Store"}
                </span>
              </h2>

              <p className="text-text-secondary text-sm leading-relaxed">
                {t("payment.cashDesc")}
              </p>

              <ul className="space-y-2.5 pt-2">
                {[
                  isRTL ? "الدفع بعد انتهاء الخدمة بالكامل" : "Pay after service is completed",
                  isRTL ? "لا يلزم أي عربون أو دفع مقدم" : "No deposit or advance payment needed",
                  isRTL ? "فرع سموحة، الإسكندرية" : "Smouha branch, Alexandria",
                  isRTL ? "مفتوح من 2 ظهراً حتى منتصف الليل" : "Open 2:00 PM – 12:00 AM (Sat–Thu)"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-text-primary">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-border">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 h-11 px-6 bg-surface-elevated hover:bg-surface-hover border border-border text-text-primary font-semibold rounded-[4px] text-sm transition-colors"
              >
                <MapPin className="w-4 h-4 text-primary" />
                <span>{t("payment.cashCta")}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </a>
            </div>
          </div>
        </div>

        {/* Info Banner: Installments & Support */}
        <div className="glass-card p-6 md:p-8 rounded-[4px] border border-primary/20 bg-surface-elevated/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-heading font-semibold text-text-primary">
                {t("payment.infoTitle")}
              </h3>
              <p className="text-text-secondary text-xs md:text-sm mt-1 leading-relaxed max-w-xl">
                {t("payment.infoDesc")}
              </p>
            </div>
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-[4px] transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{isRTL ? "تحدث مع المالك" : "Talk to Owner"}</span>
          </a>
        </div>

        {/* Booking CTA Footer */}
        <div className="text-center pt-6 space-y-4">
          <h3 className="text-xl font-heading font-semibold text-text-primary">
            {t("payment.bookCta")}
          </h3>
          <Link
            href="/booking"
            className="inline-flex items-center gap-2 h-11 px-8 bg-primary hover:bg-primary-hover text-white font-semibold rounded-[4px] text-sm transition-colors shadow-lg shadow-primary/20"
          >
            <span>{t("nav.bookNow")}</span>
            {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </Link>
        </div>
      </div>
    </div>
  );
}
