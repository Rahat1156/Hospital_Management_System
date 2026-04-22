/**
 * Audit Log & Analytics types
 * Matches SRS NFR-SEC-06 and Module 13
 */

import type { UUID } from './common';

// Audit log (FR per NFR-SEC-06, retained 5 years)
export interface AuditLog {
  id: UUID;
  tenant_id: UUID;
  user_id: UUID;
  user_name: string;
  user_role: string;
  action: string; // "patient.created", "prescription.signed", "bill.discount_applied"
  resource_type: string; // "patient", "prescription", "bill"
  resource_id: UUID;
  description: string;
  ip_address: string;
  user_agent?: string;
  request_data?: Record<string, unknown>;
  response_status?: number;
  timestamp: string;
}

// Analytics KPIs
export interface DashboardKPIs {
  total_patients: number;
  total_patients_delta_percent: number;
  appointments_today: number;
  appointments_today_delta_percent: number;
  revenue_today_bdt: number;
  revenue_today_delta_percent: number;
  revenue_month_bdt: number;
  revenue_month_delta_percent: number;
  bed_occupancy_rate: number;
  active_doctors: number;
  pending_lab_tests: number;
  pending_prescriptions: number;
  active_alerts: number;
  critical_alerts: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  date?: string;
  category?: string;
}

export interface DoctorPerformance {
  doctor_id: UUID;
  doctor_name: string;
  specialty: string;
  patients_seen: number;
  revenue_generated_bdt: number;
  avg_appointment_minutes: number;
  patient_satisfaction_score?: number;
}

export interface DepartmentMetrics {
  department: string;
  patient_count: number;
  revenue_bdt: number;
  avg_wait_minutes: number;
  occupancy_rate?: number;
}
