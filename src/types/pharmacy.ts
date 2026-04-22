/**
 * Pharmacy & Inventory types
 * Matches SRS Module 6: Medicine & Pharmacy Management
 */

import type { AuditFields, UUID } from './common';

export type DispenseStatus =
  | 'pending'
  | 'partial'
  | 'dispensed'
  | 'cancelled'
  | 'awaiting_stock';

export interface MedicineInventory extends AuditFields {
  id: UUID;
  tenant_id: UUID;
  medicine_id: UUID;
  generic_name: string;
  brand_name: string;
  strength: string;
  manufacturer: string;
  batch_number: string;
  manufacture_date: string;
  expiry_date: string;
  current_stock: number;
  min_threshold: number; // Triggers low stock alert (FR-PHM-03)
  max_threshold: number;
  unit_cost_bdt: number;
  selling_price_bdt: number;
  location?: string; // Shelf/rack location
  supplier?: string;
  is_expired: boolean;
  is_low_stock: boolean;
  is_out_of_stock: boolean;
  days_until_expiry?: number;
}

export interface DispenseItem {
  prescribed_medicine_id: UUID;
  medicine_id: UUID;
  medicine_name: string;
  prescribed_quantity: number;
  dispensed_quantity: number;
  batch_number: string;
  unit_price_bdt: number;
  total_price_bdt: number;
  notes?: string;
}

export interface PharmacyOrder extends AuditFields {
  id: UUID;
  tenant_id: UUID;
  order_number: string;
  prescription_id: UUID;
  prescription_number: string;
  patient_id: UUID;
  patient_mrn: string;
  patient_name: string;
  patient_phone: string;
  doctor_name: string;
  status: DispenseStatus;
  items: DispenseItem[];
  total_amount_bdt: number;
  dispensed_by?: UUID;
  dispensed_by_name?: string;
  dispensed_at?: string;
  payment_status: 'pending' | 'paid';
  notes?: string;
  // For partial dispensing (FR-PHM-04)
  partial_reason?: string;
  outstanding_items?: Array<{
    medicine_id: UUID;
    medicine_name: string;
    outstanding_quantity: number;
  }>;
}

export interface PharmacyAuditLog {
  id: UUID;
  tenant_id: UUID;
  pharmacist_id: UUID;
  pharmacist_name: string;
  action: 'dispensed' | 'stock_added' | 'stock_adjusted' | 'expired_removed' | 'returned';
  medicine_id: UUID;
  medicine_name: string;
  quantity_change: number; // Positive for additions, negative for dispensing
  patient_mrn?: string;
  prescription_number?: string;
  timestamp: string;
  notes?: string;
}

export interface StockAlert {
  id: UUID;
  tenant_id: UUID;
  medicine_id: UUID;
  medicine_name: string;
  alert_type: 'low_stock' | 'out_of_stock' | 'expiring_soon' | 'expired';
  current_stock: number;
  threshold?: number;
  expiry_date?: string;
  days_until_expiry?: number;
  is_acknowledged: boolean;
  acknowledged_at?: string;
  created_at: string;
}
