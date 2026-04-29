'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Activity, AlertTriangle, Bed, Calendar, DollarSign, FlaskConical, TrendingUp, Users, Phone, MapPin,
} from 'lucide-react';
import { PageHeader, KPICard, SectionCard } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { alertAPI, appointmentAPI, dashboardAPI, emergencyAPI } from '@/lib/mock-api';
import { formatBDT, formatRelative, formatTime, cn } from '@/lib/utils';
import type { Alert, Appointment, ChartDataPoint, DashboardKPIs, EmergencyRequest } from '@/types';

export default function AdminDashboardPage() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<ChartDataPoint[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [emergencies, setEmergencies] = useState<EmergencyRequest[]>([]);

  useEffect(() => {
    dashboardAPI.getKPIs().then((r) => setKpis(r.data));
    dashboardAPI.getRevenueTrend().then((r) => setRevenueTrend(r.data));
    alertAPI.getActive().then((r) => setAlerts(r.data));
    appointmentAPI.getToday().then((r) => setAppointments(r.data));
    emergencyAPI.listActive().then((r) => setEmergencies(r.data));
  }, []);

  const maxRevenue = Math.max(...revenueTrend.map((d) => d.value), 1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of hospital operations and KPIs for today."
        actions={
          <>
            <Button variant="outline" size="sm">Export report</Button>
            <Button size="sm">
              <Calendar className="h-4 w-4" />
              Today · Apr 22
            </Button>
          </>
        }
      />

      {/* KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard
          label="Total Patients"
          value={kpis?.total_patients.toLocaleString() ?? '—'}
          deltaPercent={kpis?.total_patients_delta_percent}
          icon={Users}
          accentColor="primary"
        />
        <KPICard
          label="Appointments Today"
          value={kpis?.appointments_today ?? '—'}
          deltaPercent={kpis?.appointments_today_delta_percent}
          icon={Calendar}
          accentColor="accent"
        />
        <KPICard
          label="Revenue Today"
          value={kpis ? formatBDT(kpis.revenue_today_bdt) : '—'}
          deltaPercent={kpis?.revenue_today_delta_percent}
          icon={DollarSign}
          accentColor="healthy"
        />
        <KPICard
          label="Bed Occupancy"
          value={kpis ? `${kpis.bed_occupancy_rate.toFixed(1)}%` : '—'}
          icon={Bed}
          accentColor="borderline"
          helper={kpis ? `${kpis.active_doctors} active doctors` : ''}
        />
      </div>

      {/* Critical alerts banner */}
      {kpis && kpis.critical_alerts > 0 && (
        <div className="flex items-center gap-3 rounded-xl border-2 border-critical/30 bg-critical/5 px-4 py-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-critical pulse-critical">
            <AlertTriangle className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-critical">
              {kpis.critical_alerts} critical alert{kpis.critical_alerts > 1 ? 's' : ''} require immediate attention
            </div>
            <div className="text-xs text-muted-foreground">HAS has dispatched alerts to responsible clinicians.</div>
          </div>
          <Button asChild variant="destructive" size="sm">
            <Link href="/admin/alerts">Review now</Link>
          </Button>
        </div>
      )}

      {/* Active SOS Emergencies */}
      {emergencies.length > 0 && (
        <SectionCard
          title={`🚨 Active SOS Emergencies (${emergencies.length})`}
          description="Immediate medical emergencies requiring urgent response"
          className="border-2 border-critical/40 bg-critical/5"
          action={
            <Button asChild variant="destructive" size="sm">
              <Link href="/admin/emergency">Manage all</Link>
            </Button>
          }
        >
          <div className="divide-y divide-critical/20">
            {emergencies.map((em) => (
              <div
                key={em.id}
                className="flex items-start gap-4 p-4 hover:bg-critical/10 transition-colors border-l-4 border-critical"
              >
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-critical/20">
                  <AlertTriangle className="h-5 w-5 text-critical" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-foreground">
                        {em.patient_name}
                        {em.patient_mrn && <span className="ml-2 font-mono text-xs text-muted-foreground">{em.patient_mrn}</span>}
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          {em.patient_phone?.country_code}{em.patient_phone?.number}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {em.pickup_location?.address || 'Location pending'}
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <Badge variant={em.priority === 'critical' ? 'critical' : 'warning'} className="mb-1">
                        {em.priority.toUpperCase()}
                      </Badge>
                      <div className="text-xs text-muted-foreground">{em.request_number}</div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div
                      className={cn(
                        'h-2 w-2 rounded-full animate-pulse',
                        em.status === 'sos_received' && 'bg-critical',
                        em.status === 'dispatcher_assigned' && 'bg-orange-500',
                        em.status === 'ambulance_assigned' && 'bg-orange-500',
                        em.status === 'en_route_to_patient' && 'bg-blue-500',
                      )}
                    />
                    <span className="text-xs font-medium capitalize">{em.status.replace(/_/g, ' ')}</span>
                    {em.sos_received_at && (
                      <span className="text-xs text-muted-foreground">• {formatRelative(em.sos_received_at)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Charts + Alerts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue chart */}
        <SectionCard
          title="Revenue — last 7 days"
          description="Daily revenue across all departments"
          className="lg:col-span-2"
          action={<Badge variant="healthy" className="gap-1"><TrendingUp className="h-3 w-3" /> +15.2%</Badge>}
        >
          <div className="p-5">
            <div className="flex h-48 items-end gap-2">
              {revenueTrend.map((d, i) => {
                const pct = (d.value / maxRevenue) * 100;
                return (
                  <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
                    <div className="relative flex w-full flex-1 items-end">
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-primary to-primary/70 opacity-0 animate-fade-up transition-all hover:opacity-80"
                        style={{ height: `${pct}%`, animationDelay: `${i * 60}ms` }}
                        title={formatBDT(d.value)}
                      />
                    </div>
                    <div className="text-xs font-medium text-muted-foreground">{d.label}</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Week total</div>
                <div className="font-semibold">{formatBDT(revenueTrend.reduce((s, d) => s + d.value, 0))}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Daily average</div>
                <div className="font-semibold">
                  {formatBDT(Math.round(revenueTrend.reduce((s, d) => s + d.value, 0) / Math.max(revenueTrend.length, 1)))}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Best day</div>
                <div className="font-semibold">{formatBDT(maxRevenue)}</div>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Active alerts */}
        <SectionCard
          title="Active HAS Alerts"
          description="Un-acknowledged alerts"
          action={<Link href="/admin/alerts" className="text-xs font-medium text-primary hover:underline">View all</Link>}
        >
          <div className="divide-y divide-border">
            {alerts.length === 0 ? (
              <div className="p-5 text-center text-sm text-muted-foreground">No active alerts.</div>
            ) : (
              alerts.map((a) => (
                <div key={a.id} className="flex gap-3 p-4 hover:bg-secondary/30">
                  <div
                    className={cn(
                      'mt-1 h-2 w-2 shrink-0 rounded-full',
                      a.severity === 'critical' && 'bg-critical pulse-critical',
                      a.severity === 'high' && 'bg-orange-500',
                      a.severity === 'medium' && 'bg-borderline',
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="line-clamp-1 text-sm font-medium leading-tight">{a.title}</div>
                      <Badge
                        variant={a.severity === 'critical' ? 'critical' : a.severity === 'high' ? 'warning' : 'secondary'}
                        className="shrink-0 text-[10px]"
                      >
                        {a.severity}
                      </Badge>
                    </div>
                    <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{a.message}</div>
                    <div className="mt-1 text-[10px] text-muted-foreground">{formatRelative(a.triggered_at)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>

      {/* Today's appointments + Quick actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard
          title="Today's Appointments"
          description={`${appointments.length} scheduled`}
          className="lg:col-span-2"
          action={
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/appointments">View all</Link>
            </Button>
          }
        >
          <div className="divide-y divide-border">
            {appointments.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-center gap-3 p-4 hover:bg-secondary/30">
                <div className="shrink-0 text-center">
                  <div className="text-lg font-bold tabular-nums text-foreground">
                    {formatTime(a.scheduled_at).split(' ')[0]}
                  </div>
                  <div className="text-[10px] font-semibold uppercase text-muted-foreground">
                    {formatTime(a.scheduled_at).split(' ')[1]}
                  </div>
                </div>
                <Avatar name={a.patient_name} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{a.patient_name}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    <span className="font-mono">{a.patient_mrn}</span> · {a.reason}
                  </div>
                </div>
                <div className="hidden text-right sm:block">
                  <div className="text-xs font-medium">{a.doctor_name}</div>
                  <div className="text-[10px] text-muted-foreground">{a.doctor_specialty}</div>
                </div>
                <Badge
                  variant={
                    a.status === 'completed' ? 'healthy'
                    : a.status === 'checked_in' ? 'accent'
                    : a.status === 'in_progress' ? 'warning'
                    : 'secondary'
                  }
                >
                  {a.status.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Quick Stats" description="At a glance">
          <div className="space-y-3 p-5">
            <StatRow icon={FlaskConical} label="Pending lab tests" value={kpis?.pending_lab_tests ?? '—'} />
            <StatRow icon={Activity} label="Pending prescriptions" value={kpis?.pending_prescriptions ?? '—'} />
            <StatRow icon={AlertTriangle} label="Active alerts" value={kpis?.active_alerts ?? '—'} />
            <StatRow icon={Users} label="Active doctors" value={kpis?.active_doctors ?? '—'} />
            <div className="border-t border-border pt-3">
              <div className="text-xs text-muted-foreground">Month revenue</div>
              <div className="mt-1 text-2xl font-bold">
                {kpis ? formatBDT(kpis.revenue_month_bdt) : '—'}
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function StatRow({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">{label}</span>
      </div>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}
