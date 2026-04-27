'use client';

import { useEffect, useMemo, useState } from 'react';
import { Calendar, CheckCircle, Clock, CreditCard, Download, Eye, Loader2, Plus, Stethoscope } from 'lucide-react';
import { PageHeader, SectionCard, KPICard, EmptyState } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar } from '@/components/ui/avatar';
import { AppointmentPayModal } from '@/components/stripe/appointment-pay-modal';
import { useAuthStore } from '@/lib/auth-store';
import { appointmentAPI, userAPI } from '@/lib/mock-api';
import { downloadDocument, viewDocument } from '@/lib/document-utils';
import { formatBDT, formatDateTime } from '@/lib/utils';
import type { Appointment, AppointmentType, User } from '@/types';

const STATUS_VARIANT: Record<string, 'healthy' | 'accent' | 'warning' | 'destructive' | 'secondary'> = {
  completed:   'healthy',
  confirmed:   'accent',
  checked_in:  'accent',
  in_progress: 'accent',
  cancelled:   'destructive',
  no_show:     'destructive',
  scheduled:   'secondary',
  rescheduled: 'warning',
};

function PaymentBadge({ status }: { status: 'pending' | 'paid' | 'waived' }) {
  if (status === 'paid')   return <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600"><CheckCircle className="h-3 w-3" />Paid</span>;
  if (status === 'waived') return <span className="text-xs text-muted-foreground">Waived</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600"><Clock className="h-3 w-3" />Unpaid</span>;
}

export default function PatientAppointmentsPage() {
  const { user } = useAuthStore();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [doctors, setDoctors] = useState<User[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [payingAppointment, setPayingAppointment] = useState<Appointment | null>(null);

  const [form, setForm] = useState({
    doctor_id: '',
    appointment_type: 'consultation' as AppointmentType,
    date: '',
    time: '',
    reason: '',
  });

  // Load real appointments from database
  useEffect(() => {
    async function load() {
      setLoading(true);
      setLoadError('');
      try {
        const patientFilter = user?.patient_id ?? user?.id;
        const res = await appointmentAPI.list(patientFilter ? { patient_id: patientFilter } : undefined);
        setAppointments(res.data);
      } catch (err: unknown) {
        const e = err as { message?: string };
        setLoadError(e?.message ?? 'Failed to load appointments.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.id, user?.patient_id]);

  // Load doctors for booking form
  useEffect(() => {
    userAPI.listDoctors()
      .then((res) => setDoctors(res.data.filter((d) => !!d.doctor_profile)))
      .catch(() => {});
  }, []);

  const selectedDoctor = useMemo(
    () => doctors.find((d) => d.id === form.doctor_id),
    [doctors, form.doctor_id],
  );

  const upcoming    = appointments.filter((a) => new Date(a.scheduled_at) >= new Date());
  const history     = [...appointments].sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());
  const totalFees   = appointments.reduce((s, a) => s + a.fee_bdt, 0);
  const unpaidCount = appointments.filter((a) => a.payment_status === 'pending').length;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');

    if (!form.doctor_id || !form.date || !form.time || !form.reason.trim()) {
      setFormError('Please fill in all required fields.'); return;
    }
    if (!selectedDoctor?.doctor_profile) {
      setFormError('Please select a valid doctor.'); return;
    }

    const patientId = user?.patient_id ?? user?.id;
    if (!patientId) { setFormError('Patient profile not found. Please log in again.'); return; }

    setSaving(true);
    try {
      const res = await appointmentAPI.create({
        patient_id: patientId,
        doctor_id: selectedDoctor.id,
        appointment_type: form.appointment_type,
        scheduled_at: `${form.date}T${form.time}:00Z`,
        reason: form.reason.trim(),
        duration_minutes: 30,
      });
      setAppointments((prev) => [res.data, ...prev]);
      setShowCreate(false);
      setForm({ doctor_id: '', appointment_type: 'consultation', date: '', time: '', reason: '' });
    } catch (err: unknown) {
      const ex = err as { message?: string };
      setFormError(ex?.message ?? 'Failed to book appointment. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function handlePaid(updated: Appointment) {
    setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  }

  function viewDoc(a: Appointment) {
    viewDocument({
      title: `Appointment ${a.appointment_number}`,
      fileName: `appointment-${a.appointment_number}`,
      fields: [
        { label: 'Appointment Number', value: a.appointment_number },
        { label: 'Patient', value: `${a.patient_name} (${a.patient_mrn})` },
        { label: 'Doctor', value: `${a.doctor_name} (${a.doctor_specialty})` },
        { label: 'Date & Time', value: formatDateTime(a.scheduled_at) },
        { label: 'Type', value: a.appointment_type.replace(/_/g, ' ') },
        { label: 'Status', value: a.status.replace(/_/g, ' ') },
        { label: 'Reason', value: a.reason },
        { label: 'Fee', value: formatBDT(a.fee_bdt) },
        { label: 'Payment', value: a.payment_status },
      ],
    });
  }

  function downloadDoc(a: Appointment) {
    downloadDocument({
      title: `Appointment ${a.appointment_number}`,
      fileName: `appointment-${a.appointment_number}`,
      fields: [
        { label: 'Appointment Number', value: a.appointment_number },
        { label: 'Patient', value: `${a.patient_name} (${a.patient_mrn})` },
        { label: 'Doctor', value: `${a.doctor_name} (${a.doctor_specialty})` },
        { label: 'Date & Time', value: formatDateTime(a.scheduled_at) },
        { label: 'Type', value: a.appointment_type.replace(/_/g, ' ') },
        { label: 'Status', value: a.status.replace(/_/g, ' ') },
        { label: 'Reason', value: a.reason },
        { label: 'Fee', value: formatBDT(a.fee_bdt) },
        { label: 'Payment', value: a.payment_status },
      ],
    });
  }

  const S = 'h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring';

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Appointments"
        description="Upcoming consultations, visit history, and telemedicine links."
        actions={
          <Button onClick={() => setShowCreate((p) => !p)} className="gap-2">
            <Plus className="h-4 w-4" />
            {showCreate ? 'Close' : 'Create Appointment'}
          </Button>
        }
      />

      {/* ── Create form ── */}
      {showCreate && (
        <SectionCard title="Book New Appointment" description="Select a doctor, date and time">
          <form onSubmit={handleCreate} className="grid gap-4 p-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Doctor <span className="text-destructive">*</span></Label>
              <select
                value={form.doctor_id}
                onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}
                className={S}
              >
                <option value="">Select doctor</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.full_name} — {d.doctor_profile?.specialty}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>Type <span className="text-destructive">*</span></Label>
              <select
                value={form.appointment_type}
                onChange={(e) => setForm({ ...form, appointment_type: e.target.value as AppointmentType })}
                className={S}
              >
                <option value="consultation">Consultation</option>
                <option value="follow_up">Follow-up</option>
                <option value="teleconsultation">Teleconsultation</option>
                <option value="procedure">Procedure</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>Date <span className="text-destructive">*</span></Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>

            <div className="space-y-1.5">
              <Label>Time <span className="text-destructive">*</span></Label>
              <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label>Reason / Chief Complaint <span className="text-destructive">*</span></Label>
              <Input
                placeholder="Describe your issue or consultation reason"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
              />
            </div>

            {selectedDoctor?.doctor_profile && (
              <div className="sm:col-span-2 flex items-center justify-between rounded-xl border border-border bg-secondary/30 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar name={selectedDoctor.full_name} size="sm" />
                  <div>
                    <div className="text-sm font-semibold">{selectedDoctor.full_name}</div>
                    <div className="text-xs text-muted-foreground">{selectedDoctor.doctor_profile.specialty}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Consultation fee</div>
                  <div className="text-base font-bold">{formatBDT(selectedDoctor.doctor_profile.consultation_fee_bdt)}</div>
                </div>
              </div>
            )}

            {formError && (
              <div className="sm:col-span-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {formError}
              </div>
            )}

            <div className="sm:col-span-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button type="submit" disabled={saving} className="gap-2">
                <Plus className="h-4 w-4" />
                {saving ? 'Booking…' : 'Book Appointment'}
              </Button>
            </div>
          </form>
        </SectionCard>
      )}

      {/* ── KPIs ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="Upcoming" value={upcoming.length} icon={Calendar} />
        <KPICard label="Completed" value={appointments.filter((a) => a.status === 'completed').length} icon={CheckCircle} accentColor="healthy" />
        <KPICard label="Total Fees" value={formatBDT(totalFees)} icon={Stethoscope} accentColor="accent" />
        <KPICard label="Unpaid" value={unpaidCount} icon={CreditCard} accentColor={unpaidCount > 0 ? 'critical' : 'healthy'} />
      </div>

      {/* ── Appointment history ── */}
      <SectionCard
        title="Appointment History"
        description={loading ? 'Loading…' : `${appointments.length} appointment${appointments.length !== 1 ? 's' : ''} total`}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-14 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading your appointments…
          </div>
        ) : loadError ? (
          <div className="p-6 text-center text-sm text-destructive">{loadError}</div>
        ) : history.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={Calendar} title="No appointments yet" description="Book your first appointment using the button above." />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {history.map((a) => (
              <div key={a.id} className="flex flex-wrap items-start gap-4 px-5 py-4 transition-colors hover:bg-secondary/20">

                {/* Doctor icon */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Stethoscope className="h-5 w-5 text-primary" />
                </div>

                {/* Main info */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{a.doctor_name}</span>
                    <Badge variant={STATUS_VARIANT[a.status] ?? 'secondary'} className="capitalize text-[11px]">
                      {a.status.replace(/_/g, ' ')}
                    </Badge>
                    <PaymentBadge status={a.payment_status} />
                  </div>
                  <div className="mt-0.5 text-sm text-muted-foreground">
                    {a.doctor_specialty} — {a.reason}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDateTime(a.scheduled_at)}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground/70">{a.appointment_number}</span>
                  </div>
                </div>

                {/* Fee + actions */}
                <div className="flex flex-col items-end gap-2">
                  <div className="text-right">
                    <div className="text-sm font-bold">{formatBDT(a.fee_bdt)}</div>
                    <div className="text-[10px] capitalize text-muted-foreground">
                      {a.appointment_type.replace(/_/g, ' ')}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <Button type="button" size="sm" variant="outline" onClick={() => viewDoc(a)}>
                      <Eye className="h-3.5 w-3.5" /> View
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => downloadDoc(a)}>
                      <Download className="h-3.5 w-3.5" /> Download
                    </Button>
                    {a.payment_status === 'pending' && (
                      <Button
                        type="button"
                        size="sm"
                        className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => setPayingAppointment(a)}
                      >
                        <CreditCard className="h-3.5 w-3.5" />
                        Pay Now
                      </Button>
                    )}
                    {a.payment_status === 'paid' && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-green-200 bg-green-50 px-2 py-1 text-xs font-medium text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
                        <CheckCircle className="h-3 w-3" /> Paid
                      </span>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* ── Stripe Pay Modal ── */}
      {payingAppointment && (
        <AppointmentPayModal
          appointment={payingAppointment}
          onClose={() => setPayingAppointment(null)}
          onPaid={(updated) => { handlePaid(updated); setPayingAppointment(null); }}
        />
      )}
    </div>
  );
}
