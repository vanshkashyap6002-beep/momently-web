import Razorpay from "razorpay";
import crypto from "crypto";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

let cachedClient: Razorpay | null = null;

function getClient(): Razorpay {
  if (!cachedClient) {
    cachedClient = new Razorpay({
      key_id: requireEnv("RAZORPAY_KEY_ID"),
      key_secret: requireEnv("RAZORPAY_KEY_SECRET"),
    });
  }
  return cachedClient;
}

/** The publishable key id — safe to send to the client (unlike the
 * secret), needed by Razorpay's checkout.js to open the payment modal. */
export function getRazorpayPublicKeyId(): string {
  return requireEnv("RAZORPAY_KEY_ID");
}

export interface CreateRazorpayOrderInput {
  amountInPaise: number;
  currency: string;
  receipt: string;
}

export interface RazorpayOrderResult {
  id: string;
  amount: number;
  currency: string;
}

export async function createRazorpayOrder(input: CreateRazorpayOrderInput): Promise<RazorpayOrderResult> {
  const order = await getClient().orders.create({
    amount: input.amountInPaise,
    currency: input.currency,
    receipt: input.receipt,
  });

  return {
    id: order.id,
    amount: typeof order.amount === "string" ? parseInt(order.amount, 10) : order.amount,
    currency: order.currency,
  };
}

export interface VerifyRazorpaySignatureInput {
  orderId: string;
  paymentId: string;
  signature: string;
}

/** Razorpay's documented HMAC-SHA256 verification: `order_id|payment_id`
 * signed with the key secret must match the signature returned by
 * checkout.js. This is the only trustworthy way to confirm a payment
 * actually succeeded — the client-side success callback alone is not
 * sufficient, since it can be spoofed. */
export function verifyRazorpaySignature({ orderId, paymentId, signature }: VerifyRazorpaySignatureInput): boolean {
  const secret = requireEnv("RAZORPAY_KEY_SECRET");
  const expected = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  return expected === signature;
}

/**
 * Verifies a Razorpay webhook payload using the separate webhook secret
 * (configured in the Razorpay dashboard, distinct from the API key
 * secret). The signature is computed over the *raw* request body — it
 * must be read as text, never JSON-parsed first, or the signature won't
 * match. This is what makes the webhook trustworthy as a source of truth
 * independent of whether the browser's checkout flow ever completes: if
 * the user closes the tab right after paying, this is the only thing
 * that still confirms the payment actually went through.
 */
export function verifyRazorpayWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = requireEnv("RAZORPAY_WEBHOOK_SECRET");
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return expected === signature;
}
