"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
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
  Loader2,
  AlertCircle,
} from "lucide-react";
import { VehicleSelector, type VehicleType } from "@/components/services/VehicleSelector";
import { formatPrice, cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

interface ApiService {
  _id: string;
  name: { en: string; ar: string };
  description: { en: string; ar: string };
  category: string;
  pricing: { sedan: number; suv: number; truck: number };
  duration: number;
  installmentsAllowed?: boolean;
  maxInstallments?: number;
}

const steps = [
  { id: 1, labelKey: "booking.step.vehicle", icon: Car },
  { id: 2, labelKey: "booking.step.service", icon: CheckCircle2 },
  { id: 3, labelKey: "booking.step.datetime", icon: Calendar },
  { id: 4, labelKey: "booking.step.payment", icon: CreditCard },
  { id: 5, labelKey: "booking.step.info", icon: User },
  { id: 6, labelKey: "booking.step.confirm", icon: Check },
];

function BookingContent() {
  const searchParams = useSearchParams();
  const preselectedService = searchParams.get("service") || "";
  const preselectedVehicle = (searchParams.get("vehicle") as VehicleType) || "sedan";
  const { locale, t } = useLanguage();

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
    notes: "",
  });

  // API loading states
  const [services, setServices] = useState<ApiService[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);

  const [slots, setSlots] = useState<Array<{ time: string; available: boolean; remaining: number }>>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Fetch active services on mount
  useEffect(() => {
    async function fetchServices() {
      try {
        setLoadingServices(true);
        const res = await fetch("/api/services");
        if (!res.ok) throw new Error("Failed to fetch services");
        const data = await res.json();
        setServices(data.data ?? []);
      } catch (err) {
        setServicesError(err instanceof Error ? err.message : "Failed to load services");
      } finally {
        setLoadingServices(false);
      }
    }
    fetchServices();
  }, []);

  // Fetch available timeslots when selectedDate changes
  useEffect(() => {
    if (!selectedDate) {
      setSlots([]);
      return;
    }
    async function fetchSlots() {
      try {
        setLoadingSlots(true);
        const res = await fetch(`/api/timeslots?date=${selectedDate}`);
        if (!res.ok) throw new Error("Failed to fetch slots");
        const data = await res.json();
        setSlots(data.data ?? []);
      } catch (err) {
        console.error(err);
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    }
    fetchSlots();
  }, [selectedDate]);

  const selectedService = services.find((s) => s._id === selectedServiceId);
  const price = selectedService ? selectedService.pricing[vehicleType] : 0;

  // Reset time slot when date changes
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedTime("");
  };

  // Generate available dates (next 21 days, excluding Fridays)
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
    try {
      setSubmitting(true);
      setSubmitError(null);

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerInfo.name,
          customerPhone: customerInfo.phone,
          customerEmail: customerInfo.email || undefined,
          vehicleType,
          serviceId: selectedServiceId,
          date: selectedDate,
          timeSlot: selectedTime,
          paymentMethod,
          price,
          vehicleMake: customerInfo.vehicleMake || undefined,
          vehicleModel: customerInfo.vehicleModel || undefined,
          notes: customerInfo.notes || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create booking");
      }

      setIsSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingServices) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="w-8 h-8 mx-auto text-primary animate-spin" />
        <p className="text-text-secondary mt-4 text-sm">
          {locale === "ar" ? "جاري تحميل الخدمات المتاحة..." : "Loading available services..."}
        </p>
      </div>
    );
  }

  if (servicesError) {
    return (
      <div className="py-20 max-w-md mx-auto text-center space-y-4">
        <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-error/10 text-error">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-heading font-semibold text-text-primary">
          {locale === "ar" ? "فشل تحميل البيانات" : "Failed to Load Services"}
        </h2>
        <p className="text-text-secondary text-sm">{servicesError}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-[4px] text-sm font-medium transition-colors"
        >
          {locale === "ar" ? "إعادة المحاولة" : "Try Again"}
        </button>
      </div>
    );
  }

  if (isSubmitted) {
    const formattedDate = selectedDate
      ? new Date(selectedDate + "T00:00:00").toLocaleDateString(locale, {
          weekday: "long",
          month: "long",
          day: "numeric",
        })
      : "";
    const hour = parseInt(selectedTime);
    const formattedTime = !isNaN(hour)
      ? hour >= 12
        ? `${hour === 12 ? 12 : hour - 12}:00 PM`
        : `${hour}:00 AM`
      : selectedTime;

    return (
      <div className="py-20 md:py-32">
        <div className="container-sns max-w-lg text-center space-y-6">
          <div className="w-20 h-20 mx-auto flex items-center justify-center rounded-full bg-success/10 animate-scale-in">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-text-primary">
            {t("booking.successTitle")}
          </h1>
          <p className="text-text-secondary text-sm leading-relaxed">
            {locale === "ar" ? (
              <>
                لقد تلقينا حجزك بنجاح لخدمة{" "}
                <span className="text-text-primary font-semibold">
                  {selectedService?.name.ar}
                </span>{" "}
                بتاريخ{" "}
                <span className="text-text-primary font-semibold">
                  {formattedDate}
                </span>{" "}
                في تمام الساعة{" "}
                <span className="text-text-primary font-semibold">
                  {formattedTime}
                </span>
                .
              </>
            ) : (
              <>
                We&apos;ve received your booking for{" "}
                <span className="text-text-primary font-semibold font-heading">
                  {selectedService?.name.en}
                </span>{" "}
                on{" "}
                <span className="text-text-primary font-semibold">
                  {formattedDate}
                </span>{" "}
                at{" "}
                <span className="text-text-primary font-semibold">
                  {formattedTime}
                </span>
                .
              </>
            )}
          </p>
          <p className="text-xs text-text-muted">
            {t("booking.successNote")}{" "}
            <a href="tel:+201153353362" className="text-primary font-semibold">
              0115 335 3362
            </a>
            .
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center h-10 px-6 bg-primary hover:bg-primary-hover text-white font-semibold rounded-[4px] text-sm transition-colors"
          >
            {t("booking.backToHome")}
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
            {t("booking.title")}
          </h1>
          <p className="text-text-secondary text-sm">
            {t("booking.subtitle")}
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
                    "flex items-center gap-1.5 px-3 py-2 rounded-[4px] text-xs font-medium transition-colors whitespace-nowrap",
                    isActive && "bg-primary text-white",
                    isCompleted && "bg-success/10 text-success",
                    !isActive && !isCompleted && "bg-surface text-text-muted"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t(step.labelKey)}</span>
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
                {t("booking.vehiclePrompt")}
              </h2>
              <VehicleSelector selected={vehicleType} onChange={setVehicleType} size="lg" />
            </div>
          )}

          {/* Step 2: Select Service */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-heading font-semibold text-text-primary">
                {t("booking.servicePrompt")}
              </h2>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {services.map((service) => (
                  <button
                    key={service._id}
                    onClick={() => setSelectedServiceId(service._id)}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-[4px] border transition-all duration-200 text-left",
                      selectedServiceId === service._id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-border-light bg-surface-elevated"
                    )}
                    dir={locale === "ar" ? "rtl" : "ltr"}
                  >
                    <div>
                      <p className="font-medium text-text-primary text-sm">
                        {locale === "ar" ? service.name.ar : service.name.en}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-text-muted capitalize">
                          {service.category.replace("-", " ")}
                        </span>
                        <span className="text-xs text-text-muted flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {Math.floor(service.duration / 60)}h{service.duration % 60 > 0 ? ` ${service.duration % 60}m` : ""}
                        </span>
                      </div>
                    </div>
                    <div className={locale === "ar" ? "text-left" : "text-right"}>
                      <p className="font-heading font-bold text-primary text-sm">
                        {formatPrice(service.pricing[vehicleType])}
                      </p>
                      {selectedServiceId === service._id && (
                        <Check className={cn("w-4 h-4 text-primary mt-1", locale === "ar" ? "mr-auto" : "ml-auto")} />
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
                {t("booking.datetimePrompt")}
              </h2>

              {/* Date Grid */}
              <div>
                <p className="text-sm text-text-secondary mb-3">{t("booking.availableDates")}</p>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {availableDates.map((date) => {
                    const d = new Date(date + "T00:00:00");
                    const dayName = d.toLocaleDateString(locale, { weekday: "short" });
                    const dayNum = d.getDate();
                    const month = d.toLocaleDateString(locale, { month: "short" });
                    return (
                      <button
                        key={date}
                        onClick={() => handleDateChange(date)}
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
                  <p className="text-sm text-text-secondary mb-3">{t("booking.availableTimes")}</p>
                  {loadingSlots ? (
                    <div className="flex items-center gap-2 text-text-muted text-sm py-4">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span>{t("booking.loadingSlots")}</span>
                    </div>
                  ) : slots.length === 0 ? (
                    <p className="text-sm text-text-muted py-4">
                      {t("booking.closedFriday")}
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {slots.map((slot) => {
                        const hour = parseInt(slot.time.split(":")[0]);
                        const label = hour >= 12
                          ? `${hour === 12 ? 12 : hour - 12}:00 PM`
                          : `${hour}:00 AM`;
                        const isSelected = selectedTime === slot.time;
                        return (
                          <button
                            key={slot.time}
                            onClick={() => slot.available && setSelectedTime(slot.time)}
                            disabled={!slot.available}
                            className={cn(
                              "py-2.5 rounded-[4px] border text-sm font-medium transition-all flex flex-col items-center justify-center",
                              isSelected
                                ? "border-primary bg-primary text-white"
                                : slot.available
                                  ? "border-border hover:border-border-light text-text-secondary bg-surface-elevated"
                                  : "border-border/30 text-text-muted bg-surface-elevated/50 cursor-not-allowed opacity-50"
                            )}
                          >
                            <span>{label}</span>
                            <span className="text-[9px] mt-0.5 opacity-85">
                              {slot.available 
                                ? (locale === "ar" ? `متاح (${slot.remaining})` : `${slot.remaining} free`) 
                                : (locale === "ar" ? "ممتلئ" : "full")}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Payment Method */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-heading font-semibold text-text-primary">
                {t("booking.paymentPrompt")}
              </h2>
              {[
                { id: "cash" as const, label: locale === "ar" ? "نقداً في المركز" : "Cash at the Shop", desc: locale === "ar" ? "ادفع عند زيارتك للمركز" : "Pay when you visit" },
                { id: "digital" as const, label: locale === "ar" ? "دفع إلكتروني" : "Digital Payment", desc: locale === "ar" ? "ادفع عبر فودافون كاش، إنستا باي، أو بطاقة الائتمان" : "Pay with Vodafone Cash, InstaPay, or card" },
                ...(selectedService?.installmentsAllowed
                  ? [{ id: "installments" as const, label: locale === "ar" ? `تقسيط (3 دفعات)` : `Installments (3 Payments)`, desc: locale === "ar" ? `3 × ${formatPrice(Math.ceil(price / 3))} شهرياً` : `3 × ${formatPrice(Math.ceil(price / 3))} monthly` }]
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
                  dir={locale === "ar" ? "rtl" : "ltr"}
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
            <div className="space-y-4" dir={locale === "ar" ? "rtl" : "ltr"}>
              <h2 className="text-xl font-heading font-semibold text-text-primary">
                {t("booking.infoPrompt")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    {t("booking.name")} <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <User className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted", locale === "ar" ? "right-3" : "left-3")} />
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      placeholder={locale === "ar" ? "أدخل اسمك بالكامل" : "Enter your full name"}
                      className={cn("w-full h-10 pr-4 rounded-[4px] border border-border bg-surface-elevated text-text-primary text-sm placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-colors", locale === "ar" ? "pr-10 pl-4" : "pl-10 pr-4")}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    {t("booking.phone")} <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <Phone className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted", locale === "ar" ? "right-3" : "left-3")} />
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      placeholder="01X XXXX XXXX"
                      className={cn("w-full h-10 pr-4 rounded-[4px] border border-border bg-surface-elevated text-text-primary text-sm placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-colors", locale === "ar" ? "pr-10 pl-4" : "pl-10 pr-4")}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    {t("booking.email")} <span className="text-text-muted">({t("booking.optional")})</span>
                  </label>
                  <div className="relative">
                    <Mail className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted", locale === "ar" ? "right-3" : "left-3")} />
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      placeholder="you@example.com"
                      className={cn("w-full h-10 pr-4 rounded-[4px] border border-border bg-surface-elevated text-text-primary text-sm placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-colors", locale === "ar" ? "pr-10 pl-4" : "pl-10 pr-4")}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    {t("booking.vehicleMake")}
                  </label>
                  <input
                    type="text"
                    value={customerInfo.vehicleMake}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, vehicleMake: e.target.value })}
                    placeholder="e.g. BMW, Mercedes, Toyota"
                    className="w-full h-10 px-4 rounded-[4px] border border-border bg-surface-elevated text-text-primary text-sm placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    {t("booking.vehicleModel")}
                  </label>
                  <input
                    type="text"
                    value={customerInfo.vehicleModel}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, vehicleModel: e.target.value })}
                    placeholder="e.g. C200, Camry"
                    className="w-full h-10 px-4 rounded-[4px] border border-border bg-surface-elevated text-text-primary text-sm placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-colors"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    {t("booking.notes")}
                  </label>
                  <textarea
                    value={customerInfo.notes}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                    placeholder={locale === "ar" ? "أي تفاصيل إضافية أو طلبات خاصة" : "Any special requests or details to share"}
                    rows={3}
                    className="w-full p-4 rounded-[4px] border border-border bg-surface-elevated text-text-primary text-sm placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-colors resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Confirmation */}
          {currentStep === 6 && (
            <div className="space-y-6" dir={locale === "ar" ? "rtl" : "ltr"}>
              <h2 className="text-xl font-heading font-semibold text-text-primary">
                {t("booking.confirmPrompt")}
              </h2>
              <div className="space-y-3">
                {[
                  { label: locale === "ar" ? "الخدمة" : "Service", value: selectedService ? (locale === "ar" ? selectedService.name.ar : selectedService.name.en) : "" },
                  { label: locale === "ar" ? "نوع السيارة" : "Vehicle", value: `${vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)} — ${customerInfo.vehicleMake} ${customerInfo.vehicleModel}`.trim() },
                  { label: locale === "ar" ? "التاريخ" : "Date", value: selectedDate ? new Date(selectedDate + "T00:00:00").toLocaleDateString(locale, { weekday: "long", month: "long", day: "numeric" }) : "" },
                  { label: locale === "ar" ? "الوقت" : "Time", value: selectedTime ? (parseInt(selectedTime) >= 12 ? `${parseInt(selectedTime) === 12 ? 12 : parseInt(selectedTime) - 12}:00 PM` : `${parseInt(selectedTime)}:00 AM`) : "" },
                  { label: locale === "ar" ? "الدفع" : "Payment", value: paymentMethod === "installments" ? (locale === "ar" ? `تقسيط (3 دفعات)` : `Installments (3 Payments)`) : (locale === "ar" ? (paymentMethod === "cash" ? "نقداً" : "إلكتروني") : paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)) },
                  { label: locale === "ar" ? "الاسم" : "Name", value: customerInfo.name },
                  { label: locale === "ar" ? "الهاتف" : "Phone", value: customerInfo.phone },
                  { label: locale === "ar" ? "السعر الإجمالي" : "Total Price", value: formatPrice(price), highlight: true },
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

              {submitError && (
                <div className="p-3 rounded-[4px] bg-error/10 text-error text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6" dir={locale === "ar" ? "rtl" : "ltr"}>
          <button
            onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
            disabled={currentStep === 1 || submitting}
            className={cn(
              "flex items-center gap-2 h-10 px-4 rounded-[4px] text-sm font-medium transition-colors",
              currentStep === 1
                ? "text-text-muted cursor-not-allowed opacity-50"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated border border-border"
            )}
          >
            {locale === "ar" ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            {t("booking.back")}
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
              {t("booking.next")}
              {locale === "ar" ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 h-10 px-6 rounded-[4px] bg-success hover:bg-success/90 text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{locale === "ar" ? "جاري الإرسال..." : "Processing..."}</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{t("booking.confirmBtn")}</span>
                </>
              )}
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
        <Loader2 className="w-8 h-8 mx-auto text-primary animate-spin" />
      </div>
    }>
      <BookingContent />
    </Suspense>
  );
}
