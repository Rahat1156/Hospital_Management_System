/**
 * Common types used across all modules.
 * These shapes will match the Laravel API response format.
 */

// Standard API response wrapper (matches Laravel API Resources)
export interface ApiResponse<T> {
  data: T;
  message?: string;
  meta?: PaginationMeta;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  links?: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

// Common primitive types
export type ISODateString = string; // e.g., "2026-04-22T10:30:00Z"
export type UUID = string;
export type MRN = string; // Format: HAX-XXXXX (per SRS FR-PAT-01)

// Common status types
export type ActiveStatus = 'active' | 'inactive' | 'suspended';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';

// Address (used for hospitals, patients, staff)
export interface Address {
  line1: string;
  line2?: string;
  city: string;
  district: string;
  division: string;
  postal_code: string;
  country: string; // Default "Bangladesh"
}

// Audit fields (every entity has these)
export interface AuditFields {
  created_at: ISODateString;
  updated_at: ISODateString;
  created_by?: UUID;
  updated_by?: UUID;
}

// Bangladesh-specific types
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type Gender = 'male' | 'female' | 'other';
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';

// Phone with Bangladesh format
export interface PhoneNumber {
  country_code: string; // "+880"
  number: string; // "1712345678"
}
