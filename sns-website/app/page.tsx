"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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

  return (
    <>
      {/* ─── HERO SECTION ─── */}
      <section className="relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />

        <div className="container-sns relative pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            {/* Tagline badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border text-sm text-text-secondary animate-fade-in">
              <Shield className="w-4 h-4 text-primary" />
              <span>Premium Car Care in Alexandria</span>
            </div>

            {/* Main heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold leading-[1.1] animate-fade-in-up">
              <span className="text-text-primary">Care. </span>
              <span className="chrome-text">Shine. </span>
              <span className="text-primary">Defend.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-text-secondary max-w-xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              Professional car wash, detailing, ceramic coating, PPF &amp; window
              tinting — with transparent pricing for your exact vehicle.
            </p>

            {/* Vehicle Selector */}
            <div className="flex flex-col items-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <p className="text-sm text-text-muted">Select your vehicle type to see pricing:</p>
              <VehicleSelector
                selected={vehicleType}
                onChange={setVehicleType}
                size="lg"
              />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <Link
                href="/booking"
                className="inline-flex items-center justify-center h-12 px-8 bg-primary hover:bg-primary-hover text-white font-semibold rounded-[4px] text-base transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 gap-2"
              >
                Book Your Session
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center h-12 px-8 bg-surface-elevated hover:bg-surface-hover text-text-primary font-medium rounded-[4px] text-base transition-all duration-200 border border-border gap-2"
              >
                Browse Services
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SERVICES PREVIEW ─── */}
      <section className="py-16 md:py-24 bg-surface/50">
        <div className="container-sns">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-primary mb-4">
              Our Services
            </h2>
            <p className="text-text-secondary max-w-lg mx-auto">
              Everything your car needs — from a quick wash to full paint protection.
              Prices shown for your selected vehicle type.
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
                          From
                        </p>
                        <p className="text-2xl font-heading font-bold text-primary">
                          {formatPrice(price)}
                        </p>
                      </div>
                      {service.hasInstallments && (
                        <span className="px-2 py-1 text-xs bg-amber-500/10 text-amber-400 rounded-[4px] border border-amber-500/20">
                          Installments Available
                        </span>
                      )}
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center gap-1 text-sm text-text-muted group-hover:text-primary transition-colors">
                      View details
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
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
              Why Choose S.N.S?
            </h2>
            <p className="text-text-secondary max-w-lg mx-auto">
              We&apos;re not just another car wash — we&apos;re paint protection experts
              with the polish of a high-end brand.
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
              What Our Customers Say
            </h2>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-text-secondary">
              Verified reviews from Google
            </p>
          </div>

          {/* Placeholder for Google Reviews - will be populated from API */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Ahmed M.",
                rating: 5,
                text: "Best car wash in Alexandria! The ceramic coating made my car look brand new. Professional service and fair pricing.",
                time: "2 weeks ago",
              },
              {
                name: "Mohamed K.",
                rating: 5,
                text: "Got PPF installed on my BMW. Incredible quality work. The team really knows what they're doing with paint protection.",
                time: "1 month ago",
              },
              {
                name: "Sara A.",
                rating: 5,
                text: "Finally a car care shop that shows prices upfront. The full wash package at 300 EGP is excellent value. Will definitely be back!",
                time: "3 weeks ago",
              },
            ].map((review, i) => (
              <div
                key={i}
                className="p-6 rounded-[4px] bg-surface border border-border animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(review.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-text-secondary leading-relaxed mb-4">
                  &ldquo;{review.text}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-text-primary">
                    {review.name}
                  </p>
                  <p className="text-xs text-text-muted">{review.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <a
              href="https://maps.app.goo.gl/y32A8yFnCpAAnBHMA"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-light transition-colors"
            >
              See all reviews on Google
              <ArrowRight className="w-4 h-4" />
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
            Ready to give your car
            <br />
            <span className="text-primary">the care it deserves?</span>
          </h2>
          <p className="text-lg text-text-secondary max-w-md mx-auto">
            Book your session now — pick your service, choose a time, and show up.
            It&apos;s that simple.
          </p>
          <Link
            href="/booking"
            className="inline-flex items-center justify-center h-14 px-10 bg-primary hover:bg-primary-hover text-white font-bold rounded-[4px] text-lg transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 gap-2"
          >
            Book Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </>
  );
}
