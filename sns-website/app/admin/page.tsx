"use client";

import { useState, useEffect } from "react";
import {
  CalendarDays,
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Loader2,
  CreditCard,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface DashboardStats {
  todayBookings: number;
  pending: number;
  completedThisWeek: number;
  totalCustomers: number;
  weeklyRevenue: number;
  lastWeekRevenue: number;
  installmentsDue: Array<{
    _id: string;
    customer: { name: string; phone: string } | null;
    service: { name: { en: string; ar: string } } | null;
    price: number;
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
  }>;
}

interface RecentBooking {
  _id: string;
  customer: { name: string } | null;
  service: { name: { en: string }; category: string } | null;
  vehicleType: string;
  timeSlot: string;
  status: string;
  date: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  confirmed: "bg-primary/10 text-primary",
  "in-progress": "bg-cyan-500/10 text-cyan-400",
  completed: "bg-success/10 text-success",
  cancelled: "bg-error/10 text-error",
};

/** Admin dashboard overview with real stats and recent activity. */
export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [statsRes, bookingsRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/bookings?limit=5"),
        ]);

        if (!statsRes.ok || !bookingsRes.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const statsData = await statsRes.json();
        const bookingsData = await bookingsRes.json();

        setStats(statsData.data);
        setRecentBookings(bookingsData.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
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

  const statCards = [
    {
      label: "Today's Bookings",
      value: stats?.todayBookings ?? 0,
      icon: CalendarDays,
      color: "text-primary bg-primary/10",
    },
    {
      label: "Pending",
      value: stats?.pending ?? 0,
      icon: Clock,
      color: "text-warning bg-warning/10",
    },
    {
      label: "Completed This Week",
      value: stats?.completedThisWeek ?? 0,
      icon: CheckCircle2,
      color: "text-success bg-success/10",
    },
    {
      label: "Total Customers",
      value: stats?.totalCustomers ?? 0,
      icon: Users,
      color: "text-chrome bg-chrome/10",
    },
  ];

  const weeklyRevenue = stats?.weeklyRevenue ?? 0;
  const lastWeekRevenue = stats?.lastWeekRevenue ?? 0;
  const revenueChange =
    lastWeekRevenue > 0
      ? Math.round(((weeklyRevenue - lastWeekRevenue) / lastWeekRevenue) * 100)
      : weeklyRevenue > 0
        ? 100
        : 0;

  const installmentsDue = stats?.installmentsDue ?? [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-text-primary">
          Dashboard
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Welcome back. Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="p-5 rounded-[4px] border border-border bg-surface animate-fade-in"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-text-muted uppercase tracking-wider">
                  {stat.label}
                </span>
                <div className={`w-8 h-8 flex items-center justify-center rounded-[4px] ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-heading font-bold text-text-primary">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Revenue + Installments Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weekly Revenue */}
        <div className="p-5 rounded-[4px] border border-border bg-surface animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-text-muted uppercase tracking-wider">
              Weekly Revenue
            </span>
            <div className="w-8 h-8 flex items-center justify-center rounded-[4px] bg-success/10 text-success">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-heading font-bold text-text-primary">
            {formatPrice(weeklyRevenue)}
          </p>
          <div className="flex items-center gap-1 mt-2">
            {revenueChange >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5 text-success" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-error" />
            )}
            <span className={`text-xs font-medium ${revenueChange >= 0 ? "text-success" : "text-error"}`}>
              {revenueChange >= 0 ? "+" : ""}{revenueChange}%
            </span>
            <span className="text-xs text-text-muted">vs last week</span>
          </div>
        </div>

        {/* Installments Due */}
        <div className="p-5 rounded-[4px] border border-border bg-surface animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-text-muted uppercase tracking-wider">
              Installments Due This Week
            </span>
            <div className="w-8 h-8 flex items-center justify-center rounded-[4px] bg-warning/10 text-warning">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          {installmentsDue.length === 0 ? (
            <p className="text-sm text-text-secondary">No installments due soon.</p>
          ) : (
            <div className="space-y-2">
              <p className="text-2xl font-heading font-bold text-warning">
                {installmentsDue.length}
              </p>
              {installmentsDue.slice(0, 3).map((item) => {
                const nextDue = item.installmentPlan?.schedule.find((s) => !s.paid);
                return (
                  <div key={item._id} className="flex items-center justify-between py-1.5 border-t border-border">
                    <span className="text-sm text-text-primary">
                      {item.customer?.name ?? "Unknown"}
                    </span>
                    <span className="text-xs text-warning font-medium">
                      {nextDue ? formatPrice(nextDue.amount) : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="rounded-[4px] border border-border bg-surface animate-fade-in">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-heading font-semibold text-text-primary">
            Recent Bookings
          </h2>
          <span className="text-xs text-text-muted">
            Saturday – Thursday, 2 PM – 12 AM
          </span>
        </div>
        <div className="divide-y divide-border">
          {recentBookings.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-text-muted">
              No bookings yet.
            </div>
          ) : (
            recentBookings.map((booking) => {
              const hour = parseInt(booking.timeSlot);
              const timeLabel = !isNaN(hour)
                ? hour >= 12
                  ? `${hour === 12 ? 12 : hour - 12}:00 PM`
                  : `${hour}:00 AM`
                : booking.timeSlot;

              return (
                <div
                  key={booking._id}
                  className="px-5 py-3.5 flex items-center justify-between hover:bg-surface-elevated/50 transition-colors"
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
                        {booking.service?.name?.en ?? "—"} · {booking.vehicleType?.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-text-secondary">{timeLabel}</span>
                    <span
                      className={`px-2 py-1 text-[10px] uppercase tracking-wider font-medium rounded-[4px] ${
                        statusColors[booking.status] || ""
                      }`}
                    >
                      {booking.status.replace("-", " ")}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Pending Actions */}
      {(stats?.pending ?? 0) > 0 && (
        <div className="p-5 rounded-[4px] border border-border bg-surface animate-fade-in">
          <div className="flex items-center gap-2 text-warning">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Pending Actions</span>
          </div>
          <ul className="mt-2 space-y-1 text-sm text-text-secondary">
            <li>• {stats?.pending} booking{(stats?.pending ?? 0) !== 1 ? "s" : ""} waiting for confirmation</li>
            {installmentsDue.length > 0 && (
              <li>• {installmentsDue.length} installment{installmentsDue.length !== 1 ? "s" : ""} due this week</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
