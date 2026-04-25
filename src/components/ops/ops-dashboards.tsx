'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AlertTriangle,
  ArrowRight,
  BadgePercent,
  Bed,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Download,
  FlaskConical,
  LayoutGrid,
  LoaderCircle,
  Lock,
  Mail,
  MessageSquare,
  Package,
  Pill,
  Search,
  ShieldAlert,
  Stethoscope,
  UserCog,
  Users,
  Wallet,
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { EmptyState, PageHeader, SectionCard } from '@/components/shared';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  opsDashboardData,
  type ActivityLogItem,
  type AdminDepartmentCard,
  type AdminPatientRow,
  type AlertFeedItem,
  type AuditLogRow,
  type BedState,
  type BillingSessionRow,
  type DeliveryStatus,
  type DoctorPerformanceRow,
  type InventoryRow,
  type LabPendingTest,
  type LabReportRow,
  type PaymentStatus,
  type PharmacyPrescriptionRow,
  type StaffAccountStatus,
  type StaffItem,
  type WardBedItem,
} from '@/lib/mock-data/ops-dashboards';
import { cn, formatBDT, formatDate, formatDateTime, formatRelative } from '@/lib/utils';

function statusBadge(status: string) {
  if (['paid', 'Active', 'sent', 'Resolved', 'Dispensed', 'Completed', 'Generated', 'Sent', 'In Stock', 'Available'].includes(status)) return 'healthy';
  if (['partial', 'Locked', 'retried', 'Acknowledged', 'In Progress', 'Critical', 'Partially Dispensed', 'Low Stock', 'Expiring Soon', 'Reserved'].includes(status)) return 'warning';
  if (['unpaid', 'Suspended', 'failed', 'New', 'Pending', 'Out of Stock', 'Under Maintenance', 'Cancelled'].includes(status)) return 'destructive';
  return 'secondary';
}

function stageBadge(stage: string) {
  if (stage === 'Registration') return statusBadge('pending');
  if (stage === 'Discharged') return statusBadge('sent');
  return statusBadge('retried');
}

function OpsShell({
  title,
  description,
  nav,
  actions,
  children,
}: {
  title: string;
  description: string;
  nav: Array<{ label: string; href: string }>;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} actions={actions} />
      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex min-w-max gap-2 p-2">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-xl px-3 py-2 text-sm font-medium transition',
                  active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
      {children}
    </div>
  );
}

function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = 'primary',
}: {
  label: string;
  value: string | number;
  helper?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: 'primary' | 'accent' | 'healthy' | 'warning' | 'critical';
}) {
  const tones = {
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent',
    healthy: 'bg-healthy/10 text-healthy',
    warning: 'bg-borderline/10 text-borderline',
    critical: 'bg-critical/10 text-critical',
  };
  return (
    <Card className="p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
          {helper && <p className="mt-2 text-sm text-muted-foreground">{helper}</p>}
        </div>
        <div className={cn('rounded-2xl p-3', tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

function SharedAlertFeed({ items }: { items: AlertFeedItem[] }) {
  if (items.length === 0) {
    return (
      <div className="p-6">
        <EmptyState icon={CheckCircle2} title="No alerts" description="Everything is calm right now." />
      </div>
    );
  }
  return (
    <div className="divide-y divide-border">
      {items.map((item) => (
        <div key={item.id} className={cn('flex gap-3 p-4', item.status === 'New' && 'bg-primary/5')}>
          <div className={cn('mt-1 h-2.5 w-2.5 rounded-full', item.priority === 'critical' ? 'bg-critical' : item.priority === 'high' ? 'bg-borderline' : item.priority === 'medium' ? 'bg-accent' : 'bg-border')} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-foreground">{item.title}</p>
                  <Badge variant={statusBadge(item.status)}>{item.status}</Badge>
                  <Badge variant={statusBadge(item.delivery ?? 'pending')}>{item.delivery ?? 'pending'}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{item.message}</p>
                {(item.patient || item.mrn) && <p className="mt-2 text-xs text-muted-foreground">{item.patient} {item.mrn ? `/ ${item.mrn}` : ''}</p>}
              </div>
              <p className="text-xs text-muted-foreground">{formatRelative(item.at)}</p>
            </div>
            {item.channels && (
              <div className="mt-3 flex flex-wrap gap-2">
                {item.channels.map((channel) => (
                  <Badge key={`${item.id}-${channel}`} variant="outline">{channel}</Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function AuditLogPreview({ items }: { items: ActivityLogItem[] }) {
  return (
    <div className="divide-y divide-border">
      {items.map((item) => (
        <div key={item.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-foreground">{item.action}</p>
            <p className="text-sm text-muted-foreground">{item.actor} / {item.module}</p>
          </div>
          <p className="text-xs text-muted-foreground">{formatRelative(item.at)}</p>
        </div>
      ))}
    </div>
  );
}

function WardMap({ items }: { items: WardBedItem[] }) {
  return (
    <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <Card key={item.id} className="rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-foreground">{item.bed}</p>
              <p className="text-sm text-muted-foreground">{item.ward}</p>
            </div>
            <Badge variant={statusBadge(item.state)}>{item.state}</Badge>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            {item.patient ? (
              <>
                <p className="font-medium text-foreground">{item.patient}</p>
                <p>{item.mrn}</p>
              </>
            ) : (
              <p>No patient mapped</p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

function FinanceExportActions() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm"><Download className="h-4 w-4" /> CSV</Button>
      <Button variant="outline" size="sm"><Download className="h-4 w-4" /> PDF</Button>
    </div>
  );
}

const adminNav = [
  { label: 'Overview', href: '/admin' },
  { label: 'Patients', href: '/admin/patients' },
  { label: 'Appointments', href: '/admin/appointments' },
  { label: 'Bed & Ward', href: '/admin/beds' },
  { label: 'Alerts / HAS', href: '/admin/alerts' },
  { label: 'Billing & Finance', href: '/admin/billing' },
  { label: 'Staff Management', href: '/admin/staff' },
  { label: 'Doctor Performance', href: '/admin/doctor-performance' },
  { label: 'Analytics & Reports', href: '/admin/analytics' },
  { label: 'Settings', href: '/admin/settings' },
];

const receptionNav = [
  { label: 'Overview', href: '/reception' },
  { label: 'Register Patient', href: '/reception/register-patient' },
  { label: 'Appointments', href: '/reception/appointments' },
  { label: 'Walk-ins', href: '/reception/walk-ins' },
  { label: 'OPD/IPD Flow', href: '/reception/opd-ipd' },
  { label: 'Bed Assignment', href: '/reception/bed-assignment' },
  { label: 'Billing', href: '/reception/billing' },
  { label: 'Patient Search', href: '/reception/patient-search' },
  { label: 'Notifications', href: '/reception/notifications' },
];

const labNav = [
  { label: 'Overview', href: '/lab' },
  { label: 'Pending Tests', href: '/lab/pending' },
  { label: 'Result Entry', href: '/lab/result-entry' },
  { label: 'Reports', href: '/lab/reports' },
  { label: 'Critical Alerts', href: '/lab/critical-alerts' },
  { label: 'Reference Ranges', href: '/lab/reference-ranges' },
  { label: 'Patient Lookup', href: '/lab/patient-lookup' },
];

const pharmacyNav = [
  { label: 'Overview', href: '/pharmacy' },
  { label: 'Prescription Queue', href: '/pharmacy/prescription-queue' },
  { label: 'Dispensing', href: '/pharmacy/dispensing' },
  { label: 'Inventory', href: '/pharmacy/inventory' },
  { label: 'Low Stock Alerts', href: '/pharmacy/low-stock' },
  { label: 'Expiry Tracking', href: '/pharmacy/expiry-tracking' },
  { label: 'Audit Logs', href: '/pharmacy/audit' },
];

export function HospitalAdminOverviewPage() {
  const data = opsDashboardData.admin;
  return (
    <OpsShell
      title="Hospital Admin Overview"
      description="Operations, occupancy, finance, alerts, and audit visibility across the hospital."
      nav={adminNav}
      actions={<FinanceExportActions />}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Total patients" value={data.kpis.totalPatients.toLocaleString()} icon={Users} />
        <StatCard label="Today's appointments" value={data.kpis.todaysAppointments} icon={Calendar} tone="accent" />
        <StatCard label="Occupied beds" value={data.kpis.occupiedBeds} icon={Bed} tone="warning" />
        <StatCard label="Revenue today" value={formatBDT(data.kpis.revenueToday)} icon={Wallet} tone="healthy" />
        <StatCard label="Outstanding bills" value={formatBDT(data.kpis.outstandingBills)} icon={CreditCard} tone="warning" />
        <StatCard label="Critical alerts" value={data.kpis.criticalAlerts} icon={ShieldAlert} tone="critical" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <SectionCard title="Financial summary" description="Daily revenue trend and export-ready overview" action={<FinanceExportActions />}>
          <div className="h-72 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.financialTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.22)" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip formatter={(value: number) => formatBDT(value)} />
                <Bar dataKey="revenue" fill="#0b4f6c" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
        <SectionCard title="Real-time alert feed" description="HAS dispatch and ward threshold updates">
          <SharedAlertFeed items={data.alerts} />
        </SectionCard>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="Ward occupancy summary" description="Capacity and threshold warning visibility">
          <WardMap items={data.wards} />
        </SectionCard>
        <SectionCard title="Department performance" description="Patient load and financial contribution today">
          <div className="grid gap-4 p-4 lg:grid-cols-2">
            {data.departmentCards.map((dept: AdminDepartmentCard) => (
              <Card key={dept.name} className="rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-foreground">{dept.name}</p>
                  <Badge variant={dept.utilization >= 85 ? 'warning' : 'healthy'}>{dept.utilization}%</Badge>
                </div>
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between"><span>Patients</span><span>{dept.patients}</span></div>
                  <div className="flex justify-between"><span>Revenue</span><span>{formatBDT(dept.revenue)}</span></div>
                </div>
              </Card>
            ))}
          </div>
        </SectionCard>
      </div>
      <SectionCard title="Recent activities / audit log" description="Audit-friendly operational changes across modules">
        <AuditLogPreview items={data.activityLog} />
      </SectionCard>
    </OpsShell>
  );
}

export function HospitalAdminPatientsPage() {
  const rows = opsDashboardData.admin.patients;
  return (
    <OpsShell title="Patient Records" description="Search, registration source, billing state, and timeline shortcuts." nav={adminNav} actions={<Button variant="outline"><Search className="h-4 w-4" /> Search</Button>}>
      <SectionCard title="Patient records" description="Admin-facing patient visibility">
        <div className="p-4">
          <Input placeholder="Search by patient name or MRN..." leftIcon={<Search className="h-4 w-4" />} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="border-y border-border bg-secondary/30 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">MRN</th>
                <th className="px-4 py-3">Registration source</th>
                <th className="px-4 py-3">Appointments</th>
                <th className="px-4 py-3">Billing status</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3 text-right">Timeline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row: AdminPatientRow) => (
                <tr key={row.id} className="hover:bg-secondary/20">
                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  <td className="px-4 py-3"><Badge variant="outline">{row.mrn}</Badge></td>
                  <td className="px-4 py-3">{row.registrationSource}</td>
                  <td className="px-4 py-3">{row.appointmentCount}</td>
                  <td className="px-4 py-3"><Badge variant={statusBadge(row.billingStatus)}>{row.billingStatus}</Badge></td>
                  <td className="px-4 py-3">{row.phone}</td>
                  <td className="px-4 py-3 text-right"><Button variant="ghost" size="sm">Open timeline</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </OpsShell>
  );
}

export function HospitalAdminAppointmentsPage() {
  const rows = opsDashboardData.reception.appointments;
  return (
    <OpsShell title="Appointments" description="Cross-hospital schedule visibility, completion state, and desk status." nav={adminNav} actions={<Button variant="outline"><Calendar className="h-4 w-4" /> Date range</Button>}>
      <SectionCard title="Appointments" description="Operational appointment overview">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="border-y border-border bg-secondary/30 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">MRN</th>
                <th className="px-4 py-3">Doctor</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Slot</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">SMS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-secondary/20">
                  <td className="px-4 py-3 font-medium">{row.patient}</td>
                  <td className="px-4 py-3"><Badge variant="outline">{row.mrn}</Badge></td>
                  <td className="px-4 py-3">{row.doctor}</td>
                  <td className="px-4 py-3">{row.department}</td>
                  <td className="px-4 py-3">{row.slot}</td>
                  <td className="px-4 py-3"><Badge variant={statusBadge(row.status)}>{row.status}</Badge></td>
                  <td className="px-4 py-3"><Badge variant={statusBadge(row.smsStatus === 'Sent' ? 'sent' : row.smsStatus === 'Pending' ? 'pending' : 'failed')}>{row.smsStatus}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </OpsShell>
  );
}

export function HospitalAdminBedsPage() {
  return (
    <OpsShell title="Bed & Ward" description="Digital ward map, occupancy thresholds, and admission or discharge visibility." nav={adminNav}>
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="Ward occupancy chart" description="Threshold warning defaults to 90%">
          <div className="grid gap-4 p-4 lg:grid-cols-2">
            {opsDashboardData.admin.departmentCards.map((dept) => (
              <Card key={dept.name} className="rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-foreground">{dept.name}</p>
                  <Badge variant={dept.utilization >= 90 ? 'critical' : dept.utilization >= 80 ? 'warning' : 'healthy'}>
                    {dept.utilization}%
                  </Badge>
                </div>
                <div className="mt-4 h-2 rounded-full bg-secondary">
                  <div className={cn('h-full rounded-full', dept.utilization >= 90 ? 'bg-critical' : dept.utilization >= 80 ? 'bg-borderline' : 'bg-healthy')} style={{ width: `${dept.utilization}%` }} />
                </div>
              </Card>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Admission / discharge tracking" description="Capacity-sensitive placement visibility">
          <SharedAlertFeed items={opsDashboardData.admin.alerts.filter((item) => item.title.toLowerCase().includes('occupancy') || item.title.toLowerCase().includes('sms'))} />
        </SectionCard>
      </div>
      <SectionCard title="Digital ward map" description="Available, occupied, reserved, and maintenance states">
        <WardMap items={opsDashboardData.admin.wards} />
      </SectionCard>
    </OpsShell>
  );
}

export function HospitalAdminAlertsPage() {
  return (
    <OpsShell title="Alerts / HAS" description="Alert rules, dispatch visibility, failover routing, and delivery tracking." nav={adminNav} actions={<Button><Bell className="h-4 w-4" /> Create rule</Button>}>
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard title="Alert rule list" description="Critical lab, occupancy, and reminder thresholds">
          <div className="grid gap-4 p-4">
            {[
              ['Critical lab result', 'Doctor and patient alert on critical values', 'SMS / Email / In-app'],
              ['Bed occupancy threshold', 'Warn at 90% ward occupancy', 'Email / In-app'],
              ['Appointment reminder', '24h and 2h patient reminder visibility', 'SMS / WhatsApp'],
            ].map(([title, detail, channels]) => (
              <Card key={title} className="rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
                  </div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {channels.split(' / ').map((channel) => <Badge key={`${title}-${channel}`} variant="outline">{channel}</Badge>)}
                </div>
              </Card>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Alert delivery feed" description="Pending, sent, failed, and retried channels">
          <SharedAlertFeed items={opsDashboardData.admin.alerts} />
        </SectionCard>
      </div>
    </OpsShell>
  );
}

export function HospitalAdminBillingPage() {
  const rows = opsDashboardData.admin.financeRows;
  return (
    <OpsShell title="Billing & Finance" description="Revenue, outstanding bills, payment method mix, and discount oversight." nav={adminNav} actions={<FinanceExportActions />}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue dashboard" value={formatBDT(424000)} icon={Wallet} tone="healthy" />
        <StatCard label="Outstanding bills" value={formatBDT(478200)} icon={CreditCard} tone="warning" />
        <StatCard label="Discount approvals" value={12} icon={BadgePercent} tone="accent" />
        <StatCard label="Transactions" value={138} icon={LayoutGrid} />
      </div>
      <SectionCard title="Department revenue" description="Paid, partial, unpaid, and payment method summary" action={<FinanceExportActions />}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-y border-border bg-secondary/30 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Revenue</th>
                <th className="px-4 py-3">Outstanding</th>
                <th className="px-4 py-3">Primary method</th>
                <th className="px-4 py-3">Invoices</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.department}>
                  <td className="px-4 py-3 font-medium">{row.department}</td>
                  <td className="px-4 py-3">{formatBDT(row.revenue)}</td>
                  <td className="px-4 py-3">{formatBDT(row.outstanding)}</td>
                  <td className="px-4 py-3">{row.method}</td>
                  <td className="px-4 py-3">{row.invoices}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
      <SectionCard title="Payment methods" description="Bangladesh-friendly payment rails">
        <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-4">
          {['bKash', 'Nagad', 'Stripe/Card', 'Cash'].map((method) => (
            <Card key={method} className="rounded-2xl border border-border p-4 text-center">
              <p className="font-semibold text-foreground">{method}</p>
              <p className="mt-2 text-sm text-muted-foreground">Active in reporting view</p>
            </Card>
          ))}
        </div>
      </SectionCard>
    </OpsShell>
  );
}

export function HospitalAdminStaffPage() {
  const rows = opsDashboardData.admin.staff;
  return (
    <OpsShell title="Staff Management" description="Staff directory, RBAC badges, account status, and audit history." nav={adminNav} actions={<Button><UserCog className="h-4 w-4" /> Create staff account</Button>}>
      <SectionCard title="Staff accounts" description="Role, permissions, BMDC, and account lockout visibility">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="border-y border-border bg-secondary/30 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Staff</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Permissions</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">BMDC</th>
                <th className="px-4 py-3">Login risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row: StaffItem) => (
                <tr key={row.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={row.name} size="sm" />
                      <div>
                        <p className="font-medium text-foreground">{row.name}</p>
                        <p className="text-xs text-muted-foreground">{row.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge variant="outline">{row.role}</Badge></td>
                  <td className="px-4 py-3">{row.department}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {row.permissions.map((permission) => <Badge key={`${row.id}-${permission}`} variant="secondary">{permission}</Badge>)}
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge variant={statusBadge(row.status)}>{row.status}</Badge></td>
                  <td className="px-4 py-3">{row.bmdc ?? 'N/A'}</td>
                  <td className="px-4 py-3">{row.failedLogins ? `${row.failedLogins} failed attempts` : 'Normal'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
      <SectionCard title="Role/account changes" description="Audit log for permission and account status updates">
        <AuditLogPreview items={opsDashboardData.admin.activityLog} />
      </SectionCard>
    </OpsShell>
  );
}

export function HospitalAdminDoctorPerformancePage() {
  const rows = opsDashboardData.admin.doctorPerformance;
  return (
    <OpsShell title="Doctor Performance" description="Patients seen, revenue generated, average duration, and exportable comparison." nav={adminNav} actions={<Button variant="outline"><Download className="h-4 w-4" /> CSV export</Button>}>
      <SectionCard title="Doctor comparison" description="Operational and financial performance">
        <div className="h-80 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.22)" />
              <XAxis dataKey="doctor" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip formatter={(value: number, name: string) => name === 'revenue' ? formatBDT(value) : value} />
              <Line type="monotone" dataKey="patientsSeen" stroke="#0b4f6c" strokeWidth={3} />
              <Line type="monotone" dataKey="avgDuration" stroke="#14b8a6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>
      <SectionCard title="Performance table" description="Doctor-level detail">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-y border-border bg-secondary/30 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Doctor</th>
                <th className="px-4 py-3">Specialty</th>
                <th className="px-4 py-3">Patients seen</th>
                <th className="px-4 py-3">Revenue</th>
                <th className="px-4 py-3">Avg duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row: DoctorPerformanceRow) => (
                <tr key={row.doctor}>
                  <td className="px-4 py-3 font-medium">{row.doctor}</td>
                  <td className="px-4 py-3">{row.specialty}</td>
                  <td className="px-4 py-3">{row.patientsSeen}</td>
                  <td className="px-4 py-3">{formatBDT(row.revenue)}</td>
                  <td className="px-4 py-3">{row.avgDuration} min</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </OpsShell>
  );
}

export function HospitalAdminAnalyticsPage() {
  return (
    <OpsShell title="Analytics & Reports" description="Date-filtered KPIs, top performers, lab demand, and report generation state." nav={adminNav} actions={<FinanceExportActions />}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total revenue" value={formatBDT(6420000)} icon={Wallet} tone="healthy" />
        <StatCard label="Total patients" value={3247} icon={Users} />
        <StatCard label="Top doctors" value={3} icon={Stethoscope} tone="accent" />
        <StatCard label="Lab demand" value="CBC" icon={FlaskConical} tone="warning" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="Top doctors by patient count" description="Date range filter ready">
          <div className="grid gap-3 p-4">
            {opsDashboardData.admin.doctorPerformance.map((row) => (
              <Card key={row.doctor} className="rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{row.doctor}</p>
                    <p className="text-sm text-muted-foreground">{row.specialty}</p>
                  </div>
                  <Badge variant="healthy">{row.patientsSeen} patients</Badge>
                </div>
              </Card>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Most ordered lab tests" description="Operational demand indicator">
          <div className="grid gap-3 p-4">
            {['Complete Blood Count', 'Lipid Profile', 'Liver Function Test', 'Serum Electrolytes'].map((test, index) => (
              <Card key={test} className="rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-foreground">{test}</p>
                  <Badge variant={index === 0 ? 'healthy' : 'secondary'}>{42 - index * 7} orders</Badge>
                </div>
              </Card>
            ))}
          </div>
        </SectionCard>
      </div>
      <SectionCard title="Report generation status" description={opsDashboardData.admin.analyticsStatus}>
        <div className="flex items-center gap-3 p-4 text-sm text-muted-foreground">
          <LoaderCircle className="h-4 w-4 text-primary" />
          Date range filtering, CSV export, and PDF generation placeholders are ready to extend.
        </div>
      </SectionCard>
    </OpsShell>
  );
}

export function HospitalAdminSettingsPage() {
  return (
    <OpsShell title="Settings" description="Branding visibility, hospital identity, and role-based access overview." nav={adminNav}>
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="Hospital branding" description="Tenant and identity settings">
          <div className="grid gap-4 p-4 sm:grid-cols-2">
            <Card className="rounded-2xl border border-border p-4"><p className="font-semibold text-foreground">Hospital name</p><p className="mt-2 text-sm text-muted-foreground">Demo Medical Center</p></Card>
            <Card className="rounded-2xl border border-border p-4"><p className="font-semibold text-foreground">Support email</p><p className="mt-2 text-sm text-muted-foreground">support@demo.hms.com.bd</p></Card>
            <Card className="rounded-2xl border border-border p-4"><p className="font-semibold text-foreground">Support phone</p><p className="mt-2 text-sm text-muted-foreground">+880 9612 345 678</p></Card>
            <Card className="rounded-2xl border border-border p-4"><p className="font-semibold text-foreground">Future Bangla support</p><p className="mt-2 text-sm text-muted-foreground">UI labels are ready for bilingual expansion.</p></Card>
          </div>
        </SectionCard>
        <SectionCard title="Role-based access" description="Restricted modules stay hidden or blocked">
          <div className="grid gap-4 p-4">
            <Card className="rounded-2xl border border-dashed border-border p-4 text-center">
              <Lock className="mx-auto h-6 w-6 text-muted-foreground" />
              <p className="mt-3 font-semibold text-foreground">Authenticated access only</p>
              <p className="mt-2 text-sm text-muted-foreground">Admin session is active. Role-specific navigation is enforced across dashboards.</p>
            </Card>
          </div>
        </SectionCard>
      </div>
    </OpsShell>
  );
}

export function ReceptionOverviewPage() {
  const data = opsDashboardData.reception;
  return (
    <OpsShell title="Reception Overview" description="Front desk flow for registration, appointments, walk-ins, billing, and admissions." nav={receptionNav} actions={<Button><Calendar className="h-4 w-4" /> Book Appointment</Button>}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Today's appointments" value={data.kpis.todaysAppointments} icon={Calendar} />
        <StatCard label="Walk-in queue" value={data.kpis.walkIns} icon={Users} tone="accent" />
        <StatCard label="Pending registrations" value={data.kpis.pendingRegistrations} icon={ClipboardList} tone="warning" />
        <StatCard label="Waiting billing" value={data.kpis.waitingBilling} icon={CreditCard} tone="warning" />
        <StatCard label="Available beds" value={data.kpis.availableBeds} icon={Bed} tone="healthy" />
      </div>
      <SectionCard title="Quick actions" description="Fast front-desk tasks for busy shifts">
        <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            ['Register Patient', '/reception/register-patient'],
            ['Book Appointment', '/reception/appointments'],
            ['Search Patient', '/reception/patient-search'],
            ['Assign Bed', '/reception/bed-assignment'],
            ['Open Billing', '/reception/billing'],
          ].map(([label, href]) => (
            <Link key={href} href={href} className="rounded-2xl border border-border p-4 text-sm font-medium text-foreground transition hover:border-primary/30 hover:bg-primary/5">
              <div className="flex items-center justify-between gap-3">
                <span>{label}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      </SectionCard>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Walk-in queue" description="Registration and OPD handoff visibility">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="border-y border-border bg-secondary/30 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">MRN</th>
                  <th className="px-4 py-3">Queue</th>
                  <th className="px-4 py-3">Doctor / Dept</th>
                  <th className="px-4 py-3">Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.walkIns.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3 font-medium">{row.patient}</td>
                    <td className="px-4 py-3"><Badge variant="outline">{row.mrn}</Badge></td>
                    <td className="px-4 py-3">{row.queue}</td>
                    <td className="px-4 py-3">{row.doctor}</td>
                    <td className="px-4 py-3"><Badge variant={stageBadge(row.stage)}>{row.stage}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
        <SectionCard title="Notifications" description="SMS and desk actions">
          <SharedAlertFeed items={data.notifications} />
        </SectionCard>
      </div>
    </OpsShell>
  );
}

export function ReceptionRegistrationPage() {
  const draft = opsDashboardData.reception.registrationDraft;
  return (
    <OpsShell title="Register Patient" description="Walk-in capable registration flow with MRN generation, OTP state, and family linking." nav={receptionNav} actions={<Button>Save registration</Button>}>
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard title="Patient registration" description="NID uniqueness and OTP confirmation aware">
          <div className="grid gap-4 p-4 sm:grid-cols-2">
            <Input defaultValue={draft.fullName} aria-label="Full name" />
            <Input type="date" defaultValue={draft.dateOfBirth} aria-label="Date of birth" />
            <Input defaultValue={draft.nid} aria-label="NID number" />
            <Input defaultValue={draft.gender} aria-label="Gender" />
            <Input defaultValue={draft.bloodGroup} aria-label="Blood group" />
            <Input defaultValue={draft.phone} aria-label="Phone" />
            <Input defaultValue={draft.email} aria-label="Email" />
            <Input defaultValue={draft.emergencyContact} aria-label="Emergency contact" />
            <div className="sm:col-span-2 rounded-2xl border border-border bg-secondary/20 p-4 text-sm text-muted-foreground">
              NID uniqueness check: no duplicate found. Walk-in mode and guardian linking can be enabled before confirmation.
            </div>
          </div>
        </SectionCard>
        <div className="space-y-6">
          <SectionCard title="MRN generated" description="Success state after registration">
            <div className="space-y-3 p-4">
              <Card className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Generated MRN</p>
                <p className="mt-2 text-2xl font-semibold text-primary">{opsDashboardData.reception.generatedMrn}</p>
              </Card>
              <Badge variant="healthy">SMS confirmation sent</Badge>
              <Badge variant="secondary">OTP status verified</Badge>
            </div>
          </SectionCard>
          <SectionCard title="Photo placeholder" description="Profile image capture placeholder">
            <div className="p-4">
              <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/20 text-sm text-muted-foreground">
                Profile photo placeholder
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </OpsShell>
  );
}

export function ReceptionAppointmentsPage() {
  const rows = opsDashboardData.reception.appointments;
  return (
    <OpsShell title="Appointments" description="Book, confirm, cancel, reschedule, and prevent double booking." nav={receptionNav} actions={<Button><Calendar className="h-4 w-4" /> Confirm booking</Button>}>
      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <SectionCard title="Booking wizard" description="Doctor, date, time slot, and SMS confirmation">
          <div className="space-y-4 p-4">
            <Input placeholder="Search patient by name or MRN..." leftIcon={<Search className="h-4 w-4" />} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input defaultValue="Dr. Karim Hossain" />
              <Input type="date" defaultValue="2026-04-25" />
            </div>
            <div className="grid gap-2">
              {['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM'].map((slot, index) => (
                <button key={slot} type="button" className={cn('rounded-xl border px-3 py-2 text-left text-sm transition', index === 2 ? 'border-destructive/30 bg-destructive/5 text-destructive' : 'border-border bg-background hover:border-primary/30 hover:bg-primary/5')}>
                  {slot} {index === 2 ? '/ double booking prevented' : '/ available'}
                </button>
              ))}
            </div>
          </div>
        </SectionCard>
        <SectionCard title="Appointment list" description="Scheduling, check-in, cancellation, and slot release">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="border-y border-border bg-secondary/30 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">MRN</th>
                  <th className="px-4 py-3">Doctor</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Slot</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">SMS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3 font-medium">{row.patient}</td>
                    <td className="px-4 py-3"><Badge variant="outline">{row.mrn}</Badge></td>
                    <td className="px-4 py-3">{row.doctor}</td>
                    <td className="px-4 py-3">{row.department}</td>
                    <td className="px-4 py-3">{row.slot}</td>
                    <td className="px-4 py-3"><Badge variant={statusBadge(row.status)}>{row.status}</Badge></td>
                    <td className="px-4 py-3"><Badge variant={statusBadge(row.smsStatus === 'Sent' ? 'sent' : row.smsStatus === 'Pending' ? 'pending' : 'failed')}>{row.smsStatus}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </OpsShell>
  );
}

export function ReceptionWalkInsPage() {
  return (
    <OpsShell title="Walk-ins" description="Queue visibility for on-site registrations and immediate OPD routing." nav={receptionNav}>
      <SectionCard title="Walk-in queue" description="Status transition tracker with timestamps and actors">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="border-y border-border bg-secondary/30 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">MRN</th>
                <th className="px-4 py-3">Queue</th>
                <th className="px-4 py-3">Doctor / Department</th>
                <th className="px-4 py-3">Stage</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Actor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {opsDashboardData.reception.walkIns.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 font-medium">{row.patient}</td>
                  <td className="px-4 py-3"><Badge variant="outline">{row.mrn}</Badge></td>
                  <td className="px-4 py-3">{row.queue}</td>
                  <td className="px-4 py-3">{row.doctor}</td>
                  <td className="px-4 py-3"><Badge variant={stageBadge(row.stage)}>{row.stage}</Badge></td>
                  <td className="px-4 py-3">{formatDateTime(row.at)}</td>
                  <td className="px-4 py-3">{row.actor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </OpsShell>
  );
}

export function ReceptionOpdIpdPage() {
  return (
    <OpsShell title="OPD/IPD Flow" description="Registration, OPD, admission, discharge, and actor visibility." nav={receptionNav}>
      <SectionCard title="Patient journey tracker" description="Status transitions across front-desk and admission flow">
        <div className="grid gap-4 p-4 lg:grid-cols-3">
          {opsDashboardData.reception.walkIns.map((row) => (
            <Card key={row.id} className="rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-foreground">{row.patient}</p>
                <Badge variant="outline">{row.mrn}</Badge>
              </div>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                {['Registration', 'OPD', 'IPD Admitted', 'Discharged'].map((stage) => (
                  <div key={`${row.id}-${stage}`} className={cn('rounded-xl border px-3 py-2', stage === row.stage ? 'border-primary/30 bg-primary/5 text-foreground' : 'border-border bg-background')}>
                    {stage}
                  </div>
                ))}
                <p className="pt-2 text-xs">Updated {formatRelative(row.at)} by {row.actor}</p>
              </div>
            </Card>
          ))}
        </div>
      </SectionCard>
    </OpsShell>
  );
}

export function ReceptionBedAssignmentPage() {
  return (
    <OpsShell title="Bed Assignment" description="Assign admitted patients to beds with admission details and expected discharge date." nav={receptionNav}>
      <SectionCard title="Bed availability" description="Available, occupied, reserved, and maintenance states">
        <WardMap items={opsDashboardData.reception.beds} />
      </SectionCard>
      <SectionCard title="Admission details" description="Bed assignment action placeholder">
        <div className="grid gap-4 p-4 sm:grid-cols-2">
          <Input defaultValue="Abdul Halim" aria-label="Patient" />
          <Input defaultValue="Dr. Sameer Hossain" aria-label="Admitting doctor" />
          <Input type="date" defaultValue="2026-04-24" aria-label="Admission date" />
          <Input type="date" defaultValue="2026-04-29" aria-label="Expected discharge date" />
        </div>
      </SectionCard>
    </OpsShell>
  );
}

export function ReceptionBillingPage() {
  const rows = opsDashboardData.reception.billingSessions;
  return (
    <OpsShell title="Billing" description="Open billing session, aggregate charges, show balances, and receipt placeholders." nav={receptionNav} actions={<Button variant="outline"><Download className="h-4 w-4" /> PDF receipt</Button>}>
      <SectionCard title="Billing sessions" description="Doctor fee, lab, medicine, bed, and procedure charges">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="border-y border-border bg-secondary/30 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">MRN</th>
                <th className="px-4 py-3">Doctor fee</th>
                <th className="px-4 py-3">Lab fees</th>
                <th className="px-4 py-3">Medicine</th>
                <th className="px-4 py-3">Bed</th>
                <th className="px-4 py-3">Procedure</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row: BillingSessionRow) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 font-medium">{row.patient}</td>
                  <td className="px-4 py-3"><Badge variant="outline">{row.mrn}</Badge></td>
                  <td className="px-4 py-3">{formatBDT(row.doctorFee)}</td>
                  <td className="px-4 py-3">{formatBDT(row.labFee)}</td>
                  <td className="px-4 py-3">{formatBDT(row.medicineFee)}</td>
                  <td className="px-4 py-3">{formatBDT(row.bedFee)}</td>
                  <td className="px-4 py-3">{formatBDT(row.procedureFee)}</td>
                  <td className="px-4 py-3"><Badge variant={statusBadge(row.status)}>{row.status}</Badge></td>
                  <td className="px-4 py-3">{row.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </OpsShell>
  );
}

export function ReceptionPatientSearchPage() {
  const rows = opsDashboardData.admin.patients;
  return (
    <OpsShell title="Patient Search" description="Search by name, phone, NID, or MRN for fast desk retrieval." nav={receptionNav}>
      <SectionCard title="Patient search" description="Fast search for front desk workflows">
        <div className="space-y-4 p-4">
          <Input placeholder="Search by patient name, phone, NID, or MRN..." leftIcon={<Search className="h-4 w-4" />} />
          <div className="grid gap-3 lg:grid-cols-3">
            {rows.map((row) => (
              <Card key={row.id} className="rounded-2xl border border-border p-4">
                <p className="font-semibold text-foreground">{row.name}</p>
                <p className="mt-2 text-sm text-muted-foreground">{row.mrn}</p>
                <p className="mt-1 text-sm text-muted-foreground">{row.phone}</p>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" className="flex-1">Open</Button>
                  <Button size="sm" variant="outline" className="flex-1">Book</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </SectionCard>
    </OpsShell>
  );
}

export function ReceptionNotificationsPage() {
  return (
    <OpsShell title="Notifications" description="SMS status, registration messages, booking conflicts, and front-desk reminders." nav={receptionNav}>
      <SectionCard title="Notification center" description="Urgent and non-urgent desk messages">
        <SharedAlertFeed items={opsDashboardData.reception.notifications} />
      </SectionCard>
    </OpsShell>
  );
}

export function LabOverviewPage() {
  const data = opsDashboardData.lab;
  return (
    <OpsShell title="Lab Overview" description="Pending tests, critical results, reports, and turnaround awareness for technicians." nav={labNav} actions={<Button><FlaskConical className="h-4 w-4" /> Enter Result</Button>}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Pending tests" value={data.kpis.pending} icon={ClipboardList} />
        <StatCard label="Completed today" value={data.kpis.completedToday} icon={CheckCircle2} tone="healthy" />
        <StatCard label="Critical results" value={data.kpis.criticalToday} icon={ShieldAlert} tone="critical" />
        <StatCard label="Reports generated" value={data.kpis.reportsGenerated} icon={Download} tone="accent" />
        <StatCard label="Avg turnaround" value={data.kpis.turnaround} icon={Calendar} tone="warning" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Pending tests" description="Priority, doctor, and status visibility">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="border-y border-border bg-secondary/30 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">MRN</th>
                  <th className="px-4 py-3">Test</th>
                  <th className="px-4 py-3">Doctor</th>
                  <th className="px-4 py-3">Requested</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.pendingTests.map((row: LabPendingTest) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3 font-medium">{row.patient}</td>
                    <td className="px-4 py-3"><Badge variant="outline">{row.mrn}</Badge></td>
                    <td className="px-4 py-3">{row.test}</td>
                    <td className="px-4 py-3">{row.orderingDoctor}</td>
                    <td className="px-4 py-3">{row.requestedAt}</td>
                    <td className="px-4 py-3"><Badge variant={row.priority === 'Critical' ? 'critical' : row.priority === 'Urgent' ? 'warning' : 'secondary'}>{row.priority}</Badge></td>
                    <td className="px-4 py-3"><Badge variant={statusBadge(row.status)}>{row.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
        <SectionCard title="Recent critical alerts" description="Doctor and patient notification feed">
          <SharedAlertFeed items={data.alerts} />
        </SectionCard>
      </div>
    </OpsShell>
  );
}

export function LabPendingTestsPage() {
  return (
    <OpsShell title="Pending Tests" description="View and filter test requests by status, priority, and day." nav={labNav}>
      <SectionCard title="Filters" description="Pending, in progress, completed, critical, and today">
        <div className="flex flex-wrap gap-2 p-4">
          {['Pending', 'In Progress', 'Completed', 'Critical', 'Today'].map((item, index) => (
            <Button key={item} size="sm" variant={index === 0 ? 'default' : 'outline'}>{item}</Button>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Test requests" description="Ordered by urgency and request time">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="border-y border-border bg-secondary/30 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">MRN</th>
                <th className="px-4 py-3">Test type</th>
                <th className="px-4 py-3">Ordering doctor</th>
                <th className="px-4 py-3">Requested</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {opsDashboardData.lab.pendingTests.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 font-medium">{row.patient}</td>
                  <td className="px-4 py-3"><Badge variant="outline">{row.mrn}</Badge></td>
                  <td className="px-4 py-3">{row.test}</td>
                  <td className="px-4 py-3">{row.orderingDoctor}</td>
                  <td className="px-4 py-3">{row.requestedAt}</td>
                  <td className="px-4 py-3"><Badge variant={row.priority === 'Critical' ? 'critical' : row.priority === 'Urgent' ? 'warning' : 'secondary'}>{row.priority}</Badge></td>
                  <td className="px-4 py-3"><Badge variant={statusBadge(row.status)}>{row.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </OpsShell>
  );
}

export function LabResultEntryPage() {
  const entry = opsDashboardData.lab.resultEntry;
  return (
    <OpsShell title="Result Entry" description="Enter results, preview flags, and trigger alert dispatch for critical values." nav={labNav} actions={<Button>Save result</Button>}>
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="Test result entry" description="Patient summary, unit, range, and auto-flag preview">
          <div className="grid gap-4 p-4 sm:grid-cols-2">
            <Input defaultValue={entry.patient} />
            <Input defaultValue={entry.mrn} />
            <Input defaultValue={entry.test} />
            <Input defaultValue={entry.result} />
            <Input defaultValue={entry.unit} />
            <Input defaultValue={entry.referenceRange} />
            <Input defaultValue={entry.ageGender} className="sm:col-span-2" />
          </div>
        </SectionCard>
        <SectionCard title="Flag preview and dispatch" description="Normal, borderline, and critical visual handling">
          <div className="space-y-4 p-4">
            <Card className="rounded-2xl border border-critical/30 bg-critical/5 p-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-critical" />
                <p className="font-semibold text-foreground">{entry.flag} result</p>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Ordering doctor, patient, and in-app notification status are visible before final save.</p>
            </Card>
            <div className="flex flex-wrap gap-2">
              {['SMS', 'Email', 'In-app'].map((channel) => <Badge key={channel} variant="outline">{channel}</Badge>)}
            </div>
            <div className="rounded-2xl border border-border bg-secondary/20 p-4 text-sm text-muted-foreground">
              Confirmation: result will be added to the patient timeline after save.
            </div>
          </div>
        </SectionCard>
      </div>
    </OpsShell>
  );
}

export function LabReportsPage() {
  return (
    <OpsShell title="Reports" description="PDF-ready lab report generation with branding, flags, and technician signature context." nav={labNav} actions={<Button variant="outline"><Download className="h-4 w-4" /> Download PDF</Button>}>
      <SectionCard title="Lab report list" description="Draft, generated, and sent status">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-y border-border bg-secondary/30 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">MRN</th>
                <th className="px-4 py-3">Technician</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Report date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {opsDashboardData.lab.reports.map((row: LabReportRow) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 font-medium">{row.patient}</td>
                  <td className="px-4 py-3"><Badge variant="outline">{row.mrn}</Badge></td>
                  <td className="px-4 py-3">{row.technician}</td>
                  <td className="px-4 py-3"><Badge variant={statusBadge(row.reportStatus)}>{row.reportStatus}</Badge></td>
                  <td className="px-4 py-3">{row.reportDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
      <SectionCard title="Report preview placeholder" description="Hospital branding, patient info, technician name, and ranges">
        <div className="p-4">
          <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/20 text-sm text-muted-foreground">
            Professional PDF preview placeholder
          </div>
        </div>
      </SectionCard>
    </OpsShell>
  );
}

export function LabCriticalAlertsPage() {
  return (
    <OpsShell title="Critical Alerts" description="Critical lab feed with status, delivery channels, and recipient visibility." nav={labNav}>
      <SectionCard title="Critical alert feed" description="Pending, sent, failed, and retried messages">
        <SharedAlertFeed items={opsDashboardData.lab.alerts} />
      </SectionCard>
    </OpsShell>
  );
}

export function LabReferenceRangesPage() {
  return (
    <OpsShell title="Reference Ranges" description="Age and gender aware lab reference ranges with normal, borderline, and critical thresholds." nav={labNav}>
      <SectionCard title="Reference range configuration" description="UI mock for test-specific thresholds">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="border-y border-border bg-secondary/30 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Test</th>
                <th className="px-4 py-3">Age group</th>
                <th className="px-4 py-3">Gender</th>
                <th className="px-4 py-3">Normal</th>
                <th className="px-4 py-3">Borderline</th>
                <th className="px-4 py-3">Critical</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {opsDashboardData.lab.referenceRanges.map((row) => (
                <tr key={`${row.test}-${row.ageGroup}-${row.gender}`}>
                  <td className="px-4 py-3 font-medium">{row.test}</td>
                  <td className="px-4 py-3">{row.ageGroup}</td>
                  <td className="px-4 py-3">{row.gender}</td>
                  <td className="px-4 py-3">{row.normal}</td>
                  <td className="px-4 py-3">{row.borderline}</td>
                  <td className="px-4 py-3">{row.critical}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </OpsShell>
  );
}

export function LabPatientLookupPage() {
  return (
    <OpsShell title="Patient Lookup" description="Fast patient-linked lab context for report generation and result review." nav={labNav}>
      <SectionCard title="Patient search" description="Find recent lab history by patient or MRN">
        <div className="space-y-4 p-4">
          <Input placeholder="Search patient name or MRN..." leftIcon={<Search className="h-4 w-4" />} />
          <div className="grid gap-3 lg:grid-cols-3">
            {opsDashboardData.admin.patients.map((row) => (
              <Card key={row.id} className="rounded-2xl border border-border p-4">
                <p className="font-semibold text-foreground">{row.name}</p>
                <p className="mt-2 text-sm text-muted-foreground">{row.mrn}</p>
                <p className="mt-1 text-sm text-muted-foreground">{row.phone}</p>
                <Button variant="outline" size="sm" className="mt-4 w-full">Open lab summary</Button>
              </Card>
            ))}
          </div>
        </div>
      </SectionCard>
    </OpsShell>
  );
}

export function PharmacyOverviewPage() {
  const data = opsDashboardData.pharmacy;
  return (
    <OpsShell title="Pharmacy Overview" description="Prescription queue, dispensing status, stock risk, expiry tracking, and audit visibility." nav={pharmacyNav} actions={<Button><Pill className="h-4 w-4" /> Open Queue</Button>}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Prescriptions waiting" value={data.kpis.waiting} icon={ClipboardList} />
        <StatCard label="Dispensed today" value={data.kpis.dispensedToday} icon={CheckCircle2} tone="healthy" />
        <StatCard label="Low stock medicines" value={data.kpis.lowStock} icon={Package} tone="warning" />
        <StatCard label="Expiring soon" value={data.kpis.expiringSoon} icon={AlertTriangle} tone="warning" />
        <StatCard label="Partial dispensing" value={data.kpis.partialCases} icon={Pill} tone="critical" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard title="Prescription queue" description="Doctor-sent prescriptions waiting for pharmacist action">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="border-y border-border bg-secondary/30 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">MRN</th>
                  <th className="px-4 py-3">Doctor</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Drug count</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.queue.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3 font-medium">{row.patient}</td>
                    <td className="px-4 py-3"><Badge variant="outline">{row.mrn}</Badge></td>
                    <td className="px-4 py-3">{row.doctor}</td>
                    <td className="px-4 py-3">{row.time}</td>
                    <td className="px-4 py-3">{row.drugCount}</td>
                    <td className="px-4 py-3"><Badge variant={statusBadge(row.status)}>{row.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
        <SectionCard title="Low stock alerts" description="Configured minimum thresholds and suggested restock placeholders">
          <SharedAlertFeed items={data.lowStockAlerts} />
        </SectionCard>
      </div>
    </OpsShell>
  );
}

export function PharmacyPrescriptionQueuePage() {
  return (
    <OpsShell title="Prescription Queue" description="Detailed queue with patient, doctor, and status context for dispensing." nav={pharmacyNav}>
      <SectionCard title="Prescription queue" description="New, in progress, partial, and dispensed states">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-y border-border bg-secondary/30 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">MRN</th>
                <th className="px-4 py-3">Doctor</th>
                <th className="px-4 py-3">Prescription time</th>
                <th className="px-4 py-3">Drug count</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {opsDashboardData.pharmacy.queue.map((row: PharmacyPrescriptionRow) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 font-medium">{row.patient}</td>
                  <td className="px-4 py-3"><Badge variant="outline">{row.mrn}</Badge></td>
                  <td className="px-4 py-3">{row.doctor}</td>
                  <td className="px-4 py-3">{row.time}</td>
                  <td className="px-4 py-3">{row.drugCount}</td>
                  <td className="px-4 py-3"><Badge variant={statusBadge(row.status)}>{row.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </OpsShell>
  );
}

export function PharmacyDispensingPage() {
  const draft = opsDashboardData.pharmacy.dispensingDraft;
  return (
    <OpsShell title="Dispensing" description="Confirm dispense quantities, preview inventory deduction, and timestamp pharmacist actions." nav={pharmacyNav} actions={<Button>Complete dispensing</Button>}>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Dispensing workflow" description="Patient summary and medicine-level actions">
          <div className="space-y-4 p-4">
            <Card className="rounded-2xl border border-border p-4">
              <p className="font-semibold text-foreground">{draft.patient}</p>
              <p className="mt-2 text-sm text-muted-foreground">{draft.mrn} / Pharmacist ID {draft.pharmacistId} / {draft.timestamp}</p>
            </Card>
            <div className="grid gap-4">
              {draft.medicines.map((medicine) => (
                <Card key={medicine.name} className="rounded-2xl border border-border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{medicine.name}</p>
                      <p className="text-sm text-muted-foreground">{medicine.generic} / {medicine.brand}</p>
                    </div>
                    <Badge variant={medicine.stockAvailable < medicine.quantityNeeded ? 'warning' : 'healthy'}>
                      Stock {medicine.stockAvailable}
                    </Badge>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <Card className="rounded-xl border border-border p-3"><p className="text-xs text-muted-foreground">Dosage</p><p className="mt-1 text-sm text-foreground">{medicine.dosage}</p></Card>
                    <Card className="rounded-xl border border-border p-3"><p className="text-xs text-muted-foreground">Frequency</p><p className="mt-1 text-sm text-foreground">{medicine.frequency}</p></Card>
                    <Card className="rounded-xl border border-border p-3"><p className="text-xs text-muted-foreground">Duration</p><p className="mt-1 text-sm text-foreground">{medicine.duration}</p></Card>
                    <Card className="rounded-xl border border-border p-3"><p className="text-xs text-muted-foreground">Instructions</p><p className="mt-1 text-sm text-foreground">{medicine.instructions}</p></Card>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </SectionCard>
        <div className="space-y-6">
          <SectionCard title="Inventory deduction preview" description="Auto-deduction before confirmation">
            <div className="space-y-3 p-4">
              {draft.medicines.map((medicine) => (
                <Card key={`${medicine.name}-deduction`} className="rounded-2xl border border-border p-4">
                  <p className="font-medium text-foreground">{medicine.name}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Quantity needed {medicine.quantityNeeded} / available {medicine.stockAvailable}
                  </p>
                  {medicine.stockAvailable < medicine.quantityNeeded && (
                    <Badge variant="warning" className="mt-3">Partial dispensing required / outstanding quantity tracked</Badge>
                  )}
                </Card>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Timestamped audit confirmation" description="Pharmacist ID, patient MRN, drug, and quantity">
            <div className="rounded-2xl border border-border bg-secondary/20 p-4 text-sm text-muted-foreground">
              Audit log will record pharmacist ID, timestamp, patient MRN, prescription ID, drug, and dispensed quantity on confirmation.
            </div>
          </SectionCard>
        </div>
      </div>
    </OpsShell>
  );
}

export function PharmacyInventoryPage() {
  const rows = opsDashboardData.pharmacy.inventory;
  return (
    <OpsShell title="Inventory" description="Search stock, view thresholds, expiry dates, batch numbers, and inventory health." nav={pharmacyNav}>
      <SectionCard title="Inventory search" description="Low stock, out of stock, and expiring soon visibility">
        <div className="p-4">
          <Input placeholder="Search drug, generic, brand, or batch..." leftIcon={<Search className="h-4 w-4" />} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="border-y border-border bg-secondary/30 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Drug</th>
                <th className="px-4 py-3">Generic</th>
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Threshold</th>
                <th className="px-4 py-3">Expiry</th>
                <th className="px-4 py-3">Batch</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row: InventoryRow) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 font-medium">{row.drug}</td>
                  <td className="px-4 py-3">{row.generic}</td>
                  <td className="px-4 py-3">{row.brand}</td>
                  <td className="px-4 py-3">{row.stock}</td>
                  <td className="px-4 py-3">{row.threshold}</td>
                  <td className="px-4 py-3">{row.expiry}</td>
                  <td className="px-4 py-3">{row.batch}</td>
                  <td className="px-4 py-3"><Badge variant={statusBadge(row.status)}>{row.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </OpsShell>
  );
}

export function PharmacyLowStockPage() {
  return (
    <OpsShell title="Low Stock Alerts" description="Below-threshold medicines with priority badges and restock suggestions." nav={pharmacyNav}>
      <SectionCard title="Low stock feed" description="Operational stock alerts">
        <SharedAlertFeed items={opsDashboardData.pharmacy.lowStockAlerts} />
      </SectionCard>
    </OpsShell>
  );
}

export function PharmacyExpiryTrackingPage() {
  return (
    <OpsShell title="Expiry Tracking" description="30, 60, and 90-day expiry awareness with batch-level visibility." nav={pharmacyNav}>
      <SectionCard title="Expiry filters" description="Expiring soon and expired stock visibility">
        <div className="flex flex-wrap gap-2 p-4">
          {['30 days', '60 days', '90 days'].map((range, index) => (
            <Button key={range} size="sm" variant={index === 0 ? 'default' : 'outline'}>{range}</Button>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Expiry list" description="Batch-aware expiry status">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="border-y border-border bg-secondary/30 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Drug</th>
                <th className="px-4 py-3">Generic</th>
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Expiry</th>
                <th className="px-4 py-3">Batch</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {opsDashboardData.pharmacy.expiryTracking.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 font-medium">{row.drug}</td>
                  <td className="px-4 py-3">{row.generic}</td>
                  <td className="px-4 py-3">{row.brand}</td>
                  <td className="px-4 py-3">{row.stock}</td>
                  <td className="px-4 py-3">{row.expiry}</td>
                  <td className="px-4 py-3">{row.batch}</td>
                  <td className="px-4 py-3"><Badge variant={statusBadge(row.status)}>{row.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </OpsShell>
  );
}

export function PharmacyAuditPage() {
  return (
    <OpsShell title="Audit Logs" description="Timestamped dispensing actions with patient MRN, prescription, drug, and quantity." nav={pharmacyNav}>
      <SectionCard title="Dispensing audit logs" description="Searchable audit-friendly output">
        <div className="p-4">
          <Input placeholder="Search by patient MRN, drug, or date..." leftIcon={<Search className="h-4 w-4" />} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="border-y border-border bg-secondary/30 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Pharmacist</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Patient MRN</th>
                <th className="px-4 py-3">Prescription ID</th>
                <th className="px-4 py-3">Drug</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {opsDashboardData.pharmacy.auditLogs.map((row: AuditLogRow) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 font-medium">{row.pharmacist}</td>
                  <td className="px-4 py-3">{formatDateTime(row.at)}</td>
                  <td className="px-4 py-3"><Badge variant="outline">{row.patientMrn}</Badge></td>
                  <td className="px-4 py-3">{row.prescriptionId}</td>
                  <td className="px-4 py-3">{row.drug}</td>
                  <td className="px-4 py-3">{row.quantity}</td>
                  <td className="px-4 py-3"><Badge variant={statusBadge(row.action === 'Dispensed' ? 'sent' : 'pending')}>{row.action}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </OpsShell>
  );
}

export function OpsRoleLoginChooser() {
  const roles = [
    { label: 'Hospital Admin', email: 'admin@demo.hms.com.bd', helper: 'Operations, finance, analytics' },
    { label: 'Doctor', email: 'dr.karim@demo.hms.com.bd', helper: 'Consultation, prescriptions, labs' },
    { label: 'Nurse', email: 'sister.rumana@demo.hms.com.bd', helper: 'Vitals, care chart, ward flow' },
    { label: 'Receptionist', email: 'reception@demo.hms.com.bd', helper: 'Registration, booking, billing' },
    { label: 'Lab Technician', email: 'lab.tanvir@demo.hms.com.bd', helper: 'Pending tests, result entry' },
    { label: 'Pharmacist', email: 'pharm.sadia@demo.hms.com.bd', helper: 'Queue, dispensing, inventory' },
    { label: 'Patient', email: 'rahim.patient@gmail.com', helper: 'Appointments, reports, billing' },
    { label: 'Super Admin', email: 'super@hms.com.bd', helper: 'Tenant, subscriptions, platform alerts' },
  ];
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {roles.map((role) => (
        <button
          key={role.email}
          type="button"
          data-demo-email={role.email}
          className="rounded-xl border border-border bg-background px-3 py-3 text-left transition hover:border-primary/30 hover:bg-primary/5"
        >
          <p className="font-medium text-foreground">{role.label}</p>
          <p className="mt-1 text-xs text-muted-foreground">{role.helper}</p>
        </button>
      ))}
    </div>
  );
}
