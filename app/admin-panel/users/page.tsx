import { userAdminService } from "@/services/user-admin.service";
import { UsersTable } from "@/components/AdminPanel/UsersTable";

export default async function AdminUsersPage() {
  const users = await userAdminService.getAllUsers();

  return (
    <div>
      <p className="eyebrow">Admin Panel</p>
      <h1 className="mt-2 font-display text-2xl md:text-3xl text-ink dark:text-paper">Users</h1>
      <p className="mt-1 text-sm text-ink/55 dark:text-paper/55">{users.length} total</p>

      <div className="mt-6">
        <UsersTable users={users} />
      </div>
    </div>
  );
}
