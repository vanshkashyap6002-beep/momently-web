import { paymentRepository } from "@/repositories/payment.repository";
import { projectRepository } from "@/repositories/project.repository";
import { templateRepository } from "@/repositories/template.repository";
import { createRazorpayOrder, verifyRazorpaySignature, getRazorpayPublicKeyId } from "@/lib/razorpay";
import { checkRateLimit } from "@/lib/rate-limit";
import { NotFoundError, ValidationError, RateLimitError } from "@/lib/errors";
import type { CreatePaymentOrderInput, VerifyPaymentInput, RazorpayWebhookEvent } from "@/validators/payment.schema";
import type { CheckoutOrder } from "@/types/payment";
import type { Payment } from "@prisma/client";

/** Resolves what a project's template actually costs — the single place
 * that answers "does this project need to be paid for before publishing,"
 * so the checkout flow and the publish gate can't disagree with each other. */
async function getRequiredAmount(templateId: string): Promise<number> {
  const template = await templateRepository.findById(templateId);
  if (!template) throw new NotFoundError("Template not found.");
  return Number(template.price);
}

async function assertProjectOwnership(projectId: string, userId: string) {
  const project = await projectRepository.findById(projectId);
  if (!project || project.userId !== userId) {
    throw new NotFoundError("Project not found.");
  }
  return project;
}

export const paymentService = {
  /** Creates a Razorpay order and a matching PENDING Payment row. Called
   * both for the first checkout attempt and for "retry payment" after a
   * failure — each attempt gets its own order/row rather than mutating a
   * failed one, so the payment history stays an honest audit trail. */
  async createPaymentOrder(userId: string, input: CreatePaymentOrderInput): Promise<CheckoutOrder> {
    // 5 order-creation attempts per 10 minutes per user — generous enough
    // for legitimate retries after a failed payment, tight enough to stop
    // someone scripting repeated Razorpay order creation.
    const limit = await checkRateLimit(`payment-order:${userId}`, 5, 10 * 60);
    if (!limit.allowed) {
      throw new RateLimitError("Too many payment attempts. Please wait a few minutes and try again.");
    }

    const project = await assertProjectOwnership(input.projectId, userId);
    const amount = await getRequiredAmount(project.templateId);

    if (amount <= 0) {
      throw new ValidationError("This template is free and does not require payment.");
    }

    const amountInPaise = Math.round(amount * 100);
    const razorpayOrder = await createRazorpayOrder({
      amountInPaise,
      currency: "INR",
      receipt: `project_${project.id}_${Date.now()}`,
    });

    await paymentRepository.create({
      razorpayOrderId: razorpayOrder.id,
      amount,
      currency: "INR",
      status: "PENDING",
      user: { connect: { id: userId } },
      project: { connect: { id: project.id } },
    });

    return {
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: "INR",
      keyId: getRazorpayPublicKeyId(),
      projectId: project.id,
    };
  },

  /** Verifies the Razorpay signature server-side (never trust the
   * client-side success callback alone) and marks the Payment SUCCESS or
   * FAILED accordingly. Throws on failure so the checkout UI can show a
   * friendly error and offer a retry, per spec. */
  async verifyPayment(userId: string, input: VerifyPaymentInput): Promise<Payment> {
    await assertProjectOwnership(input.projectId, userId);

    const payment = await paymentRepository.findByRazorpayOrderId(input.razorpayOrderId);
    if (!payment || payment.userId !== userId || payment.projectId !== input.projectId) {
      throw new NotFoundError("Payment not found.");
    }

    const isValid = verifyRazorpaySignature({
      orderId: input.razorpayOrderId,
      paymentId: input.razorpayPaymentId,
      signature: input.razorpaySignature,
    });

    if (!isValid) {
      await paymentRepository.update(payment.id, { status: "FAILED" });
      throw new ValidationError("Payment verification failed. Please try again.");
    }

    return paymentRepository.update(payment.id, {
      status: "SUCCESS",
      razorpayPaymentId: input.razorpayPaymentId,
    });
  },

  /** The access gate: true if the project's template is free, or if a
   * verified successful payment already exists for it. Used both to block
   * initial Studio access for premium templates (see the /customize route)
   * and, redundantly as defense-in-depth, before publishing. */
  async isProjectUnlocked(projectId: string, templateId: string): Promise<boolean> {
    const amount = await getRequiredAmount(templateId);
    if (amount <= 0) return true;
    const payment = await paymentRepository.findLatestSuccessByProjectId(projectId);
    return Boolean(payment);
  },

  /**
   * Processes a verified Razorpay webhook event — this is the source of
   * truth for "did the payment actually succeed," independent of whether
   * the browser's checkout flow ever completes (e.g. the user closed the
   * tab right after paying, before `verifyPayment` could run). Only
   * `payment.captured` marks a Payment SUCCESS; other event types are
   * accepted and ignored so Razorpay doesn't retry them as failures.
   * Idempotent: re-delivering the same event is a safe no-op.
   */
  async handleWebhookEvent(event: RazorpayWebhookEvent): Promise<void> {
    if (event.event !== "payment.captured") return;

    const { order_id: orderId, id: paymentId } = event.payload.payment.entity;
    const payment = await paymentRepository.findByRazorpayOrderId(orderId);
    if (!payment || payment.status === "SUCCESS") return;

    await paymentRepository.update(payment.id, {
      status: "SUCCESS",
      razorpayPaymentId: paymentId,
    });
  },

  /** Marks payments left PENDING for more than an hour as FAILED — cleans
   * up abandoned checkouts. Called by the /api/cron/expire-payments
   * maintenance route, meant to run on a schedule (e.g. Vercel Cron). */
  async expireStalePayments(): Promise<number> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return paymentRepository.expireStalePending(oneHourAgo);
  },

  // ---- Admin Panel addition below — existing methods above are untouched ----

  /** Backs both the admin "Payments" and "Orders" views — there's only
   * one Payment model in this schema (no separate Order model), so both
   * tables read the same data, just presented with different columns. */
  getAllPaymentsForAdmin() {
    return paymentRepository.findAllForAdmin();
  },
};
