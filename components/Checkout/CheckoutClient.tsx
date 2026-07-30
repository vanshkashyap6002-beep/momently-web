"use client";

import { useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, ShieldCheck, RotateCcw, CheckCircle2 } from "lucide-react";
import { createPaymentOrder, verifyPayment } from "@/app/actions/payment.actions";
import { confirmPublish } from "@/app/actions/project.actions";
import type { RazorpayCheckoutSuccessResponse } from "@/types/razorpay-checkout";

type CheckoutState = "idle" | "processing" | "success" | "error";

export function CheckoutClient({
  projectId,
  projectTitle,
  templateTitle,
  priceLabel,
  customizeUrl,
}: {
  projectId: string;
  projectTitle: string;
  templateTitle: string;
  priceLabel: string;
  customizeUrl: string;
}) {
  const [state, setState] = useState<CheckoutState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);

  async function handlePay() {
    setState("processing");
    setError(null);

    const orderResult = await createPaymentOrder({ projectId });
    if (!orderResult.ok) {
      setState("error");
      setError(orderResult.error);
      return;
    }

    if (!scriptReady || typeof window.Razorpay !== "function") {
      setState("error");
      setError("Payment couldn't start — please refresh the page and try again.");
      return;
    }

    const order = orderResult.data;

    const razorpay = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: "Momently",
      description: `${templateTitle} — ${projectTitle}`,
      order_id: order.razorpayOrderId,
      theme: { color: "#7A1E2B" },
      handler: async (response: RazorpayCheckoutSuccessResponse) => {
        const verifyResult = await verifyPayment({
          projectId,
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });

        if (!verifyResult.ok) {
          setState("error");
          setError(verifyResult.error);
          return;
        }

        const publishResult = await confirmPublish(projectId);
        if (!publishResult.ok) {
          setState("error");
          setError(publishResult.error);
          return;
        }

        setState("success");
      },
      modal: {
        ondismiss: () => {
          setState((current) => (current === "processing" ? "idle" : current));
        },
      },
    });

    razorpay.on("payment.failed", (failure) => {
      setState("error");
      setError(failure.error.description || "Payment failed. Please try again.");
    });

    razorpay.open();
  }

  return (
    <div className="mt-10">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setScriptReady(true)}
        strategy="afterInteractive"
      />

      {state === "success" ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-ink/10 dark:border-paper/10 bg-paper dark:bg-ink-soft p-6"
        >
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
            <p className="font-medium">Payment successful — your memory is live.</p>
          </div>
          <Link
            href={customizeUrl}
            className="mt-6 inline-block rounded-full bg-love px-6 py-3 text-sm font-medium text-paper hover:bg-love-dark transition-colors"
          >
            Back to Studio
          </Link>
        </motion.div>
      ) : (
        <div className="rounded-2xl border border-ink/10 dark:border-paper/10 bg-paper dark:bg-ink-soft p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink/60 dark:text-paper/60">{templateTitle}</span>
            <span className="font-display text-2xl text-ink dark:text-paper">{priceLabel}</span>
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-love/10 px-3 py-2 text-xs text-love dark:text-blush">
              {error}
            </p>
          )}

          <button
            onClick={handlePay}
            disabled={state === "processing"}
            className="mt-6 w-full flex items-center justify-center gap-2 rounded-full bg-love px-6 py-3.5 text-sm font-medium text-paper shadow-card hover:bg-love-dark transition-colors disabled:opacity-60"
          >
            {state === "processing" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Processing…
              </>
            ) : state === "error" ? (
              <>
                <RotateCcw className="h-4 w-4" /> Retry payment
              </>
            ) : (
              <>Pay {priceLabel} &amp; Publish</>
            )}
          </button>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-ink/45 dark:text-paper/45">
            <ShieldCheck className="h-3.5 w-3.5" /> Secured by Razorpay
          </p>

          <Link
            href={customizeUrl}
            className="mt-6 block text-center text-xs text-ink/50 dark:text-paper/50 hover:text-love dark:hover:text-blush"
          >
            Back to Studio — keep as draft
          </Link>
        </div>
      )}
    </div>
  );
}
