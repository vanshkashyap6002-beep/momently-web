import { paymentService } from "@/services/payment.service";
import { StatusBadge } from "@/components/AdminPanel/StatusBadge";

export default async function AdminOrdersPage() {
  const orders = await paymentService.getAllPaymentsForAdmin();

  return (
    <div>
      <p className="eyebrow">Admin Panel</p>
      <h1 className="mt-2 font-display text-2xl md:text-3xl text-ink dark:text-paper">Orders</h1>
      <p className="mt-1 text-sm text-ink/55 dark:text-paper/55">
        {orders.length} total — same records as Payments, presented per-order.
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-ink/10 dark:border-paper/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink/10 dark:border-paper/10 text-left text-xs text-ink/50 dark:text-paper/50">
              <th className="px-4 py-3 font-medium">Order #</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Template</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr key={order.id} className="border-b border-ink/5 dark:border-paper/5 last:border-0">
                <td className="px-4 py-3 text-ink/70 dark:text-paper/70">
                  #{String(orders.length - index).padStart(4, "0")}
                </td>
                <td className="px-4 py-3 text-ink dark:text-paper">{order.user.fullName}</td>
                <td className="px-4 py-3 text-ink/70 dark:text-paper/70">
                  {order.project.template.title}
                  <span className="block text-xs text-ink/45 dark:text-paper/45">{order.project.title}</span>
                </td>
                <td className="px-4 py-3 text-ink/70 dark:text-paper/70">
                  ₹{Number(order.amount).toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3 text-ink/50 dark:text-paper/50">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p className="py-10 text-center text-sm text-ink/45 dark:text-paper/45">No orders yet.</p>
        )}
      </div>
    </div>
  );
}
