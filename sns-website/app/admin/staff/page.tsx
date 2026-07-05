"use client";

import { useState } from "react";
import {
  Plus,
  X,
  Save,
  ToggleLeft,
  ToggleRight,
  Trash2,
  UserCog,
  Shield,
  Wrench,
  CalendarDays,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type UserRole = "admin" | "receptionist" | "technician";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

/* ─── Placeholder data ─── */
const initialStaff: StaffMember[] = [
  { id: "1", name: "Admin User", email: "admin@sns.com", role: "admin", isActive: true, createdAt: "2025-01-01" },
  { id: "2", name: "Receptionist", email: "reception@sns.com", role: "receptionist", isActive: true, createdAt: "2025-03-15" },
  { id: "3", name: "Technician 1", email: "tech1@sns.com", role: "technician", isActive: true, createdAt: "2025-04-01" },
  { id: "4", name: "Technician 2", email: "tech2@sns.com", role: "technician", isActive: false, createdAt: "2025-05-10" },
];

const roleConfig: Record<UserRole, { label: string; icon: typeof Shield; color: string }> = {
  admin: { label: "Admin", icon: Shield, color: "bg-primary/10 text-primary" },
  receptionist: { label: "Receptionist", icon: CalendarDays, color: "bg-emerald-500/10 text-emerald-400" },
  technician: { label: "Technician", icon: Wrench, color: "bg-amber-500/10 text-amber-400" },
};

export default function AdminStaffPage() {
  const [staff, setStaff] = useState(initialStaff);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "receptionist" as UserRole,
  });

  const toggleActive = (id: string) => {
    setStaff((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
  };

  const deleteStaff = (id: string) => {
    // Don't allow deleting the last admin
    const member = staff.find((s) => s.id === id);
    if (member?.role === "admin") {
      const adminCount = staff.filter((s) => s.role === "admin" && s.id !== id).length;
      if (adminCount === 0) {
        setError("Cannot delete the last admin account.");
        setTimeout(() => setError(""), 3000);
        return;
      }
    }
    setStaff((prev) => prev.filter((s) => s.id !== id));
  };

  const handleCreate = () => {
    if (!formData.name || !formData.email || !formData.password) return;
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setStaff((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email.toLowerCase(),
        role: formData.role,
        isActive: true,
        createdAt: new Date().toISOString().split("T")[0],
      },
    ]);
    setFormData({ name: "", email: "", password: "", role: "receptionist" });
    setIsCreating(false);
    setError("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            Staff
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage staff accounts and access levels.
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 h-9 px-4 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-[4px] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Staff
        </button>
      </div>

      {/* Error Toast */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-[4px] bg-error/10 border border-error/20 text-error text-sm animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Role Legend */}
      <div className="flex gap-4">
        {Object.entries(roleConfig).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <div key={key} className="flex items-center gap-1.5 text-xs text-text-muted">
              <div className={`w-6 h-6 flex items-center justify-center rounded-[4px] ${config.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              {config.label}
            </div>
          );
        })}
      </div>

      {/* Staff List */}
      <div className="rounded-[4px] border border-border bg-surface divide-y divide-border">
        {staff.map((member) => {
          const role = roleConfig[member.role];
          const RoleIcon = role.icon;
          return (
            <div
              key={member.id}
              className={cn(
                "flex items-center justify-between p-4 transition-colors",
                !member.isActive && "opacity-50"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 flex items-center justify-center rounded-full ${role.color}`}>
                  <RoleIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-text-primary">
                      {member.name}
                    </p>
                    <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium rounded-[4px] ${role.color}`}>
                      {role.label}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">
                    {member.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted hidden sm:block">
                  Since {new Date(member.createdAt).toLocaleDateString("en", { month: "short", year: "numeric" })}
                </span>
                <button
                  onClick={() => toggleActive(member.id)}
                  className="p-1.5 rounded-[4px] transition-colors"
                  title={member.isActive ? "Deactivate" : "Activate"}
                  aria-label={member.isActive ? "Deactivate" : "Activate"}
                >
                  {member.isActive ? (
                    <ToggleRight className="w-6 h-6 text-success" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-text-muted" />
                  )}
                </button>
                <button
                  onClick={() => deleteStaff(member.id)}
                  className="p-1.5 rounded-[4px] text-text-muted hover:text-error hover:bg-error/10 transition-colors"
                  title="Delete"
                  aria-label="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Staff Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[4px] border border-border bg-surface p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-heading font-semibold text-text-primary">
                Add Staff Member
              </h2>
              <button
                onClick={() => { setIsCreating(false); setError(""); }}
                className="p-1 text-text-muted hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Full Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter name"
                  className="w-full h-9 px-3 rounded-[4px] border border-border bg-surface-elevated text-text-primary text-sm focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Email <span className="text-error">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="staff@sns.com"
                  className="w-full h-9 px-3 rounded-[4px] border border-border bg-surface-elevated text-text-primary text-sm focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Password <span className="text-error">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min. 6 characters"
                  className="w-full h-9 px-3 rounded-[4px] border border-border bg-surface-elevated text-text-primary text-sm focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full h-9 px-3 rounded-[4px] border border-border bg-surface-elevated text-text-primary text-sm focus:border-primary outline-none"
                >
                  <option value="receptionist">Receptionist — manage bookings & customers</option>
                  <option value="technician">Technician — update booking status</option>
                  <option value="admin">Admin — full access</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => { setIsCreating(false); setError(""); }}
                className="h-9 px-4 border border-border text-text-secondary hover:text-text-primary rounded-[4px] text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 h-9 px-4 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-[4px] transition-colors"
              >
                <Save className="w-4 h-4" />
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
