'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  Ambulance,
  BarChart3,
  Bed,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FileText,
  FlaskConical,
  HeartPulse,
  Package,
  Pill,
  Plus,
  Settings,
  ShieldCheck,
  Stethoscope,
  TrendingUp,
  UserCog,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { PageHeader, KPICard, SectionCard } from '@/components/shared';
import { Avatar } from '@/components/ui/avatar';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  alertAPI,
  appointmentAPI,
  bedAPI,
  billingAPI,
  dashboardAPI,
  emergencyAPI,
  labAPI,
  patientAPI,
  pharmacyAPI,
  prescriptionAPI,
  tenantAPI,
  userAPI,
} from '@/lib/mock-api';
import { cn, formatBDT, formatDate, formatDateTime, formatPhone, formatRelative, formatTime } from '@/lib/utils';
import type {
  Alert,
  Appointment,
  Bed as HospitalBed,
  Bill,
  ChartDataPoint,
  DashboardKPIs,
  DoctorPerformance,
  EmergencyRequest,
  LabTest,
  MedicineInventory,
  Patient,
  PharmacyOrder,
  Prescription,
  Tenant,
  User,
  Ward,
} from '@/types';

type BadgeVariant = BadgeProps['variant'];

function statusVariant(status: string): BadgeVariant {
  if (['paid', 'completed', 'reported', 'verified', 'dispensed', 'dispensed_full', 'active', 'delivered'].includes(status)) return 'healthy';
  if (['critical', 'high', 'partial', 'checked_in', 'in_progress', 'sample_collected', 'en_route_to_patient', 'transporting'].includes(status)) return 'warning';
  if (['pending', 'ordered', 'scheduled', 'confirmed', 'draft', 'reserved'].includes(status)) return 'secondary';
  if (['cancelled', 'failed', 'locked', 'out_of_stock'].includes(status)) return 'destructive';
  return 'outline';
}

function label(value: string) {
  return value.replace(/_/g, ' ');
}

function TableShell({ children }: { children: React.ReactNode }) {
  return <div className="overflow-x-auto">{children}</div>;
}

function MiniMetric({ icon: Icon, label: title, value, tone = 'primary' }: { icon: LucideIcon; label: string; value: string | number; tone?: 'primary' | 'accent' | 'critical' | 'healthy' | 'borderline' }) {
  return <KPICard label={title} value={value} icon={Icon} accentColor={tone} />;
}

function ProgressBar({ value, critical }: { value: number; critical?: boolean }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-secondary">
      <div className={cn('h-full rounded-full bg-primary', critical && 'bg-critical')} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  );
}

export function AppointmentsModulePage({ scope = 'Admin' }: { scope?: string }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    appointmentAPI.list().then((r) => setAppointments(r.data));
  }, []);

  const filtered = appointments.filter((a) => `${a.patient_name} ${a.patient_mrn} ${a.doctor_name} ${a.reason}`.toLowerCase().includes(query.toLowerCase()));
  const today = appointments.filter((a) => new Date(a.scheduled_at).toDateString() === new Date().toDateString()).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={scope === 'Doctor' ? 'My Appointments' : 'Appointments'}
        description="Schedule, check-in, teleconsultation, and visit status management."
        actions={<Button><Plus className="h-4 w-4" /> New Appointment</Button>}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MiniMetric icon={Calendar} label="Total bookings" value={appointments.length} />
        <MiniMetric icon={CheckCircle2} label="Today" value={today} tone="accent" />
        <MiniMetric icon={Activity} label="Checked in" value={appointments.filter((a) => a.status === 'checked_in').length} tone="healthy" />
        <MiniMetric icon={CreditCard} label="Pending payment" value={appointments.filter((a) => a.payment_status === 'pending').length} tone="borderline" />
      </div>
      <SectionCard title="Appointment Queue" description={`${filtered.length} appointments`} action={<Input placeholder="Search appointments..." value={query} onChange={(e) => setQuery(e.target.value)} className="h-8 w-56" />}>
        <TableShell>
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/30 text-left text-xs uppercase text-muted-foreground">
              <tr><th className="px-5 py-3">Time</th><th className="px-3 py-3">Patient</th><th className="px-3 py-3">Doctor</th><th className="px-3 py-3">Type</th><th className="px-3 py-3">Fee</th><th className="px-3 py-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-secondary/30">
                  <td className="px-5 py-3 font-medium">{formatDateTime(a.scheduled_at)}</td>
                  <td className="px-3 py-3"><div className="font-medium">{a.patient_name}</div><div className="font-mono text-xs text-muted-foreground">{a.patient_mrn}</div></td>
                  <td className="px-3 py-3"><div>{a.doctor_name}</div><div className="text-xs text-muted-foreground">{a.doctor_specialty}</div></td>
                  <td className="px-3 py-3 capitalize">{label(a.appointment_type)}</td>
                  <td className="px-3 py-3">{formatBDT(a.fee_bdt)}</td>
                  <td className="px-3 py-3"><Badge variant={statusVariant(a.status)}>{label(a.status)}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableShell>
      </SectionCard>
    </div>
  );
}

export function PrescriptionsModulePage({ scope = 'Admin' }: { scope?: string }) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  useEffect(() => {
    prescriptionAPI.list().then((r) => setPrescriptions(r.data));
  }, []);
  return (
    <div className="space-y-6">
      <PageHeader title={scope === 'Patient' ? 'My Prescriptions' : 'Prescriptions'} description="Signed prescriptions, dispensing progress, and follow-up reminders." actions={<Button><FileText className="h-4 w-4" /> Create Prescription</Button>} />
      <div className="grid gap-4 sm:grid-cols-3">
        <MiniMetric icon={FileText} label="Total prescriptions" value={prescriptions.length} />
        <MiniMetric icon={Pill} label="Medicines prescribed" value={prescriptions.reduce((sum, p) => sum + p.medicines.length, 0)} tone="accent" />
        <MiniMetric icon={CheckCircle2} label="Fully dispensed" value={prescriptions.filter((p) => p.status === 'dispensed_full').length} tone="healthy" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {prescriptions.map((p) => (
          <Card key={p.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div><div className="font-semibold">{p.prescription_number}</div><div className="text-sm text-muted-foreground">{p.patient_name} · {p.patient_mrn}</div></div>
              <Badge variant={statusVariant(p.status)}>{label(p.status)}</Badge>
            </div>
            <div className="mt-4 rounded-lg bg-secondary/40 p-3 text-sm">
              <div className="font-medium">{p.diagnosis}{p.diagnosis_icd10 ? ` (${p.diagnosis_icd10})` : ''}</div>
              <div className="mt-1 text-muted-foreground">{p.chief_complaint}</div>
            </div>
            <div className="mt-4 space-y-2">
              {p.medicines.map((m) => (
                <div key={`${p.id}-${m.medicine_id}`} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                  <div><div className="font-medium">{m.brand_name} {m.strength}</div><div className="text-xs text-muted-foreground">{label(m.frequency)} · {m.duration_days} days</div></div>
                  <Badge variant="outline">{m.dispensed_quantity}/{m.quantity}</Badge>
                </div>
              ))}
            </div>
            <div className="mt-4 text-xs text-muted-foreground">By {p.doctor_name} · Signed {p.signed_at ? formatDateTime(p.signed_at) : 'Draft'}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function LabModulePage({ scope = 'Admin' }: { scope?: string }) {
  const [tests, setTests] = useState<LabTest[]>([]);
  useEffect(() => {
    labAPI.list().then((r) => setTests(r.data));
  }, []);
  return (
    <div className="space-y-6">
      <PageHeader title={scope === 'Patient' ? 'Lab Reports' : 'Lab Tests'} description="Order tracking, sample workflow, result flags, and report status." actions={<Button><FlaskConical className="h-4 w-4" /> Order Lab Test</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MiniMetric icon={FlaskConical} label="Tests" value={tests.length} />
        <MiniMetric icon={Activity} label="In progress" value={tests.filter((t) => t.status === 'in_progress').length} tone="accent" />
        <MiniMetric icon={AlertTriangle} label="Critical flags" value={tests.filter((t) => t.overall_flag === 'critical').length} tone="critical" />
        <MiniMetric icon={CheckCircle2} label="Reported" value={tests.filter((t) => t.status === 'reported').length} tone="healthy" />
      </div>
      <SectionCard title="Lab Worklist" description="Prioritized by clinical urgency">
        <div className="divide-y divide-border">
          {tests.map((t) => (
            <div key={t.id} className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{t.test_name}</h3><Badge variant={statusVariant(t.overall_flag)}>{label(t.overall_flag)}</Badge><Badge variant="outline">{t.priority}</Badge></div>
                  <div className="mt-1 text-sm text-muted-foreground">{t.patient_name} · {t.patient_mrn} · Ordered by {t.ordered_by_doctor_name}</div>
                </div>
                <Badge variant={statusVariant(t.status)}>{label(t.status)}</Badge>
              </div>
              {t.results && (
                <div className="mt-4 grid gap-2 md:grid-cols-3">
                  {t.results.map((r) => (
                    <div key={r.parameter_id} className="rounded-lg border border-border p-3 text-sm">
                      <div className="font-medium">{r.parameter_name}</div>
                      <div className="mt-1 text-lg font-semibold">{r.value} <span className="text-xs text-muted-foreground">{r.unit}</span></div>
                      <div className="text-xs text-muted-foreground">Ref {r.reference_range_display}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

export function PharmacyModulePage() {
  const [orders, setOrders] = useState<PharmacyOrder[]>([]);
  const [inventory, setInventory] = useState<MedicineInventory[]>([]);
  useEffect(() => {
    pharmacyAPI.listOrders().then((r) => setOrders(r.data));
    pharmacyAPI.listInventory().then((r) => setInventory(r.data));
  }, []);
  return (
    <div className="space-y-6">
      <PageHeader title="Pharmacy" description="Dispensing queue, inventory status, and low-stock controls." actions={<Button><Package className="h-4 w-4" /> Add Stock</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MiniMetric icon={Pill} label="Orders" value={orders.length} />
        <MiniMetric icon={Package} label="Inventory items" value={inventory.length} tone="accent" />
        <MiniMetric icon={AlertTriangle} label="Low stock" value={inventory.filter((i) => i.is_low_stock || i.is_out_of_stock).length} tone="critical" />
        <MiniMetric icon={CreditCard} label="Order value" value={formatBDT(orders.reduce((s, o) => s + o.total_amount_bdt, 0))} tone="healthy" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Dispensing Queue" description="Prescription-linked orders">
          <div className="divide-y divide-border">
            {orders.map((o) => <div key={o.id} className="p-4"><div className="flex justify-between gap-3"><div><div className="font-medium">{o.order_number}</div><div className="text-sm text-muted-foreground">{o.patient_name} · {o.prescription_number}</div></div><Badge variant={statusVariant(o.status)}>{label(o.status)}</Badge></div><div className="mt-3 text-sm">{o.items.map((i) => i.medicine_name).join(', ')}</div></div>)}
          </div>
        </SectionCard>
        <SectionCard title="Inventory" description="Stock thresholds and pricing">
          <div className="divide-y divide-border">
            {inventory.map((i) => <div key={i.id} className="p-4"><div className="flex justify-between gap-3"><div><div className="font-medium">{i.brand_name} {i.strength}</div><div className="text-xs text-muted-foreground">{i.generic_name} · Batch {i.batch_number}</div></div><Badge variant={i.is_low_stock ? 'warning' : 'healthy'}>{i.current_stock} units</Badge></div><div className="mt-3"><ProgressBar value={(i.current_stock / i.max_threshold) * 100} critical={i.is_low_stock} /></div></div>)}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

export function BedsModulePage() {
  const [wards, setWards] = useState<Ward[]>([]);
  const [beds, setBeds] = useState<HospitalBed[]>([]);
  useEffect(() => {
    bedAPI.listWards().then((r) => setWards(r.data));
    bedAPI.listBeds().then((r) => setBeds(r.data));
  }, []);
  const totals = wards.reduce((acc, w) => ({ total: acc.total + w.total_beds, available: acc.available + w.available_beds, occupied: acc.occupied + w.occupied_beds }), { total: 0, available: 0, occupied: 0 });
  return (
    <div className="space-y-6">
      <PageHeader title="Beds & Wards" description="Ward capacity, bed availability, and admission visibility." actions={<Button><Bed className="h-4 w-4" /> Assign Bed</Button>} />
      <div className="grid gap-4 sm:grid-cols-3">
        <MiniMetric icon={Bed} label="Total beds" value={totals.total} />
        <MiniMetric icon={CheckCircle2} label="Available" value={totals.available} tone="healthy" />
        <MiniMetric icon={Users} label="Occupied" value={totals.occupied} tone="borderline" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {wards.map((w) => (
          <Card key={w.id} className="p-5">
            <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{w.name}</h3><div className="text-sm text-muted-foreground">{w.floor} · {label(w.ward_type)}</div></div><Badge variant={w.occupancy_rate >= w.capacity_threshold ? 'critical' : 'secondary'}>{w.occupancy_rate.toFixed(1)}%</Badge></div>
            <div className="mt-4"><ProgressBar value={w.occupancy_rate} critical={w.occupancy_rate >= w.capacity_threshold} /></div>
            <div className="mt-4 grid grid-cols-4 gap-2 text-center text-sm"><div><div className="font-semibold">{w.total_beds}</div><div className="text-xs text-muted-foreground">Total</div></div><div><div className="font-semibold text-healthy">{w.available_beds}</div><div className="text-xs text-muted-foreground">Free</div></div><div><div className="font-semibold">{w.occupied_beds}</div><div className="text-xs text-muted-foreground">Used</div></div><div><div className="font-semibold">{formatBDT(w.daily_rate_bdt ?? 0)}</div><div className="text-xs text-muted-foreground">Rate</div></div></div>
          </Card>
        ))}
      </div>
      <SectionCard title="Bed Board" description={`${beds.length} beds loaded`}>
        <div className="grid gap-2 p-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {beds.slice(0, 24).map((b) => <div key={b.id} className={cn('rounded-lg border p-3 text-sm', b.status === 'available' && 'border-healthy/30 bg-healthy/5', b.status === 'occupied' && 'border-border bg-secondary/30', b.status === 'reserved' && 'border-borderline/40 bg-borderline/10')}><div className="font-semibold">{b.bed_number}</div><div className="mt-1 text-xs capitalize text-muted-foreground">{b.status}</div>{b.current_patient_name && <div className="mt-2 line-clamp-1 text-xs">{b.current_patient_name}</div>}</div>)}
        </div>
      </SectionCard>
    </div>
  );
}

export function BillingModulePage({ scope = 'Admin' }: { scope?: string }) {
  const [bills, setBills] = useState<Bill[]>([]);
  useEffect(() => {
    billingAPI.list().then((r) => setBills(r.data));
  }, []);
  return (
    <div className="space-y-6">
      <PageHeader title={scope === 'Patient' ? 'My Bills' : 'Billing'} description="Invoices, payment status, discounts, and outstanding balances." actions={<Button><CreditCard className="h-4 w-4" /> New Invoice</Button>} />
      <div className="grid gap-4 sm:grid-cols-3">
        <MiniMetric icon={CreditCard} label="Total billed" value={formatBDT(bills.reduce((s, b) => s + b.total_amount_bdt, 0))} />
        <MiniMetric icon={AlertTriangle} label="Outstanding" value={formatBDT(bills.reduce((s, b) => s + b.amount_outstanding_bdt, 0))} tone="borderline" />
        <MiniMetric icon={CheckCircle2} label="Paid bills" value={bills.filter((b) => b.status === 'paid').length} tone="healthy" />
      </div>
      <SectionCard title="Invoices" description={`${bills.length} bill records`}>
        <div className="divide-y divide-border">
          {bills.map((b) => <div key={b.id} className="p-5"><div className="flex flex-col gap-3 sm:flex-row sm:justify-between"><div><div className="font-semibold">{b.bill_number}</div><div className="text-sm text-muted-foreground">{b.patient_name} · {b.patient_mrn} · {formatDate(b.bill_date)}</div></div><div className="text-left sm:text-right"><Badge variant={statusVariant(b.status)}>{label(b.status)}</Badge><div className="mt-1 font-semibold">{formatBDT(b.total_amount_bdt)}</div></div></div><div className="mt-4 grid gap-2 md:grid-cols-2">{b.line_items.map((i) => <div key={i.id} className="flex justify-between rounded-lg border border-border px-3 py-2 text-sm"><span>{i.description}</span><span className="font-medium">{formatBDT(i.total_bdt)}</span></div>)}</div></div>)}
        </div>
      </SectionCard>
    </div>
  );
}

export function EmergencyModulePage({ patientMode = false }: { patientMode?: boolean }) {
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  useEffect(() => {
    emergencyAPI.listActive().then((r) => setRequests(r.data));
  }, []);
  async function trigger() {
    const r = await emergencyAPI.triggerSOS();
    setRequests([r.data, ...requests]);
  }
  return (
    <div className="space-y-6">
      <PageHeader title={patientMode ? 'SOS Emergency' : 'Emergency'} description="SOS intake, ambulance dispatch, GPS handoff, and ER pre-notification." actions={<Button variant={patientMode ? 'destructive' : 'default'} onClick={trigger}><Ambulance className="h-4 w-4" /> Trigger SOS Demo</Button>} />
      <div className="grid gap-4 sm:grid-cols-3">
        <MiniMetric icon={Ambulance} label="Active requests" value={requests.length} tone="critical" />
        <MiniMetric icon={Activity} label="En route" value={requests.filter((r) => r.status.includes('en_route') || r.status === 'transporting').length} tone="borderline" />
        <MiniMetric icon={ShieldCheck} label="ER notified" value={requests.filter((r) => r.er_pre_notification_sent).length} tone="healthy" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {requests.map((r) => <Card key={r.id} className="p-5"><div className="flex justify-between gap-3"><div><div className="font-semibold">{r.request_number}</div><div className="text-sm text-muted-foreground">{r.pickup_location.address}</div></div><Badge variant={statusVariant(r.priority)}>{r.priority}</Badge></div><div className="mt-4 rounded-lg bg-secondary/40 p-3 text-sm">{r.chief_complaint}</div><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><div className="text-xs text-muted-foreground">Status</div><div className="font-medium capitalize">{label(r.status)}</div></div><div><div className="text-xs text-muted-foreground">ETA</div><div className="font-medium">{r.estimated_arrival_time ? formatTime(r.estimated_arrival_time) : 'Pending'}</div></div><div><div className="text-xs text-muted-foreground">Ambulance</div><div className="font-medium">{r.ambulance_number ?? 'Unassigned'}</div></div><div><div className="text-xs text-muted-foreground">Dispatcher</div><div className="font-medium">{r.dispatcher_name ?? 'Pending'}</div></div></div></Card>)}
      </div>
    </div>
  );
}

export function StaffModulePage() {
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    userAPI.list().then((r) => setUsers(r.data));
  }, []);
  return (
    <div className="space-y-6">
      <PageHeader title="Doctors & Staff" description="Role directory, credential status, and clinical assignments." actions={<Button><UserCog className="h-4 w-4" /> Add Staff</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MiniMetric icon={Stethoscope} label="Doctors" value={users.filter((u) => u.role === 'doctor').length} />
        <MiniMetric icon={HeartPulse} label="Nurses" value={users.filter((u) => u.role === 'nurse').length} tone="accent" />
        <MiniMetric icon={ShieldCheck} label="2FA enabled" value={users.filter((u) => u.two_factor_enabled).length} tone="healthy" />
        <MiniMetric icon={Users} label="Active staff" value={users.filter((u) => u.status === 'active').length} tone="borderline" />
      </div>
      <SectionCard title="Staff Directory" description={`${users.length} team members`}>
        <div className="divide-y divide-border">
          {users.map((u) => <div key={u.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><Avatar name={u.full_name} src={u.profile_photo_url} size="md" /><div><div className="font-medium">{u.full_name}</div><div className="text-sm text-muted-foreground">{u.email} · {formatPhone(u.phone)}</div></div></div><div className="flex flex-wrap gap-2"><Badge variant="outline">{label(u.role)}</Badge><Badge variant={statusVariant(u.status)}>{u.status}</Badge>{u.two_factor_enabled && <Badge variant="healthy">2FA</Badge>}</div></div>)}
        </div>
      </SectionCard>
    </div>
  );
}

export function AnalyticsModulePage() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [revenue, setRevenue] = useState<ChartDataPoint[]>([]);
  const [visits, setVisits] = useState<ChartDataPoint[]>([]);
  const [departments, setDepartments] = useState<ChartDataPoint[]>([]);
  const [doctors, setDoctors] = useState<DoctorPerformance[]>([]);
  useEffect(() => {
    dashboardAPI.getKPIs().then((r) => setKpis(r.data));
    dashboardAPI.getRevenueTrend().then((r) => setRevenue(r.data));
    dashboardAPI.getPatientVisitsTrend().then((r) => setVisits(r.data));
    dashboardAPI.getDepartmentRevenue().then((r) => setDepartments(r.data));
    dashboardAPI.getDoctorPerformance().then((r) => setDoctors(r.data));
  }, []);
  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Operational performance, revenue trends, and doctor productivity." actions={<Button variant="outline"><BarChart3 className="h-4 w-4" /> Export</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MiniMetric icon={Users} label="Patients" value={kpis?.total_patients.toLocaleString() ?? '-'} />
        <MiniMetric icon={Calendar} label="Appointments today" value={kpis?.appointments_today ?? '-'} tone="accent" />
        <MiniMetric icon={CreditCard} label="Month revenue" value={kpis ? formatBDT(kpis.revenue_month_bdt) : '-'} tone="healthy" />
        <MiniMetric icon={Bed} label="Bed occupancy" value={kpis ? `${kpis.bed_occupancy_rate}%` : '-'} tone="borderline" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Revenue Trend" data={revenue} formatter={formatBDT} />
        <ChartCard title="Patient Visits" data={visits} />
        <ChartCard title="Department Revenue" data={departments} formatter={formatBDT} />
        <SectionCard title="Doctor Performance" description="Monthly clinical productivity">
          <div className="divide-y divide-border">
            {doctors.map((d) => <div key={d.doctor_id} className="p-4"><div className="flex justify-between"><div><div className="font-medium">{d.doctor_name}</div><div className="text-xs text-muted-foreground">{d.specialty}</div></div><Badge variant="healthy">{d.patient_satisfaction_score}/5</Badge></div><div className="mt-3 grid grid-cols-3 gap-2 text-sm"><div>{d.patients_seen} patients</div><div>{formatBDT(d.revenue_generated_bdt)}</div><div>{d.avg_appointment_minutes} min avg</div></div></div>)}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function ChartCard({ title, data, formatter = (n: number) => String(n) }: { title: string; data: ChartDataPoint[]; formatter?: (n: number) => string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <SectionCard title={title} description="Mock analytics data">
      <div className="flex h-56 items-end gap-2 p-5">
        {data.map((d) => <div key={d.label} className="flex flex-1 flex-col items-center gap-2"><div className="flex w-full flex-1 items-end"><div className="w-full rounded-t-md bg-gradient-to-t from-primary to-accent" style={{ height: `${(d.value / max) * 100}%` }} title={formatter(d.value)} /></div><div className="text-xs text-muted-foreground">{d.label}</div></div>)}
      </div>
    </SectionCard>
  );
}

export function SettingsModulePage() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  useEffect(() => {
    tenantAPI.getCurrent().then((r) => setTenant(r.data));
  }, []);
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Hospital profile, subscription limits, security, and communication channels." actions={<Button><Settings className="h-4 w-4" /> Save Changes</Button>} />
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Hospital Profile" description="Tenant branding and contact details">
          <div className="space-y-4 p-5">
            <LabeledReadOnly label="Hospital name" value={tenant?.branding.hospital_name ?? ''} />
            <LabeledReadOnly label="Display name" value={tenant?.branding.display_name ?? ''} />
            <LabeledReadOnly label="Support email" value={tenant?.branding.support_email ?? ''} />
            <LabeledReadOnly label="Support phone" value={tenant?.branding.support_phone ?? ''} />
          </div>
        </SectionCard>
        <SectionCard title="Subscription & Limits" description="Current SaaS plan capability">
          <div className="space-y-3 p-5 text-sm">
            <SettingRow label="Plan" value={tenant?.plan ?? '-'} />
            <SettingRow label="Status" value={tenant?.status ?? '-'} />
            <SettingRow label="Patient usage" value={`${tenant?.usage.patient_count ?? 0}/${tenant?.limits.max_patients ?? 'Unlimited'}`} />
            <SettingRow label="Branches" value={`${tenant?.usage.branch_count ?? 0}/${tenant?.limits.max_branches ?? 'Unlimited'}`} />
            <SettingRow label="Renews" value={tenant?.subscription_renews_at ? formatDate(tenant.subscription_renews_at) : '-'} />
          </div>
        </SectionCard>
        <SectionCard title="Security" description="Account protection defaults">
          <div className="grid gap-3 p-5 sm:grid-cols-2">
            {['Two-factor authentication', 'Account lock after failed attempts', 'Audit trail retention', 'Role based access'].map((item) => <div key={item} className="rounded-lg border border-border p-3 text-sm"><ShieldCheck className="mb-2 h-4 w-4 text-healthy" /><div className="font-medium">{item}</div><div className="text-xs text-muted-foreground">Enabled for demo tenant</div></div>)}
          </div>
        </SectionCard>
        <SectionCard title="Alert Channels" description="HAS dispatch methods">
          <div className="flex flex-wrap gap-2 p-5">{tenant?.limits.alert_channels.map((c) => <Badge key={c} variant="secondary">{c}</Badge>)}</div>
        </SectionCard>
      </div>
    </div>
  );
}

function SettingRow({ label: title, value }: { label: string; value: string | number }) {
  return <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2"><span className="text-muted-foreground">{title}</span><span className="font-medium capitalize">{value}</span></div>;
}

function LabeledReadOnly({ label: title, value }: { label: string; value: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{title}</span>
      <Input value={value} readOnly />
    </label>
  );
}

export function OpdIpdModulePage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  useEffect(() => {
    patientAPI.list().then((r) => setPatients(r.data));
    appointmentAPI.list().then((r) => setAppointments(r.data));
    bedAPI.listWards().then((r) => setWards(r.data));
  }, []);
  return (
    <div className="space-y-6">
      <PageHeader title="OPD / IPD" description="Outpatient flow, admissions, ward occupancy, and discharge readiness." actions={<Button><ClipboardList className="h-4 w-4" /> New Admission</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MiniMetric icon={ClipboardList} label="OPD visits" value={appointments.length} />
        <MiniMetric icon={Bed} label="IPD occupied" value={wards.reduce((s, w) => s + w.occupied_beds, 0)} tone="borderline" />
        <MiniMetric icon={Users} label="Registered patients" value={patients.length} tone="accent" />
        <MiniMetric icon={CheckCircle2} label="Ready discharge" value={2} tone="healthy" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="OPD Queue" description="Today and recent outpatient visits">
          <div className="divide-y divide-border">{appointments.map((a) => <div key={a.id} className="flex justify-between gap-3 p-4"><div><div className="font-medium">{a.patient_name}</div><div className="text-sm text-muted-foreground">{a.reason}</div></div><Badge variant={statusVariant(a.status)}>{label(a.status)}</Badge></div>)}</div>
        </SectionCard>
        <SectionCard title="IPD Capacity" description="Admission pressure by ward">
          <div className="divide-y divide-border">{wards.map((w) => <div key={w.id} className="p-4"><div className="flex justify-between text-sm"><span className="font-medium">{w.name}</span><span>{w.occupied_beds}/{w.total_beds}</span></div><div className="mt-2"><ProgressBar value={w.occupancy_rate} /></div></div>)}</div>
        </SectionCard>
      </div>
    </div>
  );
}

export function RoleDashboardPage({ role }: { role: 'Doctor' | 'Nurse' | 'Lab' | 'Pharmacy' | 'Reception' | 'Patient' | 'Super Admin' }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  useEffect(() => {
    appointmentAPI.list().then((r) => setAppointments(r.data));
    alertAPI.getActive().then((r) => setAlerts(r.data));
    patientAPI.list().then((r) => setPatients(r.data));
    tenantAPI.getCurrent().then((r) => setTenant(r.data));
  }, []);

  if (role === 'Patient') {
    return <PatientDashboard />;
  }
  if (role === 'Super Admin') {
    return (
      <div className="space-y-6">
        <PageHeader title="Platform Overview" description="SaaS tenant health, subscription status, and platform alerts." />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MiniMetric icon={Building2} label="Tenants" value={1} />
          <MiniMetric icon={Users} label="Patients served" value={tenant?.usage.patient_count.toLocaleString() ?? '-'} tone="accent" />
          <MiniMetric icon={CreditCard} label="Active plan" value={tenant?.plan ?? '-'} tone="healthy" />
          <MiniMetric icon={AlertTriangle} label="Platform alerts" value={alerts.length} tone="borderline" />
        </div>
        <SettingsModulePage />
      </div>
    );
  }

  const config: Record<typeof role, { icon: LucideIcon; primary: string; href: string }> = {
    Doctor: { icon: Stethoscope, primary: 'Consultation queue', href: '/doctor/appointments' },
    Nurse: { icon: HeartPulse, primary: 'Ward assignments', href: '/nurse/ward' },
    Lab: { icon: FlaskConical, primary: 'Pending lab samples', href: '/lab/pending' },
    Pharmacy: { icon: Pill, primary: 'Dispensing queue', href: '/pharmacy' },
    Reception: { icon: Users, primary: 'Front desk flow', href: '/reception/appointments' },
  };
  const CfgIcon = config[role].icon;

  return (
    <div className="space-y-6">
      <PageHeader title={`${role} Dashboard`} description={`${config[role].primary}, alerts, and today's operational priorities.`} actions={<Button asChild><Link href={config[role].href}>Open Workspace</Link></Button>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MiniMetric icon={CfgIcon} label={config[role].primary} value={role === 'Lab' ? 18 : role === 'Pharmacy' ? 7 : appointments.length} />
        <MiniMetric icon={Calendar} label="Appointments" value={appointments.length} tone="accent" />
        <MiniMetric icon={Users} label="Patients" value={patients.length} tone="healthy" />
        <MiniMetric icon={AlertTriangle} label="Active alerts" value={alerts.length} tone="critical" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Today at a Glance" description="Work queue generated from mock API">
          <div className="divide-y divide-border">{appointments.map((a) => <div key={a.id} className="flex items-center justify-between gap-3 p-4"><div><div className="font-medium">{a.patient_name}</div><div className="text-xs text-muted-foreground">{formatTime(a.scheduled_at)} · {a.reason}</div></div><Badge variant={statusVariant(a.status)}>{label(a.status)}</Badge></div>)}</div>
        </SectionCard>
        <SectionCard title="Priority Alerts" description="Unacknowledged work requiring attention">
          <div className="divide-y divide-border">{alerts.map((a) => <div key={a.id} className="p-4"><div className="flex justify-between gap-3"><div className="font-medium">{a.title}</div><Badge variant={statusVariant(a.severity)}>{a.severity}</Badge></div><div className="mt-1 text-sm text-muted-foreground">{a.message}</div></div>)}</div>
        </SectionCard>
      </div>
    </div>
  );
}

function PatientDashboard() {
  const [timeline, setTimeline] = useState<Array<{ id: string; title: string; description?: string; event_date: string; event_type: string }>>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  useEffect(() => {
    patientAPI.getHealthTimeline('patient-001').then((r) => setTimeline(r.data));
    appointmentAPI.list({ patient_id: 'patient-001' }).then((r) => setAppointments(r.data));
    billingAPI.list({ patient_id: 'patient-001' }).then((r) => setBills(r.data));
  }, []);
  return (
    <div className="space-y-6">
      <PageHeader title="My Health" description="Appointments, prescriptions, reports, bills, and emergency access." actions={<Button asChild variant="destructive"><Link href="/patient/sos">SOS Emergency</Link></Button>} />
      <div className="grid gap-4 sm:grid-cols-3">
        <MiniMetric icon={Calendar} label="Appointments" value={appointments.length} />
        <MiniMetric icon={CreditCard} label="Outstanding" value={formatBDT(bills.reduce((s, b) => s + b.amount_outstanding_bdt, 0))} tone="borderline" />
        <MiniMetric icon={ClipboardList} label="Timeline events" value={timeline.length} tone="healthy" />
      </div>
      <SectionCard title="Health Timeline" description="Recent care activity">
        <div className="divide-y divide-border">{timeline.map((t) => <div key={t.id} className="p-4"><div className="flex justify-between gap-3"><div><div className="font-medium">{t.title}</div><div className="text-sm text-muted-foreground">{t.description}</div></div><Badge variant="outline">{t.event_type}</Badge></div><div className="mt-1 text-xs text-muted-foreground">{formatRelative(t.event_date)}</div></div>)}</div>
      </SectionCard>
    </div>
  );
}
