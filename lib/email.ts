/**
 * Email abstraction: one function to swap when you pick a real provider
 * (Resend, SendGrid, etc.) — nothing else in the app needs to change.
 *
 * STATUS: Requires production email provider configuration. No provider
 * is wired up yet (no SDK dependency, no provider env vars in
 * .env.example), so this only logs to the server console. Password
 * reset and email verification both depend on this — until a provider is
 * configured, those links are generated and stored correctly but never
 * actually reach the user's inbox.
 */
export interface SendEmailInput {
  to: string;
  subject: string;
  text: string;
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  // TODO: replace with a real provider call, e.g.:
  //   await resend.emails.send({ from: "Momently <noreply@momently.app>", ...input })
  console.log("─── Email NOT sent — requires production email provider configuration ───");
  console.log(`To: ${input.to}`);
  console.log(`Subject: ${input.subject}`);
  console.log(input.text);
  console.log("───────────────────────────────────────────────────────────────────────");
}
