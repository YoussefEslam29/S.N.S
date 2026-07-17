"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  X,
  Save,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Shield,
  Wrench,
  CalendarDays,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingOverlay } from "@/components/LoadingOverlay";

type UserRole = "admin" | "receptionist" | "technician";

interface StaffMember {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

const roleConfig: Record<UserRole, { label: string; icon: typeof Shield; color: string }> = {
  admin: { label: "Admin", icon: Shield, color: "bg-primary/10 text-primary" },
  receptionist: { label: "Receptionist", icon: CalendarDays, color: "bg-emerald-500/10 text-emerald-400" },
  technician: { label: "Technician", icon: Wrench, color: "bg-amber-500/10 text-amber-400" },
};

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "receptionist" as UserRole,
  });

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch staff");
      const data = await res.json();
      setStaff(data.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const toggleActive = async (member: StaffMember) => {
    try {
      setSaving(true);
      const res = await fetch(`/api/users/${member._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !member.isActive }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to toggle status");
      }
      setStaff((prev) =>
        prev.map((s) => (s._id === member._id ? { ...s, isActive: !s.isActive } : s))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Toggle failed");
    } finally {
      setSaving(false);
    }
  };

  const deleteStaff = async (member: StaffMember) => {
    // Don't allow deleting the last admin
    if (member.role === "admin") {
      const adminCount = staff.filter((s) => s.role === "admin" && s._id !== member._id).length;
      if (adminCount === 0) {
        setError("Cannot delete the last admin account.");
        setTimeout(() => setError(""), 3000);
        return;
      }
    }

    if (!confirm(`Are you sure you want to permanently delete ${member.name}?`)) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/users/${member._id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete staff member");
      }
      setStaff((prev) => prev.filter((s) => s._id !== member._id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.email || !formData.password) return;
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create staff member");
      }

      setFormData({ name: "", email: "", password: "", role: "receptionist" });
      setIsCreating(false);
      await fetchStaff();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <LoadingOverlay show={saving} message="Saving staff details..." />
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
              key={member._id}
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
                  onClick={() => toggleActive(member)}
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
                  onClick={() => deleteStaff(member)}
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

        {staff.length === 0 && (
          <div className="py-12 text-center text-text-muted text-sm">
            No staff members found.
          </div>
        )}
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
                disabled={saving}
                className="flex items-center gap-2 h-9 px-4 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-[4px] transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
