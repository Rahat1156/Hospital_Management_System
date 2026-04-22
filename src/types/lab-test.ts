/**
 * Lab Test types
 * Matches SRS Module 5: Lab Test Management
 * Critical (Red) / Borderline (Amber) flagging per FR-LAB-01
 */

import type { AuditFields, MRN, UUID } from './common';

export type LabResultFlag = 'normal' | 'borderline' | 'critical' | 'abnormal_high' | 'abnormal_low';

export type LabTestStatus =
  | 'ordered'
  | 'sample_collected'
  | 'in_progress'
  | 'result_entered'
  | 'verified'
  | 'reported'
  | 'cancelled';

export type LabTestPriority = 'routine' | 'urgent' | 'stat' | 'critical';

export interface ReferenceRange {
  test_parameter_id: UUID;
  min_value?: number;
  max_value?: number;
  critical_low?: number;
  critical_high?: number;
  unit: string;
  age_group?: 'infant' | 'child' | 'adolescent' | 'adult' | 'elderly';
  gender?: 'male' | 'female' | 'all';
  notes?: string;
}

export interface TestParameter {
  id: UUID;
  name: string; // "Hemoglobin", "Glucose", "Creatinine"
  code: string; // "HGB", "GLU", "CRE"
  unit: string; // "g/dL", "mg/dL"
  reference_ranges: ReferenceRange[];
}

export interface LabTestCatalogItem {
  id: UUID;
  name: string; // "Complete Blood Count", "Lipid Profile"
  code: string; // "CBC", "LIPID"
  category: string; // "Hematology", "Biochemistry", "Microbiology", "Radiology"
  parameters: TestParameter[];
  price_bdt: number;
  sample_type: string; // "Blood", "Urine", "Stool"
  turnaround_hours: number;
  description?: string;
  preparation_required?: string;
}

export interface LabTestResult {
  parameter_id: UUID;
  parameter_name: string;
  value: string | number;
  unit: string;
  flag: LabResultFlag;
  reference_range_display: string; // "12.0 - 15.5"
  notes?: string;
}

export interface LabTest extends AuditFields {
  id: UUID;
  tenant_id: UUID;
  test_number: string;
  patient_id: UUID;
  patient_mrn: MRN;
  patient_name: string;
  patient_age: number;
  patient_gender: string;
  ordered_by_doctor_id: UUID;
  ordered_by_doctor_name: string;
  catalog_item_id: UUID;
  test_name: string;
  test_code: string;
  category: string;
  priority: LabTestPriority;
  status: LabTestStatus;
  ordered_at: string;
  sample_collected_at?: string;
  sample_collected_by?: UUID;
  sample_id?: string; // Barcode
  result_entered_at?: string;
  entered_by_technician_id?: UUID;
  entered_by_technician_name?: string;
  verified_at?: string;
  verified_by?: UUID;
  reported_at?: string;
  results?: LabTestResult[];
  overall_flag: LabResultFlag; // Highest flag across all results
  clinical_notes?: string;
  report_pdf_url?: string;
  price_bdt: number;
  payment_status: 'pending' | 'paid' | 'waived';
  // HAS alert tracking
  critical_alert_triggered: boolean;
  critical_alert_sent_at?: string;
}
