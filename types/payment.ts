import type { Payment } from "@prisma/client";

export type PaymentDTO = Payment;

/** What the client needs to open Razorpay's checkout modal — deliberately
 * narrower than the full Payment row (no internal ids beyond what
 * checkout.js itself requires). */
export interface CheckoutOrder {
  razorpayOrderId: string;
  amount: number; // in the smallest currency unit (paise for INR)
  currency: string;
  keyId: string;
  projectId: string;
}
