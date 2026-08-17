import { Users, UserCheck, ShoppingBag, IndianRupee, Clock, CheckCircle2, XCircle, Globe, FileEdit } from "lucide-react";
import { dashboardService } from "@/services/dashboard.service";
import { StatCard } from "@/components/AdminPanel/StatCard";

export default async function AdminDashboardPage() {
  const stats = await dashboardService.getStats();

  return (
    <div>
      <p className="eyebrow">Admin Panel</p>
      <h1 className="mt-2 font-display text-2xl md:text-3xl text-ink dark:text-paper">Dashboard</h1>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats.totalUsers} icon={Users} />
        <StatCard label="Active Users (30d)" value={stats.activeUsers} icon={UserCheck} />
        <StatCard label="Total Orders" value={stats.totalOrders} icon={ShoppingBag} />
        <StatCard label="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString("en-IN")}`} icon={IndianRupee} />
        <StatCard label="Pending Orders" value={stats.pendingOrders} icon={Clock} />
        <StatCard label="Successful Payments" value={stats.successfulPayments} icon={CheckCircle2} />
        <StatCard label="Failed Payments" value={stats.failedPayments} icon={XCircle} />
        <StatCard label="Published Projects" value={stats.publishedProjects} icon={Globe} />
        <StatCard label="Draft Projects" value={stats.draftProjects} icon={FileEdit} />
      </div>
    </div>
  );
}
