'use client';

import { useMemo, useState } from 'react';
import { Calendar, Download, Eye, Plus } from 'lucide-react';
import { PageHeader, SectionCard, KPICard } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/lib/auth-store';
import { downloadDocument, viewDocument } from '@/lib/document-utils';
import { MOCK_APPOINTMENTS, MOCK_USERS } from '@/lib/mock-data';
import { formatBDT, formatDateTime } from '@/lib/utils';
import type { Appointment, AppointmentType } from '@/types';

const patientId = 'patient-001';

export default function PatientAppointmentsPage() {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>(
    MOCK_APPOINTMENTS.filter((appointment) => appointment.patient_id === patientId),
  );
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({
    doctor_id: '',
    appointment_type: 'consultation' as AppointmentType,
    date: '',
    time: '',
    reason: '',
  });

  const doctors = useMemo(
    () => MOCK_USERS.filter((u) => u.role === 'doctor' && !!u.doctor_profile),
    [],
  );
  const selectedDoctor = doctors.find((d) => d.id === form.doctor_id);

  const upcoming = appointments.filter((appointment) => new Date(appointment.scheduled_at) >= new Date());
  const history = [...appointments].sort(
    (a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime(),
  );

  async function handleCreateAppointment(event: React.FormEvent) {
    event.preventDefault();
    setFormError('');

    if (!form.doctor_id || !form.date || !form.time || !form.reason.trim()) {
      setFormError('Please fill in all required fields.');
      return;
    }

    if (!selectedDoctor?.doctor_profile) {
      setFormError('Please select a valid doctor.');
      return;
    }

    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const nowIso = new Date().toISOString();
    const newAppointment: Appointment = {
      id: `appt-${Date.now()}`,
      tenant_id: user?.tenant_id ?? 'tenant-001',
      appointment_number: `APT-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      patient_id: patientId,
      patient_mrn: 'HAX-10024',
      patient_name: user?.full_name ?? 'Patient',
      patient_phone: user ? `${user.phone.country_code} ${user.phone.number}` : '+880',
      doctor_id: selectedDoctor.id,
      doctor_name: selectedDoctor.full_name,
      doctor_specialty: selectedDoctor.doctor_profile.specialty,
      appointment_type: form.appointment_type,
      status: 'scheduled',
      source: 'online_patient',
      scheduled_at: `${form.date}T${form.time}:00Z`,
      duration_minutes: 30,
      reason: form.reason.trim(),
      fee_bdt: selectedDoctor.doctor_profile.consultation_fee_bdt,
      payment_status: 'pending',
      reminder_24h_sent: false,
      reminder_2h_sent: false,
      created_at: nowIso,
      updated_at: nowIso,
    };

    setAppointments((prev) => [newAppointment, ...prev]);
    setSaving(false);
    setShowCreate(false);
    setForm({
      doctor_id: '',
      appointment_type: 'consultation',
      date: '',
      time: '',
      reason: '',
    });
  }

  function viewAppointmentDocument(appointment: Appointment) {
    viewDocument({
      title: `Appointment ${appointment.appointment_number}`,
      fileName: `appointment-${appointment.appointment_number}`,
      fields: [
        { label: 'Appointment Number', value: appointment.appointment_number },
        { label: 'Patient', value: `${appointment.patient_name} (${appointment.patient_mrn})` },
        { label: 'Doctor', value: `${appointment.doctor_name} (${appointment.doctor_specialty})` },
        { label: 'Date & Time', value: formatDateTime(appointment.scheduled_at) },
        { label: 'Type', value: appointment.appointment_type.replace(/_/g, ' ') },
        { label: 'Status', value: appointment.status.replace(/_/g, ' ') },
        { label: 'Reason', value: appointment.reason },
        { label: 'Fee', value: formatBDT(appointment.fee_bdt) },
        { label: 'Payment Status', value: appointment.payment_status },
      ],
    });
  }

  function downloadAppointmentDocument(appointment: Appointment) {
    downloadDocument({
      title: `Appointment ${appointment.appointment_number}`,
      fileName: `appointment-${appointment.appointment_number}`,
      fields: [
        { label: 'Appointment Number', value: appointment.appointment_number },
        { label: 'Patient', value: `${appointment.patient_name} (${appointment.patient_mrn})` },
        { label: 'Doctor', value: `${appointment.doctor_name} (${appointment.doctor_specialty})` },
        { label: 'Date & Time', value: formatDateTime(appointment.scheduled_at) },
        { label: 'Type', value: appointment.appointment_type.replace(/_/g, ' ') },
        { label: 'Status', value: appointment.status.replace(/_/g, ' ') },
        { label: 'Reason', value: appointment.reason },
        { label: 'Fee', value: formatBDT(appointment.fee_bdt) },
        { label: 'Payment Status', value: appointment.payment_status },
      ],
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Appointments"
        description="Upcoming consultations, visit history, and telemedicine links."
        actions={
          <Button onClick={() => setShowCreate((prev) => !prev)}>
            <Plus className="h-4 w-4" /> {showCreate ? 'Close' : 'Create Appointment'}
          </Button>
        }
      />

      {showCreate && (
        <SectionCard title="Create Appointment" description="Book a new appointment and add it to your history">
          <form onSubmit={handleCreateAppointment} className="grid gap-4 p-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Doctor *</Label>
              <select
                required
                value={form.doctor_id}
                onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}
                className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.full_name} - {doctor.doctor_profile?.specialty}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>Appointment Type *</Label>
              <select
                value={form.appointment_type}
                onChange={(e) => setForm({ ...form, appointment_type: e.target.value as AppointmentType })}
                className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="consultation">Consultation</option>
                <option value="follow_up">Follow-up</option>
                <option value="teleconsultation">Teleconsultation</option>
                <option value="procedure">Procedure</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>Date *</Label>
              <Input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Time *</Label>
              <Input
                type="time"
                required
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label>Reason *</Label>
              <Input
                required
                placeholder="Describe your issue or consultation reason"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
              />
            </div>

            {selectedDoctor?.doctor_profile && (
              <div className="sm:col-span-2 rounded-lg bg-secondary/40 px-4 py-3 text-sm">
                <span className="text-muted-foreground">Estimated fee: </span>
                <span className="font-semibold">{formatBDT(selectedDoctor.doctor_profile.consultation_fee_bdt)}</span>
              </div>
            )}

            {formError && (
              <div className="sm:col-span-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {formError}
              </div>
            )}

            <div className="sm:col-span-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                {!saving && <Plus className="h-4 w-4" />} Book Appointment
              </Button>
            </div>
          </form>
        </SectionCard>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <KPICard label="Upcoming" value={upcoming.length} icon={Calendar} />
        <KPICard label="Completed" value={appointments.filter((appointment) => appointment.status === 'completed').length} icon={Calendar} accentColor="healthy" />
        <KPICard label="Total Fees" value={formatBDT(appointments.reduce((sum, appointment) => sum + appointment.fee_bdt, 0))} icon={Calendar} accentColor="accent" />
      </div>

      <SectionCard title="Appointment History" description="SRS Module 3">
        <div className="divide-y divide-border">
          {history.map((appointment) => (
            <div key={appointment.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <div className="font-semibold">{appointment.doctor_name}</div>
                <div className="text-sm text-muted-foreground">{appointment.doctor_specialty} - {appointment.reason}</div>
                <div className="text-xs text-muted-foreground">{formatDateTime(appointment.scheduled_at)}</div>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Badge variant={appointment.status === 'completed' ? 'healthy' : appointment.status === 'confirmed' ? 'accent' : 'secondary'} className="capitalize">
                  {appointment.status.replace(/_/g, ' ')}
                </Badge>
                <Button type="button" size="sm" variant="outline" onClick={() => viewAppointmentDocument(appointment)}>
                  <Eye className="h-4 w-4" /> View
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => downloadAppointmentDocument(appointment)}>
                  <Download className="h-4 w-4" /> Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
