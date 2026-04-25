import { AnalyticsModulePage, RoleDashboardPage } from '@/components/shared/module-pages';

export default function Page() {
  return (
    <div className="space-y-6">
      <RoleDashboardPage role="Reception" />
      <AnalyticsModulePage />
    </div>
  );
}
