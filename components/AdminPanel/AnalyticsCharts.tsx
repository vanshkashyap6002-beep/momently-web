"use client";

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { RevenuePoint, UserGrowthPoint, BestSellingTemplate } from "@/repositories/admin.repository";

const LOVE = "#7A1E2B";

export function AnalyticsCharts({
  revenue,
  userGrowth,
  bestSelling,
}: {
  revenue: RevenuePoint[];
  userGrowth: UserGrowthPoint[];
  bestSelling: BestSellingTemplate[];
}) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="rounded-2xl border border-ink/10 dark:border-paper/10 bg-paper dark:bg-ink-soft p-5">
        <h2 className="text-sm font-medium text-ink dark:text-paper mb-4">Monthly Revenue</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={revenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-ink/10 dark:text-paper/10" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="currentColor" className="text-ink/40 dark:text-paper/40" />
            <YAxis tick={{ fontSize: 11 }} stroke="currentColor" className="text-ink/40 dark:text-paper/40" />
            <Tooltip formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Revenue"]} />
            <Line type="monotone" dataKey="revenue" stroke={LOVE} strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl border border-ink/10 dark:border-paper/10 bg-paper dark:bg-ink-soft p-5">
        <h2 className="text-sm font-medium text-ink dark:text-paper mb-4">User Growth</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={userGrowth}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-ink/10 dark:text-paper/10" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="currentColor" className="text-ink/40 dark:text-paper/40" />
            <YAxis tick={{ fontSize: 11 }} stroke="currentColor" className="text-ink/40 dark:text-paper/40" />
            <Tooltip />
            <Bar dataKey="users" fill={LOVE} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="lg:col-span-2 rounded-2xl border border-ink/10 dark:border-paper/10 bg-paper dark:bg-ink-soft p-5">
        <h2 className="text-sm font-medium text-ink dark:text-paper mb-4">Best Selling Templates</h2>
        {bestSelling.length === 0 ? (
          <p className="text-sm text-ink/45 dark:text-paper/45">No sales yet.</p>
        ) : (
          <div className="space-y-3">
            {bestSelling.map((t) => (
              <div key={t.templateId} className="flex items-center justify-between text-sm">
                <span className="text-ink dark:text-paper">{t.title}</span>
                <span className="text-ink/55 dark:text-paper/55">
                  {t.salesCount} sales · ₹{t.revenue.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
