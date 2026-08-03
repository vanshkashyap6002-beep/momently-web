"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, ShieldOff, ShieldCheck } from "lucide-react";
import { StatusBadge } from "@/components/AdminPanel/StatusBadge";
import { changeUserRole, setUserSuspended, deleteUser } from "@/app/actions/admin.actions";
import type { UserWithStats } from "@/services/user-admin.service";

export function UsersTable({ users }: { users: UserWithStats[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRoleChange(userId: string, role: "USER" | "ADMIN") {
    setPendingId(userId);
    setError(null);
    const result = await changeUserRole({ userId, role });
    setPendingId(null);
    if (!result.ok) setError(result.error);
    else router.refresh();
  }

  async function handleSuspendToggle(userId: string, isSuspended: boolean) {
    setPendingId(userId);
    setError(null);
    const result = await setUserSuspended({ userId, isSuspended });
    setPendingId(null);
    if (!result.ok) setError(result.error);
    else router.refresh();
  }

  async function handleDelete(userId: string, name: string) {
    if (!confirm(`Delete ${name}? This also deletes all of their projects. This can't be undone.`)) return;
    setPendingId(userId);
    setError(null);
    const result = await deleteUser({ id: userId });
    setPendingId(null);
    if (!result.ok) setError(result.error);
    else router.refresh();
  }

  return (
    <div>
      {error && (
        <p className="mb-4 rounded-lg bg-love/10 px-3 py-2 text-xs text-love dark:text-blush">{error}</p>
      )}
      <div className="overflow-x-auto rounded-2xl border border-ink/10 dark:border-paper/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink/10 dark:border-paper/10 text-left text-xs text-ink/50 dark:text-paper/50">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Projects</th>
              <th className="px-4 py-3 font-medium">Orders</th>
              <th className="px-4 py-3 font-medium">Spent</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isPending = pendingId === user.id;
              return (
                <tr key={user.id} className="border-b border-ink/5 dark:border-paper/5 last:border-0">
                  <td className="px-4 py-3 text-ink dark:text-paper">{user.fullName}</td>
                  <td className="px-4 py-3 text-ink/60 dark:text-paper/60">{user.email}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={user.role} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={user.isSuspended ? "SUSPENDED" : "ACTIVE"} />
                  </td>
                  <td className="px-4 py-3 text-ink/70 dark:text-paper/70">{user.projectCount}</td>
                  <td className="px-4 py-3 text-ink/70 dark:text-paper/70">{user.paymentCount}</td>
                  <td className="px-4 py-3 text-ink/70 dark:text-paper/70">
                    ₹{user.amountSpent.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-ink/50 dark:text-paper/50">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin text-ink/40 dark:text-paper/40" />
                      ) : (
                        <>
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value as "USER" | "ADMIN")}
                            className="rounded-md border border-ink/10 dark:border-paper/15 bg-paper dark:bg-ink-soft px-2 py-1 text-xs text-ink dark:text-paper"
                          >
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                          <button
                            onClick={() => handleSuspendToggle(user.id, !user.isSuspended)}
                            title={user.isSuspended ? "Unsuspend" : "Suspend"}
                            className="h-7 w-7 flex items-center justify-center rounded-md text-ink/50 hover:bg-ink/5 hover:text-love dark:text-paper/50 dark:hover:bg-paper/10 dark:hover:text-blush"
                          >
                            {user.isSuspended ? (
                              <ShieldCheck className="h-3.5 w-3.5" />
                            ) : (
                              <ShieldOff className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(user.id, user.fullName)}
                            title="Delete"
                            className="h-7 w-7 flex items-center justify-center rounded-md text-ink/50 hover:bg-love/10 hover:text-love dark:text-paper/50 dark:hover:text-blush"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
