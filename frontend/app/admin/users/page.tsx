"use client";

import { useEffect, useState } from "react";
import { Users, Search, ShieldCheck, UserCheck, Check, AlertCircle } from "lucide-react";
import { Card, PageHeading, StatusBadge } from "@/components/ui-kit";
import { getUsers } from "@/lib/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleRoleChange = (userId: number, newRole: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  const filtered = users.filter((u) => {
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    const matchesSearch =
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search);
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <PageHeading
        title="Role-Based Access Control (RBAC) & Users"
        description="Manage portal users, security permissions, and role delegations for extension officers and system administrators."
      />

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {["All", "farmer", "officer", "admin"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${
                  roleFilter === r
                    ? "bg-[#166534] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {r === "All" ? "All Roles" : r}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user by name, phone..."
              className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs outline-none focus:border-[#166534]"
            />
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User Details</th>
                <th>Username</th>
                <th>Assigned Role</th>
                <th>Registered Date</th>
                <th>Status</th>
                <th>Change Role</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50">
                  <td className="font-semibold text-slate-900">
                    <div>
                      <p>{u.full_name}</p>
                      <p className="text-[11px] font-mono text-slate-400">Phone: {u.phone}</p>
                    </div>
                  </td>
                  <td className="font-mono text-xs text-slate-600">{u.username}</td>
                  <td>
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[11px] font-semibold capitalize ${
                        u.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : u.role === "officer"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="text-xs text-slate-500">{u.created_at}</td>
                  <td>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                      <ShieldCheck className="size-3 text-emerald-600" />
                      Active
                    </span>
                  </td>
                  <td>
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-[#166534]"
                    >
                      <option value="farmer">Farmer</option>
                      <option value="officer">Officer</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
