"use client";

import { useState } from "react";
import {
  Search,
  Phone,
  Mail,
  Car,
  Calendar,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomerItem {
  id: string;
  name: string;
  phone: string;
  email?: string;
  vehicleType: string;
  vehicleMake?: string;
  vehicleModel?: string;
  bookingsCount: number;
  lastVisit: string;
  notes?: string;
}

/* ─── Placeholder data ─── */
const initialCustomers: CustomerItem[] = [
  { id: "1", name: "Ahmed M.", phone: "0115 335 3362", email: "ahmed@email.com", vehicleType: "sedan", vehicleMake: "BMW", vehicleModel: "320i", bookingsCount: 5, lastVisit: "2025-06-28", notes: "Regular customer, prefers chemical wiping wash" },
  { id: "2", name: "Mohamed K.", phone: "0108 080 6061", vehicleType: "suv", vehicleMake: "BMW", vehicleModel: "X5", bookingsCount: 2, lastVisit: "2025-06-15" },
  { id: "3", name: "Sara A.", phone: "0123 456 7890", email: "sara@email.com", vehicleType: "sedan", vehicleMake: "Mercedes", vehicleModel: "C200", bookingsCount: 3, lastVisit: "2025-07-01" },
  { id: "4", name: "Omar H.", phone: "0111 222 3333", vehicleType: "suv", vehicleMake: "Hyundai", vehicleModel: "Tucson", bookingsCount: 1, lastVisit: "2025-05-20" },
  { id: "5", name: "Youssef E.", phone: "0100 111 2222", vehicleType: "truck", vehicleMake: "Toyota", vehicleModel: "Land Cruiser", bookingsCount: 4, lastVisit: "2025-07-03" },
  { id: "6", name: "Nour R.", phone: "0112 333 4444", email: "nour@email.com", vehicleType: "sedan", vehicleMake: "Kia", vehicleModel: "Cerato", bookingsCount: 2, lastVisit: "2025-06-10" },
  { id: "7", name: "Hassan F.", phone: "0155 666 7777", vehicleType: "suv", vehicleMake: "Range Rover", vehicleModel: "Sport", bookingsCount: 3, lastVisit: "2025-06-25" },
];

export default function AdminCustomersPage() {
  const [customers] = useState(initialCustomers);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.vehicleMake && c.vehicleMake.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-text-primary">
          Customers
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {customers.length} customers in your database.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone, or vehicle..."
          className="w-full h-9 pl-10 pr-4 rounded-[4px] border border-border bg-surface-elevated text-text-primary text-sm placeholder:text-text-muted focus:border-primary outline-none transition-colors"
        />
      </div>

      {/* Customers List */}
      <div className="rounded-[4px] border border-border bg-surface divide-y divide-border">
        {filtered.map((customer) => (
          <button
            key={customer.id}
            onClick={() => setSelectedCustomer(customer)}
            className="w-full flex items-center justify-between p-4 hover:bg-surface-elevated/50 transition-colors text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                {customer.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {customer.name}
                </p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-text-muted flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {customer.phone}
                  </span>
                  {customer.vehicleMake && (
                    <span className="text-xs text-text-muted flex items-center gap-1">
                      <Car className="w-3 h-3" />
                      {customer.vehicleMake} {customer.vehicleModel}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-text-muted">
                  {customer.bookingsCount} bookings
                </p>
                <p className="text-[10px] text-text-muted">
                  Last: {new Date(customer.lastVisit).toLocaleDateString("en", { month: "short", day: "numeric" })}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </div>
          </button>
        ))}

        {filtered.length === 0 && (
          <div className="py-12 text-center text-text-muted text-sm">
            No customers found.
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={() => setSelectedCustomer(null)}
        >
          <div
            className="w-full max-w-md rounded-[4px] border border-border bg-surface p-6 space-y-5 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary text-lg font-bold">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-heading font-semibold text-text-primary">
                    {selectedCustomer.name}
                  </h2>
                  <p className="text-xs text-text-muted">{selectedCustomer.vehicleType.toUpperCase()}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-1 text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info */}
            <div className="space-y-3">
              {[
                { icon: Phone, label: "Phone", value: selectedCustomer.phone, href: `tel:${selectedCustomer.phone.replace(/\s/g, "")}` },
                ...(selectedCustomer.email ? [{ icon: Mail, label: "Email", value: selectedCustomer.email, href: `mailto:${selectedCustomer.email}` }] : []),
                { icon: Car, label: "Vehicle", value: `${selectedCustomer.vehicleMake || ""} ${selectedCustomer.vehicleModel || ""}`.trim() || selectedCustomer.vehicleType },
                { icon: Calendar, label: "Bookings", value: `${selectedCustomer.bookingsCount} total` },
                { icon: Calendar, label: "Last Visit", value: new Date(selectedCustomer.lastVisit).toLocaleDateString("en", { weekday: "short", month: "long", day: "numeric", year: "numeric" }) },
              ].map((row) => {
                const Icon = row.icon;
                return (
                  <div key={row.label} className="flex items-center gap-3 py-1.5">
                    <Icon className="w-4 h-4 text-text-muted shrink-0" />
                    <span className="text-sm text-text-secondary flex-1">{row.label}</span>
                    {row.href ? (
                      <a href={row.href} className="text-sm font-medium text-primary hover:text-primary-light transition-colors">
                        {row.value}
                      </a>
                    ) : (
                      <span className="text-sm font-medium text-text-primary">{row.value}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Notes */}
            {selectedCustomer.notes && (
              <div className="p-3 rounded-[4px] bg-surface-elevated border border-border">
                <p className="text-xs text-text-muted mb-1">Notes</p>
                <p className="text-sm text-text-secondary">{selectedCustomer.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
