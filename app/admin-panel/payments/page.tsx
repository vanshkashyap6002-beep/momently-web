import { paymentService } from "@/services/payment.service";
import { StatusBadge } from "@/components/AdminPanel/StatusBadge";

export default async function AdminPaymentsPage() {
  const payments = await paymentService.getAllPaymentsForAdmin();

  return (
    <div>
      <p className="eyebrow">Admin Panel</p>
      <h1 className="mt-2 font-display text-2xl md:text-3xl text-ink dark:text-paper">Payments</h1>
      <p className="mt-1 text-sm text-ink/55 dark:text-paper/55">{payments.length} total</p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-ink/10 dark:border-paper/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink/10 dark:border-paper/10 text-left text-xs text-ink/50 dark:text-paper/50">
              <th className="px-4 py-3 font-medium">Payment ID</th>
              <th className="px-4 py-3 font-medium">Razorpay Order ID</th>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Currency</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-b border-ink/5 dark:border-paper/5 last:border-0">
                <td className="px-4 py-3 text-ink/70 dark:text-paper/70 font-mono text-xs">{payment.id}</td>
                <td className="px-4 py-3 text-ink/70 dark:text-paper/70 font-mono text-xs">
                  {payment.razorpayOrderId}
                </td>
                <td className="px-4 py-3 text-ink dark:text-paper">
                  {payment.user.fullName}
                  <span className="block text-xs text-ink/45 dark:text-paper/45">{payment.user.email}</span>
                </td>
                <td className="px-4 py-3 text-ink/70 dark:text-paper/70">
                  ₹{Number(payment.amount).toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3 text-ink/70 dark:text-paper/70">{payment.currency}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={payment.status} />
                </td>
                <td className="px-4 py-3 text-ink/50 dark:text-paper/50">
                  {new Date(payment.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {payments.length === 0 && (
          <p className="py-10 text-center text-sm text-ink/45 dark:text-paper/45">No payments yet.</p>
        )}
      </div>
    </div>
  );
}
