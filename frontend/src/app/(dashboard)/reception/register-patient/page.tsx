'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle, UserPlus } from 'lucide-react';
import { PageHeader, SectionCard } from '@/components/shared';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { patientAPI } from '@/lib/mock-api';
import type { Patient } from '@/types';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const RELIGIONS = ['Islam', 'Hinduism', 'Christianity', 'Buddhism', 'Other'];
const DIVISIONS = ['Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'];

const S =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';

const EMPTY: Record<string, string> = {
  full_name: '',
  father_name: '',
  mother_name: '',
  phone_country_code: '+880',
  phone_number: '',
  date_of_birth: '',
  gender: '',
  marital_status: '',
  religion: '',
  occupation: '',
  nid_number: '',
  birth_certificate_number: '',
  blood_group: '',
  email: '',
  address_line1: '',
  address_city: '',
  address_district: '',
  address_division: '',
  address_postal_code: '',
  emergency_contact_name: '',
  emergency_contact_relation: '',
  emergency_contact_phone: '',
  allergies: '',
  chronic_conditions: '',
};

function Field({
  label,
  required,
  children,
  col2,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  col2?: boolean;
}) {
  return (
    <div className={col2 ? 'md:col-span-2' : undefined}>
      <Label className="mb-1 block text-sm font-medium">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}

export default function ReceptionRegisterPatientPage() {
  const [form, setForm] = useState<Record<string, string>>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registered, setRegistered] = useState<Patient | null>(null);

  function handle(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!form.full_name.trim() || !form.phone_number.trim() || !form.date_of_birth || !form.gender) {
      setError('Full name, phone number, date of birth, and gender are required.');
      return;
    }

    setLoading(true);
    try {
      const res = await patientAPI.registerWalkIn({
        full_name: form.full_name.trim(),
        father_name: form.father_name.trim() || undefined,
        mother_name: form.mother_name.trim() || undefined,
        phone_country_code: form.phone_country_code.trim() || '+880',
        phone_number: form.phone_number.trim(),
        date_of_birth: form.date_of_birth,
        gender: form.gender,
        marital_status: form.marital_status || undefined,
        religion: form.religion || undefined,
        occupation: form.occupation.trim() || undefined,
        nid_number: form.nid_number.trim() || undefined,
        birth_certificate_number: form.birth_certificate_number.trim() || undefined,
        blood_group: form.blood_group || undefined,
        email: form.email.trim() || undefined,
        address_line1: form.address_line1.trim() || undefined,
        address_city: form.address_city.trim() || undefined,
        address_district: form.address_district.trim() || undefined,
        address_division: form.address_division || undefined,
        address_postal_code: form.address_postal_code.trim() || undefined,
        emergency_contact_name: form.emergency_contact_name.trim() || undefined,
        emergency_contact_relation: form.emergency_contact_relation.trim() || undefined,
        emergency_contact_phone: form.emergency_contact_phone.trim() || undefined,
        allergies: form.allergies.trim() || undefined,
        chronic_conditions: form.chronic_conditions.trim() || undefined,
      });
      setRegistered(res.data);
      setForm(EMPTY);
    } catch (err: unknown) {
      const apiErr = err as { message?: string; errors?: Record<string, string[]> };
      const fieldErrors = apiErr?.errors
        ? Object.values(apiErr.errors).flat().join(' ')
        : null;
      setError(fieldErrors || apiErr?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Register Patient"
        description="Walk-in patient registration — record is created instantly with a unique MRN."
      />

      {registered && (
        <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
          <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <div className="font-semibold">Patient registered successfully</div>
            <div className="mt-1 text-sm">
              <span className="font-medium">{registered.full_name}</span>
              {' — MRN: '}
              <span className="font-mono font-bold tracking-widest">{registered.mrn}</span>
            </div>
            {registered.father_name && (
              <div className="mt-0.5 text-xs text-green-700 dark:text-green-400">
                Father: {registered.father_name}
              </div>
            )}
            <button
              type="button"
              className="mt-2 text-sm underline underline-offset-2"
              onClick={() => setRegistered(null)}
            >
              Register another patient
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="text-sm">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Personal Information ── */}
        <SectionCard title="Personal Information" description="Basic patient identity details">
          <div className="grid gap-4 p-5 md:grid-cols-2">

            <Field label="Full Name" required>
              <Input name="full_name" value={form.full_name} onChange={handle} placeholder="Md. Rahim Uddin" />
            </Field>

            <Field label="Father's Name">
              <Input name="father_name" value={form.father_name} onChange={handle} placeholder="Md. Karim Uddin" />
            </Field>

            <Field label="Mother's Name">
              <Input name="mother_name" value={form.mother_name} onChange={handle} placeholder="Fatema Begum" />
            </Field>

            <Field label="Date of Birth" required>
              <Input name="date_of_birth" type="date" value={form.date_of_birth} onChange={handle} />
            </Field>

            <Field label="Gender" required>
              <select name="gender" value={form.gender} onChange={handle} className={S}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </Field>

            <Field label="Marital Status">
              <select name="marital_status" value={form.marital_status} onChange={handle} className={S}>
                <option value="">Select status</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
            </Field>

            <Field label="Religion">
              <select name="religion" value={form.religion} onChange={handle} className={S}>
                <option value="">Select religion</option>
                {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>

            <Field label="Occupation">
              <Input name="occupation" value={form.occupation} onChange={handle} placeholder="e.g. Teacher, Farmer, Business" />
            </Field>

            <Field label="Blood Group">
              <select name="blood_group" value={form.blood_group} onChange={handle} className={S}>
                <option value="">Unknown / not provided</option>
                {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </Field>

            <Field label="Email (optional)">
              <Input name="email" type="email" value={form.email} onChange={handle} placeholder="patient@example.com" />
            </Field>

          </div>
        </SectionCard>

        {/* ── Identification ── */}
        <SectionCard title="Identification" description="National ID or birth certificate number">
          <div className="grid gap-4 p-5 md:grid-cols-2">

            <Field label="NID Number">
              <Input name="nid_number" value={form.nid_number} onChange={handle} placeholder="10, 13, or 17-digit NID" />
            </Field>

            <Field label="Birth Certificate Number">
              <Input name="birth_certificate_number" value={form.birth_certificate_number} onChange={handle} placeholder="For minors without NID" />
            </Field>

          </div>
        </SectionCard>

        {/* ── Contact & Phone ── */}
        <SectionCard title="Contact Information" description="Phone number and address">
          <div className="grid gap-4 p-5 md:grid-cols-2">

            <Field label="Phone Number" required>
              <div className="flex gap-2">
                <Input
                  name="phone_country_code"
                  value={form.phone_country_code}
                  onChange={handle}
                  className="w-20 shrink-0"
                  placeholder="+880"
                />
                <Input
                  name="phone_number"
                  value={form.phone_number}
                  onChange={handle}
                  placeholder="1712345678"
                />
              </div>
            </Field>

            <Field label="Address Line">
              <Input name="address_line1" value={form.address_line1} onChange={handle} placeholder="House no., Road, Area" />
            </Field>

            <Field label="City / Thana">
              <Input name="address_city" value={form.address_city} onChange={handle} placeholder="Mirpur" />
            </Field>

            <Field label="District">
              <Input name="address_district" value={form.address_district} onChange={handle} placeholder="Dhaka" />
            </Field>

            <Field label="Division">
              <select name="address_division" value={form.address_division} onChange={handle} className={S}>
                <option value="">Select division</option>
                {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>

            <Field label="Postal Code">
              <Input name="address_postal_code" value={form.address_postal_code} onChange={handle} placeholder="1216" />
            </Field>

          </div>
        </SectionCard>

        {/* ── Emergency Contact ── */}
        <SectionCard title="Emergency Contact" description="Person to contact in case of emergency">
          <div className="grid gap-4 p-5 md:grid-cols-2">

            <Field label="Contact Name">
              <Input name="emergency_contact_name" value={form.emergency_contact_name} onChange={handle} placeholder="Md. Salam Uddin" />
            </Field>

            <Field label="Relationship">
              <Input name="emergency_contact_relation" value={form.emergency_contact_relation} onChange={handle} placeholder="e.g. Spouse, Son, Brother" />
            </Field>

            <Field label="Contact Phone">
              <Input name="emergency_contact_phone" value={form.emergency_contact_phone} onChange={handle} placeholder="1812345678" />
            </Field>

          </div>
        </SectionCard>

        {/* ── Medical Notes ── */}
        <SectionCard title="Medical Notes" description="Known allergies or chronic conditions (comma separated)">
          <div className="grid gap-4 p-5 md:grid-cols-2">

            <Field label="Known Allergies">
              <Input name="allergies" value={form.allergies} onChange={handle} placeholder="e.g. Penicillin, Dust, Pollen" />
            </Field>

            <Field label="Chronic Conditions">
              <Input name="chronic_conditions" value={form.chronic_conditions} onChange={handle} placeholder="e.g. Diabetes, Hypertension" />
            </Field>

          </div>
        </SectionCard>

        {/* ── Submit ── */}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={loading} className="gap-2">
            <UserPlus className="h-4 w-4" />
            {loading ? 'Registering…' : 'Register Patient'}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => { setForm(EMPTY); setError(null); }}
          >
            Clear Form
          </Button>
        </div>

      </form>
    </div>
  );
}
