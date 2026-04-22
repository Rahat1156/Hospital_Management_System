/**
 * Appointment types
 * Matches SRS Module 3: Appointment & Scheduling Management
 */

import type { AuditFields, MRN, UUID } from './common';

export type AppointmentType =
  | 'consultation'
  | 'follow_up'
  | 'teleconsultation'
  | 'procedure'
  | 'emergency';

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'checked_in'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'rescheduled';

export type AppointmentSource = 'online_patient' | 'walk_in' | 'phone' | 'app';

export interface Appointment extends AuditFields {
  id: UUID;
  tenant_id: UUID;
  appointment_number: string; // Human-readable ID
  patient_id: UUID;
  patient_mrn: MRN;
  patient_name: string;
  patient_phone: string;
  doctor_id: UUID;
  doctor_name: string;
  doctor_specialty: string;
  department?: string;
  appointment_type: AppointmentType;
  status: AppointmentStatus;
  source: AppointmentSource;
  scheduled_at: string; // ISO datetime
  duration_minutes: number;
  reason: string; // Chief complaint
  notes?: string;
  checked_in_at?: string;
  started_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  cancelled_by?: UUID;
  fee_bdt: number;
  payment_status: 'pending' | 'paid' | 'waived';
  // Teleconsultation specific (FR-APT-04)
  video_link?: string;
  video_room_id?: string;
  // Reminders sent
  reminder_24h_sent: boolean;
  reminder_2h_sent: boolean;
}

export interface TimeSlot {
  start_time: string; // "09:00"
  end_time: string; // "09:30"
  is_available: boolean;
  is_break: boolean;
}

export interface DoctorScheduleDay {
  date: string; // "2026-04-25"
  doctor_id: UUID;
  slots: TimeSlot[];
}

export interface BookAppointmentPayload {
  patient_id: UUID;
  doctor_id: UUID;
  appointment_type: AppointmentType;
  scheduled_at: string;
  duration_minutes: number;
  reason: string;
  notes?: string;
}
