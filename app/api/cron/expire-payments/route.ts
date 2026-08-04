import { NextResponse } from "next/server";
import { paymentService } from "@/services/payment.service";

// Never statically prerendered/cached — this route always touches the
// database and/or the current request's auth state. Without this,
// Next.js can attempt to run it once at BUILD time (to bake a cached
// response), when the database is not expected to be reachable — this
// is exactly what caused the "Can't reach database server" build error.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/cron/expire-payments
 *
 * Not a user-facing endpoint — meant to be called on a schedule (e.g.
 * Vercel Cron, or any external scheduler) to clean up checkouts the user
 * abandoned (closed the tab, never paid). Protected by a shared secret in
 * the `Authorization` header rather than a user session, since there's no
 * user attached to a cron trigger. Configure `CRON_SECRET` in the
 * environment and point your scheduler at this URL with
 * `Authorization: Bearer <CRON_SECRET>`.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET;

  if (!expected || authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const expiredCount = await paymentService.expireStalePayments();
  return NextResponse.json({ ok: true, expiredCount });
}
