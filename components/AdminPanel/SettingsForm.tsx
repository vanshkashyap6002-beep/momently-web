"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { updateSettings } from "@/app/actions/admin.actions";
import type { Settings } from "@prisma/client";
import type { IntegrationStatus } from "@/services/settings.service";

export function SettingsForm({
  settings,
  integrations,
}: {
  settings: Settings;
  integrations: IntegrationStatus;
}) {
  const router = useRouter();
  const [siteName, setSiteName] = useState(settings.siteName);
  const [maintenanceMode, setMaintenanceMode] = useState(settings.maintenanceMode);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const result = await updateSettings({ siteName, maintenanceMode });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 1600);
  }

  return (
    <div className="max-w-xl space-y-8">
      <div className="rounded-2xl border border-ink/10 dark:border-paper/10 bg-paper dark:bg-ink-soft p-5 space-y-4">
        <h2 className="text-sm font-medium text-ink dark:text-paper">General</h2>

        <label className="block">
          <span className="block text-xs text-ink/60 dark:text-paper/60 mb-1.5">Website Name</span>
          <input
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="w-full rounded-lg border border-ink/10 dark:border-paper/15 bg-paper dark:bg-ink px-3 py-2.5 text-sm text-ink dark:text-paper focus:outline-none focus:ring-2 focus:ring-love/30 dark:focus:ring-blush/30"
          />
        </label>

        <label className="flex items-center justify-between">
          <span className="text-sm text-ink dark:text-paper">Maintenance Mode</span>
          <input
            type="checkbox"
            checked={maintenanceMode}
            onChange={(e) => setMaintenanceMode(e.target.checked)}
            className="accent-love dark:accent-blush h-4 w-4"
          />
        </label>
        {maintenanceMode && (
          <p className="text-xs text-ink/45 dark:text-paper/45">
            Note: this flag is stored, but not yet wired to actually block customer-facing pages —
            see the migration report for why that was left as a follow-up.
          </p>
        )}

        {error && <p className="text-xs text-love dark:text-blush">{error}</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-full bg-love px-6 py-2.5 text-sm font-medium text-paper hover:bg-love-dark transition-colors disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
        </button>
      </div>

      <div className="rounded-2xl border border-ink/10 dark:border-paper/10 bg-paper dark:bg-ink-soft p-5">
        <h2 className="text-sm font-medium text-ink dark:text-paper mb-1">Integrations</h2>
        <p className="text-xs text-ink/45 dark:text-paper/45 mb-4">
          Status only — credentials are configured via environment variables, never stored here.
        </p>
        <div className="space-y-3 text-sm">
          <IntegrationRow label="Razorpay" configured={integrations.razorpayConfigured} />
          <IntegrationRow label="Supabase Storage" configured={integrations.supabaseConfigured} />
          <IntegrationRow label="SMTP" configured={integrations.smtpConfigured} />
        </div>
      </div>
    </div>
  );
}

function IntegrationRow({ label, configured }: { label: string; configured: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink/70 dark:text-paper/70">{label}</span>
      {configured ? (
        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs">
          <CheckCircle2 className="h-3.5 w-3.5" /> Configured
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-ink/40 dark:text-paper/40 text-xs">
          <XCircle className="h-3.5 w-3.5" /> Not set
        </span>
      )}
    </div>
  );
}
