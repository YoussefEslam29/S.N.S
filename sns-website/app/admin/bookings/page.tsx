"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  CalendarDays,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  Loader2,
  Phone,
  List,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  CreditCard,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

type BookingStatus = "pending" | "confirmed" | "in-progress" | "completed" | "cancelled";

interface BookingItem {
  _id: string;
  customer: { name: string; phone: string; vehicleType?: string } | null;
  service: { name: { en: string; ar: string }; category: string; pricing?: { sedan: number; suv: number; truck: number } } | null;
  vehicleType: string;
  date: string;
  timeSlot: string;
  status: BookingStatus;
  price: number;
  paymentMethod: string;
  installmentPlan?: {
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    schedule: Array<{
      amount: number;
      dueDate: string;
      paid: boolean;
      paidDate?: string;
    }>;
  };
  notes?: string;
}

const statusConfig: Record<BookingStatus, { color: string; label: string; icon: typeof Clock }> = {
  pending: { color: "bg-warning/10 text-warning border-warning/20", label: "Pending", icon: Clock },
  confirmed: { color: "bg-primary/10 text-primary border-primary/20", label: "Confirmed", icon: CheckCircle2 },
  "in-progress": { color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20", label: "In Progress", icon: Play },
  completed: { color: "bg-success/10 text-success border-success/20", label: "Completed", icon: CheckCircle2 },
  cancelled: { color: "bg-error/10 text-error border-error/20", label: "Cancelled", icon: XCircle },
};

const statusFlow: Record<BookingStatus, BookingStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["in-progress", "cancelled"],
  "in-progress": ["completed"],
  completed: [],
  cancelled: [],
};

const TIME_SLOTS = ["14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"];

function formatTimeSlot(slot: string): string {
  const hour = parseInt(slot);
  if (isNaN(hour)) return slot;
  return hour >= 12
    ? `${hour === 12 ? 12 : hour - 12}:00 PM`
    : `${hour}:00 AM`;
}

function getWeekDates(baseDate: Date): Date[] {
  const dates: Date[] = [];
  // Start from Saturday (day 6)
  const day = baseDate.getDay();
  const diff = day >= 6 ? day - 6 : day + 1; // days since last Saturday
  const saturday = new Date(baseDate);
  saturday.setDate(baseDate.getDate() - diff);
  for (let i = 0; i < 7; i++) {
    const d = new Date(saturday);
    d.setDate(saturday.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function formatDateKey(d: Date): string {
  return d.toISOString().split("T")[0];
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | BookingStatus>("all");
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [calendarWeek, setCalendarWeek] = useState(new Date());
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [markingInstallment, setMarkingInstallment] = useState<number | null>(null);

  const fetchBookings = useCallback(async (params?: string) => {
    try {
      setLoading(true);
      const url = params ? `/api/bookings?${params}` : "/api/bookings?limit=100";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data = await res.json();
      setBookings(data.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch bookings based on view mode
  useEffect(() => {
    if (viewMode === "calendar") {
      const weekDates = getWeekDates(calendarWeek);
      const from = formatDateKey(weekDates[0]);
      const to = formatDateKey(weekDates[6]);
      fetchBookings(`from=${from}&to=${to}&limit=100`);
    } else {
      fetchBookings("limit=100");
    }
  }, [viewMode, calendarWeek, fetchBookings]);

  const filtered = bookings.filter((b) => {
    const matchSearch =
      (b.customer?.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (b.service?.name?.en ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || b.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const updateStatus = async (id: string, newStatus: BookingStatus) => {
    try {
      setUpdatingStatus(true);
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update status");
      }
      const updated = await res.json();
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, ...updated.data } : b))
      );
      if (selectedBooking?._id === id) {
        setSelectedBooking({ ...selectedBooking, status: newStatus });
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Update failed");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const markInstallmentPaid = async (bookingId: string, index: number) => {
    try {
      setMarkingInstallment(index);
      const res = await fetch(`/api/bookings/${bookingId}/installments/${index}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to mark installment");
      }
      const updated = await res.json();
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, installmentPlan: updated.data.installmentPlan } : b))
      );
      if (selectedBooking?._id === bookingId) {
        setSelectedBooking({ ...selectedBooking, installmentPlan: updated.data.installmentPlan });
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    } finally {
      setMarkingInstallment(null);
    }
  };

  // Group by date for list view
  const groupedByDate = useMemo(() => {
    const groups: Record<string, BookingItem[]> = {};
    for (const b of filtered) {
      const dateKey = b.date?.split("T")[0] ?? "unknown";
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(b);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  // Calendar data
  const weekDates = useMemo(() => getWeekDates(calendarWeek), [calendarWeek]);
  const calendarBookings = useMemo(() => {
    const map: Record<string, Record<string, BookingItem[]>> = {};
    for (const b of filtered) {
      const dateKey = b.date?.split("T")[0] ?? "";
      const timeKey = b.timeSlot;
      if (!map[dateKey]) map[dateKey] = {};
      if (!map[dateKey][timeKey]) map[dateKey][timeKey] = [];
      map[dateKey][timeKey].push(b);
    }
    return map;
  }, [filtered]);

  const navigateWeek = (direction: number) => {
    const newDate = new Date(calendarWeek);
    newDate.setDate(newDate.getDate() + direction * 7);
    setCalendarWeek(newDate);
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            Bookings
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            View and manage customer appointments.
          </p>
        </div>
        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-[4px] border border-border bg-surface">
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[4px] transition-colors",
              viewMode === "list" ? "bg-primary text-white" : "text-text-secondary hover:text-text-primary"
            )}
          >
            <List className="w-3.5 h-3.5" />
            List
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[4px] transition-colors",
              viewMode === "calendar" ? "bg-primary text-white" : "text-text-secondary hover:text-text-primary"
            )}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Calendar
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer or service..."
            className="w-full h-9 pl-10 pr-4 rounded-[4px] border border-border bg-surface-elevated text-text-primary text-sm placeholder:text-text-muted focus:border-primary outline-none transition-colors"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {(["all", "pending", "confirmed", "in-progress", "completed", "cancelled"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-[4px] whitespace-nowrap transition-colors",
                filterStatus === s
                  ? "bg-primary text-white"
                  : "bg-surface border border-border text-text-secondary hover:text-text-primary"
              )}
            >
              {s === "all" ? "All" : statusConfig[s].label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-[4px] bg-error/10 text-error text-sm flex items-center gap-2">
          <XCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <div className="space-y-4 animate-fade-in">
          {/* Week Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateWeek(-1)}
              className="p-2 rounded-[4px] border border-border text-text-secondary hover:text-text-primary transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-text-primary">
              {weekDates[0].toLocaleDateString("en", { month: "short", day: "numeric" })} — {weekDates[6].toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
            </span>
            <button
              onClick={() => navigateWeek(1)}
              className="p-2 rounded-[4px] border border-border text-text-secondary hover:text-text-primary transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="rounded-[4px] border border-border bg-surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[800px]">
                <thead>
                  <tr className="border-b border-border bg-surface-elevated/50">
                    <th className="px-3 py-2 text-xs font-medium text-text-muted uppercase tracking-wider text-left w-16">Time</th>
                    {weekDates.map((d) => {
                      const isFriday = d.getDay() === 5;
                      const isToday = formatDateKey(d) === formatDateKey(new Date());
                      return (
                        <th
                          key={formatDateKey(d)}
                          className={cn(
                            "px-2 py-2 text-xs font-medium uppercase tracking-wider text-center",
                            isFriday ? "text-error/50" : isToday ? "text-primary" : "text-text-muted"
                          )}
                        >
                          <div>{d.toLocaleDateString("en", { weekday: "short" })}</div>
                          <div className={cn("text-sm font-semibold", isToday ? "text-primary" : "text-text-primary")}>
                            {d.getDate()}
                          </div>
                          {isFriday && <span className="text-[10px] text-error/50">Closed</span>}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {TIME_SLOTS.map((slot) => (
                    <tr key={slot} className="hover:bg-surface-elevated/20">
                      <td className="px-3 py-2 text-xs text-text-muted whitespace-nowrap">
                        {formatTimeSlot(slot)}
                      </td>
                      {weekDates.map((d) => {
                        const dateKey = formatDateKey(d);
                        const isFriday = d.getDay() === 5;
                        const slotBookings = calendarBookings[dateKey]?.[slot] ?? [];
                        return (
                          <td
                            key={`${dateKey}-${slot}`}
                            className={cn(
                              "px-1 py-1 text-center align-top min-w-[100px]",
                              isFriday && "bg-error/5"
                            )}
                          >
                            {!isFriday && slotBookings.map((b) => (
                              <button
                                key={b._id}
                                onClick={() => setSelectedBooking(b)}
                                className={cn(
                                  "w-full px-1.5 py-1 mb-0.5 rounded-[4px] text-[10px] font-medium truncate text-left transition-colors cursor-pointer",
                                  statusConfig[b.status]?.color ?? "bg-surface-elevated text-text-muted"
                                )}
                                title={`${b.customer?.name ?? "?"} — ${b.service?.name?.en ?? "?"}`}
                              >
                                {b.customer?.name ?? "?"}
                              </button>
                            ))}
                            {!isFriday && slotBookings.length === 0 && (
                              <span className="text-[10px] text-text-muted/30">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="space-y-6 animate-fade-in">
          {groupedByDate.map(([date, dateBookings]) => {
            const d = new Date(date + "T00:00:00");
            const dateLabel = d.toLocaleDateString("en", {
              weekday: "long",
              month: "long",
              day: "numeric",
            });

            return (
              <div key={date}>
                <div className="flex items-center gap-2 mb-3">
                  <CalendarDays className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-text-primary">{dateLabel}</h3>
                  <span className="text-xs text-text-muted">({dateBookings.length} bookings)</span>
                </div>
                <div className="space-y-2">
                  {dateBookings.map((booking) => {
                    const status = statusConfig[booking.status];

                    return (
                      <div
                        key={booking._id}
                        onClick={() => setSelectedBooking(booking)}
                        className="flex items-center justify-between p-4 rounded-[4px] border border-border bg-surface hover:bg-surface-elevated/50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-elevated text-text-muted text-sm font-medium">
                            {(booking.customer?.name ?? "?").charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text-primary">
                              {booking.customer?.name ?? "Unknown"}
                            </p>
                            <p className="text-xs text-text-muted">
                              {booking.service?.name?.en ?? "—"} · {booking.vehicleType?.toUpperCase()} · {formatTimeSlot(booking.timeSlot)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {booking.paymentMethod === "installments" && (
                            <CreditCard className="w-3.5 h-3.5 text-warning" />
                          )}
                          <span className="text-sm font-medium text-text-primary hidden sm:block">
                            {formatPrice(booking.price)}
                          </span>
                          <span className={`px-2 py-1 text-[10px] uppercase tracking-wider font-medium rounded-[4px] ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && !loading && (
            <div className="py-12 text-center text-text-muted text-sm">
              No bookings found.
            </div>
          )}
        </div>
      )}

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-[4px] border border-border bg-surface p-6 space-y-5 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-heading font-semibold text-text-primary">
                Booking Details
              </h2>
              <button onClick={() => setSelectedBooking(null)} className="p-1 text-text-muted hover:text-text-primary">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {[
                { label: "Customer", value: selectedBooking.customer?.name ?? "Unknown" },
                { label: "Phone", value: selectedBooking.customer?.phone ?? "—" },
                { label: "Service", value: selectedBooking.service?.name?.en ?? "—" },
                { label: "Vehicle", value: selectedBooking.vehicleType?.toUpperCase() ?? "—" },
                { label: "Date", value: selectedBooking.date ? new Date(selectedBooking.date).toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" }) : "—" },
                { label: "Time", value: formatTimeSlot(selectedBooking.timeSlot) },
                { label: "Payment", value: selectedBooking.paymentMethod?.charAt(0).toUpperCase() + selectedBooking.paymentMethod?.slice(1) },
                { label: "Price", value: formatPrice(selectedBooking.price) },
              ].map((row) => (
                <div key={row.label} className="flex justify-between py-1.5 border-b border-border last:border-0">
                  <span className="text-sm text-text-secondary">{row.label}</span>
                  <span className="text-sm font-medium text-text-primary">{row.value}</span>
                </div>
              ))}
              {selectedBooking.notes && (
                <div className="py-1.5 border-b border-border">
                  <span className="text-sm text-text-secondary">Notes</span>
                  <p className="text-sm text-text-primary mt-1">{selectedBooking.notes}</p>
                </div>
              )}
            </div>

            {/* Status */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-text-secondary">Status</span>
              <span className={`px-2 py-1 text-xs uppercase tracking-wider font-medium rounded-[4px] ${statusConfig[selectedBooking.status].color}`}>
                {statusConfig[selectedBooking.status].label}
              </span>
            </div>

            {/* Status Actions */}
            {statusFlow[selectedBooking.status].length > 0 && (
              <div className="flex gap-2 pt-2">
                {statusFlow[selectedBooking.status].map((nextStatus) => (
                  <button
                    key={nextStatus}
                    onClick={() => updateStatus(selectedBooking._id, nextStatus)}
                    disabled={updatingStatus}
                    className={cn(
                      "flex-1 h-9 text-sm font-medium rounded-[4px] transition-colors disabled:opacity-50",
                      nextStatus === "cancelled"
                        ? "border border-error/30 text-error hover:bg-error/10"
                        : "bg-primary hover:bg-primary-hover text-white"
                    )}
                  >
                    {updatingStatus ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : statusConfig[nextStatus].label}
                  </button>
                ))}
              </div>
            )}

            {/* Installment Plan */}
            {selectedBooking.installmentPlan && (
              <div className="pt-3 border-t border-border space-y-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-warning" />
                  <span className="text-sm font-medium text-text-primary">Installment Plan</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Paid</span>
                  <span className="text-success font-medium">{formatPrice(selectedBooking.installmentPlan.paidAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Remaining</span>
                  <span className="text-warning font-medium">{formatPrice(selectedBooking.installmentPlan.remainingAmount)}</span>
                </div>
                <div className="space-y-2 mt-2">
                  {selectedBooking.installmentPlan.schedule.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 px-3 rounded-[4px] border border-border bg-surface-elevated/30">
                      <div>
                        <p className="text-sm text-text-primary font-medium">
                          {formatPrice(item.amount)}
                        </p>
                        <p className="text-xs text-text-muted">
                          Due: {new Date(item.dueDate).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      {item.paid ? (
                        <span className="px-2 py-1 text-[10px] uppercase tracking-wider font-medium rounded-[4px] bg-success/10 text-success">
                          Paid
                        </span>
                      ) : (
                        <button
                          onClick={() => markInstallmentPaid(selectedBooking._id, idx)}
                          disabled={markingInstallment === idx}
                          className="px-3 py-1.5 text-xs font-medium rounded-[4px] bg-warning/10 text-warning hover:bg-warning/20 transition-colors disabled:opacity-50"
                        >
                          {markingInstallment === idx ? <Loader2 className="w-3 h-3 animate-spin" /> : "Mark Paid"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Call Button */}
            {selectedBooking.customer?.phone && (
              <a
                href={`tel:${selectedBooking.customer.phone.replace(/\s/g, "")}`}
                className="flex items-center justify-center gap-2 h-9 w-full border border-border text-text-secondary hover:text-primary hover:border-primary/30 rounded-[4px] text-sm transition-colors"
              >
                <Phone className="w-4 h-4" />
                Call Customer
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
