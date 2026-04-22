'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Filter, Plus, Search, Users, X } from 'lucide-react';
import { PageHeader, EmptyState, SectionCard } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { patientAPI } from '@/lib/mock-api';
import { calculateAge, formatDate, formatPhone, generateMRN } from '@/lib/utils';
import type { Patient, BloodGroup, Gender } from '@/types';

export default function PatientListPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | Gender>('all');
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    patientAPI.list().then((r) => setPatients(r.data));
  }, []);

  const filtered = patients.filter((p) => {
    const q = search.toLowerCase();
    const matchQuery =
      !q || p.full_name.toLowerCase().includes(q) || p.mrn.toLowerCase().includes(q) || p.phone.number.includes(q);
    const matchGender = genderFilter === 'all' || p.gender === genderFilter;
    return matchQuery && matchGender;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patients"
        description={`${patients.length.toLocaleString()} registered patients`}
        actions={
          <Button onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4" /> Add Patient
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Input
            leftIcon={<Search className="h-4 w-4" />}
            placeholder="Search by name, MRN, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'male', 'female'] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGenderFilter(g)}
              className={`rounded-md border px-4 h-11 text-sm font-medium transition-colors ${
                genderFilter === g
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background hover:bg-secondary'
              }`}
            >
              {g === 'all' ? 'All' : g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
          <Button variant="outline" size="lg" className="h-11">
            <Filter className="h-4 w-4" /> More
          </Button>
        </div>
      </div>

      {/* Table */}
      <SectionCard title="Patient Directory" description={`Showing ${filtered.length} of ${patients.length}`}>
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Users}
              title="No patients found"
              description="Try adjusting your search or filter."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/30">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3">Patient</th>
                  <th className="px-3 py-3">MRN</th>
                  <th className="px-3 py-3">Age / Gender</th>
                  <th className="px-3 py-3">Blood</th>
                  <th className="px-3 py-3">Phone</th>
                  <th className="px-3 py-3">Last Visit</th>
                  <th className="px-3 py-3">Balance</th>
                  <th className="px-3 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-secondary/30">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={p.full_name} size="sm" />
                        <div>
                          <div className="font-medium">{p.full_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {p.patient_type.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <code className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary">
                        {p.mrn}
                      </code>
                    </td>
                    <td className="px-3 py-3">
                      {p.age_years}y · {p.gender}
                    </td>
                    <td className="px-3 py-3">
                      {p.blood_group && <Badge variant="outline" className="font-mono">{p.blood_group}</Badge>}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{formatPhone(p.phone)}</td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {p.last_visit_date ? formatDate(p.last_visit_date) : '—'}
                    </td>
                    <td className="px-3 py-3">
                      {(p.outstanding_balance_bdt ?? 0) > 0 ? (
                        <Badge variant="warning">Due ৳{p.outstanding_balance_bdt}</Badge>
                      ) : (
                        <Badge variant="healthy">Paid</Badge>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/patients/${p.id}`}>View</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {showAdd && <AddPatientModal onClose={() => setShowAdd(false)} onSaved={(p) => setPatients([p, ...patients])} />}
    </div>
  );
}

/* ============================================================================
   Add Patient Modal
   ============================================================================ */
function AddPatientModal({ onClose, onSaved }: { onClose: () => void; onSaved: (p: Patient) => void }) {
  const [form, setForm] = useState({
    full_name: '', nid_number: '', date_of_birth: '', gender: 'male' as Gender,
    blood_group: '' as BloodGroup | '', phone: '', email: '',
    address_line1: '', city: 'Dhaka', district: 'Dhaka',
    emergency_name: '', emergency_relationship: '', emergency_phone: '',
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    const newPatient: Patient = {
      id: `patient-${Date.now()}`,
      tenant_id: 'tenant-001',
      mrn: generateMRN(),
      full_name: form.full_name,
      date_of_birth: form.date_of_birth,
      gender: form.gender,
      nid_number: form.nid_number || undefined,
      blood_group: (form.blood_group || undefined) as BloodGroup | undefined,
      phone: { country_code: '+880', number: form.phone },
      email: form.email || undefined,
      address: {
        line1: form.address_line1, city: form.city, district: form.district,
        division: 'Dhaka', postal_code: '1209', country: 'Bangladesh',
      },
      emergency_contacts: form.emergency_name
        ? [{
            name: form.emergency_name,
            relationship: form.emergency_relationship,
            phone: { country_code: '+880', number: form.emergency_phone },
          }]
        : [],
      medical_history: { allergies: [], chronic_conditions: [], current_medications: [], past_surgeries: [], family_history: [] },
      patient_type: 'walk_in',
      age_years: calculateAge(form.date_of_birth),
      total_visits: 0,
      outstanding_balance_bdt: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setSaving(false);
    onSaved(newPatient);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-slim rounded-xl border border-border bg-card shadow-elevated animate-fade-up">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold">Register New Patient</h3>
            <p className="text-xs text-muted-foreground">MRN will be auto-generated on save.</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          {/* Personal */}
          <FormSection title="Personal Information">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full Name" required>
                <Input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              </Field>
              <Field label="NID Number">
                <Input placeholder="10 or 13 digits" value={form.nid_number} onChange={(e) => setForm({ ...form, nid_number: e.target.value })} />
              </Field>
              <Field label="Date of Birth" required>
                <Input type="date" required value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} />
              </Field>
              <Field label="Gender" required>
                <select
                  className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value as Gender })}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </Field>
              <Field label="Blood Group">
                <select
                  className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={form.blood_group}
                  onChange={(e) => setForm({ ...form, blood_group: e.target.value as BloodGroup | '' })}
                >
                  <option value="">—</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </Field>
            </div>
          </FormSection>

          {/* Contact */}
          <FormSection title="Contact">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone" required>
                <div className="flex gap-2">
                  <div className="flex items-center rounded-md border border-input bg-secondary px-3 text-sm font-medium">+880</div>
                  <Input required placeholder="1712345678" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
              </Field>
              <Field label="Email">
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Field>
              <Field label="Address" className="sm:col-span-2">
                <Input placeholder="House, Road, Area" value={form.address_line1} onChange={(e) => setForm({ ...form, address_line1: e.target.value })} />
              </Field>
            </div>
          </FormSection>

          {/* Emergency */}
          <FormSection title="Emergency Contact">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Name">
                <Input value={form.emergency_name} onChange={(e) => setForm({ ...form, emergency_name: e.target.value })} />
              </Field>
              <Field label="Relationship">
                <Input placeholder="e.g. Wife" value={form.emergency_relationship} onChange={(e) => setForm({ ...form, emergency_relationship: e.target.value })} />
              </Field>
              <Field label="Phone">
                <Input value={form.emergency_phone} onChange={(e) => setForm({ ...form, emergency_phone: e.target.value })} />
              </Field>
            </div>
          </FormSection>

          <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={saving}>
              {!saving && <Plus className="h-4 w-4" />} Register patient
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</div>
      {children}
    </div>
  );
}

function Field({ label, required, className, children }: {
  label: string; required?: boolean; className?: string; children: React.ReactNode;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ''}`}>
      <Label>{label}{required && <span className="text-destructive"> *</span>}</Label>
      {children}
    </div>
  );
}
