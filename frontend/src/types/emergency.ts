/**
 * Emergency & Ambulance Service types
 * Matches SRS Module 7: Emergency & Ambulance Service
 */

import type { AuditFields, MRN, PhoneNumber, UUID } from './common';

export type EmergencyStatus =
  | 'sos_received'
  | 'dispatcher_assigned'
  | 'ambulance_assigned'
  | 'en_route_to_patient'
  | 'at_patient_location'
  | 'transporting'
  | 'arrived_at_er'
  | 'handed_over'
  | 'cancelled'
  | 'false_alarm';

export type AmbulanceStatus = 'available' | 'on_duty' | 'returning' | 'maintenance' | 'offline';

export interface GpsLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  updated_at: string;
  address?: string;
}

export interface Ambulance extends AuditFields {
  id: UUID;
  tenant_id: UUID;
  vehicle_number: string; // "DHK-AMB-001"
  vehicle_type: 'basic' | 'advanced' | 'icu' | 'neonatal';
  status: AmbulanceStatus;
  driver_id?: UUID;
  driver_name?: string;
  driver_phone?: PhoneNumber;
  paramedic_id?: UUID;
  paramedic_name?: string;
  current_location?: GpsLocation;
  equipment: string[];
  // Current assignment
  current_request_id?: UUID;
}

export interface EmergencyRequest extends AuditFields {
  id: UUID;
  tenant_id: UUID;
  request_number: string; // "EMR-2026-0001"
  // Source of SOS (FR-EMR-01)
  patient_id?: UUID;
  patient_mrn?: MRN;
  patient_name: string;
  patient_phone: PhoneNumber;
  patient?: {
    id: UUID;
    user_id?: UUID;
    mrn?: MRN;
    full_name?: string;
    gender?: Gender;
    date_of_birth?: string;
    blood_group?: string;
    phone?: PhoneNumber;
    email?: string;
    medical_history?: Record<string, unknown>;
    address?: Record<string, unknown>;
  };
  requester_name?: string; // If different from patient
  requester_phone?: PhoneNumber;
  requester_relationship?: string;
  // Location
  pickup_location: GpsLocation;
  destination_hospital_id?: UUID;
  destination_hospital_name?: string;
  // Status tracking
  status: EmergencyStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  chief_complaint: string;
  reported_vitals?: {
    consciousness?: 'alert' | 'responsive' | 'unresponsive';
    breathing?: 'normal' | 'labored' | 'stopped';
    bleeding?: 'none' | 'minor' | 'severe';
    notes?: string;
  };
  // Assignments
  dispatcher_id?: UUID;
  dispatcher_name?: string;
  ambulance_id?: UUID;
  ambulance_number?: string;
  // Timeline
  sos_received_at: string;
  dispatcher_assigned_at?: string;
  ambulance_assigned_at?: string;
  ambulance_dispatched_at?: string;
  arrived_at_patient_at?: string;
  left_patient_location_at?: string;
  arrived_at_er_at?: string;
  estimated_arrival_time?: string;
  // ER pre-notification (FR-EMR-03)
  er_pre_notification_sent: boolean;
  er_pre_notification_sent_at?: string;
  known_allergies?: string[];
  last_known_vitals?: string;
  // Outcome
  outcome?: string;
  notes?: string;
}
