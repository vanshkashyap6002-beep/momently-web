import { reportService } from "@/services/report.service";
import { ReportsTable } from "@/components/AdminPanel/ReportsTable";

export default async function AdminReportsPage() {
  const reports = await reportService.getAllReportsForAdmin();

  return (
    <div>
      <p className="eyebrow">Admin Panel</p>
      <h1 className="mt-2 font-display text-2xl md:text-3xl text-ink dark:text-paper">Reports</h1>
      <p className="mt-1 text-sm text-ink/55 dark:text-paper/55">{reports.length} total</p>

      <div className="mt-6">
        <ReportsTable reports={reports} />
      </div>
    </div>
  );
}
