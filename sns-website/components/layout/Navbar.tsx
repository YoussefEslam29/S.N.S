"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, Phone } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/booking", label: "Book Now" },
  { href: "/gallery", label: "Gallery" },
  { href: "/reviews", label: "Reviews" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <nav className="container-sns flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image
            src="/logo.jpg"
            alt="S.N.S Car Care"
            width={160}
            height={48}
            className="h-10 md:h-12 w-auto object-contain rounded-[4px]"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-200 relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
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
            Book Now
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
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="py-3 px-4 text-base font-medium text-text-secondary hover:text-text-primary hover:bg-surface rounded-[4px] transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 pt-3 border-t border-border">
              <Link
                href="/booking"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center h-12 bg-primary hover:bg-primary-hover text-white font-semibold rounded-[4px] text-sm transition-colors"
              >
                Book Now
              </Link>
              <a
                href="tel:+201153353362"
                className="flex items-center justify-center gap-2 mt-2 py-3 text-sm text-text-secondary hover:text-primary transition-colors"
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
