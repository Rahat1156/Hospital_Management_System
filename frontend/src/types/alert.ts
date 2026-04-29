/**
 * Hospital Alert System (HAS) types
 * Matches SRS Module 1: HAS - Primary differentiator
 */

import type { AuditFields, UUID } from './common';

export type AlertChannel = 'sms' | 'email' | 'whatsapp' | 'in_app' | 'voice' | 'push';

export type AlertSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';

export type AlertStatus =
  | 'queued'
  | 'dispatching'
  | 'sent'
  | 'delivered'
  | 'acknowledged'
  | 'failed'
  | 'retrying';

export type AlertTriggerType =
  | 'critical_lab_result'
  | 'appointment_reminder_24h'
  | 'appointment_reminder_2h'
  | 'appointment_confirmed'
  | 'appointment_cancelled'
  | 'bed_occupancy_threshold'
  | 'low_stock'
  | 'medicine_expiring'
  | 'follow_up_reminder'
  | 'sos_emergency'
  | 'ambulance_dispatched'
  | 'er_pre_notification'
  | 'admission_confirmed'
  | 'discharge_complete'
  | 'bill_payment_due'
  | 'payment_received'
  | 'subscription_overdue'
  | 'custom_rule';

// Alert configuration rule (FR-HAS-02)
export interface AlertRule extends AuditFields {
  id: UUID;
  tenant_id: UUID;
  name: string;
  description?: string;
  trigger_type: AlertTriggerType;
  severity: AlertSeverity;
  is_active: boolean;
  // Conditions (e.g., "when glucose > 300")
  conditions?: {
    field: string;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'contains';
    value: string | number;
  }[];
  // Recipients
  recipient_roles: string[];
  recipient_user_ids?: UUID[];
  // Channels
  channels: AlertChannel[];
  // Escalation chain (if not acknowledged in X minutes)
  escalation_enabled: boolean;
  escalation_minutes?: number;
  escalation_recipient_ids?: UUID[];
  // Message template
  message_template: string;
  subject_template?: string;
  // Stats
  total_triggered: number;
  last_triggered_at?: string;
}

export interface AlertDispatchAttempt {
  channel: AlertChannel;
  gateway?: string; // "ssl_wireless", "twilio", "sendgrid"
  status: 'success' | 'failed' | 'retrying';
  attempted_at: string;
  delivered_at?: string;
  error_message?: string;
  retry_count: number;
}

export interface Alert extends AuditFields {
  id: UUID;
  tenant_id: UUID;
  rule_id?: UUID;
  trigger_type: AlertTriggerType;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  message: string;
  // Context
  patient_id?: UUID;
  patient_mrn?: string;
  patient_name?: string;
  reference_type?: string;
  reference_id?: UUID;
  // Recipients
  recipients: Array<{
    user_id: UUID;
    user_name: string;
    role: string;
    contact: string;
    acknowledged: boolean;
    acknowledged_at?: string;
  }>;
  channels: AlertChannel[];
  dispatch_attempts: AlertDispatchAttempt[];
  triggered_at: string;
  first_delivered_at?: string;
  acknowledged_at?: string;
  escalated: boolean;
  escalated_at?: string;
  action_url?: string;
  metadata?: Record<string, string | number | boolean>;
}

// Notification center item (in-app alerts)
export interface InAppNotification {
  id: UUID;
  alert_id?: UUID;
  user_id: UUID;
  title: string;
  message: string;
  severity: AlertSeverity;
  icon?: string;
  is_read: boolean;
  read_at?: string;
  action_url?: string;
  patient_name?: string;
  patient_mrn?: string;
  metadata?: Record<string, string | number | boolean | null>;
  created_at: string;
}
