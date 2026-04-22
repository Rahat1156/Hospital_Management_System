/**
 * Patient types
 * Matches SRS Module 2: Patient Profile & Registration
 * MRN format: HAX-XXXXX per FR-PAT-01
 */

import type {
  Address,
  AuditFields,
  BloodGroup,
  Gender,
  MaritalStatus,
  MRN,
  PhoneNumber,
  UUID,
} from './common';

export type PatientType = 'self_registered' | 'walk_in' | 'guardian_registered';

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: PhoneNumber;
  email?: string;
}

export interface MedicalHistory {
  allergies: string[];
  chronic_conditions: string[];
  current_medications: string[];
  past_surgeries: Array<{ procedure: string; date: string; hospital?: string }>;
  family_history: string[];
}

export interface Patient extends AuditFields {
  id: UUID;
  tenant_id: UUID;
  mrn: MRN; // HAX-XXXXX format
  full_name: string;
  name_bangla?: string;
  date_of_birth: string;
  gender: Gender;
  marital_status?: MaritalStatus;
  nid_number?: string; // Bangladesh National ID (unique per FR-PAT-02)
  birth_certificate_number?: string; // For children without NID
  blood_group?: BloodGroup;
  phone: PhoneNumber;
  email?: string;
  profile_photo_url?: string;
  address: Address;
  occupation?: string;
  religion?: string;
  emergency_contacts: EmergencyContact[]; // Min 1, max 3
  medical_history: MedicalHistory;
  patient_type: PatientType;
  guardian_id?: UUID; // If linked to a guardian account
  registered_by?: UUID; // Staff who registered (for walk-in)
  // Computed fields
  age_years?: number;
  last_visit_date?: string;
  total_visits?: number;
  outstanding_balance_bdt?: number;
}

// Guardian/family account - one guardian can manage up to 10 linked profiles (FR-PAT-04)
export interface GuardianAccount extends AuditFields {
  id: UUID;
  primary_user_id: UUID;
  linked_patients: Array<{
    patient_id: UUID;
    mrn: MRN;
    full_name: string;
    relationship: string;
    can_book_appointments: boolean;
    can_view_prescriptions: boolean;
    can_view_lab_reports: boolean;
    can_pay_bills: boolean;
  }>;
}

// Health history timeline entry (FR-PAT-05)
export type TimelineEventType =
  | 'appointment'
  | 'prescription'
  | 'lab_test'
  | 'admission'
  | 'discharge'
  | 'emergency'
  | 'vaccination'
  | 'procedure'
  | 'bill';

export interface HealthTimelineEvent {
  id: UUID;
  patient_id: UUID;
  event_type: TimelineEventType;
  event_date: string;
  title: string;
  description?: string;
  doctor_name?: string;
  department?: string;
  attachment_url?: string;
  reference_id: UUID; // Links to the actual appointment/prescription/etc.
  icon?: string;
}
