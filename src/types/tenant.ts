/**
 * Tenant = Hospital/Clinic/Diagnostic Center
 * Matches SRS Module 12: Multi-Tenant Architecture & SaaS Admin Panel
 */

import type { Address, AuditFields, UUID } from './common';

export type SubscriptionPlan = 'starter' | 'professional' | 'business' | 'enterprise';

export type TenantStatus =
  | 'trial'
  | 'active'
  | 'suspended'
  | 'cancelled'
  | 'deleted';

export interface PlanLimits {
  max_patients: number | null; // null = unlimited
  max_beds: number | null;
  max_branches: number | null;
  has_telemedicine: boolean;
  has_emergency_module: boolean;
  has_pharma_portal: boolean;
  has_white_label: boolean;
  has_ai_features: boolean;
  alert_channels: Array<'sms' | 'email' | 'whatsapp' | 'voice' | 'api'>;
  sla_response_hours: number;
}

export interface TenantBranding {
  logo_url?: string;
  primary_color?: string; // Hex
  hospital_name: string;
  display_name: string;
  tagline?: string;
  support_email?: string;
  support_phone?: string;
}

export interface Tenant extends AuditFields {
  id: UUID;
  subdomain: string; // e.g., "squarehospital" → squarehospital.hms.com.bd
  custom_domain?: string; // For white-label (Enterprise only)
  plan: SubscriptionPlan;
  status: TenantStatus;
  branding: TenantBranding;
  address: Address;
  limits: PlanLimits;
  trial_ends_at?: string;
  subscription_started_at?: string;
  subscription_renews_at?: string;
  bmdc_license_number?: string; // Bangladesh Medical & Dental Council
  // Usage counters (updated via backend)
  usage: {
    patient_count: number;
    bed_count: number;
    branch_count: number;
    active_staff_count: number;
  };
}

export interface Subscription extends AuditFields {
  id: UUID;
  tenant_id: UUID;
  plan: SubscriptionPlan;
  status: 'active' | 'past_due' | 'cancelled' | 'trialing';
  amount_bdt: number; // Bangladeshi Taka
  billing_cycle: 'monthly' | 'quarterly' | 'yearly';
  next_billing_date: string;
  payment_method: 'bkash' | 'nagad' | 'stripe' | 'bank_transfer';
  invoices: Invoice[];
}

export interface Invoice extends AuditFields {
  id: UUID;
  tenant_id: UUID;
  invoice_number: string;
  amount_bdt: number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  due_date: string;
  paid_at?: string;
  pdf_url?: string;
}
