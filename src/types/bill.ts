/**
 * Billing & Finance types
 * Matches SRS Module 10: Billing & Finance
 */

import type { AuditFields, MRN, UUID } from './common';

export type BillStatus = 'draft' | 'pending' | 'partial' | 'paid' | 'cancelled' | 'refunded';

export type PaymentMethod = 'bkash' | 'nagad' | 'stripe_card' | 'cash' | 'bank_transfer' | 'insurance';

export type BillItemCategory =
  | 'consultation'
  | 'lab_test'
  | 'medicine'
  | 'bed_charge'
  | 'procedure'
  | 'surgery'
  | 'nursing_care'
  | 'ambulance'
  | 'other';

export interface BillLineItem {
  id: UUID;
  category: BillItemCategory;
  description: string;
  reference_id?: UUID;
  reference_type?: string;
  quantity: number;
  unit_price_bdt: number;
  subtotal_bdt: number;
  tax_bdt: number;
  discount_bdt: number;
  total_bdt: number;
  date: string;
}

export interface Payment {
  id: UUID;
  bill_id: UUID;
  amount_bdt: number;
  method: PaymentMethod;
  transaction_id?: string;
  gateway_reference?: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  paid_at: string;
  received_by?: UUID;
  notes?: string;
}

export interface Bill extends AuditFields {
  id: UUID;
  tenant_id: UUID;
  bill_number: string;
  patient_id: UUID;
  patient_mrn: MRN;
  patient_name: string;
  patient_phone: string;
  admission_id?: UUID;
  appointment_id?: UUID;
  status: BillStatus;
  bill_date: string;
  due_date?: string;
  line_items: BillLineItem[];
  subtotal_bdt: number;
  total_tax_bdt: number;
  total_discount_bdt: number;
  total_amount_bdt: number;
  amount_paid_bdt: number;
  amount_outstanding_bdt: number;
  payments: Payment[];
  discount_applied_by?: UUID;
  discount_reason?: string;
  pdf_url?: string;
  notes?: string;
}
