'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AlertTriangle,
  Ambulance,
  ArrowRight,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  Download,
  FileBarChart2,
  FileText,
  FlaskConical,
  HeartHandshake,
  HeartPulse,
  LifeBuoy,
  MapPinned,
  Phone,
  Pill,
  RefreshCcw,
  ShieldAlert,
  Siren,
  Stethoscope,
  UserRound,
  Video,
  Wallet,
} from 'lucide-react';
import {
  Area,
  AreaChart,
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
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  patientDashboardData,
  patientDashboardSummary,
  type AppointmentItem,
  type BillItem,
  type CareStage,
  type DoctorAvailability,
  type LabReportItem,
  type NotificationItem,
  type PrescriptionItem,
  type PriorityLevel,
  type TimelineItem,
} from '@/lib/mock-data/patient-dashboard';
import { cn, formatBDT, formatDate, formatRelative } from '@/lib/utils';

const patientSections = [
  { label: 'Overview', href: '/patient' },
  { label: 'My Profile', href: '/patient/profile' },
  { label: 'Appointments', href: '/patient/appointments' },
  { label: 'Prescriptions', href: '/patient/prescriptions' },
  { label: 'Lab Reports', href: '/patient/lab-reports' },
  { label: 'Billing', href: '/patient/bills' },
  { label: 'Timeline', href: '/patient/timeline' },
  { label: 'Notifications', href: '/patient/notifications' },
  { label: 'Emergency', href: '/patient/sos' },
];

function priorityBadge(priority: PriorityLevel) {
  if (priority === 'critical') return 'critical';
  if (priority === 'high') return 'warning';
  if (priority === 'medium') return 'secondary';
  return 'outline';
}

function appointmentBadge(status: AppointmentItem['status']) {
  if (status === 'confirmed') return 'healthy';
  if (status === 'reminder_due') return 'warning';
  if (status === 'completed') return 'secondary';
  return 'destructive';
}

function labFlagBadge(flag: LabReportItem['parameters'][number]['flag']) {
  if (flag === 'critical') return 'critical';
  if (flag === 'borderline') return 'warning';
  return 'healthy';
}

function billBadge(status: BillItem['status']) {
  if (status === 'paid') return 'healthy';
  if (status === 'partial') return 'warning';
  return 'destructive';
}

function prescriptionBadge(status: PrescriptionItem['status']) {
  if (status === 'active') return 'healthy';
  if (status === 'refill_due') return 'warning';
  return 'secondary';
}

function timelineBadge(type: TimelineItem['type']) {
  if (type === 'lab_result') return 'critical';
  if (type === 'prescription') return 'healthy';
  if (type === 'discharge_summary') return 'accent';
  return 'secondary';
}

function careStageStyle(status: CareStage['status']) {
  if (status === 'done') return 'border-healthy/30 bg-healthy/10 text-healthy';
  if (status === 'current') return 'border-primary/30 bg-primary/10 text-primary';
  return 'border-border bg-background text-muted-foreground';
}

function teleStatus(status?: AppointmentItem['teleLinkStatus']) {
  if (status === 'live') return 'critical';
  if (status === 'available') return 'healthy';
  return 'secondary';
}

function availabilityStyle(status: DoctorAvailability['slots'][number]['status']) {
  if (status === 'available') return 'border-healthy/30 bg-healthy/10 text-healthy';
  if (status === 'limited') return 'border-borderline/40 bg-borderline/10 text-borderline';
  return 'border-border bg-secondary/50 text-muted-foreground';
}

function totalBillAmount(bill: BillItem) {
  return bill.lineItems.reduce((sum, item) => sum + item.amount, 0);
}

function PatientPageLayout({
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
      <PatientSectionNav />
      {children}
      <Link
        href="/patient/sos"
        aria-label="Open SOS emergency page"
        className="fixed bottom-5 right-4 z-20 inline-flex items-center gap-2 rounded-full bg-destructive px-4 py-3 text-sm font-semibold text-destructive-foreground shadow-elevated transition hover:bg-destructive/90 sm:right-6"
      >
        <Siren className="h-4 w-4" />
        SOS Emergency
      </Link>
    </div>
  );
}

function PatientSectionNav() {
  const pathname = usePathname();

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex min-w-max gap-2 p-2">
        {patientSections.map((section) => {
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
    <Card className="overflow-hidden p-5 shadow-sm">
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

function ActionGrid() {
  return (
    <SectionCard title="Quick actions" description="Common patient tasks with one tap access">
      <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
        {patientDashboardData.quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group rounded-2xl border border-border bg-background p-4 transition hover:border-primary/30 hover:bg-primary/5"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="font-semibold text-foreground">{action.label}</div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{action.helper}</p>
          </Link>
        ))}
      </div>
    </SectionCard>
  );
}

function OverviewHero() {
  const profile = patientDashboardData.profile;
  const nextAppointment = patientDashboardSummary.upcomingAppointments[0];

  return (
    <Card className="overflow-hidden border-primary/10 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.14),_transparent_38%),linear-gradient(135deg,rgba(11,79,108,0.06),rgba(255,255,255,0.85))] p-5 shadow-elevated lg:p-6">
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex items-start gap-4">
          <Avatar name={profile.fullName} src={profile.profilePhotoUrl} size="xl" className="ring-4 ring-white" />
          <div className="space-y-3">
            <Badge variant="accent" className="w-fit rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em]">
              Patient dashboard
            </Badge>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{profile.fullName}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                MRN {profile.mrn} / Preferred language: {profile.preferredLanguage}
              </p>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Your health summary is designed for fast, calm decision-making. Upcoming care, reports, billing, and emergency access stay visible from one place.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href="/patient/appointments">Book appointment</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/patient/timeline">Open health timeline</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/60 bg-white/80 p-4 backdrop-blur">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Clock3 className="h-4 w-4 text-accent" />
            Next scheduled care
          </div>
          {nextAppointment ? (
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-lg font-semibold text-foreground">{nextAppointment.doctor}</p>
                <p className="text-sm text-muted-foreground">{nextAppointment.specialty}</p>
              </div>
              <div className="grid gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  {formatDate(nextAppointment.date)} at {nextAppointment.time}
                </div>
                <div className="flex items-center gap-2">
                  <MapPinned className="h-4 w-4 text-primary" />
                  {nextAppointment.location}
                </div>
              </div>
              <div className="rounded-2xl bg-secondary/60 p-3 text-sm text-muted-foreground">
                {nextAppointment.queueNote}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">No upcoming appointment is booked yet.</p>
          )}
        </div>
      </div>
    </Card>
  );
}

function NotificationsPanel() {
  return (
    <SectionCard
      title="Alerts and reminders"
      description="Time-sensitive updates for follow-up, medication, billing, and emergency visibility"
      action={
        <Button asChild variant="ghost" size="sm">
          <Link href="/patient/notifications">View all</Link>
        </Button>
      }
    >
      <div className="divide-y divide-border">
        {patientDashboardSummary.unreadNotifications.map((notification) => (
          <div key={notification.id} className="flex gap-3 p-4">
            <div className={cn('mt-1 h-2.5 w-2.5 rounded-full', notification.priority === 'critical' ? 'bg-critical' : notification.priority === 'high' ? 'bg-borderline' : 'bg-accent')} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-foreground">{notification.title}</p>
                <Badge variant={priorityBadge(notification.priority)}>{notification.priority}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
              <p className="mt-2 text-xs text-muted-foreground">{formatRelative(notification.at)}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function UpcomingAppointmentsSummary() {
  return (
    <SectionCard
      title="Upcoming appointments"
      description="Your next visits and teleconsultation access"
      action={
        <Button asChild variant="ghost" size="sm">
          <Link href="/patient/appointments">Manage</Link>
        </Button>
      }
    >
      <div className="grid gap-4 p-4">
        {patientDashboardSummary.upcomingAppointments.slice(0, 2).map((appointment) => (
          <Card key={appointment.id} className="rounded-2xl border border-border p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-foreground">{appointment.doctor}</h3>
                  <Badge variant={appointmentBadge(appointment.status)}>{appointment.status.replace('_', ' ')}</Badge>
                  {appointment.type === 'teleconsultation' && appointment.teleLinkStatus && (
                    <Badge variant={teleStatus(appointment.teleLinkStatus)}>
                      Video {appointment.teleLinkStatus}
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{appointment.specialty}</p>
              </div>
              <div className="text-sm text-muted-foreground">
                {formatDate(appointment.date)} / {appointment.time}
              </div>
            </div>
            <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPinned className="h-4 w-4 text-primary" />
                {appointment.location}
              </div>
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-primary" />
                {appointment.reason}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </SectionCard>
  );
}

function RecentPrescriptionsSummary() {
  return (
    <SectionCard
      title="Recent prescriptions"
      description="Latest active medicines and follow-up notes"
      action={
        <Button asChild variant="ghost" size="sm">
          <Link href="/patient/prescriptions">See all</Link>
        </Button>
      }
    >
      <div className="grid gap-3 p-4">
        {patientDashboardSummary.recentPrescriptions.map((prescription) => (
          <div key={prescription.id} className="rounded-2xl border border-border bg-background p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-foreground">{prescription.diagnosis}</h3>
                <p className="text-sm text-muted-foreground">
                  {prescription.doctor} / {formatDate(prescription.issuedOn)}
                </p>
              </div>
              <Badge variant={prescriptionBadge(prescription.status)}>{prescription.status.replace('_', ' ')}</Badge>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {prescription.medicines[0].name} / {prescription.medicines[0].dosage} / {prescription.medicines[0].frequency}
            </p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function RecentLabSummary() {
  return (
    <SectionCard
      title="Recent lab reports"
      description="Latest test summaries with abnormal highlights"
      action={
        <Button asChild variant="ghost" size="sm">
          <Link href="/patient/lab-reports">Open reports</Link>
        </Button>
      }
    >
      <div className="grid gap-3 p-4">
        {patientDashboardSummary.recentReports.map((report) => (
          <div key={report.id} className="rounded-2xl border border-border bg-background p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-foreground">{report.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatDate(report.collectedOn)} / {report.orderingDoctor}
                </p>
              </div>
              <Badge variant={report.status === 'critical' ? 'critical' : report.status === 'reviewed' ? 'accent' : 'secondary'}>
                {report.status}
              </Badge>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {report.parameters.map((parameter) => (
                <Badge key={`${report.id}-${parameter.name}`} variant={labFlagBadge(parameter.flag)}>
                  {parameter.name}: {parameter.value}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function BillingSummary() {
  return (
    <SectionCard
      title="Outstanding bills"
      description="See balances, payment status, and receipt access"
      action={
        <Button asChild variant="ghost" size="sm">
          <Link href="/patient/bills">Pay now</Link>
        </Button>
      }
    >
      <div className="space-y-3 p-4">
        {patientDashboardData.bills.map((bill) => {
          const total = totalBillAmount(bill);
          const outstanding = total - bill.paidAmount;
          return (
            <div key={bill.id} className="rounded-2xl border border-border bg-background p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-foreground">{bill.invoiceNumber}</h3>
                  <p className="text-sm text-muted-foreground">
                    Due {formatDate(bill.dueOn)} / {bill.lineItems.length} charges
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={billBadge(bill.status)}>{bill.status}</Badge>
                  <p className="mt-2 font-semibold text-foreground">{formatBDT(outstanding)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

function CareJourneyCard() {
  return (
    <SectionCard title="Care journey" description="Current status across registration, OPD, IPD, and discharge">
      <div className="p-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {patientDashboardData.careJourney.map((stage, index) => (
            <div key={stage.label} className={cn('rounded-2xl border p-4', careStageStyle(stage.status))}>
              <div className="text-xs font-semibold uppercase tracking-[0.18em]">{String(index + 1).padStart(2, '0')}</div>
              <div className="mt-3 font-semibold">{stage.label}</div>
              <p className="mt-1 text-sm text-current/80">{stage.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}

function VitalsTrendCard() {
  return (
    <SectionCard title="Vitals trend" description="Recent blood pressure and pulse tracking">
      <div className="h-72 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={patientDashboardData.vitalsTrend}>
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
  );
}

function DischargeSummaryCard() {
  const lastDischarge = patientDashboardData.timeline.find((item) => item.type === 'discharge_summary');

  return (
    <SectionCard title="Discharge summary" description="Latest inpatient or observation discharge note">
      <div className="space-y-3 p-4">
        {lastDischarge ? (
          <>
            <div className="rounded-2xl border border-border bg-secondary/40 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="accent">Stable discharge</Badge>
                <p className="text-sm text-muted-foreground">{formatDate(lastDischarge.date)}</p>
              </div>
              <h3 className="mt-3 text-lg font-semibold text-foreground">{lastDischarge.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{lastDischarge.detail}</p>
            </div>
            <Button variant="outline" className="w-full justify-between">
              Download discharge PDF
              <Download className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No discharge summary found.</p>
        )}
      </div>
    </SectionCard>
  );
}

export function PatientOverviewPage() {
  const profile = patientDashboardData.profile;

  return (
    <PatientPageLayout
      title="Overview"
      description="Your personal care dashboard for appointments, reports, bills, and urgent help."
      actions={
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/patient/appointments">Book appointment</Link>
          </Button>
          <Button asChild variant="destructive">
            <Link href="/patient/sos">SOS</Link>
          </Button>
        </div>
      }
    >
      <OverviewHero />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Patient"
          value={profile.fullName}
          helper={`MRN ${profile.mrn}`}
          icon={UserRound}
        />
        <MetricCard
          label="Upcoming appointments"
          value={patientDashboardSummary.upcomingAppointments.length}
          helper="Confirmed and reminder-ready visits"
          icon={Calendar}
          tone="accent"
        />
        <MetricCard
          label="Outstanding balance"
          value={formatBDT(patientDashboardSummary.outstandingBalance)}
          helper="Includes partial and unpaid invoices"
          icon={Wallet}
          tone="warning"
        />
        <MetricCard
          label="Unread alerts"
          value={patientDashboardSummary.unreadNotifications.length}
          helper="Critical care and medication reminders"
          icon={Bell}
          tone="critical"
        />
      </div>
      <ActionGrid />
      <div className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
        <div className="space-y-5">
          <UpcomingAppointmentsSummary />
          <RecentPrescriptionsSummary />
          <CareJourneyCard />
        </div>
        <div className="space-y-5">
          <NotificationsPanel />
          <RecentLabSummary />
          <BillingSummary />
        </div>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <VitalsTrendCard />
        <DischargeSummaryCard />
      </div>
    </PatientPageLayout>
  );
}

export function PatientProfilePage() {
  const profile = patientDashboardData.profile;

  return (
    <PatientPageLayout
      title="My Profile"
      description="Personal details, emergency contacts, and linked family accounts."
      actions={<Button variant="outline">Request profile update</Button>}
    >
      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="overflow-hidden shadow-sm">
          <div className="border-b border-border bg-secondary/40 p-6">
            <div className="flex items-center gap-4">
              <Avatar name={profile.fullName} src={profile.profilePhotoUrl} size="xl" />
              <div>
                <h2 className="text-xl font-semibold text-foreground">{profile.fullName}</h2>
                <p className="mt-1 text-sm text-muted-foreground">MRN {profile.mrn}</p>
              </div>
            </div>
          </div>
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <ProfileField label="Date of birth" value={formatDate(profile.dateOfBirth)} />
            <ProfileField label="Gender" value={profile.gender} />
            <ProfileField label="Blood group" value={profile.bloodGroup} />
            <ProfileField label="Phone" value={profile.phone} />
            <ProfileField label="Email" value={profile.email} />
            <ProfileField label="NID" value={profile.nid} />
            <div className="sm:col-span-2">
              <ProfileField label="Address" value={profile.address} />
            </div>
          </div>
        </Card>
        <Card className="p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <HeartHandshake className="h-5 w-5 text-accent" />
            <div>
              <h2 className="text-lg font-semibold text-foreground">Guardian and emergency support</h2>
              <p className="text-sm text-muted-foreground">Primary family visibility and emergency communication settings.</p>
            </div>
          </div>
          <div className="mt-5 rounded-2xl border border-border bg-secondary/30 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-foreground">{profile.guardian.name}</p>
                <p className="text-sm text-muted-foreground">{profile.guardian.relationship}</p>
              </div>
              <Badge variant="healthy">Primary guardian</Badge>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <ProfileField label="Phone" value={profile.guardian.phone} />
              <ProfileField label="Email" value={profile.guardian.email} />
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {profile.emergencyContacts.map((contact) => (
              <div key={contact.phone} className="rounded-2xl border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{contact.name}</p>
                    <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                  </div>
                  <Badge variant="outline">{contact.phone}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{contact.note}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <SectionCard title="Family-linked accounts" description="A guardian can manage up to 10 linked patient profiles">
        <div className="space-y-4 p-4">
          <div className="rounded-2xl border border-border bg-primary/5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-foreground">Linked profiles in use</p>
                <p className="text-sm text-muted-foreground">3 of 10 profiles are connected to this guardian account.</p>
              </div>
              <Badge variant="accent">Capacity available</Badge>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {profile.linkedAccounts.map((account) => (
              <Card key={account.id} className="rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{account.name}</p>
                    <p className="text-sm text-muted-foreground">{account.relationship}</p>
                  </div>
                  <Badge variant="outline">{account.mrn}</Badge>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{account.lastActivity}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {account.permissions.map((permission) => (
                    <Badge key={`${account.id}-${permission}`} variant="secondary">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </SectionCard>
    </PatientPageLayout>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

export function PatientAppointmentsPage() {
  return (
    <PatientPageLayout
      title="Appointments"
      description="Book care, track visit status, and manage teleconsultation links."
      actions={<Button>Book new slot</Button>}
    >
      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard title="Book a new appointment" description="Choose doctor, date, and available time slots">
          <div className="space-y-4 p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input defaultValue="Dr. Imtiaz Karim" aria-label="Doctor name" />
              <Input defaultValue="2026-04-29" type="date" aria-label="Appointment date" />
            </div>
            <Input defaultValue="Follow-up consultation after lab results" aria-label="Reason for visit" />
            <div className="grid gap-4 lg:grid-cols-3">
              {patientDashboardData.doctorAvailability.map((doctor) => (
                <Card key={doctor.id} className="rounded-2xl border border-border p-4">
                  <p className="font-semibold text-foreground">{doctor.doctor}</p>
                  <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">{doctor.nextAvailable}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {doctor.slots.map((slot) => (
                      <button
                        key={`${doctor.id}-${slot.label}`}
                        type="button"
                        className={cn('rounded-xl border px-3 py-2 text-sm font-medium transition', availabilityStyle(slot.status))}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </SectionCard>
        <SectionCard title="Reminders" description="Fast patient-facing guidance for each booking">
          <div className="space-y-3 p-4 text-sm text-muted-foreground">
            <div className="rounded-2xl border border-border bg-secondary/30 p-4">
              Bring your latest lab reports and medicine list for in-person cardiology visits.
            </div>
            <div className="rounded-2xl border border-border bg-secondary/30 p-4">
              Teleconsultation rooms open 15 minutes early and work best on stable mobile data or Wi-Fi.
            </div>
            <div className="rounded-2xl border border-border bg-secondary/30 p-4">
              You can cancel or reschedule from this page until 6 hours before appointment time.
            </div>
          </div>
        </SectionCard>
      </div>
      <SectionCard title="Upcoming and past appointments" description="Visit history with cancellation and reschedule access">
        <div className="grid gap-4 p-4">
          {patientDashboardData.appointments.map((appointment) => (
            <Card key={appointment.id} className="rounded-2xl border border-border p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-foreground">{appointment.doctor}</h3>
                    <Badge variant={appointmentBadge(appointment.status)}>{appointment.status.replace('_', ' ')}</Badge>
                    <Badge variant="outline">{appointment.type.replace('_', ' ')}</Badge>
                    {appointment.type === 'teleconsultation' && appointment.teleLinkStatus && (
                      <Badge variant={teleStatus(appointment.teleLinkStatus)}>
                        Video {appointment.teleLinkStatus}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
                  <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      {formatDate(appointment.date)} at {appointment.time}
                    </div>
                    <div className="flex items-center gap-2">
                      {appointment.type === 'teleconsultation' ? <Video className="h-4 w-4 text-primary" /> : <MapPinned className="h-4 w-4 text-primary" />}
                      {appointment.location}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                  <div className="rounded-2xl bg-secondary/40 p-3 text-sm text-muted-foreground">
                    {appointment.queueNote}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 lg:w-52 lg:flex-col">
                  <Button variant="outline" className="justify-between">
                    Reschedule
                    <RefreshCcw className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="justify-between">
                    Cancel
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  {appointment.type === 'teleconsultation' && (
                    <Button className="justify-between" variant={appointment.teleLinkStatus === 'available' ? 'accent' : 'secondary'}>
                      Join video room
                      <Video className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </SectionCard>
    </PatientPageLayout>
  );
}

export function PatientPrescriptionsPage() {
  return (
    <PatientPageLayout
      title="Prescriptions"
      description="Medicine details, dosage guidance, and downloadable prescription files."
      actions={<Button variant="outline">Request refill</Button>}
    >
      <div className="grid gap-5">
        {patientDashboardData.prescriptions.map((prescription) => (
          <Card key={prescription.id} className="overflow-hidden rounded-3xl shadow-sm">
            <div className="border-b border-border bg-secondary/30 p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-foreground">{prescription.diagnosis}</h2>
                    <Badge variant={prescriptionBadge(prescription.status)}>{prescription.status.replace('_', ' ')}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Issued by {prescription.doctor} on {formatDate(prescription.issuedOn)}
                  </p>
                </div>
                <Button variant="outline">
                  Download PDF
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{prescription.notes}</p>
            </div>
            <div className="grid gap-4 p-5 lg:grid-cols-2">
              {prescription.medicines.map((medicine) => (
                <div key={`${prescription.id}-${medicine.name}`} className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex items-center gap-2">
                    <Pill className="h-4 w-4 text-accent" />
                    <p className="font-semibold text-foreground">{medicine.name}</p>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <PrescriptionField label="Dosage" value={medicine.dosage} />
                    <PrescriptionField label="Frequency" value={medicine.frequency} />
                    <PrescriptionField label="Duration" value={medicine.duration} />
                    <PrescriptionField label="Instructions" value={medicine.instructions} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </PatientPageLayout>
  );
}

function PrescriptionField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm text-foreground">{value}</p>
    </div>
  );
}

export function PatientLabReportsPage() {
  return (
    <PatientPageLayout
      title="Lab Reports"
      description="Download reports, review findings, and identify abnormal values quickly."
      actions={<Button variant="outline">Share with doctor</Button>}
    >
      <div className="grid gap-5">
        {patientDashboardData.labReports.map((report) => (
          <Card key={report.id} className="overflow-hidden rounded-3xl shadow-sm">
            <div className="border-b border-border bg-secondary/30 p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-foreground">{report.title}</h2>
                    <Badge variant={report.status === 'critical' ? 'critical' : report.status === 'reviewed' ? 'accent' : 'secondary'}>
                      {report.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Collected on {formatDate(report.collectedOn)} / Ordered by {report.orderingDoctor}
                  </p>
                </div>
                <Button variant="outline">
                  Download PDF
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{report.summary}</p>
            </div>
            <div className="grid gap-4 p-5 lg:grid-cols-3">
              {report.parameters.map((parameter) => (
                <div
                  key={`${report.id}-${parameter.name}`}
                  className={cn(
                    'rounded-2xl border p-4',
                    parameter.flag === 'critical' && 'border-critical/40 bg-critical/5',
                    parameter.flag === 'borderline' && 'border-borderline/40 bg-borderline/5',
                    parameter.flag === 'normal' && 'border-border bg-background',
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-foreground">{parameter.name}</p>
                    <Badge variant={labFlagBadge(parameter.flag)}>{parameter.flag}</Badge>
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-foreground">
                    {parameter.value} <span className="text-sm font-medium text-muted-foreground">{parameter.unit}</span>
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">Reference range: {parameter.range}</p>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </PatientPageLayout>
  );
}

export function PatientBillingPage() {
  return (
    <PatientPageLayout
      title="Billing and Payments"
      description="Track invoices, pay balances, and download receipts."
      actions={<Button>Pay outstanding</Button>}
    >
      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard title="Outstanding summary" description="Current balance and monthly payment history">
          <div className="space-y-4 p-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <MetricCard
                label="Current due"
                value={formatBDT(patientDashboardSummary.outstandingBalance)}
                helper="Across unpaid and partial invoices"
                icon={CreditCard}
                tone="warning"
              />
              <MetricCard
                label="Paid this year"
                value={formatBDT(patientDashboardData.paymentHistory.reduce((sum, item) => sum + item.amount, 0))}
                helper="Successful payment history total"
                icon={CheckCircle2}
                tone="healthy"
              />
              <MetricCard
                label="Receipts"
                value={patientDashboardData.paymentHistory.length}
                helper="Downloadable receipt records"
                icon={FileText}
                tone="accent"
              />
            </div>
            <div className="h-72 rounded-2xl border border-border bg-background p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={patientDashboardData.balanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.22)" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="billed" fill="#0b4f6c" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="paid" fill="#14b8a6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </SectionCard>
        <SectionCard title="Payment methods" description="Preferred options for Bangladesh patient journeys">
          <div className="grid gap-3 p-4">
            {['bKash', 'Nagad', 'Card', 'Cash'].map((method) => (
              <div key={method} className="flex items-center justify-between rounded-2xl border border-border bg-background p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-secondary p-3">
                    <Wallet className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{method}</p>
                    <p className="text-sm text-muted-foreground">Fast checkout option available</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Select
                </Button>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
      <SectionCard title="Itemized invoices" description="Paid, unpaid, and partially paid records">
        <div className="grid gap-4 p-4">
          {patientDashboardData.bills.map((bill) => (
            <Card key={bill.id} className="rounded-2xl border border-border p-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-foreground">{bill.invoiceNumber}</h3>
                    <Badge variant={billBadge(bill.status)}>{bill.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Issued {formatDate(bill.issuedOn)} / Due {formatDate(bill.dueOn)}
                  </p>
                  <div className="mt-4 grid gap-2 md:grid-cols-2">
                    {bill.lineItems.map((item) => (
                      <div key={`${bill.id}-${item.name}`} className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2 text-sm">
                        <span>{item.name}</span>
                        <span className="font-medium text-foreground">{formatBDT(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="w-full rounded-2xl border border-border bg-secondary/30 p-4 xl:w-72">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-semibold text-foreground">{formatBDT(totalBillAmount(bill))}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Paid</span>
                    <span className="font-semibold text-foreground">{formatBDT(bill.paidAmount)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Outstanding</span>
                    <span className="font-semibold text-foreground">{formatBDT(totalBillAmount(bill) - bill.paidAmount)}</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button className="flex-1">Pay</Button>
                    <Button variant="outline" className="flex-1">
                      Receipt
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Payment history" description="Recent transactions and receipt references">
        <div className="grid gap-3 p-4">
          {patientDashboardData.paymentHistory.map((payment) => (
            <div key={payment.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-foreground">{formatBDT(payment.amount)}</p>
                <p className="text-sm text-muted-foreground">
                  {payment.method} / {formatDate(payment.date)} / Ref {payment.reference}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={payment.status === 'success' ? 'healthy' : 'warning'}>{payment.status}</Badge>
                <Button variant="outline" size="sm">
                  Download receipt
                </Button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </PatientPageLayout>
  );
}

export function PatientTimelinePage() {
  return (
    <PatientPageLayout
      title="Health Timeline"
      description="A reverse chronological view of visits, diagnoses, prescriptions, labs, reports, and discharge notes."
      actions={<Button variant="outline">Export history</Button>}
    >
      <Card className="overflow-hidden rounded-3xl shadow-sm">
        <div className="border-b border-border bg-secondary/30 p-5">
          <h2 className="text-lg font-semibold text-foreground">Your care story</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This timeline keeps major medical events in one place so you and your family can track progress clearly.
          </p>
        </div>
        <div className="p-4 sm:p-6">
          <div className="relative space-y-6 before:absolute before:left-[11px] before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-border sm:before:left-[19px]">
            {patientDashboardData.timeline.map((event) => (
              <div key={event.id} className="relative flex gap-4">
                <div className="relative z-10 mt-1 h-6 w-6 rounded-full border-4 border-background bg-primary shadow-sm sm:h-10 sm:w-10" />
                <div className="min-w-0 flex-1 rounded-3xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-foreground">{event.title}</h3>
                        <Badge variant={timelineBadge(event.type)}>{event.type.replace('_', ' ')}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {event.location} / {event.clinician}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">{formatDate(event.date)}</p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{event.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </PatientPageLayout>
  );
}

export function PatientNotificationsPage() {
  return (
    <PatientPageLayout
      title="Notifications"
      description="Appointment reminders, follow-up tasks, refill prompts, lab alerts, and emergency updates."
      actions={<Button variant="outline">Mark all as read</Button>}
    >
      <div className="grid gap-5 xl:grid-cols-[0.78fr_1.22fr]">
        <SectionCard title="Priority summary" description="High-signal patient messages at a glance">
          <div className="grid gap-3 p-4">
            <MetricCard
              label="Critical"
              value={patientDashboardData.notifications.filter((item) => item.priority === 'critical').length}
              helper="Needs fast patient attention"
              icon={ShieldAlert}
              tone="critical"
            />
            <MetricCard
              label="Unread"
              value={patientDashboardSummary.unreadNotifications.length}
              helper="Still not acknowledged"
              icon={Bell}
              tone="warning"
            />
            <MetricCard
              label="Appointment reminders"
              value={patientDashboardData.notifications.filter((item) => item.kind === 'appointment').length}
              helper="Upcoming visit guidance"
              icon={Calendar}
              tone="accent"
            />
          </div>
        </SectionCard>
        <SectionCard title="Notification center" description="Ordered by urgency and recency">
          <div className="divide-y divide-border">
            {patientDashboardData.notifications.map((notification: NotificationItem) => (
              <div
                key={notification.id}
                className={cn('flex gap-4 p-4', notification.unread && 'bg-primary/5')}
              >
                <div className={cn('mt-1 h-3 w-3 rounded-full', notification.priority === 'critical' ? 'bg-critical' : notification.priority === 'high' ? 'bg-borderline' : notification.priority === 'medium' ? 'bg-accent' : 'bg-border')} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-foreground">{notification.title}</h3>
                        <Badge variant={priorityBadge(notification.priority)}>{notification.priority}</Badge>
                        <Badge variant="outline">{notification.kind.replace('_', ' ')}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{notification.message}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{formatRelative(notification.at)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </PatientPageLayout>
  );
}

export function PatientEmergencyPage() {
  const emergency = patientDashboardData.emergency;

  return (
    <PatientPageLayout
      title="Emergency / SOS"
      description="One-tap urgent help with dispatch status, ambulance tracking, and family visibility."
      actions={
        <Button variant="destructive" size="lg" className="px-6">
          <Siren className="h-4 w-4" />
          Send SOS now
        </Button>
      }
    >
      <Card className="overflow-hidden border-destructive/20 bg-[radial-gradient(circle_at_top_left,_rgba(239,68,68,0.15),_transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,245,245,0.98))] p-5 shadow-elevated">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="critical" className="rounded-full px-3 py-1 uppercase tracking-[0.16em]">
                Emergency ready
              </Badge>
              <p className="text-sm text-muted-foreground">Always accessible from every patient page</p>
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">Urgent help in one step</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              If you or a family member need immediate support, the SOS flow shares your dispatch request with emergency operations and keeps linked guardians informed.
            </p>
          </div>
          <div className="rounded-3xl border border-destructive/20 bg-white/90 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-destructive/10 p-3 text-destructive">
                <LifeBuoy className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Quick emergency contact</p>
                <p className="text-sm text-muted-foreground">24/7 hospital dispatch desk</p>
              </div>
            </div>
            <Button className="mt-4 w-full justify-between" variant="destructive">
              Call emergency support
              <Phone className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard title="Emergency request status" description="Live dispatch state, ETA, and family visibility">
          <div className="space-y-4 p-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Request ID" value={emergency.requestId} helper="Current active SOS" icon={ShieldAlert} tone="critical" />
              <MetricCard label="Dispatch state" value={emergency.state.replace('_', ' ')} helper="Ambulance is on the way" icon={Ambulance} tone="warning" />
              <MetricCard label="ETA" value={`${emergency.etaMinutes} min`} helper="Estimated arrival time" icon={Clock3} tone="accent" />
              <MetricCard label="Family visibility" value={emergency.familyVisible ? 'On' : 'Off'} helper="Linked guardian can follow progress" icon={HeartHandshake} tone="healthy" />
            </div>
            <div className="rounded-3xl border border-border bg-background p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-foreground">{emergency.ambulance}</h3>
                  <p className="text-sm text-muted-foreground">{emergency.driver}</p>
                </div>
                <Badge variant="warning">En route</Badge>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <ProfileField label="Route" value={emergency.location} />
                <ProfileField label="Dispatch desk" value={emergency.hospitalDesk} />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">Last updated {formatRelative(emergency.lastUpdated)}</p>
            </div>
          </div>
        </SectionCard>
        <SectionCard title="Ambulance tracking" description="Map placeholder for current vehicle movement">
          <div className="space-y-4 p-4">
            <div className="flex h-72 items-center justify-center rounded-3xl border border-dashed border-border bg-[radial-gradient(circle_at_center,_rgba(20,184,166,0.12),_transparent_42%),linear-gradient(180deg,rgba(238,247,250,0.9),rgba(255,255,255,1))]">
              <div className="text-center">
                <MapPinned className="mx-auto h-10 w-10 text-primary" />
                <p className="mt-3 font-semibold text-foreground">Live map placeholder</p>
                <p className="mt-2 text-sm text-muted-foreground">Ambulance route, patient location, and ETA would appear here in production.</p>
              </div>
            </div>
            <div className="rounded-3xl border border-border bg-secondary/30 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-borderline" />
                <div>
                  <p className="font-semibold text-foreground">Family visibility enabled</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Linked guardian accounts can see dispatch progress and emergency status updates during this SOS event.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </PatientPageLayout>
  );
}
