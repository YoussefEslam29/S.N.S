"use client";

import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Calendar,
  Car,
  Clock,
  CreditCard,
  User,
  Phone,
  Mail,
  CheckCircle2,
} from "lucide-react";
import { VehicleSelector, type VehicleType } from "@/components/services/VehicleSelector";
import { formatPrice, cn } from "@/lib/utils";

/* ─── Steps ─── */
const steps = [
  { id: 1, label: "Vehicle", icon: Car },
  { id: 2, label: "Service", icon: CheckCircle2 },
  { id: 3, label: "Date & Time", icon: Calendar },
  { id: 4, label: "Payment", icon: CreditCard },
  { id: 5, label: "Your Info", icon: User },
  { id: 6, label: "Confirm", icon: Check },
];

/* ─── Time Slots (2 PM – 12 AM, every 1 hour) ─── */
const timeSlots = [
  "14:00", "15:00", "16:00", "17:00", "18:00",
  "19:00", "20:00", "21:00", "22:00", "23:00",
];

/* ─── Services (same as services page) ─── */
const allServices = [
  { id: "wash-basic", name: "Inside & Outside Wash", category: "wash", pricing: { sedan: 300, suv: 400, truck: 500 }, duration: 60 },
  { id: "wash-detailed", name: "Wash + Chemical Wiping", category: "wash", pricing: { sedan: 400, suv: 550, truck: 700 }, duration: 90 },
  { id: "wash-premium", name: "Premium Wash + Motor Cleaning", category: "wash", pricing: { sedan: 500, suv: 700, truck: 900 }, duration: 120 },
  { id: "detail-interior", name: "Full Interior Detailing", category: "detailing", pricing: { sedan: 800, suv: 1100, truck: 1400 }, duration: 180 },
  { id: "detail-exterior", name: "Exterior Polish & Detail", category: "detailing", pricing: { sedan: 1200, suv: 1600, truck: 2000 }, duration: 240 },
  { id: "ceramic-standard", name: "Ceramic Coating — Standard", category: "ceramic-coating", pricing: { sedan: 3000, suv: 4000, truck: 5000 }, duration: 480 },
  { id: "ceramic-premium", name: "Ceramic Coating — Premium", category: "ceramic-coating", pricing: { sedan: 5000, suv: 7000, truck: 9000 }, duration: 720 },
  { id: "ppf-partial", name: "PPF — Front End Package", category: "ppf", pricing: { sedan: 15000, suv: 20000, truck: 25000 }, duration: 1440, installments: true },
  { id: "ppf-full", name: "PPF — Full Body Wrap", category: "ppf", pricing: { sedan: 35000, suv: 45000, truck: 55000 }, duration: 2880, installments: true },
  { id: "tint-standard", name: "Window Tinting — Standard", category: "tinting", pricing: { sedan: 1500, suv: 2000, truck: 2500 }, duration: 120 },
  { id: "tint-ceramic", name: "Window Tinting — Ceramic", category: "tinting", pricing: { sedan: 3000, suv: 4000, truck: 5000 }, duration: 180 },
];

function BookingContent() {
  const searchParams = useSearchParams();
  const preselectedService = searchParams.get("service") || "";
  const preselectedVehicle = (searchParams.get("vehicle") as VehicleType) || "sedan";

  const [currentStep, setCurrentStep] = useState(1);
  const [vehicleType, setVehicleType] = useState<VehicleType>(preselectedVehicle);
  const [selectedServiceId, setSelectedServiceId] = useState(preselectedService);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "digital" | "installments">("cash");
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: "",
    vehicleMake: "",
    vehicleModel: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const selectedService = allServices.find((s) => s.id === selectedServiceId);
  const price = selectedService ? selectedService.pricing[vehicleType] : 0;

  // Generate available dates (next 14 days, excluding Fridays)
  const availableDates = useMemo(() => {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 1; i <= 21 && dates.length < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      if (d.getDay() !== 5) { // Skip Friday (5)
        dates.push(d.toISOString().split("T")[0]);
      }
    }
    return dates;
  }, []);

  const canGoNext = () => {
    switch (currentStep) {
      case 1: return !!vehicleType;
      case 2: return !!selectedServiceId;
      case 3: return !!selectedDate && !!selectedTime;
      case 4: return !!paymentMethod;
      case 5: return !!customerInfo.name && !!customerInfo.phone;
      default: return true;
    }
  };

  const handleSubmit = async () => {
    // TODO: POST to /api/bookings
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="py-20 md:py-32">
        <div className="container-sns max-w-lg text-center space-y-6">
          <div className="w-20 h-20 mx-auto flex items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-text-primary">
            Booking Confirmed!
          </h1>
          <p className="text-text-secondary">
            We&apos;ve received your booking for{" "}
            <span className="text-text-primary font-medium">
              {selectedService?.name}
            </span>{" "}
            on{" "}
            <span className="text-text-primary font-medium">
              {selectedDate} at {selectedTime}
            </span>
            .
          </p>
          <p className="text-sm text-text-muted">
            We&apos;ll confirm your appointment shortly. If you need to make changes,
            contact us at{" "}
            <a href="tel:+201153353362" className="text-primary">
              0115 335 3362
            </a>
            .
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center h-10 px-6 bg-primary hover:bg-primary-hover text-white font-semibold rounded-[4px] text-sm transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-20">
      <div className="container-sns max-w-3xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-text-primary mb-2">
            Book Your Session
          </h1>
          <p className="text-text-secondary">
            Choose your service, pick a time, and you&apos;re booked.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-1 mb-10 overflow-x-auto pb-2">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-[4px] text-xs font-medium transition-colors",
                    isActive && "bg-primary text-white",
                    isCompleted && "bg-success/10 text-success",
                    !isActive && !isCompleted && "bg-surface text-text-muted"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{step.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={cn(
                    "w-6 h-px mx-1",
                    isCompleted ? "bg-success" : "bg-border"
                  )} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="rounded-[4px] border border-border bg-surface p-6 md:p-8 animate-fade-in">
          {/* Step 1: Vehicle Type */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-heading font-semibold text-text-primary">
                What type of vehicle do you have?
              </h2>
              <VehicleSelector selected={vehicleType} onChange={setVehicleType} size="lg" />
            </div>
          )}

          {/* Step 2: Select Service */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-heading font-semibold text-text-primary">
                Choose your service
              </h2>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {allServices.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setSelectedServiceId(service.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-[4px] border transition-all duration-200 text-left",
                      selectedServiceId === service.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-border-light bg-surface-elevated"
                    )}
                  >
                    <div>
                      <p className="font-medium text-text-primary text-sm">
                        {service.name}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-text-muted capitalize">
                          {service.category.replace("-", " ")}
                        </span>
                        <span className="text-xs text-text-muted flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {Math.floor(service.duration / 60)}h{service.duration % 60 > 0 ? ` ${service.duration % 60}m` : ""}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-heading font-bold text-primary text-sm">
                        {formatPrice(service.pricing[vehicleType])}
                      </p>
                      {selectedServiceId === service.id && (
                        <Check className="w-4 h-4 text-primary ml-auto mt-1" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Date & Time */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-heading font-semibold text-text-primary">
                Pick a date and time
              </h2>

              {/* Date Grid */}
              <div>
                <p className="text-sm text-text-secondary mb-3">Available dates:</p>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {availableDates.map((date) => {
                    const d = new Date(date + "T00:00:00");
                    const dayName = d.toLocaleDateString("en", { weekday: "short" });
                    const dayNum = d.getDate();
                    const month = d.toLocaleDateString("en", { month: "short" });
                    return (
                      <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={cn(
                          "flex flex-col items-center py-3 px-2 rounded-[4px] border text-xs transition-all",
                          selectedDate === date
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-border-light text-text-secondary"
                        )}
                      >
                        <span className="text-[10px] uppercase">{dayName}</span>
                        <span className="text-lg font-bold mt-0.5">{dayNum}</span>
                        <span className="text-[10px]">{month}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div>
                  <p className="text-sm text-text-secondary mb-3">Available times:</p>
                  <div className="grid grid-cols-5 gap-2">
                    {timeSlots.map((time) => {
                      const hour = parseInt(time.split(":")[0]);
                      const label = hour >= 12
                        ? `${hour === 12 ? 12 : hour - 12}:00 PM`
                        : `${hour}:00 AM`;
                      return (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={cn(
                            "py-2.5 rounded-[4px] border text-sm font-medium transition-all",
                            selectedTime === time
                              ? "border-primary bg-primary text-white"
                              : "border-border hover:border-border-light text-text-secondary"
                          )}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Payment Method */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-heading font-semibold text-text-primary">
                How would you like to pay?
              </h2>
              {[
                { id: "cash" as const, label: "Cash at the Shop", desc: "Pay when you visit" },
                { id: "digital" as const, label: "Digital Payment", desc: "Pay with Vodafone Cash, InstaPay, or card" },
                ...(selectedService && "installments" in selectedService && selectedService.installments
                  ? [{ id: "installments" as const, label: "Installments (3 Payments)", desc: `3 × ${formatPrice(Math.ceil(price / 3))}` }]
                  : []),
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-[4px] border transition-all duration-200 text-left",
                    paymentMethod === method.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-border-light bg-surface-elevated"
                  )}
                >
                  <div>
                    <p className="font-medium text-text-primary text-sm">{method.label}</p>
                    <p className="text-xs text-text-muted mt-0.5">{method.desc}</p>
                  </div>
                  {paymentMethod === method.id && <Check className="w-5 h-5 text-primary" />}
                </button>
              ))}
            </div>
          )}

          {/* Step 5: Customer Info */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h2 className="text-xl font-heading font-semibold text-text-primary">
                Your information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Full Name <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      placeholder="Enter your name"
                      className="w-full h-10 pl-10 pr-4 rounded-[4px] border border-border bg-surface-elevated text-text-primary text-sm placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-colors"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Phone Number <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      placeholder="01X XXXX XXXX"
                      className="w-full h-10 pl-10 pr-4 rounded-[4px] border border-border bg-surface-elevated text-text-primary text-sm placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-colors"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Email <span className="text-text-muted">(optional)</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      placeholder="you@example.com"
                      className="w-full h-10 pl-10 pr-4 rounded-[4px] border border-border bg-surface-elevated text-text-primary text-sm placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Vehicle Make
                  </label>
                  <input
                    type="text"
                    value={customerInfo.vehicleMake}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, vehicleMake: e.target.value })}
                    placeholder="e.g. BMW, Toyota"
                    className="w-full h-10 px-4 rounded-[4px] border border-border bg-surface-elevated text-text-primary text-sm placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Vehicle Model
                  </label>
                  <input
                    type="text"
                    value={customerInfo.vehicleModel}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, vehicleModel: e.target.value })}
                    placeholder="e.g. X5, Camry"
                    className="w-full h-10 px-4 rounded-[4px] border border-border bg-surface-elevated text-text-primary text-sm placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Confirmation */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <h2 className="text-xl font-heading font-semibold text-text-primary">
                Confirm your booking
              </h2>
              <div className="space-y-3">
                {[
                  { label: "Service", value: selectedService?.name || "" },
                  { label: "Vehicle", value: `${vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)} — ${customerInfo.vehicleMake} ${customerInfo.vehicleModel}`.trim() },
                  { label: "Date", value: selectedDate ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" }) : "" },
                  { label: "Time", value: selectedTime ? `${parseInt(selectedTime) >= 12 ? `${parseInt(selectedTime) === 12 ? 12 : parseInt(selectedTime) - 12}:00 PM` : `${parseInt(selectedTime)}:00 AM`}` : "" },
                  { label: "Payment", value: paymentMethod === "installments" ? `Installments (3 × ${formatPrice(Math.ceil(price / 3))})` : paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1) },
                  { label: "Name", value: customerInfo.name },
                  { label: "Phone", value: customerInfo.phone },
                  { label: "Total Price", value: formatPrice(price), highlight: true },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-sm text-text-secondary">{row.label}</span>
                    <span className={cn(
                      "text-sm font-medium",
                      row.highlight ? "text-primary text-lg font-heading font-bold" : "text-text-primary"
                    )}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
            disabled={currentStep === 1}
            className={cn(
              "flex items-center gap-2 h-10 px-4 rounded-[4px] text-sm font-medium transition-colors",
              currentStep === 1
                ? "text-text-muted cursor-not-allowed"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated border border-border"
            )}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {currentStep < 6 ? (
            <button
              onClick={() => setCurrentStep((s) => Math.min(6, s + 1))}
              disabled={!canGoNext()}
              className={cn(
                "flex items-center gap-2 h-10 px-6 rounded-[4px] text-sm font-semibold transition-colors",
                canGoNext()
                  ? "bg-primary hover:bg-primary-hover text-white"
                  : "bg-surface-elevated text-text-muted cursor-not-allowed"
              )}
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 h-10 px-6 rounded-[4px] bg-success hover:bg-success/90 text-white text-sm font-semibold transition-colors"
            >
              <Check className="w-4 h-4" />
              Confirm Booking
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="py-20 text-center">
        <div className="w-8 h-8 mx-auto border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <BookingContent />
    </Suspense>
  );
}
