/**
 * Bed & Ward Management types
 * Matches SRS Module 8: Bed & Ward Management
 */

import type { AuditFields, MRN, UUID } from './common';

export type BedStatus = 'available' | 'occupied' | 'reserved' | 'maintenance' | 'cleaning';

export type WardType =
  | 'general'
  | 'private'
  | 'cabin'
  | 'icu'
  | 'ccu'
  | 'nicu'
  | 'picu'
  | 'emergency'
  | 'isolation'
  | 'maternity';

export interface Ward extends AuditFields {
  id: UUID;
  tenant_id: UUID;
  name: string; // "Ward A", "ICU Ward 3"
  ward_type: WardType;
  floor: string;
  block?: string;
  total_beds: number;
  available_beds: number;
  occupied_beds: number;
  reserved_beds: number;
  maintenance_beds: number;
  occupancy_rate: number; // Percentage (0-100)
  capacity_threshold: number; // Default 90% (FR-BED-02)
  threshold_alert_sent: boolean;
  head_nurse_id?: UUID;
  head_nurse_name?: string;
  daily_rate_bdt?: number;
}

export interface Bed extends AuditFields {
  id: UUID;
  tenant_id: UUID;
  ward_id: UUID;
  ward_name: string;
  bed_number: string; // "B-204"
  status: BedStatus;
  // If occupied
  current_patient_id?: UUID;
  current_patient_mrn?: MRN;
  current_patient_name?: string;
  admitting_doctor_id?: UUID;
  admitting_doctor_name?: string;
  admission_date?: string;
  expected_discharge_date?: string;
  // Features
  has_oxygen: boolean;
  has_ventilator: boolean;
  has_monitor: boolean;
  daily_rate_bdt: number;
  notes?: string;
}

export interface Admission extends AuditFields {
  id: UUID;
  tenant_id: UUID;
  admission_number: string;
  patient_id: UUID;
  patient_mrn: MRN;
  patient_name: string;
  bed_id: UUID;
  bed_number: string;
  ward_id: UUID;
  ward_name: string;
  admitting_doctor_id: UUID;
  admitting_doctor_name: string;
  admission_type: 'planned' | 'emergency' | 'transfer';
  admission_date: string;
  discharge_date?: string;
  admission_diagnosis: string;
  discharge_diagnosis?: string;
  status: 'admitted' | 'discharged' | 'transferred' | 'deceased' | 'lama'; // LAMA = Left Against Medical Advice
  estimated_stay_days: number;
  actual_stay_days?: number;
  attending_doctor_id?: UUID;
  attending_doctor_name?: string;
}
