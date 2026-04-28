/**
 * User (Staff) types - covers all 8 roles from SRS
 * Matches SRS Module 11: Doctor & Staff Management
 */

import type { AuditFields, Gender, PhoneNumber, UUID, VerificationStatus } from './common';

// 8 roles per SRS Section 3.3.1
export type UserRole =
  | 'super_admin'       // Platform-level (SaaS operator)
  | 'hospital_admin'    // Tenant-level admin
  | 'doctor'            // Clinical
  | 'nurse'             // Clinical
  | 'lab_technician'    // Lab module
  | 'pharmacist'        // Pharmacy module
  | 'receptionist'      // Front desk
  | 'patient';          // End user

export type UserStatus = 'active' | 'inactive' | 'locked' | 'pending_verification';

export interface Permission {
  module: string;
  actions: Array<'view' | 'create' | 'update' | 'delete' | 'export' | 'approve'>;
}

// Doctor-specific fields
export interface DoctorProfile {
  bmdc_number: string; // Bangladesh Medical & Dental Council (required per SRS)
  specialty: string;
  sub_specialty?: string;
  qualifications: string[]; // ["MBBS", "FCPS", "MD"]
  years_of_experience: number;
  consultation_fee_bdt: number;
  languages: string[]; // ["Bangla", "English"]
  bio?: string;
  signature_url?: string; // e-signature for prescriptions
  availability?: DoctorAvailability[];
}

export interface DoctorAvailability {
  day_of_week: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  start_time: string; // "09:00"
  end_time: string; // "17:00"
  slot_duration_minutes: number; // 15, 30, 45, 60
  break_start?: string;
  break_end?: string;
}

// Nurse-specific fields
export interface NurseProfile {
  license_number: string;
  ward_assigned?: string;
  shift: 'morning' | 'evening' | 'night' | 'rotating';
}

// Lab Technician fields
export interface LabTechProfile {
  license_number?: string;
  specializations: string[]; // ["Hematology", "Biochemistry"]
}

// Pharmacist fields
export interface PharmacistProfile {
  license_number: string;
  pharmacy_id?: UUID;
}

export interface User extends AuditFields {
  id: UUID;
  tenant_id?: UUID; // null for super_admin
  role: UserRole;
  email: string;
  phone: PhoneNumber;
  full_name: string;
  display_name?: string;
  profile_photo_url?: string;
  gender?: Gender;
  date_of_birth?: string;
  status: UserStatus;
  email_verified: boolean;
  phone_verified: boolean;
  two_factor_enabled: boolean;
  last_login_at?: string;
  last_login_ip?: string;
  locked_until?: string; // Per NFR-SEC account locks after 5 failed attempts
  failed_login_attempts: number;
  permissions?: Permission[];
  // Role-specific profile (only one will be populated)
  doctor_profile?: DoctorProfile;
  nurse_profile?: NurseProfile;
  lab_tech_profile?: LabTechProfile;
  pharmacist_profile?: PharmacistProfile;
  // Populated for patient role only
  patient_id?: string;
  mrn?: string;
}

// Auth-related types
export interface LoginCredentials {
  email: string;
  password: string;
  tenant_subdomain?: string;
  remember_me?: boolean;
}

export interface RegisterData {
  full_name: string;
  email: string;
  phone: PhoneNumber;
  password: string;
  password_confirmation: string;
  date_of_birth: string;
  gender: Gender;
  nid_number?: string;
  agreed_to_terms: boolean;
}

export interface OtpVerification {
  identifier: string; // email or phone
  otp_code: string; // 6-digit per SRS NFR-SEC-08
  purpose: 'registration' | 'password_reset' | 'two_factor' | 'phone_verification';
}

export interface AuthSession {
  user: User;
  tenant?: import('./tenant').Tenant;
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

export interface TwoFactorSetup {
  qr_code_url: string;
  secret: string;
  backup_codes: string[];
}
