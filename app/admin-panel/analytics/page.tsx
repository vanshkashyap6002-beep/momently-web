import { dashboardService } from "@/services/dashboard.service";
import { AnalyticsCharts } from "@/components/AdminPanel/AnalyticsCharts";

export default async function AdminAnalyticsPage() {
  const [revenue, userGrowth, bestSelling] = await Promise.all([
    dashboardService.getRevenueChart(),
    dashboardService.getUserGrowthChart(),
    dashboardService.getBestSellingTemplates(),
  ]);

  return (
    <div>
      <p className="eyebrow">Admin Panel</p>
      <h1 className="mt-2 font-display text-2xl md:text-3xl text-ink dark:text-paper">Analytics</h1>

      <div className="mt-6">
        <AnalyticsCharts revenue={revenue} userGrowth={userGrowth} bestSelling={bestSelling} />
      </div>
    </div>
  );
}
