'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Check, Filter, Mail, MessageSquare, Phone } from 'lucide-react';
import { PageHeader, KPICard, SectionCard } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { alertAPI } from '@/lib/mock-api';
import { cn, formatDateTime, formatRelative } from '@/lib/utils';
import type { Alert, AlertChannel, AlertSeverity } from '@/types';

const SEVERITY_ORDER: AlertSeverity[] = ['critical', 'high', 'medium', 'low', 'info'];

const severityConfig: Record<AlertSeverity, { bg: string; text: string; label: string; ring: string }> = {
  critical: { bg: 'bg-critical', text: 'text-critical', label: 'Critical', ring: 'ring-critical/30' },
  high: { bg: 'bg-orange-500', text: 'text-orange-600', label: 'High', ring: 'ring-orange-500/30' },
  medium: { bg: 'bg-borderline', text: 'text-borderline', label: 'Medium', ring: 'ring-borderline/30' },
  low: { bg: 'bg-accent', text: 'text-accent', label: 'Low', ring: 'ring-accent/30' },
  info: { bg: 'bg-blue-500', text: 'text-blue-600', label: 'Info', ring: 'ring-blue-500/30' },
};

const channelIcon: Record<AlertChannel, typeof Mail> = {
  sms: MessageSquare, email: Mail, whatsapp: MessageSquare, in_app: AlertTriangle, voice: Phone, push: AlertTriangle,
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<'all' | AlertSeverity>('all');
  const [selected, setSelected] = useState<Alert | null>(null);

  useEffect(() => {
    alertAPI.list().then((r) => {
      const sorted = r.data.sort(
        (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity),
      );
      setAlerts(sorted);
      setSelected(sorted[0] ?? null);
    });
  }, []);

  const filtered = filter === 'all' ? alerts : alerts.filter((a) => a.severity === filter);
  const counts = {
    total: alerts.length,
    critical: alerts.filter((a) => a.severity === 'critical').length,
    unack: alerts.filter((a) => !a.acknowledged_at).length,
    delivered: alerts.filter((a) => a.status === 'delivered' || a.status === 'acknowledged').length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hospital Alert System"
        description="Real-time alert dispatch center — HAS engine (SRS Module 1)"
        actions={
          <>
            <Button variant="outline" size="sm"><Filter className="h-4 w-4" />Rules</Button>
            <Button size="sm">Configure Alert Rule</Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="Total alerts" value={counts.total} icon={AlertTriangle} accentColor="primary" />
        <KPICard label="Critical" value={counts.critical} icon={AlertTriangle} accentColor="critical" />
        <KPICard label="Unacknowledged" value={counts.unack} icon={AlertTriangle} accentColor="borderline" />
        <KPICard label="Delivered" value={counts.delivered} icon={Check} accentColor="healthy" helper="≥99.5% SLA" />
      </div>

      {/* Severity filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', ...SEVERITY_ORDER] as const).map((sev) => (
          <button
            key={sev}
            onClick={() => setFilter(sev)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              filter === sev
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background hover:bg-secondary',
            )}
          >
            {sev !== 'all' && (
              <span className={cn('h-1.5 w-1.5 rounded-full', severityConfig[sev].bg)} />
            )}
            {sev === 'all' ? 'All' : severityConfig[sev].label}
            <span className="opacity-60">
              ({sev === 'all' ? alerts.length : alerts.filter((a) => a.severity === sev).length})
            </span>
          </button>
        ))}
      </div>

      {/* Master-detail */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
        <SectionCard title="Alert Feed" description={`${filtered.length} alert${filtered.length === 1 ? '' : 's'}`}>
          <div className="max-h-[640px] divide-y divide-border overflow-y-auto scrollbar-slim">
            {filtered.map((a) => {
              const cfg = severityConfig[a.severity];
              const active = selected?.id === a.id;
              return (
                <button
                  key={a.id}
                  onClick={() => setSelected(a)}
                  className={cn(
                    'flex w-full gap-3 p-4 text-left transition-colors',
                    active ? 'bg-primary/5 ring-2 ring-inset ring-primary/20' : 'hover:bg-secondary/30',
                  )}
                >
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <div
                      className={cn(
                        'h-3 w-3 rounded-full',
                        cfg.bg,
                        a.severity === 'critical' && !a.acknowledged_at && 'pulse-critical',
                      )}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="line-clamp-1 text-sm font-semibold">{a.title}</div>
                      {!a.acknowledged_at && (
                        <span className="shrink-0 rounded-full bg-destructive/10 px-1.5 text-[10px] font-bold uppercase text-destructive">New</span>
                      )}
                    </div>
                    <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{a.message}</div>
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                      <Badge
                        variant={a.severity === 'critical' ? 'critical' : a.severity === 'high' ? 'warning' : 'secondary'}
                        className="text-[10px]"
                      >
                        {cfg.label}
                      </Badge>
                      <span>·</span>
                      <span>{formatRelative(a.triggered_at)}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        {a.channels.slice(0, 3).map((c) => {
                          const Icon = channelIcon[c];
                          return <Icon key={c} className="h-3 w-3" />;
                        })}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </SectionCard>

        {/* Detail */}
        {selected && (
          <SectionCard
            title="Alert Details"
            description={selected.trigger_type.replace(/_/g, ' ')}
            action={
              !selected.acknowledged_at && (
                <Button size="sm">
                  <Check className="h-4 w-4" /> Acknowledge
                </Button>
              )
            }
          >
            <div className="space-y-5 p-5">
              {/* Top banner */}
              <div
                className={cn(
                  'rounded-lg border-l-4 bg-secondary/30 p-4',
                  selected.severity === 'critical' && 'border-critical bg-critical/5',
                  selected.severity === 'high' && 'border-orange-500 bg-orange-500/5',
                  selected.severity === 'medium' && 'border-borderline bg-borderline/5',
                )}
              >
                <div className="flex items-center gap-2">
                  <Badge
                    variant={selected.severity === 'critical' ? 'critical' : selected.severity === 'high' ? 'warning' : 'secondary'}
                  >
                    {severityConfig[selected.severity].label}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    Triggered {formatDateTime(selected.triggered_at)}
                  </div>
                </div>
                <h3 className="mt-2 text-lg font-semibold">{selected.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{selected.message}</p>
              </div>

              {/* Patient info */}
              {selected.patient_name && (
                <div className="rounded-lg border border-border p-3">
                  <div className="text-xs font-semibold uppercase text-muted-foreground">Patient</div>
                  <div className="mt-1 flex items-center gap-3">
                    <div className="font-medium">{selected.patient_name}</div>
                    <code className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-xs text-primary">
                      {selected.patient_mrn}
                    </code>
                  </div>
                </div>
              )}

              {/* Recipients */}
              <div>
                <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Recipients</div>
                <div className="space-y-2">
                  {selected.recipients.map((r, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                      <div>
                        <div className="text-sm font-medium">{r.user_name}</div>
                        <div className="text-xs text-muted-foreground capitalize">{r.role.replace('_', ' ')} · {r.contact}</div>
                      </div>
                      {r.acknowledged ? (
                        <Badge variant="healthy">
                          <Check className="h-3 w-3" /> Acknowledged
                        </Badge>
                      ) : (
                        <Badge variant="warning">Pending</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Dispatch log */}
              <div>
                <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Dispatch Log</div>
                <div className="space-y-2">
                  {selected.dispatch_attempts.map((d, i) => {
                    const Icon = channelIcon[d.channel];
                    return (
                      <div key={i} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="font-medium capitalize">
                            {d.channel} <span className="text-muted-foreground font-normal">via {d.gateway}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Sent {formatDateTime(d.attempted_at)}
                            {d.delivered_at && ` · Delivered ${formatRelative(d.delivered_at)}`}
                          </div>
                        </div>
                        <Badge variant={d.status === 'success' ? 'healthy' : d.status === 'retrying' ? 'warning' : 'destructive'}>
                          {d.status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}
