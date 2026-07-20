"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Droplets,
  Sparkles,
  Shield,
  Film,
  Sun,
  Star,
  Clock,
  CreditCard,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { VehicleSelector, type VehicleType } from "@/components/services/VehicleSelector";
import { formatPrice } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

/* ─── Service category data (static for homepage) ─── */
const serviceCategories = [
  {
    id: "wash",
    title: "Car Wash",
    description: "Inside & outside wash, chemical wiping, motor cleaning",
    icon: Droplets,
    pricing: { sedan: 300, suv: 400, truck: 500 },
    color: "from-blue-500/20 to-blue-600/5",
    borderColor: "group-hover:border-blue-500/40",
  },
  {
    id: "detailing",
    title: "Interior Detailing",
    description: "Deep interior cleaning, leather care, dashboard restoration",
    icon: Sparkles,
    pricing: { sedan: 500, suv: 700, truck: 900 },
    color: "from-purple-500/20 to-purple-600/5",
    borderColor: "group-hover:border-purple-500/40",
  },
  {
    id: "ceramic-coating",
    title: "Ceramic Coating",
    description: "Long-lasting paint protection with a brilliant shine",
    icon: Shield,
    pricing: { sedan: 3000, suv: 4000, truck: 5000 },
    color: "from-emerald-500/20 to-emerald-600/5",
    borderColor: "group-hover:border-emerald-500/40",
  },
  {
    id: "ppf",
    title: "Paint Protection Film",
    description: "Invisible shield against scratches, chips & road debris",
    icon: Film,
    pricing: { sedan: 15000, suv: 20000, truck: 25000 },
    color: "from-amber-500/20 to-amber-600/5",
    borderColor: "group-hover:border-amber-500/40",
    hasInstallments: true,
  },
  {
    id: "tinting",
    title: "Window Tinting",
    description: "UV protection, privacy, and a sleek appearance",
    icon: Sun,
    pricing: { sedan: 1500, suv: 2000, truck: 2500 },
    color: "from-cyan-500/20 to-cyan-600/5",
    borderColor: "group-hover:border-cyan-500/40",
  },
];

const valueProps = [
  {
    icon: Shield,
    title: "PPF Experts",
    description: "Professional paint protection film installation by certified technicians",
  },
  {
    icon: CreditCard,
    title: "Transparent Pricing",
    description: "Clear prices by vehicle size — no hidden fees, no surprises",
  },
  {
    icon: Clock,
    title: "Easy Booking",
    description: "Pick a time slot online, no WhatsApp back-and-forth needed",
  },
  {
    icon: MapPin,
    title: "Smouha Location",
    description: "Conveniently located in Smouha, Alexandria — open 2PM to midnight",
  },
];

export default function HomePage() {
  const [vehicleType, setVehicleType] = useState<VehicleType>("sedan");
  const { t, locale } = useLanguage();
  const isRTL = locale === "ar";

  return (
    <>
      {/* ─── HERO SECTION ─── */}
      <section className="relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />

        <div className="container-sns relative pt-12 pb-20 md:pt-20 md:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column - Content */}
            <motion.div 
              initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:col-span-7 space-y-8 text-center lg:text-start flex flex-col items-center lg:items-start"
            >
              {/* Tagline badge */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border text-sm text-text-secondary"
              >
                <Shield className="w-4 h-4 text-primary" />
                <span>{t("hero.badge")}</span>
              </motion.div>

              {/* Main heading */}
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-heading font-bold leading-[1.1] text-center lg:text-start"
              >
                <span className="text-text-primary">{t("hero.care")}</span>
                <span className="chrome-text">{t("hero.shine")}</span>
                <span className="text-primary">{t("hero.defend")}</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-base md:text-lg text-text-secondary max-w-xl leading-relaxed text-center lg:text-start"
              >
                {t("hero.subtitle")}
              </motion.p>

              {/* Vehicle Selector */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex flex-col items-center lg:items-start gap-4 w-full"
                dir={isRTL ? "rtl" : "ltr"}
              >
                <p className="text-sm text-text-muted">{t("hero.vehiclePrompt")}</p>
                <VehicleSelector
                  selected={vehicleType}
                  onChange={setVehicleType}
                  size="lg"
                />
              </motion.div>

              {/* CTA Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 w-full sm:w-auto"
              >
                <Link
                  href="/booking"
                  className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 bg-primary hover:bg-primary-hover text-white font-semibold rounded-[4px] text-base transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 gap-2"
                >
                  {t("hero.bookSession")}
                  <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                </Link>
                <Link
                  href="/services"
                  className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 bg-surface-elevated hover:bg-surface-hover text-text-primary font-medium rounded-[4px] text-base transition-all duration-200 border border-border gap-2"
                >
                  {t("hero.browseServices")}
                  <ChevronRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Column - Visual Showcase */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, x: isRTL ? -30 : 30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="lg:col-span-5 flex justify-center items-center relative"
            >
              {/* Background glow behind image */}
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-[80px] w-72 h-72 m-auto" />
              
              {/* Floating glassmorphic frame */}
              <motion.div 
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 p-4 md:p-6 rounded-[24px] border border-white/10 bg-surface/30 backdrop-blur-md shadow-2xl hover:border-primary/40 transition-all duration-500 group max-w-[400px] lg:max-w-full"
              >
                {/* Subtle rotating glow border */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-blue-500 rounded-[24px] opacity-10 group-hover:opacity-30 blur transition-all duration-700" />
                
                <div className="relative rounded-[16px] overflow-hidden bg-background/50 border border-border/50">
                  <Image
                    src="/hero-logo.png"
                    alt="S.N.S Premium Car Care Logo"
                    width={500}
                    height={500}
                    className="w-full h-auto object-contain scale-95 group-hover:scale-100 transition-transform duration-700 ease-out"
                    priority
                  />
                  
                  {/* Glassmorphic watermark tag */}
                  <div className="absolute bottom-4 left-4 right-4 px-4 py-2.5 rounded-[12px] bg-background/70 backdrop-blur-md border border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-white tracking-wide uppercase">{t("hero.swillNSpin")}</p>
                      <p className="text-[10px] text-text-muted">{t("hero.estAlexandria")}</p>
                    </div>
                    <div className="px-2 py-1 rounded-[6px] bg-primary/20 text-primary border border-primary/30 text-[10px] font-bold">
                      {t("hero.premium")}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── SERVICES PREVIEW ─── */}
      <section className="py-16 md:py-24 bg-surface/50">
        <div className="container-sns">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-primary mb-4">
              {t("services.title")}
            </h2>
            <p className="text-text-secondary max-w-lg mx-auto">
              {t("services.subtitle")}
            </p>

            {/* Vehicle selector inline */}
            <div className="flex justify-center mt-6">
              <VehicleSelector
                selected={vehicleType}
                onChange={setVehicleType}
                size="sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceCategories.map((service, i) => {
              const Icon = service.icon;
              const price = service.pricing[vehicleType];
              return (
                <Link
                  key={service.id}
                  href={`/services?category=${service.id}`}
                  className="group relative rounded-[4px] border border-border bg-surface p-6 hover:border-primary/30 transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 rounded-[4px] bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                  <div className="relative space-y-4">
                    {/* Icon */}
                    <div className="w-12 h-12 flex items-center justify-center rounded-[4px] bg-surface-elevated group-hover:bg-primary/10 transition-colors">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary group-hover:text-white transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="flex items-end justify-between pt-2">
                      <div>
                        <p className="text-xs text-text-muted uppercase tracking-wider">
                          {t("services.from")}
                        </p>
                        <p className="text-2xl font-heading font-bold text-primary">
                          {formatPrice(price)}
                        </p>
                      </div>
                      {service.hasInstallments && (
                        <span className="px-2 py-1 text-xs bg-amber-500/10 text-amber-400 rounded-[4px] border border-amber-500/20">
                          {t("services.installments")}
                        </span>
                      )}
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center gap-1 text-sm text-text-muted group-hover:text-primary transition-colors">
                      {t("services.viewDetails")}
                      <ChevronRight className={`w-4 h-4 transition-transform ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── WHY S.N.S ─── */}
      <section className="py-16 md:py-24">
        <div className="container-sns">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-primary mb-4">
              {t("why.title")}
            </h2>
            <p className="text-text-secondary max-w-lg mx-auto">
              {t("why.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {valueProps.map((prop, i) => {
              const Icon = prop.icon;
              return (
                <div
                  key={prop.title}
                  className="group p-6 rounded-[4px] bg-surface border border-border hover:border-primary/30 transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-[4px] bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    {prop.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {prop.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── GOOGLE REVIEWS ─── */}
      <section className="py-16 md:py-24 bg-surface/50">
        <div className="container-sns">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-primary mb-4">
              {t("reviews.title")}
            </h2>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-text-secondary">
              {t("reviews.verified")}
            </p>
          </div>

          {/* Reviews link — real reviews are on the /reviews page */}
          <div className="text-center py-12 rounded-[4px] bg-surface border border-border border-dashed">
            <Star className="w-10 h-10 mx-auto text-amber-400/30 mb-3" />
            <p className="text-text-secondary text-sm mb-4">
              {locale === "ar" ? "اقرأ تقييمات عملائنا الحقيقية" : "Read real reviews from our customers"}
            </p>
            <Link
              href="/reviews"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-[4px] text-sm transition-colors"
            >
              {locale === "ar" ? "عرض التقييمات" : "View Reviews"}
              <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            </Link>
          </div>

          <div className="text-center mt-8">
            <a
              href="https://maps.app.goo.gl/y32A8yFnCpAAnBHMA"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-light transition-colors"
            >
              {t("reviews.seeAll")}
              <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            </a>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />

        <div className="container-sns relative text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-text-primary">
            {t("cta.title1")}
            <br />
            <span className="text-primary">{t("cta.title2")}</span>
          </h2>
          <p className="text-lg text-text-secondary max-w-md mx-auto">
            {t("cta.subtitle")}
          </p>
          <Link
            href="/booking"
            className="inline-flex items-center justify-center h-14 px-10 bg-primary hover:bg-primary-hover text-white font-bold rounded-[4px] text-lg transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 gap-2"
          >
            {t("nav.bookNow")}
            <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
          </Link>
        </div>
      </section>
    </>
  );
}
