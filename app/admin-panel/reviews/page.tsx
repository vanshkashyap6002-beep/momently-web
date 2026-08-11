import { communityTemplateService } from "@/services/community-template.service";
import { ReviewQueueTable } from "@/components/AdminPanel/ReviewQueueTable";

export default async function AdminReviewsPage() {
  const templates = await communityTemplateService.getPendingReview();

  return (
    <div>
      <p className="eyebrow">Admin Panel</p>
      <h1 className="mt-2 font-display text-2xl md:text-3xl text-ink dark:text-paper">Template Reviews</h1>
      <p className="mt-1 text-sm text-ink/55 dark:text-paper/55">{templates.length} pending</p>

      <div className="mt-6">
        <ReviewQueueTable templates={templates} />
      </div>
    </div>
  );
}
