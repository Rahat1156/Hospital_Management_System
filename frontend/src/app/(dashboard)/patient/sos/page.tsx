'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, LifeBuoy } from 'lucide-react';
import { PageHeader, SectionCard, KPICard } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { emergencyAPI } from '@/lib/mock-api';
import { useAuthStore } from '@/lib/auth-store';

export default function PatientSOSPage() {
  const { user } = useAuthStore();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifiedCount, setNotifiedCount] = useState(0);

  useEffect(() => {
    // Reset state if user changes or logs out
    if (!user) {
      setSent(false);
    }
  }, [user]);

  async function triggerSOS() {
    if (!user?.id) {
      alert('User not authenticated');
      return;
    }
    
    setLoading(true);
    try {
      const res = await emergencyAPI.triggerSOS(user.id);
      setNotifiedCount(res.data.notified_count ?? 0);
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="SOS Emergency" description="One-tap emergency request and ambulance dispatch alert." />

      <div className="grid gap-4 sm:grid-cols-3">
        <KPICard label="Dispatcher SLA" value="< 2 min" icon={LifeBuoy} accentColor="critical" />
        <KPICard label="ER Pre-alert" value="Enabled" icon={LifeBuoy} accentColor="accent" />
        <KPICard label="Ambulance" value="Available" icon={LifeBuoy} accentColor="healthy" />
      </div>

      <SectionCard title="Emergency Dispatch" description="SRS Module 7">
        <div className="p-6">
          <div className={`rounded-2xl border-2 p-6 text-center ${sent ? 'border-healthy/40 bg-healthy/5' : 'border-critical/40 bg-critical/5'}`}>
            <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${sent ? 'bg-healthy' : 'bg-critical pulse-critical'}`}>
              <AlertTriangle className="h-10 w-10 text-white" />
            </div>
            <h2 className={`mt-4 text-2xl font-bold ${sent ? 'text-healthy' : 'text-critical'}`}>
              {sent ? 'Emergency request sent' : 'Press SOS only for real emergencies'}
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
              This will notify the hospital admin, doctors, and nurses immediately, and it also creates the active emergency record for the dispatch team.
            </p>
            <div className="mt-6">
              {sent ? (
                <div className="space-y-2">
                  <Badge variant="healthy" className="px-4 py-2 text-sm">Hospital staff alerted</Badge>
                  <div className="text-xs text-muted-foreground">
                    Notified recipients: {notifiedCount}
                  </div>
                </div>
              ) : (
                <Button variant="destructive" size="lg" loading={loading} onClick={triggerSOS}>
                  {!loading && <AlertTriangle className="h-5 w-5" />}
                  Trigger SOS
                </Button>
              )}
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
