import { z } from "zod";

export const createPaymentOrderSchema = z.object({
  projectId: z.string().trim().min(1, "projectId is required"),
});
export type CreatePaymentOrderInput = z.infer<typeof createPaymentOrderSchema>;

export const verifyPaymentSchema = z.object({
  projectId: z.string().trim().min(1, "projectId is required"),
  razorpayOrderId: z.string().trim().min(1, "razorpayOrderId is required"),
  razorpayPaymentId: z.string().trim().min(1, "razorpayPaymentId is required"),
  razorpaySignature: z.string().trim().min(1, "razorpaySignature is required"),
});
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;

/** The subset of Razorpay's webhook payload we actually read — Razorpay
 * sends many more fields, all ignored here. See
 * https://razorpay.com/docs/webhooks/payloads/payments/ */
export const razorpayWebhookEventSchema = z.object({
  event: z.string(),
  payload: z.object({
    payment: z.object({
      entity: z.object({
        id: z.string(),
        order_id: z.string(),
        status: z.string(),
      }),
    }),
  }),
});
export type RazorpayWebhookEvent = z.infer<typeof razorpayWebhookEventSchema>;
