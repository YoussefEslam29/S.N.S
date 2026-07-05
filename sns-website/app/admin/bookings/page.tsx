"use client";

import { useState, useMemo } from "react";
import {
  CalendarDays,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  Loader2,
  Phone,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

type BookingStatus = "pending" | "confirmed" | "in-progress" | "completed" | "cancelled";

interface BookingItem {
  id: string;
  customerName: string;
  customerPhone: string;
  service: string;
  vehicleType: string;
  date: string;
  timeSlot: string;
  status: BookingStatus;
  price: number;
  paymentMethod: string;
}

/* ─── Placeholder data ─── */
const initialBookings: BookingItem[] = [
  { id: "1", customerName: "Ahmed M.", customerPhone: "0115 335 3362", service: "Premium Wash", vehicleType: "sedan", date: "2025-07-06", timeSlot: "15:00", status: "pending", price: 500, paymentMethod: "cash" },
  { id: "2", customerName: "Mohamed K.", customerPhone: "0108 080 6061", service: "PPF — Front End", vehicleType: "suv", date: "2025-07-06", timeSlot: "16:00", status: "confirmed", price: 20000, paymentMethod: "installments" },
  { id: "3", customerName: "Sara A.", customerPhone: "0123 456 7890", service: "Ceramic Coating", vehicleType: "sedan", date: "2025-07-06", timeSlot: "17:00", status: "in-progress", price: 3000, paymentMethod: "digital" },
  { id: "4", customerName: "Omar H.", customerPhone: "0111 222 3333", service: "Window Tinting", vehicleType: "suv", date: "2025-07-07", timeSlot: "14:00", status: "pending", price: 2000, paymentMethod: "cash" },
  { id: "5", customerName: "Youssef E.", customerPhone: "0100 111 2222", service: "Interior Detail", vehicleType: "truck", date: "2025-07-07", timeSlot: "18:00", status: "completed", price: 1400, paymentMethod: "cash" },
  { id: "6", customerName: "Nour R.", customerPhone: "0112 333 4444", service: "Wash + Chemical Wiping", vehicleType: "sedan", date: "2025-07-08", timeSlot: "20:00", status: "cancelled", price: 400, paymentMethod: "cash" },
];

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

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState(initialBookings);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | BookingStatus>("all");
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);

  const filtered = bookings.filter((b) => {
    const matchSearch =
      b.customerName.toLowerCase().includes(search.toLowerCase()) ||
      b.service.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || b.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const updateStatus = (id: string, newStatus: BookingStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
    if (selectedBooking?.id === id) {
      setSelectedBooking({ ...selectedBooking, status: newStatus });
    }
  };

  // Group by date for visual clarity
  const groupedByDate = useMemo(() => {
    const groups: Record<string, BookingItem[]> = {};
    for (const b of filtered) {
      if (!groups[b.date]) groups[b.date] = [];
      groups[b.date].push(b);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-text-primary">
          Bookings
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          View and manage customer appointments.
        </p>
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

      {/* Bookings List */}
      <div className="space-y-6">
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
                  const hour = parseInt(booking.timeSlot);
                  const timeLabel = hour >= 12
                    ? `${hour === 12 ? 12 : hour - 12}:00 PM`
                    : `${hour}:00 AM`;

                  return (
                    <div
                      key={booking.id}
                      onClick={() => setSelectedBooking(booking)}
                      className="flex items-center justify-between p-4 rounded-[4px] border border-border bg-surface hover:bg-surface-elevated/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-elevated text-text-muted text-sm font-medium">
                          {booking.customerName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">
                            {booking.customerName}
                          </p>
                          <p className="text-xs text-text-muted">
                            {booking.service} · {booking.vehicleType.toUpperCase()} · {timeLabel}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
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

        {filtered.length === 0 && (
          <div className="py-12 text-center text-text-muted text-sm">
            No bookings found.
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="w-full max-w-md rounded-[4px] border border-border bg-surface p-6 space-y-5 animate-fade-in"
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
                { label: "Customer", value: selectedBooking.customerName },
                { label: "Phone", value: selectedBooking.customerPhone },
                { label: "Service", value: selectedBooking.service },
                { label: "Vehicle", value: selectedBooking.vehicleType.toUpperCase() },
                { label: "Date", value: new Date(selectedBooking.date + "T00:00:00").toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" }) },
                { label: "Time", value: `${parseInt(selectedBooking.timeSlot) >= 12 ? `${parseInt(selectedBooking.timeSlot) === 12 ? 12 : parseInt(selectedBooking.timeSlot) - 12}:00 PM` : `${parseInt(selectedBooking.timeSlot)}:00 AM`}` },
                { label: "Payment", value: selectedBooking.paymentMethod.charAt(0).toUpperCase() + selectedBooking.paymentMethod.slice(1) },
                { label: "Price", value: formatPrice(selectedBooking.price) },
              ].map((row) => (
                <div key={row.label} className="flex justify-between py-1.5 border-b border-border last:border-0">
                  <span className="text-sm text-text-secondary">{row.label}</span>
                  <span className="text-sm font-medium text-text-primary">{row.value}</span>
                </div>
              ))}
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
                    onClick={() => updateStatus(selectedBooking.id, nextStatus)}
                    className={cn(
                      "flex-1 h-9 text-sm font-medium rounded-[4px] transition-colors",
                      nextStatus === "cancelled"
                        ? "border border-error/30 text-error hover:bg-error/10"
                        : "bg-primary hover:bg-primary-hover text-white"
                    )}
                  >
                    {statusConfig[nextStatus].label}
                  </button>
                ))}
              </div>
            )}

            {/* Call Button */}
            <a
              href={`tel:${selectedBooking.customerPhone.replace(/\s/g, "")}`}
              className="flex items-center justify-center gap-2 h-9 w-full border border-border text-text-secondary hover:text-primary hover:border-primary/30 rounded-[4px] text-sm transition-colors"
            >
              <Phone className="w-4 h-4" />
              Call Customer
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
