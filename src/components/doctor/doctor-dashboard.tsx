'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  FileClock,
  FileText,
  FlaskConical,
  HeartPulse,
  LayoutGrid,
  LifeBuoy,
  PlayCircle,
  Search,
  ShieldAlert,
  ShieldCheck,
  Signature,
  Siren,
  Stethoscope,
  Tablet,
  TimerReset,
  Users,
  Video,
  Wallet,
} from 'lucide-react';
import {
  Bar,
  BarChart,
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
  doctorDashboardData,
  doctorDashboardSummary,
  type DoctorAlert,
  type DoctorAlertPriority,
  type DoctorAppointment,
  type DrugInteractionWarning,
  type FollowUpItem,
  type LabResult,
  type PatientSummary,
  type PatientTimelineItem,
  type PrescriptionRecord,
  type ScheduleSlot,
} from '@/lib/mock-data/doctor-dashboard';
import { cn, formatBDT, formatDate, formatRelative } from '@/lib/utils';

const doctorSections = [
  { label: 'Overview', href: '/doctor' },
  { label: 'Patient Queue', href: '/doctor/appointments' },
  { label: 'Patients', href: '/doctor/patients' },
  { label: 'Schedule', href: '/doctor/schedule' },
  { label: 'Prescriptions', href: '/doctor/prescriptions' },
  { label: 'Lab Results', href: '/doctor/lab-orders' },
  { label: 'Alerts', href: '/doctor/alerts' },
  { label: 'Performance', href: '/doctor/performance' },
];

function alertVariant(priority: DoctorAlertPriority) {
  if (priority === 'critical') return 'critical';
  if (priority === 'high') return 'warning';
  if (priority === 'medium') return 'secondary';
  return 'outline';
}

function appointmentVariant(status: DoctorAppointment['status']) {
  if (status === 'checked_in' || status === 'in_consultation') return 'healthy';
  if (status === 'waiting' || status === 'upcoming') return 'warning';
  return 'secondary';
}

function labVariant(flag: LabResult['flag']) {
  if (flag === 'critical') return 'critical';
  if (flag === 'borderline') return 'warning';
  return 'healthy';
}

function followUpVariant(status: FollowUpItem['status']) {
  if (status === 'new') return 'critical';
  if (status === 'acknowledged') return 'warning';
  return 'healthy';
}

function scheduleVariant(status: ScheduleSlot['status']) {
  if (status === 'available') return 'healthy';
  if (status === 'booked') return 'accent';
  if (status === 'break') return 'warning';
  return 'secondary';
}

function teleVariant(status?: DoctorAppointment['teleStatus']) {
  if (status === 'live') return 'critical';
  if (status === 'ready') return 'healthy';
  return 'secondary';
}

function timelineVariant(type: PatientTimelineItem['type']) {
  if (type === 'lab_report') return 'critical';
  if (type === 'prescription') return 'accent';
  if (type === 'diagnosis') return 'warning';
  return 'secondary';
}

function DoctorPageLayout({
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
      <DoctorSectionNav />
      {children}
      <Link
        href="/doctor/alerts"
        className="fixed bottom-5 right-4 z-20 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-elevated transition hover:bg-primary/90 sm:right-6"
      >
        <Siren className="h-4 w-4" />
        Critical Alerts
      </Link>
    </div>
  );
}

function DoctorSectionNav() {
  const pathname = usePathname();
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex min-w-max gap-2 p-2">
        {doctorSections.map((section) => {
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

function DoctorHero() {
  const doctor = doctorDashboardData.doctor;
  return (
    <Card className="overflow-hidden border-primary/10 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.14),_transparent_38%),linear-gradient(135deg,rgba(11,79,108,0.06),rgba(255,255,255,0.85))] p-5 shadow-elevated lg:p-6">
      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <Badge variant="accent" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em]">
            Doctor workspace
          </Badge>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{doctor.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {doctor.specialty} / {doctor.bmdc}
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
            Designed for quick consultations, safe prescribing, and fast review of alerts, history, labs, and follow-up work.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/doctor/appointments">Start consultation</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/doctor/prescriptions">Create prescription</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/doctor/schedule">Manage schedule</Link>
            </Button>
          </div>
        </div>
        <div className="rounded-2xl border border-white/60 bg-white/85 p-4 backdrop-blur">
          <p className="text-sm font-semibold text-foreground">Today at a glance</p>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-secondary/60 px-3 py-2">
              <span className="text-muted-foreground">Hospital</span>
              <span className="font-medium text-foreground">{doctor.hospital}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-secondary/60 px-3 py-2">
              <span className="text-muted-foreground">Shift</span>
              <span className="font-medium text-foreground">{doctor.shift}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-secondary/60 px-3 py-2">
              <span className="text-muted-foreground">Next break</span>
              <span className="font-medium text-foreground">{doctor.nextBreak}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-secondary/60 px-3 py-2">
              <span className="text-muted-foreground">Urgent items</span>
              <Badge variant="critical">{doctorDashboardSummary.criticalAlerts.length} active</Badge>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function QuickActions() {
  const actions = [
    { label: 'Start Consultation', href: '/doctor/appointments', helper: 'Open patient queue', icon: PlayCircle },
    { label: 'Create Prescription', href: '/doctor/prescriptions', helper: 'Safe prescribing workflow', icon: FileText },
    { label: 'View Patient History', href: '/doctor/patients', helper: 'Open consultation context', icon: Users },
    { label: 'Manage Schedule', href: '/doctor/schedule', helper: 'Adjust slots and breaks', icon: Calendar },
  ];

  return (
    <SectionCard title="Quick actions" description="Common doctor workflows optimized for minimal clicks">
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

function AlertFeed({
  alerts,
  compact = false,
}: {
  alerts: DoctorAlert[];
  compact?: boolean;
}) {
  return (
    <div className={cn('divide-y divide-border', compact && 'max-h-[420px] overflow-y-auto')}>
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
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={alert.status === 'resolved' ? 'healthy' : alert.status === 'acknowledged' ? 'warning' : 'critical'}>{alert.status}</Badge>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{formatRelative(alert.at)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function AppointmentCard({ appointment }: { appointment: DoctorAppointment }) {
  return (
    <Card className="rounded-2xl border border-border p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-foreground">{appointment.patientName}</h3>
            <Badge variant="outline">{appointment.mrn}</Badge>
            <Badge variant={appointmentVariant(appointment.status)}>{appointment.status.replace('_', ' ')}</Badge>
            <Badge variant="secondary">{appointment.visitType}</Badge>
            {appointment.visitType === 'Teleconsultation' && appointment.teleStatus && (
              <Badge variant={teleVariant(appointment.teleStatus)}>Video {appointment.teleStatus}</Badge>
            )}
          </div>
          <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-primary" />
              {appointment.time}
            </div>
            <div className="flex items-center gap-2">
              {appointment.visitType === 'Teleconsultation' ? <Video className="h-4 w-4 text-primary" /> : <Stethoscope className="h-4 w-4 text-primary" />}
              {appointment.room}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{appointment.concern}</p>
        </div>
        <div className="flex flex-wrap gap-2 lg:w-52 lg:flex-col">
          <Button asChild className="justify-between">
            <Link href="/doctor/patients">Open consultation</Link>
          </Button>
          <Button variant="outline" className="justify-between">
            Details
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function LabResultCard({ result }: { result: LabResult }) {
  return (
    <Card
      className={cn(
        'rounded-2xl border p-4',
        result.flag === 'critical' && 'border-critical/40 bg-critical/5',
        result.flag === 'borderline' && 'border-borderline/40 bg-borderline/5',
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-foreground">{result.testName}</p>
            <Badge variant={labVariant(result.flag)}>{result.flag}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.patientName} / {result.mrn}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">{formatDate(result.date)}</p>
      </div>
      <p className="mt-4 text-2xl font-semibold text-foreground">{result.value}</p>
      <p className="mt-1 text-sm text-muted-foreground">Reference: {result.referenceRange}</p>
      <p className="mt-3 text-sm text-muted-foreground">{result.detail}</p>
    </Card>
  );
}

function PatientSummaryCard({ patient }: { patient: PatientSummary }) {
  return (
    <Card className="p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold text-foreground">{patient.name}</h2>
            <Badge variant="outline">{patient.mrn}</Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {patient.age} years / {patient.gender} / Blood group {patient.bloodGroup}
          </p>
        </div>
        <Badge variant="accent">{patient.currentCareStage}</Badge>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ProfileChip label="Allergies" value={patient.allergies.join(', ')} />
        <ProfileChip label="Emergency contact" value={`${patient.emergencyContact.name} (${patient.emergencyContact.relationship})`} />
        <ProfileChip label="Phone" value={patient.emergencyContact.phone} />
        <ProfileChip label="Diagnosis summary" value={patient.diagnosisSummary} />
      </div>
    </Card>
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

function HealthTimeline({ items }: { items: PatientTimelineItem[] }) {
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
                  <Badge variant={timelineVariant(item.type)}>{item.type.replace('_', ' ')}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.location} / {item.clinician}
                </p>
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

function DrugSearchPanel() {
  return (
    <SectionCard title="Drug search and safety assistant" description="Fast lookup with visible contraindications">
      <div className="space-y-4 p-4">
        <Input placeholder="Search generic or brand name..." leftIcon={<Search className="h-4 w-4" />} />
        <div className="grid gap-3 lg:grid-cols-2">
          {doctorDashboardData.drugDatabase.map((drug) => (
            <Card key={drug.id} className="rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">{drug.genericName}</p>
                  <p className="text-sm text-muted-foreground">{drug.brandName}</p>
                </div>
                <Badge variant="outline">{drug.dosage}</Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {drug.contraindications.map((item) => (
                  <Badge key={`${drug.id}-${item}`} variant="warning">
                    {item}
                  </Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}

function InteractionWarningBanner({ warning }: { warning: DrugInteractionWarning }) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-4',
        warning.severity === 'blocking' ? 'border-critical/40 bg-critical/5' : 'border-borderline/40 bg-borderline/5',
      )}
    >
      <div className="flex items-start gap-3">
        <ShieldAlert className={cn('mt-0.5 h-5 w-5', warning.severity === 'blocking' ? 'text-critical' : 'text-borderline')} />
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-foreground">{warning.title}</p>
            <Badge variant={warning.severity === 'blocking' ? 'critical' : 'warning'}>{warning.severity}</Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{warning.detail}</p>
          {warning.requiresAcknowledgement && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-sm text-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Explicit acknowledgment required before sign and send.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function DoctorOverviewPage() {
  return (
    <DoctorPageLayout
      title="Overview"
      description="A fast clinical workspace for consultations, prescribing, labs, and alerts."
      actions={
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/doctor/appointments">Start Consultation</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/doctor/prescriptions">Create Prescription</Link>
          </Button>
        </div>
      }
    >
      <DoctorHero />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Patients seen today" value={14} helper="Running clinic total" icon={Users} />
        <MetricCard label="Appointments scheduled" value={22} helper="Includes OPD and tele" icon={Calendar} tone="accent" />
        <MetricCard label="Pending reports" value={5} helper="Needs review before close of shift" icon={FlaskConical} tone="warning" />
        <MetricCard label="Prescriptions issued" value={11} helper="Signed and sent today" icon={FileText} tone="healthy" />
      </div>
      <QuickActions />
      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <div className="space-y-5">
          <SectionCard title="Today's appointment summary" description="Current queue, tele readiness, and next consultations">
            <div className="grid gap-4 p-4">
              {doctorDashboardSummary.todaysAppointments.slice(0, 3).map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Recent lab result updates" description="Critical and borderline results linked to patients">
            <div className="grid gap-4 p-4 lg:grid-cols-2">
              {doctorDashboardSummary.recentLabs.map((result) => (
                <LabResultCard key={result.id} result={result} />
              ))}
            </div>
          </SectionCard>
        </div>
        <div className="space-y-5">
          <SectionCard title="Pending follow-ups" description="Doctor-set reminders and unresolved tasks">
            <div className="space-y-3 p-4">
              {doctorDashboardData.followUps.map((item) => (
                <Card key={item.id} className="rounded-2xl border border-border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{item.patientName}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.mrn} / {item.reason}
                      </p>
                    </div>
                    <Badge variant={alertVariant(item.priority)}>{item.priority}</Badge>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{formatRelative(item.dueAt)}</p>
                    <Badge variant={followUpVariant(item.status)}>{item.status}</Badge>
                  </div>
                </Card>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Notifications" description="Urgent and non-urgent items during clinic">
            <AlertFeed alerts={doctorDashboardData.alerts} compact />
          </SectionCard>
        </div>
      </div>
    </DoctorPageLayout>
  );
}

export function DoctorAppointmentsPage() {
  const todays = doctorDashboardData.appointments.filter((item) => item.date === '2026-04-24');
  const upcoming = doctorDashboardData.appointments.filter((item) => item.status === 'upcoming' || item.status === 'waiting');
  const completed = doctorDashboardData.appointments.filter((item) => item.status === 'completed');
  const tele = doctorDashboardData.appointments.filter((item) => item.visitType === 'Teleconsultation');

  return (
    <DoctorPageLayout
      title="Patient Queue"
      description="Manage today's consultation flow, appointment status, and teleconsultation readiness."
      actions={<Button>Start next patient</Button>}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Today" value={todays.length} helper="Patients in clinic flow" icon={LayoutGrid} />
        <MetricCard label="Upcoming" value={upcoming.length} helper="Waiting and later slots" icon={Clock3} tone="accent" />
        <MetricCard label="Completed" value={completed.length} helper="Visits completed recently" icon={CheckCircle2} tone="healthy" />
        <MetricCard label="Teleconsultation" value={tele.length} helper="Remote slots and video status" icon={Video} tone="warning" />
      </div>
      <SectionCard title="Filters" description="Quick queue segmentation during busy hours">
        <div className="flex flex-wrap gap-2 p-4">
          {['Today', 'Upcoming', 'Completed', 'Teleconsultation'].map((label) => (
            <Button key={label} variant={label === 'Today' ? 'default' : 'outline'} size="sm">
              {label}
            </Button>
          ))}
        </div>
      </SectionCard>
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard title="Appointment list" description="Click into consultation details or open the patient chart">
          <div className="grid gap-4 p-4">
            {doctorDashboardData.appointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Appointment detail" description="Focused view for next patient">
          <div className="space-y-4 p-4">
            <Card className="rounded-2xl border border-border p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-foreground">Hasib Rahman</p>
                <Badge variant="outline">HAX-51244</Badge>
                <Badge variant="warning">waiting</Badge>
                <Badge variant="healthy">Video ready</Badge>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">Teleconsultation at 10:00 AM for post-discharge weakness and medication review.</p>
              <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-primary" />
                  Link status active, patient joined waiting room
                </div>
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-primary" />
                  Queue time 8 minutes
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button className="flex-1">Open consultation</Button>
                <Button variant="outline" className="flex-1">View history</Button>
              </div>
            </Card>
            <Card className="rounded-2xl border border-border p-4">
              <p className="font-semibold text-foreground">Workflow note</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Designed as a detail drawer/page placeholder for production integration with encounter notes, orders, and video visit controls.
              </p>
            </Card>
          </div>
        </SectionCard>
      </div>
    </DoctorPageLayout>
  );
}

export function DoctorPatientsPage() {
  const patient = doctorDashboardData.patients[0];
  return (
    <DoctorPageLayout
      title="Patients"
      description="Open patient details with immediate clinical context for fast, safe consultations."
      actions={<Button variant="outline">Search patient</Button>}
    >
      <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <SectionCard title="Patient list" description="Recent and active patients in your care">
          <div className="space-y-3 p-4">
            <Input placeholder="Search by name or MRN..." leftIcon={<Search className="h-4 w-4" />} />
            {doctorDashboardData.patients.map((item) => (
              <Card key={item.id} className={cn('rounded-2xl border p-4', item.id === patient.id ? 'border-primary/30 bg-primary/5' : 'border-border')}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.mrn} / {item.currentCareStage}
                    </p>
                  </div>
                  <Badge variant="outline">{item.age}y</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{item.diagnosisSummary}</p>
              </Card>
            ))}
          </div>
        </SectionCard>
        <div className="space-y-5">
          <PatientSummaryCard patient={patient} />
          <div className="grid gap-5 xl:grid-cols-[1fr_0.95fr]">
            <SectionCard title="Health history timeline" description="Reverse chronological visit and treatment history">
              <div className="p-4 sm:p-6">
                <HealthTimeline items={patient.timeline} />
              </div>
            </SectionCard>
            <div className="space-y-5">
              <SectionCard title="Recent vitals" description="Most recent measurements for quick review">
                <div className="grid gap-3 p-4 sm:grid-cols-2">
                  {patient.recentVitals.map((item) => (
                    <ProfileChip key={item.label} label={item.label} value={item.value} />
                  ))}
                </div>
              </SectionCard>
              <SectionCard title="Lab summary preview" description="Most recent patient-linked results">
                <div className="space-y-3 p-4">
                  {patient.labPreview.map((item) => (
                    <div key={item.test} className="rounded-2xl border border-border p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="font-semibold text-foreground">{item.test}</p>
                        <Badge variant={labVariant(item.flag)}>{item.flag}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{item.result}</p>
                    </div>
                  ))}
                </div>
              </SectionCard>
              <SectionCard title="Clinical notes" description="Consultation speed placeholder">
                <div className="p-4">
                  <div className="rounded-2xl border border-dashed border-border bg-secondary/20 p-4 text-sm text-muted-foreground">
                    {patient.notesPlaceholder}
                  </div>
                </div>
              </SectionCard>
            </div>
          </div>
          <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <SectionCard title="Recent vitals trend" description="Quick graph during consultation">
              <div className="h-72 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={patient.vitalsTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.22)" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="systolic" stroke="#0b4f6c" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="diastolic" stroke="#14b8a6" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="pulse" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
            <SectionCard title="OPD/IPD care journey" description="Current stage, treatment, and discharge context">
              <div className="space-y-3 p-4">
                {['Registration', 'OPD', 'IPD admitted', 'Discharged'].map((stage) => (
                  <div
                    key={stage}
                    className={cn(
                      'rounded-2xl border p-4 text-sm',
                      stage === patient.currentCareStage ? 'border-primary/30 bg-primary/10 text-primary' : 'border-border bg-background text-muted-foreground',
                    )}
                  >
                    <div className="font-semibold">{stage}</div>
                  </div>
                ))}
                <Card className="rounded-2xl border border-border p-4">
                  <p className="font-semibold text-foreground">Treatment summary</p>
                  <p className="mt-2 text-sm text-muted-foreground">{patient.treatmentSummary}</p>
                </Card>
                <Card className="rounded-2xl border border-border p-4">
                  <p className="font-semibold text-foreground">Discharge summary preview</p>
                  <p className="mt-2 text-sm text-muted-foreground">{patient.dischargePreview}</p>
                </Card>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </DoctorPageLayout>
  );
}

export function DoctorSchedulePage() {
  return (
    <DoctorPageLayout
      title="Schedule"
      description="Manage availability, breaks, appointment duration, and teleconsultation slots."
      actions={<Button>Save schedule</Button>}
    >
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard title="Schedule controls" description="Core outpatient timing and slot settings">
          <div className="space-y-4 p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <ProfileChip label="Available hours" value="09:00 AM - 05:00 PM" />
              <ProfileChip label="Break time" value="01:15 PM - 01:45 PM" />
              <ProfileChip label="Appointment duration" value="15 minutes" />
              <ProfileChip label="Specialty slots" value="Internal Medicine / Follow-up Clinic" />
            </div>
            <div className="grid gap-2">
              <Button variant="outline" className="justify-between">
                Toggle morning availability
                <CheckCircle2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="justify-between">
                Add teleconsultation block
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="justify-between">
                Update break time
                <TimerReset className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SectionCard>
        <SectionCard title="Weekly calendar" description="Desktop and tablet-friendly schedule overview">
          <div className="grid gap-3 p-4 lg:grid-cols-2">
            {doctorDashboardData.schedule.map((slot, index) => (
              <Card key={`${slot.day}-${slot.start}-${index}`} className="rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">
                      {slot.day} / {slot.date}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {slot.start} - {slot.end}
                    </p>
                  </div>
                  <Badge variant={scheduleVariant(slot.status)}>{slot.status}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{slot.mode}</Badge>
                  <Badge variant="secondary">{slot.specialty}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </SectionCard>
      </div>
    </DoctorPageLayout>
  );
}

function PrescriptionSummary({ record }: { record: PrescriptionRecord }) {
  return (
    <Card className="rounded-3xl border border-border p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-foreground">Prescription summary</p>
          <p className="text-sm text-muted-foreground">
            {record.patientName} / {record.mrn}
          </p>
        </div>
        <Badge variant="warning">{record.status}</Badge>
      </div>
      <div className="mt-4 space-y-3 text-sm">
        <div className="rounded-2xl border border-border bg-background p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Diagnosis</p>
          <p className="mt-2 text-foreground">{record.diagnosis}</p>
        </div>
        <div className="rounded-2xl border border-border bg-background p-4">
          <div className="flex items-center gap-2">
            <Signature className="h-4 w-4 text-primary" />
            <p className="font-medium text-foreground">Doctor e-signature ready</p>
          </div>
          <p className="mt-2 text-muted-foreground">Signature certificate synced. Sign step required before send.</p>
        </div>
      </div>
    </Card>
  );
}

export function DoctorPrescriptionsPage() {
  const draft = doctorDashboardData.prescriptionDraft;
  return (
    <DoctorPageLayout
      title="Prescriptions"
      description="Fast and safe prescription creation with drug lookup, interaction warnings, and signature workflow."
      actions={<Button>Save draft</Button>}
    >
      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-5">
          <SectionCard title="Prescription composer" description="Patient info, diagnosis, medicines, and instructions">
            <div className="space-y-4 p-4">
              <Card className="rounded-2xl border border-border p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-foreground">{draft.patientName}</p>
                  <Badge variant="outline">{draft.mrn}</Badge>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">Patient info header for current consultation encounter.</p>
              </Card>
              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Diagnosis</p>
                <p className="mt-2 text-sm text-foreground">{draft.diagnosis}</p>
              </div>
              <div className="grid gap-4">
                {draft.medicines.map((medicine, index) => (
                  <Card key={`${medicine.drugName}-${index}`} className="rounded-2xl border border-border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{medicine.drugName}</p>
                        <p className="text-sm text-muted-foreground">
                          {medicine.genericName} / {medicine.brandName}
                        </p>
                      </div>
                      <Badge variant="outline">{medicine.dosage}</Badge>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <ProfileChip label="Frequency" value={medicine.frequency} />
                      <ProfileChip label="Duration" value={medicine.duration} />
                      <ProfileChip label="Contraindications" value={medicine.contraindications} />
                      <ProfileChip label="Special instructions" value={medicine.specialInstructions} />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </SectionCard>
          <DrugSearchPanel />
          <SectionCard title="Interaction warnings" description="Highly visible safety checks that block unsafe prescribing">
            <div className="space-y-3 p-4">
              {doctorDashboardData.interactionWarnings.map((warning) => (
                <InteractionWarningBanner key={warning.title} warning={warning} />
              ))}
            </div>
          </SectionCard>
        </div>
        <div className="space-y-5">
          <PrescriptionSummary record={draft} />
          <SectionCard title="Actions" description="Save, sign, send, and PDF workflow">
            <div className="grid gap-2 p-4">
              <Button className="justify-between">
                Save draft
                <FileClock className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="justify-between">
                Sign prescription
                <Signature className="h-4 w-4" />
              </Button>
              <Button variant="accent" className="justify-between">
                Send to patient
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="justify-between">
                PDF placeholder
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </SectionCard>
          <SectionCard title="Prescription history" description="Recent drafts, signed items, and sent records">
            <div className="space-y-3 p-4">
              {doctorDashboardData.prescriptionHistory.map((record) => (
                <Card key={record.id} className="rounded-2xl border border-border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{record.patientName}</p>
                      <p className="text-sm text-muted-foreground">
                        {record.mrn} / {record.diagnosis}
                      </p>
                    </div>
                    <Badge variant={record.status === 'sent' ? 'healthy' : 'warning'}>{record.status}</Badge>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                    <span>{formatDate(record.createdAt)}</span>
                    <span>{record.pdfReady ? 'PDF ready' : 'PDF pending'}</span>
                  </div>
                </Card>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </DoctorPageLayout>
  );
}

export function DoctorLabResultsPage() {
  return (
    <DoctorPageLayout
      title="Lab Results"
      description="Review recent labs, scan critical alerts, and open patient-linked result details quickly."
      actions={<Button variant="outline">Open patient-linked view</Button>}
    >
      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <SectionCard title="Critical alert feed" description="Fast scan list for clinically urgent results">
          <AlertFeed alerts={doctorDashboardData.alerts.filter((item) => item.category === 'Critical lab')} />
        </SectionCard>
        <SectionCard title="Recent lab results" description="Critical and borderline values surfaced clearly">
          <div className="grid gap-4 p-4 lg:grid-cols-2">
            {doctorDashboardData.labResults.map((result) => (
              <LabResultCard key={result.id} result={result} />
            ))}
          </div>
        </SectionCard>
      </div>
    </DoctorPageLayout>
  );
}

export function DoctorAlertsPage() {
  return (
    <DoctorPageLayout
      title="Alerts"
      description="Follow-up reminders, critical labs, teleconsultation updates, schedule changes, and system notices."
      actions={<Button variant="outline">Notification settings</Button>}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Critical" value={doctorDashboardData.alerts.filter((item) => item.priority === 'critical').length} helper="Needs immediate doctor attention" icon={ShieldAlert} tone="critical" />
        <MetricCard label="Unread" value={doctorDashboardData.alerts.filter((item) => item.unread).length} helper="Not yet reviewed" icon={Bell} tone="warning" />
        <MetricCard label="Follow-ups" value={doctorDashboardData.followUps.length} helper="Doctor-configured reminders" icon={TimerReset} tone="accent" />
        <MetricCard label="Resolved" value={doctorDashboardData.alerts.filter((item) => item.status === 'resolved').length} helper="Closed items" icon={CheckCircle2} tone="healthy" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
        <SectionCard title="Follow-up reminders" description="Due tasks and tracked patient callbacks">
          <div className="space-y-3 p-4">
            {doctorDashboardData.followUps.map((item) => (
              <Card key={item.id} className="rounded-2xl border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{item.patientName}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.mrn} / {item.reason}
                    </p>
                  </div>
                  <Badge variant={alertVariant(item.priority)}>{item.priority}</Badge>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{formatRelative(item.dueAt)}</span>
                  <Badge variant={followUpVariant(item.status)}>{item.status}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Notification center" description="Severity, timestamps, read state, and workflow status">
          <AlertFeed alerts={doctorDashboardData.alerts} />
        </SectionCard>
      </div>
    </DoctorPageLayout>
  );
}

export function DoctorPerformancePage() {
  const summary = doctorDashboardData.performanceSummary;
  return (
    <DoctorPageLayout
      title="Performance"
      description="Useful personal metrics for workload, timing, and clinic performance without heavy admin framing."
      actions={
        <div className="flex flex-wrap gap-2">
          {doctorDashboardData.performanceRangeOptions.map((label, index) => (
            <Button key={label} variant={index === 0 ? 'default' : 'outline'} size="sm">
              {label}
            </Button>
          ))}
          <Button variant="outline">
            Export CSV
            <Download className="h-4 w-4" />
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total patients seen" value={summary.patientsSeen} helper="This month" icon={Users} />
        <MetricCard label="Revenue generated" value={formatBDT(summary.revenue)} helper="Consultation-linked total" icon={Wallet} tone="accent" />
        <MetricCard label="Average appointment duration" value={`${summary.avgDuration} min`} helper="Consultation pace" icon={Clock3} tone="warning" />
        <MetricCard label="Follow-up rate" value={summary.followUpRate} helper="Patients returning as advised" icon={HeartPulse} tone="healthy" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Clinical activity trend" description="Patients seen and average consultation time">
          <div className="h-80 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={doctorDashboardData.performanceChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.22)" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="patientsSeen" stroke="#0b4f6c" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="avgDuration" stroke="#14b8a6" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
        <SectionCard title="Revenue trend" description="Simple monthly output view">
          <div className="h-80 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={doctorDashboardData.performanceChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.22)" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip formatter={(value: number) => formatBDT(value)} />
                <Bar dataKey="revenue" fill="#0b4f6c" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
    </DoctorPageLayout>
  );
}
