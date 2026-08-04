import { NextResponse } from "next/server";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay";
import { paymentService } from "@/services/payment.service";
import { razorpayWebhookEventSchema } from "@/validators/payment.schema";

// Never statically prerendered/cached — this route always touches the
// database and/or the current request's auth state. Without this,
// Next.js can attempt to run it once at BUILD time (to bake a cached
// response), when the database is not expected to be reachable — this
// is exactly what caused the "Can't reach database server" build error.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/webhooks/razorpay
 *
 * Deliberately has no session/user auth — Razorpay's servers call this
 * directly, with no cookies. Instead it's protected the correct way for a
 * webhook: verifying the `X-Razorpay-Signature` header against the raw
 * request body using the webhook secret (configured in the Razorpay
 * dashboard, separate from the API key secret). Configure this URL in
 * Razorpay Dashboard → Settings → Webhooks, subscribed to `payment.captured`.
 *
 * This exists specifically to close the gap in the browser-only checkout
 * flow: if the user closes the tab right after Razorpay captures their
 * payment but before `verifyPayment` runs, the DB would otherwise be stuck
 * showing PENDING forever even though the money was taken. This endpoint
 * is the reliable, server-to-server source of truth for that case.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature || !verifyRazorpayWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  const parsed = razorpayWebhookEventSchema.safeParse(JSON.parse(rawBody));
  if (!parsed.success) {
    // Malformed payload from a verified sender — acknowledge so Razorpay
    // doesn't retry indefinitely, but don't process anything.
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  try {
    await paymentService.handleWebhookEvent(parsed.data);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("Failed to process Razorpay webhook:", err);
    // 500 tells Razorpay to retry delivery later.
    return NextResponse.json({ error: "Failed to process webhook." }, { status: 500 });
  }
}
