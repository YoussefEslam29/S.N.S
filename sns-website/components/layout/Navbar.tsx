"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, Globe } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const navLinkKeys = [
  { href: "/", labelKey: "nav.home" },
  { href: "/services", labelKey: "nav.services" },
  { href: "/booking", labelKey: "nav.bookNow" },
  { href: "/gallery", labelKey: "nav.gallery" },
  { href: "/reviews", labelKey: "nav.reviews" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { t, locale, setLocale } = useLanguage();

  const toggleLang = () => setLocale(locale === "en" ? "ar" : "en");
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <nav className="container-sns flex items-center justify-between h-16 md:h-20">
        {/* Logo — text wordmark */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <span className="chrome-text text-xl md:text-2xl font-heading font-bold tracking-wide">
            S.N.S
          </span>
          <span className="hidden sm:block w-px h-5 bg-border" />
          <span className="hidden sm:block text-xs font-medium text-text-muted uppercase tracking-[0.2em]">
            {t("nav.carCare")}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinkKeys.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors duration-200 relative group",
                  isActive
                    ? "text-primary font-semibold"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                {t(link.labelKey)}
                <span
                  className={cn(
                    "absolute -bottom-1 start-0 h-[2px] bg-primary transition-all duration-300",
                    isActive ? "w-full" : "w-0 group-hover:w-full"
                  )}
                />
              </Link>
            );
          })}
        </div>

        {/* Desktop CTA + Language Toggle */}
        <div className="hidden md:flex items-center gap-4">
          {/* Language Toggle */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-medium text-text-secondary hover:text-primary hover:bg-surface-elevated border border-border transition-all duration-200"
            aria-label="Switch language"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{t("lang.switch")}</span>
          </button>

          <a
            href="tel:+201153353362"
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors"
            aria-label="Call S.N.S"
          >
            <Phone className="w-4 h-4" />
            <span>0115 335 3362</span>
          </a>
          <Link
            href="/booking"
            className="inline-flex items-center justify-center h-10 px-6 bg-primary hover:bg-primary-hover text-white font-semibold rounded-[4px] text-sm transition-colors duration-200"
          >
            {t("nav.bookNow")}
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-background animate-fade-in">
          <div className="container-sns py-4 flex flex-col gap-1">
            {navLinkKeys.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "py-3 px-4 text-base font-medium rounded-[4px] transition-colors block",
                    isActive
                      ? "text-primary bg-primary/5 font-semibold"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface"
                  )}
                >
                  {t(link.labelKey)}
                </Link>
              );
            })}
            <div className="mt-3 pt-3 border-t border-border space-y-2">
              {/* Mobile Language Toggle */}
              <button
                onClick={toggleLang}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-text-secondary hover:text-primary rounded-[4px] border border-border transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span>{t("lang.switch")}</span>
              </button>
              <Link
                href="/booking"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center h-12 bg-primary hover:bg-primary-hover text-white font-semibold rounded-[4px] text-sm transition-colors"
              >
                {t("nav.bookNow")}
              </Link>
              <a
                href="tel:+201153353362"
                className="flex items-center justify-center gap-2 py-3 text-sm text-text-secondary hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>0115 335 3362</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
