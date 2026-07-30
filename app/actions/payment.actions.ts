"use server";

import { requireUserId } from "@/lib/session";
import { parseOrThrow } from "@/lib/validation";
import { toActionResult } from "@/lib/api-response";
import { paymentService } from "@/services/payment.service";
import { createPaymentOrderSchema, verifyPaymentSchema } from "@/validators/payment.schema";
import type { CheckoutOrder } from "@/types/payment";
import type { Payment } from "@prisma/client";
import type { ActionResult } from "@/types/api";

/** Creates a Razorpay order for the given project. Called both for the
 * initial checkout attempt and for "retry payment" after a failure. */
export async function createPaymentOrder(input: unknown): Promise<ActionResult<CheckoutOrder>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    const parsed = parseOrThrow(createPaymentOrderSchema, input);
    return paymentService.createPaymentOrder(userId, parsed);
  });
}

/** Verifies the Razorpay signature server-side after checkout.js reports
 * success. This is the only step that actually marks a Payment SUCCESS —
 * the client-side callback alone is never trusted. */
export async function verifyPayment(input: unknown): Promise<ActionResult<Payment>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    const parsed = parseOrThrow(verifyPaymentSchema, input);
    return paymentService.verifyPayment(userId, parsed);
  });
}
