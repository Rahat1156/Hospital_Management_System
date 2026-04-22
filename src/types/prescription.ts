/**
 * Prescription types
 * Matches SRS Module 4: Digital Prescription Management
 */

import type { AuditFields, MRN, UUID } from './common';

export type PrescriptionStatus =
  | 'draft'
  | 'signed'
  | 'dispensed_partial'
  | 'dispensed_full'
  | 'cancelled';

export type MedicineFrequency =
  | 'once_daily'
  | 'twice_daily'
  | 'thrice_daily'
  | 'four_times_daily'
  | 'every_4_hours'
  | 'every_6_hours'
  | 'every_8_hours'
  | 'every_12_hours'
  | 'as_needed'
  | 'before_meals'
  | 'after_meals'
  | 'at_bedtime';

export type MedicineRoute =
  | 'oral'
  | 'iv'
  | 'im'
  | 'sc'
  | 'topical'
  | 'inhalation'
  | 'rectal'
  | 'ophthalmic'
  | 'nasal';

export interface Medicine {
  id: UUID;
  generic_name: string;
  brand_name: string;
  manufacturer?: string;
  strength: string; // "500mg", "10ml"
  form: 'tablet' | 'capsule' | 'syrup' | 'injection' | 'cream' | 'drops' | 'inhaler';
  contraindications?: string[];
  interactions?: string[]; // Drug IDs this interacts with
  requires_prescription: boolean;
}

export interface PrescribedMedicine {
  medicine_id: UUID;
  generic_name: string;
  brand_name: string;
  strength: string;
  dosage: string; // "1 tablet", "5ml"
  frequency: MedicineFrequency;
  route: MedicineRoute;
  duration_days: number;
  quantity: number; // Total units prescribed
  special_instructions?: string;
  dispensed_quantity: number; // Updated by pharmacy
}

export interface DrugInteraction {
  medicine_a_id: UUID;
  medicine_a_name: string;
  medicine_b_id: UUID;
  medicine_b_name: string;
  severity: 'minor' | 'moderate' | 'major' | 'contraindicated';
  description: string;
  recommendation: string;
}

export interface Prescription extends AuditFields {
  id: UUID;
  tenant_id: UUID;
  prescription_number: string;
  appointment_id?: UUID;
  patient_id: UUID;
  patient_mrn: MRN;
  patient_name: string;
  patient_age: number;
  patient_gender: string;
  doctor_id: UUID;
  doctor_name: string;
  doctor_bmdc_number: string;
  doctor_specialty: string;
  doctor_signature_url?: string;
  diagnosis: string;
  diagnosis_icd10?: string; // ICD-10 code
  chief_complaint: string;
  vital_signs?: {
    blood_pressure?: string;
    pulse?: number;
    temperature?: number;
    weight_kg?: number;
    height_cm?: number;
  };
  medicines: PrescribedMedicine[];
  advice?: string;
  follow_up_date?: string;
  follow_up_reminder_set: boolean;
  status: PrescriptionStatus;
  signed_at?: string;
  content_hash?: string; // SHA-256 hash for tamper detection (FR-PRE-03)
  pdf_url?: string;
  // Drug interaction warnings acknowledged by doctor (FR-PRE-02)
  acknowledged_warnings: Array<{
    interaction: DrugInteraction;
    acknowledged_at: string;
  }>;
}
