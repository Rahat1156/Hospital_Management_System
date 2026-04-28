'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, Plus, Search, UserPlus, Users } from 'lucide-react';
import { PageHeader, SectionCard, KPICard, EmptyState } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { appointmentAPI, patientAPI } from '@/lib/mock-api';
import { useAuthStore } from '@/lib/auth-store';
import { formatTime, formatDate } from '@/lib/utils';
import type { Appointment, Patient } from '@/types';

export default function ReceptionDashboardPage() {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    appointmentAPI.getToday().then((r) => setAppointments(r.data));
    patientAPI.list().then((r) => setPatients(r.data));
  }, []);

  const waiting = appointments.filter((a) => ['scheduled', 'confirmed'].includes(a.status)).length;
  const checkedIn = appointments.filter((a) => a.status === 'checked_in').length;
  const completed = appointments.filter((a) => a.status === 'completed').length;

  const filteredPatients = patients.filter((p) => {
    const q = search.toLowerCase();
    return (
      !q ||
      p.full_name.toLowerCase().includes(q) ||
      p.mrn.toLowerCase().includes(q) ||
      p.phone.number.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user?.full_name ?? 'Receptionist'}`}
        description="Front desk — check-ins, appointments and patient registration"
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/reception/register-patient">
                <UserPlus className="h-4 w-4" /> Register Patient
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/reception/appointments">
                <Plus className="h-4 w-4" /> New Appointment
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="Today's Total" value={appointments.length} icon={Calendar} accentColor="primary" />
        <KPICard label="Waiting / Confirmed" value={waiting} icon={Clock} accentColor="borderline" />
        <KPICard label="Checked In" value={checkedIn} icon={Users} accentColor="accent" />
        <KPICard label="Completed" value={completed} icon={Calendar} accentColor="healthy" />
      </div>

      <SectionCard
        title="Today's Appointment Queue"
        description={`${appointments.length} appointments today`}
        action={
          <Button asChild variant="outline" size="sm">
            <Link href="/reception/appointments">Full schedule</Link>
          </Button>
        }
      >
        {appointments.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={Calendar} title="No appointments today" description="No appointments scheduled for today." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/30">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3">Time</th>
                  <th className="px-3 py-3">Patient</th>
                  <th className="px-3 py-3">Doctor</th>
                  <th className="px-3 py-3">Type</th>
                  <th className="px-3 py-3">Fee</th>
                  <th className="px-3 py-3">Payment</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {appointments.map((a) => (
                  <tr key={a.id} className="hover:bg-secondary/30">
                    <td className="px-5 py-3 shrink-0">
                      <div className="font-bold tabular-nums">{formatTime(a.scheduled_at).split(' ')[0]}</div>
                      <div className="text-[10px] font-semibold uppercase text-muted-foreground">
                        {formatTime(a.scheduled_at).split(' ')[1]}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={a.patient_name} size="sm" />
                        <div>
                          <div className="font-medium">{a.patient_name}</div>
                          <div className="font-mono text-xs text-muted-foreground">{a.patient_mrn}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-medium">{a.doctor_name}</div>
                      <div className="text-xs text-muted-foreground">{a.doctor_specialty}</div>
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant="secondary" className="capitalize text-[11px]">
                        {a.appointment_type.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 tabular-nums font-medium">৳{a.fee_bdt.toLocaleString()}</td>
                    <td className="px-3 py-3">
                      <Badge variant={a.payment_status === 'paid' ? 'healthy' : 'warning'}>
                        {a.payment_status}
                      </Badge>
                    </td>
                    <td className="px-3 py-3">
                      <Badge
                        variant={
                          a.status === 'completed' ? 'healthy'
                          : a.status === 'checked_in' || a.status === 'in_progress' ? 'accent'
                          : a.status === 'cancelled' ? 'destructive'
                          : 'secondary'
                        }
                        className="capitalize"
                      >
                        {a.status.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-right">
                      {(a.status === 'scheduled' || a.status === 'confirmed') && (
                        <Button variant="outline" size="sm">
                          Check In
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Patient Search"
        description="Quick patient lookup by name, MRN, or phone"
      >
        <div className="p-4">
          <Input
            leftIcon={<Search className="h-4 w-4" />}
            placeholder="Search patients by name, MRN, or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {search && (
          <div className="border-t border-border">
            {filteredPatients.length === 0 ? (
              <div className="p-6">
                <EmptyState icon={Users} title="No patients found" description="Try a different search term." />
              </div>
            ) : (
              <div className="divide-y divide-border max-h-64 overflow-y-auto scrollbar-slim">
                {filteredPatients.slice(0, 8).map((p) => (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/30">
                    <Avatar name={p.full_name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{p.full_name}</div>
                      <div className="text-xs text-muted-foreground">
                        <code>{p.mrn}</code> · {p.age_years}y {p.gender} · {p.phone.number}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      {(p.outstanding_balance_bdt ?? 0) > 0 ? (
                        <Badge variant="warning">Due ৳{p.outstanding_balance_bdt}</Badge>
                      ) : (
                        <Badge variant="healthy">Clear</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
