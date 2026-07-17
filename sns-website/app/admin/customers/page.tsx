"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Phone,
  Mail,
  Car,
  Calendar,
  ChevronRight,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomerItem {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  vehicleType: string;
  vehicleMake?: string;
  vehicleModel?: string;
  notes?: string;
  createdAt: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchCustomers = useCallback(async (searchQuery?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: "100" });
      if (searchQuery) params.set("search", searchQuery);
      const res = await fetch(`/api/customers?${params}`);
      if (!res.ok) throw new Error("Failed to fetch customers");
      const data = await res.json();
      setCustomers(data.data ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchCustomers(search || undefined);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, fetchCustomers]);

  if (loading && customers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-error">
        <AlertCircle className="w-5 h-5 mr-2" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-text-primary">
          Customers
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {total} customer{total !== 1 ? "s" : ""} in your database.
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
        {customers.map((customer) => (
          <button
            key={customer._id}
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
                <p className="text-xs text-text-muted uppercase">
                  {customer.vehicleType}
                </p>
                <p className="text-[10px] text-text-muted">
                  Added: {new Date(customer.createdAt).toLocaleDateString("en", { month: "short", day: "numeric" })}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </div>
          </button>
        ))}

        {customers.length === 0 && (
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
                { icon: Calendar, label: "Joined", value: new Date(selectedCustomer.createdAt).toLocaleDateString("en", { weekday: "short", month: "long", day: "numeric", year: "numeric" }) },
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
