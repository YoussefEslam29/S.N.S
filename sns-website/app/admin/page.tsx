import {
  CalendarDays,
  Clock,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

/** Admin dashboard overview with stats and recent activity. */
export default function AdminDashboardPage() {
  // TODO: Fetch real data from API
  const stats = [
    {
      label: "Today's Bookings",
      value: "5",
      icon: CalendarDays,
      color: "text-primary bg-primary/10",
    },
    {
      label: "Pending",
      value: "3",
      icon: Clock,
      color: "text-warning bg-warning/10",
    },
    {
      label: "Completed This Week",
      value: "18",
      icon: CheckCircle2,
      color: "text-success bg-success/10",
    },
    {
      label: "Total Customers",
      value: "142",
      icon: Users,
      color: "text-chrome bg-chrome/10",
    },
  ];

  const recentBookings = [
    { id: "1", customer: "Ahmed M.", service: "Premium Wash", vehicle: "Sedan", time: "3:00 PM", status: "confirmed" },
    { id: "2", customer: "Mohamed K.", service: "PPF Front End", vehicle: "SUV", time: "4:00 PM", status: "pending" },
    { id: "3", customer: "Sara A.", service: "Ceramic Coating", vehicle: "Sedan", time: "5:00 PM", status: "in-progress" },
    { id: "4", customer: "Omar H.", service: "Window Tinting", vehicle: "SUV", time: "7:00 PM", status: "pending" },
    { id: "5", customer: "Youssef E.", service: "Interior Detail", vehicle: "Truck", time: "8:00 PM", status: "confirmed" },
  ];

  const statusColors: Record<string, string> = {
    pending: "bg-warning/10 text-warning",
    confirmed: "bg-primary/10 text-primary",
    "in-progress": "bg-cyan-500/10 text-cyan-400",
    completed: "bg-success/10 text-success",
    cancelled: "bg-error/10 text-error",
  };

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
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="p-5 rounded-[4px] border border-border bg-surface"
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

      {/* Recent Bookings */}
      <div className="rounded-[4px] border border-border bg-surface">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-heading font-semibold text-text-primary">
            Today&apos;s Bookings
          </h2>
          <span className="text-xs text-text-muted">
            Saturday – Thursday, 2 PM – 12 AM
          </span>
        </div>
        <div className="divide-y divide-border">
          {recentBookings.map((booking) => (
            <div
              key={booking.id}
              className="px-5 py-3.5 flex items-center justify-between hover:bg-surface-elevated/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-elevated text-text-muted text-sm font-medium">
                  {booking.customer.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {booking.customer}
                  </p>
                  <p className="text-xs text-text-muted">
                    {booking.service} · {booking.vehicle}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-text-secondary">{booking.time}</span>
                <span
                  className={`px-2 py-1 text-[10px] uppercase tracking-wider font-medium rounded-[4px] ${
                    statusColors[booking.status] || ""
                  }`}
                >
                  {booking.status.replace("-", " ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-[4px] border border-border bg-surface space-y-2">
          <div className="flex items-center gap-2 text-warning">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Pending Actions</span>
          </div>
          <ul className="space-y-1 text-sm text-text-secondary">
            <li>• 3 bookings waiting for confirmation</li>
            <li>• Connect MongoDB to see live data</li>
          </ul>
        </div>
        <div className="p-5 rounded-[4px] border border-border bg-surface space-y-2">
          <div className="flex items-center gap-2 text-success">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">Quick Stats</span>
          </div>
          <ul className="space-y-1 text-sm text-text-secondary">
            <li>• Most booked: Premium Wash</li>
            <li>• Busiest day: Saturday</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
