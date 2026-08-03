import { settingsRepository } from "@/repositories/settings.repository";
import type { Settings } from "@prisma/client";

export interface IntegrationStatus {
  razorpayConfigured: boolean;
  supabaseConfigured: boolean;
  smtpConfigured: boolean;
}

export const settingsService = {
  getSettings(): Promise<Settings> {
    return settingsRepository.get();
  },

  updateSettings(data: { siteName?: string; maintenanceMode?: boolean }): Promise<Settings> {
    return settingsRepository.update(data);
  },

  /**
   * Reports whether each third-party integration has credentials
   * configured — never the values themselves. Deliberately not stored in
   * or editable from the database: env vars (set in the hosting
   * platform) are the correct place for secrets, and a "paste your
   * Razorpay secret into a web form" admin feature would be a real
   * security downgrade from that, so this stays read-only status only.
   */
  getIntegrationStatus(): IntegrationStatus {
    return {
      razorpayConfigured: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
      supabaseConfigured: Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
      ),
      smtpConfigured: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD),
    };
  },
};
