import { settingsService } from "@/services/settings.service";
import { SettingsForm } from "@/components/AdminPanel/SettingsForm";

export default async function AdminSettingsPage() {
  const [settings, integrations] = await Promise.all([
    settingsService.getSettings(),
    Promise.resolve(settingsService.getIntegrationStatus()),
  ]);

  return (
    <div>
      <p className="eyebrow">Admin Panel</p>
      <h1 className="mt-2 font-display text-2xl md:text-3xl text-ink dark:text-paper">Settings</h1>

      <div className="mt-6">
        <SettingsForm settings={settings} integrations={integrations} />
      </div>
    </div>
  );
}
