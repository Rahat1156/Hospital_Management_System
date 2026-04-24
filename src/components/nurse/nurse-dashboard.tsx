'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AlertTriangle,
  Bed,
  Bell,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  FileText,
  FlaskConical,
  HeartPulse,
  LayoutGrid,
  Lock,
  Search,
  ShieldAlert,
  Siren,
  Stethoscope,
  Thermometer,
  UserRound,
  Users,
} from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PageHeader, SectionCard } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  nurseDashboardData,
  nurseDashboardSummary,
  type AssignedPatient,
  type BedStatusItem,
  type NurseAlert,
  type NurseAlertPriority,
  type PatientHistoryItem,
  type VitalReading,
  type WardOccupancy,
} from '@/lib/mock-data/nurse-dashboard';
import { cn, formatDate, formatDateTime, formatRelative } from '@/lib/utils';

const nurseSections = [
  { label: 'Overview', href: '/nurse' },
  { label: 'Assigned Patients', href: '/nurse/patients' },
  { label: 'Care Chart', href: '/nurse/care-chart' },
  { label: 'Vitals', href: '/nurse/vitals' },
  { label: 'Ward Status', href: '/nurse/ward' },
  { label: 'Alerts', href: '/nurse/alerts' },
  { label: 'History', href: '/nurse/history' },
];

function alertVariant(priority: NurseAlertPriority) {
  if (priority === 'critical') return 'critical';
  if (priority === 'high') return 'warning';
  if (priority === 'medium') return 'secondary';
  return 'outline';
}

function patientStatusVariant(status: AssignedPatient['currentStatus']) {
  if (status === 'Critical') return 'critical';
  if (status === 'Needs review') return 'warning';
  if (status === 'Stable') return 'healthy';
  return 'secondary';
}

function bedVariant(state: BedStatusItem['state']) {
  if (state === 'Occupied') return 'accent';
  if (state === 'Available') return 'healthy';
  if (state === 'Reserved') return 'warning';
  return 'secondary';
}

function historyVariant(type: PatientHistoryItem['type']) {
  if (type === 'lab_result') return 'critical';
  if (type === 'prescription') return 'accent';
  if (type === 'discharge_summary') return 'secondary';
  return 'outline';
}

function vitalsStatusVariant(status: VitalReading['status']) {
  if (status === 'Critical') return 'critical';
  if (status === 'Needs review') return 'warning';
  return 'healthy';
}

function NursePageLayout({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="relative space-y-5 pb-24 lg:space-y-6 lg:pb-8">
      <PageHeader title={title} description={description} actions={actions} />
      <NurseSectionNav />
      {children}
      <Link
        href="/nurse/alerts"
        className="fixed bottom-5 right-4 z-20 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-elevated transition hover:bg-primary/90 sm:right-6"
      >
        <Siren className="h-4 w-4" />
        Needs Attention
      </Link>
    </div>
  );
}

function NurseSectionNav() {
  const pathname = usePathname();
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex min-w-max gap-2 p-2">
        {nurseSections.map((section) => {
          const active = pathname === section.href;
          return (
            <Link
              key={section.href}
              href={section.href}
              className={cn(
                'rounded-xl px-3 py-2 text-sm font-medium transition',
                active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
              )}
            >
              {section.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = 'primary',
}: {
  label: string;
  value: string | number;
  helper: string;
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
          <p className="mt-2 text-sm text-muted-foreground">{helper}</p>
        </div>
        <div className={cn('rounded-2xl p-3', tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

function NurseHero() {
  const nurse = nurseDashboardData.nurse;
  return (
    <Card className="overflow-hidden border-primary/10 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.14),_transparent_38%),linear-gradient(135deg,rgba(11,79,108,0.06),rgba(255,255,255,0.85))] p-5 shadow-elevated lg:p-6">
      <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
        <div>
          <Badge variant="accent" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em]">
            Nurse workspace
          </Badge>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{nurse.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {nurse.role} / {nurse.ward}
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
            Built for active ward work with fast vitals entry, clear patient status, bed visibility, and calm alert handling across desktop, tablet, and mobile.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/nurse/vitals">Record Vitals</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/nurse/care-chart">View Care Chart</Link>
            </Button>
          </div>
        </div>
        <div className="rounded-2xl border border-white/60 bg-white/85 p-4 backdrop-blur">
          <p className="text-sm font-semibold text-foreground">Shift summary</p>
          <div className="mt-4 space-y-3 text-sm">
            <ShiftRow label="Assigned ward" value={nurse.ward} />
            <ShiftRow label="Shift" value={nurse.shift} />
            <ShiftRow label="Status" value={nurse.status} />
            <ShiftRow label="Session" value="Role-limited access active" />
          </div>
        </div>
      </div>
    </Card>
  );
}

function ShiftRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-secondary/60 px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function QuickActionPanel() {
  const actions = [
    { label: 'Record Vitals', href: '/nurse/vitals', helper: 'Fast entry during rounds', icon: HeartPulse },
    { label: 'View Patient Care Chart', href: '/nurse/care-chart', helper: 'Open nursing context', icon: ClipboardList },
    { label: 'View Ward Status', href: '/nurse/ward', helper: 'Bed map and occupancy', icon: Bed },
    { label: 'Open Patient Profile', href: '/nurse/patients', helper: 'Assigned patient list', icon: UserRound },
  ];

  return (
    <SectionCard title="Quick actions" description="The most common nursing tasks are reachable with one tap">
      <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="group rounded-2xl border border-border bg-background p-4 transition hover:border-primary/30 hover:bg-primary/5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="rounded-2xl bg-secondary p-3">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
              </div>
              <p className="mt-4 font-semibold text-foreground">{action.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{action.helper}</p>
            </Link>
          );
        })}
      </div>
    </SectionCard>
  );
}

function AssignedPatientCard({ patient }: { patient: AssignedPatient }) {
  return (
    <Card className="rounded-2xl border border-border p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-foreground">{patient.name}</h3>
            <Badge variant="outline">{patient.mrn}</Badge>
            <Badge variant={patientStatusVariant(patient.currentStatus)}>{patient.currentStatus}</Badge>
            {patient.alertState !== 'none' && (
              <Badge variant={patient.alertState === 'critical' ? 'critical' : 'warning'}>
                {patient.alertState}
              </Badge>
            )}
          </div>
          <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <div>{patient.age} years / {patient.gender}</div>
            <div>{patient.ward} / {patient.bed}</div>
            <div>{patient.careStage}</div>
            <div>Last vitals {formatRelative(patient.lastVitalsAt)}</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 lg:w-52 lg:flex-col">
          <Button asChild className="justify-between">
            <Link href="/nurse/care-chart">Open care chart</Link>
          </Button>
          <Button asChild variant="outline" className="justify-between">
            <Link href="/nurse/vitals">Record vitals</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

function AlertFeed({ alerts }: { alerts: NurseAlert[] }) {
  return (
    <div className="divide-y divide-border">
      {alerts.map((alert) => (
        <div key={alert.id} className={cn('flex gap-3 p-4', alert.unread && 'bg-primary/5')}>
          <div className={cn('mt-1 h-2.5 w-2.5 rounded-full', alert.priority === 'critical' ? 'bg-critical' : alert.priority === 'high' ? 'bg-borderline' : alert.priority === 'medium' ? 'bg-accent' : 'bg-border')} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-foreground">{alert.title}</p>
                  <Badge variant={alertVariant(alert.priority)}>{alert.priority}</Badge>
                  <Badge variant="outline">{alert.category}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{alert.detail}</p>
                {alert.patientName && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {alert.patientName} {alert.mrn ? `/ ${alert.mrn}` : ''}
                  </p>
                )}
              </div>
              <Badge variant={alert.status === 'resolved' ? 'healthy' : alert.status === 'acknowledged' ? 'warning' : 'critical'}>
                {alert.status}
              </Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{formatRelative(alert.timestamp)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function CareStageStepper({ patientId }: { patientId: string }) {
  const steps = nurseDashboardData.careStageByPatient[patientId] ?? [];
  return (
    <div className="grid gap-3">
      {steps.map((step, index) => (
        <div key={`${step.stage}-${index}`} className="rounded-2xl border border-border bg-background p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-semibold text-foreground">{step.stage}</p>
            <p className="text-sm text-muted-foreground">{formatDateTime(step.timestamp)}</p>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Responsible actor: {step.actor}</p>
        </div>
      ))}
    </div>
  );
}

function HistoryTimeline({ items }: { items: PatientHistoryItem[] }) {
  return (
    <div className="relative space-y-5 before:absolute before:left-[11px] before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-border sm:before:left-[19px]">
      {items.map((item) => (
        <div key={item.id} className="relative flex gap-4">
          <div className="relative z-10 mt-1 h-6 w-6 rounded-full border-4 border-background bg-primary shadow-sm sm:h-10 sm:w-10" />
          <div className="min-w-0 flex-1 rounded-3xl border border-border bg-card p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <Badge variant={historyVariant(item.type)}>{item.type.replace('_', ' ')}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{item.clinician}</p>
              </div>
              <p className="text-sm text-muted-foreground">{formatDate(item.date)}</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function VitalsTrendChart({ readings }: { readings: VitalReading[] }) {
  const chartData = readings.map((reading) => ({
    label: new Date(reading.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    temp: reading.temperatureC,
    systolic: reading.systolic,
    pulse: reading.pulse,
    spo2: reading.spo2,
  }));

  return (
    <div className="h-72 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.22)" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis tickLine={false} axisLine={false} fontSize={12} />
          <Tooltip />
          <Line type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="systolic" stroke="#0b4f6c" strokeWidth={3} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="pulse" stroke="#14b8a6" strokeWidth={3} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="spo2" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function VitalMetricCard({
  label,
  value,
  status,
  icon: Icon,
}: {
  label: string;
  value: string;
  status: VitalReading['status'];
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="rounded-2xl border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
          <p className="mt-3 text-2xl font-semibold text-foreground">{value}</p>
        </div>
        <div className="rounded-2xl bg-secondary p-3">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
      <div className="mt-4">
        <Badge variant={vitalsStatusVariant(status)}>{status}</Badge>
      </div>
    </Card>
  );
}

function WardBedGrid({ beds }: { beds: BedStatusItem[] }) {
  return (
    <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
      {beds.map((bed) => (
        <Card key={bed.id} className="rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-foreground">{bed.bedLabel}</p>
              <p className="text-sm text-muted-foreground">{bed.ward}</p>
            </div>
            <Badge variant={bedVariant(bed.state)}>{bed.state}</Badge>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            {bed.patientName ? (
              <>
                <p className="font-medium text-foreground">{bed.patientName}</p>
                <p>{bed.mrn}</p>
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

function AccessDeniedPattern() {
  return (
    <Card className="rounded-3xl border border-dashed border-border p-6 text-center shadow-sm">
      <Lock className="mx-auto h-8 w-8 text-muted-foreground" />
      <p className="mt-4 font-semibold text-foreground">Role-based access is active</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Billing, pharmacy, and admin controls are intentionally unavailable in the nurse dashboard.
      </p>
    </Card>
  );
}

export function NurseOverviewPage() {
  return (
    <NursePageLayout
      title="Overview"
      description="A shift-friendly nursing workspace for monitoring, vitals, patient movement, and alerts."
      actions={
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/nurse/vitals">Record Vitals</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/nurse/ward">Ward Status</Link>
          </Button>
        </div>
      }
    >
      <NurseHero />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total assigned patients" value={nurseDashboardData.assignedPatients.length} helper="Across OPD and IPD areas" icon={Users} />
        <MetricCard label="Vitals pending" value={nurseDashboardSummary.vitalsPending} helper="Patients needing prompt review" icon={HeartPulse} tone="warning" />
        <MetricCard label="Critical patients" value={nurseDashboardSummary.criticalPatients} helper="Keep close watch during rounds" icon={ShieldAlert} tone="critical" />
        <MetricCard label="Beds occupied" value={nurseDashboardSummary.occupiedBeds} helper="Mapped across visible wards" icon={Bed} tone="accent" />
      </div>
      <QuickActionPanel />
      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <div className="space-y-5">
          <SectionCard title="Today’s assigned patients" description="Patients currently under nursing watch">
            <div className="grid gap-4 p-4">
              {nurseDashboardData.assignedPatients.slice(0, 3).map((patient) => (
                <AssignedPatientCard key={patient.id} patient={patient} />
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Ward occupancy summary" description="At-a-glance bed pressure by ward">
            <div className="grid gap-4 p-4 lg:grid-cols-3">
              {nurseDashboardData.occupancy.map((ward) => {
                const occupancyRate = (ward.occupiedBeds / ward.totalBeds) * 100;
                return (
                  <Card key={ward.ward} className="rounded-2xl border border-border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-foreground">{ward.ward}</p>
                      <Badge variant={occupancyRate >= 80 ? 'warning' : 'healthy'}>
                        {occupancyRate.toFixed(0)}%
                      </Badge>
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                      <div className="flex justify-between"><span>Occupied</span><span>{ward.occupiedBeds}</span></div>
                      <div className="flex justify-between"><span>Reserved</span><span>{ward.reservedBeds}</span></div>
                      <div className="flex justify-between"><span>Maintenance</span><span>{ward.maintenanceBeds}</span></div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </SectionCard>
        </div>
        <div className="space-y-5">
          <SectionCard title="Patients needing vitals" description="Fast queue for active monitoring">
            <div className="space-y-3 p-4">
              {nurseDashboardSummary.patientsNeedingVitals.map((patient) => (
                <Card key={patient.id} className="rounded-2xl border border-border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{patient.name}</p>
                      <p className="text-sm text-muted-foreground">{patient.bed} / {patient.ward}</p>
                    </div>
                    <Badge variant={patientStatusVariant(patient.currentStatus)}>{patient.currentStatus}</Badge>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">Last vitals {formatRelative(patient.lastVitalsAt)}</p>
                </Card>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Active alerts feed" description="Urgent and non-urgent nursing notifications">
            <AlertFeed alerts={nurseDashboardData.alerts} />
          </SectionCard>
        </div>
      </div>
    </NursePageLayout>
  );
}

export function NursePatientsPage() {
  return (
    <NursePageLayout
      title="Assigned Patients"
      description="Find active patients quickly and jump into care chart or vitals workflows."
      actions={<Button variant="outline">Fast patient lookup</Button>}
    >
      <SectionCard title="Filters" description="Common nursing list views">
        <div className="flex flex-wrap gap-2 p-4">
          {['OPD', 'IPD admitted', 'Discharged', 'Critical', 'Needs vitals'].map((label, index) => (
            <Button key={label} variant={index === 0 ? 'default' : 'outline'} size="sm">
              {label}
            </Button>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Assigned patient list" description="Fast-read cards optimized for bedside use">
        <div className="space-y-4 p-4">
          <Input placeholder="Search by patient name, MRN, or bed..." leftIcon={<Search className="h-4 w-4" />} />
          {nurseDashboardData.assignedPatients.map((patient) => (
            <AssignedPatientCard key={patient.id} patient={patient} />
          ))}
        </div>
      </SectionCard>
    </NursePageLayout>
  );
}

export function NurseCareChartPage() {
  const patient = nurseDashboardData.assignedPatients[0];
  const history = nurseDashboardData.patientHistory[patient.id] ?? [];
  const dischargePreview = nurseDashboardData.dischargeSummaries.find((item) => item.patientId === patient.id);

  return (
    <NursePageLayout
      title="Care Chart"
      description="Rapid nursing context with patient summary, stages, history, labs, prescriptions, and notes."
      actions={<Button asChild><Link href="/nurse/vitals">Record vitals</Link></Button>}
    >
      <Card className="p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold text-foreground">{patient.name}</h2>
              <Badge variant="outline">{patient.mrn}</Badge>
              <Badge variant={patientStatusVariant(patient.currentStatus)}>{patient.currentStatus}</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {patient.age} years / {patient.gender} / Blood group {patient.bloodGroup}
            </p>
          </div>
          <Badge variant="accent">{patient.careStage}</Badge>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ProfileChip label="Allergies" value={patient.allergies.join(', ')} />
          <ProfileChip label="Emergency contact" value={`${patient.emergencyContact.name} (${patient.emergencyContact.relationship})`} />
          <ProfileChip label="Phone" value={patient.emergencyContact.phone} />
          <ProfileChip label="Admission date" value={formatDate(patient.admissionDate)} />
          <ProfileChip label="Assigned bed" value={`${patient.ward} / ${patient.bed}`} />
          <ProfileChip label="Expected discharge" value={patient.expectedDischarge ? formatDate(patient.expectedDischarge) : 'Not set'} />
        </div>
      </Card>
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard title="Current care stage" description="Registration, OPD, admission, and discharge visibility">
          <div className="p-4">
            <CareStageStepper patientId={patient.id} />
          </div>
        </SectionCard>
        <SectionCard title="Health history timeline preview" description="Reverse chronological context for nursing care">
          <div className="p-4 sm:p-6">
            <HistoryTimeline items={history} />
          </div>
        </SectionCard>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="Care chart area" description="Nursing-focused quick view of recent care inputs">
          <div className="grid gap-3 p-4 sm:grid-cols-2">
            <Card className="rounded-2xl border border-border p-4">
              <p className="font-semibold text-foreground">Recent notes</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Patient resting comfortably. Oral intake improving. Continue 4-hour glucose checks and fluid chart.
              </p>
            </Card>
            <Card className="rounded-2xl border border-border p-4">
              <p className="font-semibold text-foreground">Recent prescriptions preview</p>
              {nurseDashboardData.recentPrescriptions
                .filter((item) => item.patientId === patient.id)
                .map((item) => (
                  <p key={item.item} className="mt-2 text-sm text-muted-foreground">{item.item} / {item.by}</p>
                ))}
            </Card>
            <Card className="rounded-2xl border border-border p-4">
              <p className="font-semibold text-foreground">Recent lab reports preview</p>
              {nurseDashboardData.recentLabs
                .filter((item) => item.patientId === patient.id)
                .map((item) => (
                  <div key={item.item} className="mt-2 flex items-center gap-2 text-sm">
                    <Badge variant={item.flag === 'critical' ? 'critical' : 'warning'}>{item.flag}</Badge>
                    <span className="text-muted-foreground">{item.item}</span>
                  </div>
                ))}
            </Card>
            <Card className="rounded-2xl border border-border p-4">
              <p className="font-semibold text-foreground">Discharge summary preview</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {dischargePreview?.preview ?? 'No discharge summary available yet for this patient.'}
              </p>
            </Card>
          </div>
        </SectionCard>
        <AccessDeniedPattern />
      </div>
    </NursePageLayout>
  );
}

function ProfileChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

export function NurseVitalsPage() {
  const patient = nurseDashboardData.assignedPatients[1];
  const readings = nurseDashboardData.vitalsByPatient[patient.id] ?? [];
  const latest = readings[readings.length - 1];

  return (
    <NursePageLayout
      title="Vitals"
      description="Fast vitals recording with timestamps, nurse attribution, validation states, and trend review."
      actions={<Button>Save vitals</Button>}
    >
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard title="Vitals entry workflow" description="Optimized for rapid IPD entry during rounds">
          <div className="space-y-4 p-4">
            <Card className="rounded-2xl border border-border p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-foreground">{patient.name}</p>
                <Badge variant="outline">{patient.mrn}</Badge>
                <Badge variant={patientStatusVariant(patient.currentStatus)}>{patient.currentStatus}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{patient.ward} / {patient.bed}</p>
            </Card>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input defaultValue="37.9" aria-label="Temperature" />
              <Input defaultValue="146/90" aria-label="Blood pressure" />
              <Input defaultValue="102" aria-label="Pulse" />
              <Input defaultValue="95" aria-label="Oxygen saturation" />
              <Input defaultValue="2026-04-24T10:05" type="datetime-local" aria-label="Timestamp" />
              <Input defaultValue={nurseDashboardData.nurse.name} aria-label="Recorded by" />
            </div>
            <div className="rounded-2xl border border-border bg-secondary/20 p-4 text-sm text-muted-foreground">
              Validation state: abnormal values are highlighted in the trend and recent history below before save.
            </div>
          </div>
        </SectionCard>
        <SectionCard title="Latest metrics" description="Clinical scan view for the most recent entry">
          <div className="grid gap-3 p-4 sm:grid-cols-2">
            <VitalMetricCard label="Temperature" value={`${latest.temperatureC.toFixed(1)} C`} status={latest.status} icon={Thermometer} />
            <VitalMetricCard label="Blood pressure" value={`${latest.systolic}/${latest.diastolic} mmHg`} status={latest.status} icon={HeartPulse} />
            <VitalMetricCard label="Pulse" value={`${latest.pulse} bpm`} status={latest.status} icon={HeartPulse} />
            <VitalMetricCard label="SpO2" value={`${latest.spo2}%`} status={latest.status} icon={Stethoscope} />
          </div>
        </SectionCard>
      </div>
      <SectionCard title="Vitals trends and monitoring" description="Recent readings with clinical status markers">
        <div className="flex flex-wrap gap-2 px-4 pt-4">
          {['Last 6 hours', 'Last 24 hours', 'Last 3 days'].map((label, index) => (
            <Button key={label} size="sm" variant={index === 0 ? 'default' : 'outline'}>
              {label}
            </Button>
          ))}
        </div>
        <VitalsTrendChart readings={readings} />
      </SectionCard>
      <SectionCard title="Recent vitals history" description="Timestamped history with nurse attribution">
        <div className="overflow-x-auto p-4">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-border bg-secondary/30 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-3">Timestamp</th>
                <th className="px-3 py-3">Temp</th>
                <th className="px-3 py-3">BP</th>
                <th className="px-3 py-3">Pulse</th>
                <th className="px-3 py-3">SpO2</th>
                <th className="px-3 py-3">Recorded by</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {readings.map((reading) => (
                <tr key={reading.timestamp} className="hover:bg-secondary/20">
                  <td className="px-3 py-3">{formatDateTime(reading.timestamp)}</td>
                  <td className="px-3 py-3">{reading.temperatureC.toFixed(1)} C</td>
                  <td className="px-3 py-3">{reading.systolic}/{reading.diastolic}</td>
                  <td className="px-3 py-3">{reading.pulse}</td>
                  <td className="px-3 py-3">{reading.spo2}%</td>
                  <td className="px-3 py-3">{reading.recordedBy}</td>
                  <td className="px-3 py-3"><Badge variant={vitalsStatusVariant(reading.status)}>{reading.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </NursePageLayout>
  );
}

export function NurseWardPage() {
  return (
    <NursePageLayout
      title="Ward Status"
      description="Bed mapping, occupancy visibility, and quick awareness of ward pressure and patient placement."
      actions={<Button variant="outline">Refresh ward view</Button>}
    >
      <SectionCard title="Occupancy summary by ward" description="Threshold visibility when occupancy rises">
        <div className="grid gap-4 p-4 lg:grid-cols-3">
          {nurseDashboardData.occupancy.map((ward: WardOccupancy) => {
            const rate = (ward.occupiedBeds / ward.totalBeds) * 100;
            return (
              <Card key={ward.ward} className="rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-foreground">{ward.ward}</p>
                  <Badge variant={rate >= 80 ? 'warning' : 'healthy'}>{rate.toFixed(0)}%</Badge>
                </div>
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between"><span>Occupied</span><span>{ward.occupiedBeds}</span></div>
                  <div className="flex justify-between"><span>Reserved</span><span>{ward.reservedBeds}</span></div>
                  <div className="flex justify-between"><span>Maintenance</span><span>{ward.maintenanceBeds}</span></div>
                </div>
              </Card>
            );
          })}
        </div>
      </SectionCard>
      <SectionCard title="Ward and bed grid" description="Patient-to-bed mapping with bed status states">
        <WardBedGrid beds={nurseDashboardData.beds} />
      </SectionCard>
    </NursePageLayout>
  );
}

export function NurseAlertsPage() {
  return (
    <NursePageLayout
      title="Alerts"
      description="Critical labs, ward alerts, patient-specific reminders, and role-appropriate system notices."
      actions={<Button variant="outline">Mark unit alerts reviewed</Button>}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Critical" value={nurseDashboardData.alerts.filter((alert) => alert.priority === 'critical').length} helper="Urgent care staff visibility" icon={ShieldAlert} tone="critical" />
        <MetricCard label="Unread" value={nurseDashboardData.alerts.filter((alert) => alert.unread).length} helper="Still needs acknowledgment" icon={Bell} tone="warning" />
        <MetricCard label="Ward alerts" value={nurseDashboardData.alerts.filter((alert) => alert.category === 'Ward').length} helper="Operational bed and unit signals" icon={Bed} tone="accent" />
        <MetricCard label="Resolved" value={nurseDashboardData.alerts.filter((alert) => alert.status === 'resolved').length} helper="Closed items during shift" icon={CheckCircle2} tone="healthy" />
      </div>
      <SectionCard title="Alert center" description="Easy to scan without visual chaos">
        <AlertFeed alerts={nurseDashboardData.alerts} />
      </SectionCard>
    </NursePageLayout>
  );
}

export function NurseHistoryPage() {
  const historyItems = Object.values(nurseDashboardData.patientHistory).flat().sort((a, b) => +new Date(b.date) - +new Date(a.date));
  return (
    <NursePageLayout
      title="History"
      description="Fast-read reverse chronological patient context for visits, diagnoses, labs, reports, prescriptions, and discharges."
      actions={<Button variant="outline">Filter patient history</Button>}
    >
      <SectionCard title="Patient history access" description="Nursing context without doctor-only prescribing focus">
        <div className="p-4 sm:p-6">
          <HistoryTimeline items={historyItems} />
        </div>
      </SectionCard>
    </NursePageLayout>
  );
}
