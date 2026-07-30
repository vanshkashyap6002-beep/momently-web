/**
 * Email abstraction: one function to swap when you pick a real provider
 * (Resend, SendGrid, etc.) — nothing else in the app needs to change.
 * Right now, with no provider configured, it just logs the email to the
 * server console so password reset / email verification are fully
 * functional to test locally, without actually deliverable email yet.
 */
export interface SendEmailInput {
  to: string;
  subject: string;
  text: string;
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  // TODO: replace with a real provider call, e.g.:
  //   await resend.emails.send({ from: "Momently <noreply@momently.app>", ...input })
  console.log("─── Email (no provider configured — logging instead) ───");
  console.log(`To: ${input.to}`);
  console.log(`Subject: ${input.subject}`);
  console.log(input.text);
  console.log("──────────────────────────────────────────────────────");
}
