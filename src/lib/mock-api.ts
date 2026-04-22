/**
 * Mock API layer.
 *
 * CRITICAL: This file is the SWAP POINT. When the Laravel backend is ready,
 * replace these function bodies with real HTTP calls using axios/fetch.
 * The function SIGNATURES must stay the same — this is the contract that the UI depends on.
 *
 * Example swap:
 *   // Before (mock):
 *   async getPatients() { await delay(); return { data: MOCK_PATIENTS }; }
 *   // After (real):
 *   async getPatients() { return (await api.get('/patients')).data; }
 */

import {
  MOCK_ALERTS,
  MOCK_APPOINTMENTS,
  MOCK_BEDS,
  MOCK_BILLS,
  MOCK_DEPARTMENT_REVENUE,
  MOCK_DOCTOR_PERFORMANCE,
  MOCK_EMERGENCIES,
  MOCK_HEALTH_TIMELINE,
  MOCK_INVENTORY,
  MOCK_KPIS,
  MOCK_LAB_TESTS,
  MOCK_NOTIFICATIONS,
  MOCK_PATIENT_VISITS_TREND,
  MOCK_PATIENTS,
  MOCK_PHARMACY_ORDERS,
  MOCK_PRESCRIPTIONS,
  MOCK_REVENUE_TREND,
  MOCK_TENANT,
  MOCK_USERS,
  MOCK_WARDS,
  DEMO_CREDENTIALS,
} from './mock-data';
import { delay, generateMRN, uuid } from './utils';
import type {
  Alert,
  ApiResponse,
  Appointment,
  AuthSession,
  Bed,
  Bill,
  ChartDataPoint,
  DashboardKPIs,
  DoctorPerformance,
  EmergencyRequest,
  HealthTimelineEvent,
  InAppNotification,
  LabTest,
  LoginCredentials,
  MedicineInventory,
  OtpVerification,
  Patient,
  PharmacyOrder,
  Prescription,
  RegisterData,
  Tenant,
  User,
  Ward,
} from '@/types';

// ============================================================================
// AUTH API
// ============================================================================
export const authAPI = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthSession>> {
    await delay(600);
    const user = MOCK_USERS.find((u) => u.email.toLowerCase() === credentials.email.toLowerCase());
    if (!user) throw { message: 'Invalid email or password', status: 401 };
    const validPassword = DEMO_CREDENTIALS.some(
      (c) => c.email.toLowerCase() === credentials.email.toLowerCase() && c.password === credentials.password,
    );
    if (!validPassword) throw { message: 'Invalid email or password', status: 401 };
    if (user.status === 'locked') throw { message: 'Account is locked. Contact admin.', status: 423 };

    const session: AuthSession = {
      user,
      tenant: user.tenant_id ? MOCK_TENANT : undefined,
      access_token: `mock-token-${uuid()}`,
      refresh_token: `mock-refresh-${uuid()}`,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };
    return { data: session, message: 'Login successful' };
  },

  async register(payload: RegisterData): Promise<ApiResponse<{ user_id: string; otp_sent_to: string }>> {
    await delay(700);
    if (!payload.agreed_to_terms) throw { message: 'You must agree to the terms', status: 422 };
    return {
      data: { user_id: uuid(), otp_sent_to: payload.phone.country_code + ' ' + payload.phone.number },
      message: 'OTP sent to your phone',
    };
  },

  async verifyOtp(payload: OtpVerification): Promise<ApiResponse<{ verified: boolean; mrn?: string }>> {
    await delay(500);
    if (payload.otp_code !== '123456') throw { message: 'Invalid OTP. Use 123456 for demo.', status: 422 };
    const result: { verified: boolean; mrn?: string } = { verified: true };
    if (payload.purpose === 'registration') result.mrn = generateMRN();
    return { data: result, message: 'OTP verified' };
  },

  async requestPasswordReset(email: string): Promise<ApiResponse<{ sent: boolean }>> {
    await delay(500);
    return { data: { sent: true }, message: `Reset link sent to ${email}` };
  },

  async setup2FA(): Promise<ApiResponse<{ qr_code_url: string; secret: string; backup_codes: string[] }>> {
    await delay(500);
    return {
      data: {
        qr_code_url: 'otpauth://totp/HMS:admin@demo.hms.com.bd?secret=JBSWY3DPEHPK3PXP&issuer=HMS',
        secret: 'JBSWY3DPEHPK3PXP',
        backup_codes: Array.from({ length: 8 }, () => Math.random().toString(36).slice(2, 10).toUpperCase()),
      },
    };
  },

  async logout(): Promise<ApiResponse<{ success: boolean }>> {
    await delay(200);
    return { data: { success: true } };
  },

  async getCurrentUser(): Promise<ApiResponse<AuthSession>> {
    await delay(200);
    const user = MOCK_USERS[0];
    return {
      data: {
        user,
        tenant: MOCK_TENANT,
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      },
    };
  },
};

// ============================================================================
// TENANT API
// ============================================================================
export const tenantAPI = {
  async getCurrent(): Promise<ApiResponse<Tenant>> {
    await delay(300);
    return { data: MOCK_TENANT };
  },
};

// ============================================================================
// DASHBOARD API
// ============================================================================
export const dashboardAPI = {
  async getKPIs(): Promise<ApiResponse<DashboardKPIs>> {
    await delay(400);
    return { data: MOCK_KPIS };
  },
  async getRevenueTrend(): Promise<ApiResponse<ChartDataPoint[]>> {
    await delay(300);
    return { data: MOCK_REVENUE_TREND };
  },
  async getPatientVisitsTrend(): Promise<ApiResponse<ChartDataPoint[]>> {
    await delay(300);
    return { data: MOCK_PATIENT_VISITS_TREND };
  },
  async getDepartmentRevenue(): Promise<ApiResponse<ChartDataPoint[]>> {
    await delay(300);
    return { data: MOCK_DEPARTMENT_REVENUE };
  },
  async getDoctorPerformance(): Promise<ApiResponse<DoctorPerformance[]>> {
    await delay(300);
    return { data: MOCK_DOCTOR_PERFORMANCE };
  },
};

// ============================================================================
// PATIENT API
// ============================================================================
export const patientAPI = {
  async list(): Promise<ApiResponse<Patient[]>> {
    await delay(400);
    return { data: MOCK_PATIENTS };
  },
  async get(id: string): Promise<ApiResponse<Patient>> {
    await delay(300);
    const patient = MOCK_PATIENTS.find((p) => p.id === id);
    if (!patient) throw { message: 'Patient not found', status: 404 };
    return { data: patient };
  },
  async getByMRN(mrn: string): Promise<ApiResponse<Patient>> {
    await delay(300);
    const patient = MOCK_PATIENTS.find((p) => p.mrn === mrn);
    if (!patient) throw { message: 'Patient not found', status: 404 };
    return { data: patient };
  },
  async getHealthTimeline(patientId: string): Promise<ApiResponse<HealthTimelineEvent[]>> {
    await delay(400);
    return { data: MOCK_HEALTH_TIMELINE.filter((e) => e.patient_id === patientId) };
  },
  async search(query: string): Promise<ApiResponse<Patient[]>> {
    await delay(300);
    const q = query.toLowerCase();
    return {
      data: MOCK_PATIENTS.filter(
        (p) => p.full_name.toLowerCase().includes(q) || p.mrn.toLowerCase().includes(q) || p.phone.number.includes(q),
      ),
    };
  },
};

// ============================================================================
// APPOINTMENT API
// ============================================================================
export const appointmentAPI = {
  async list(filters?: { doctor_id?: string; patient_id?: string; status?: string }): Promise<ApiResponse<Appointment[]>> {
    await delay(400);
    let appointments = [...MOCK_APPOINTMENTS];
    if (filters?.doctor_id) appointments = appointments.filter((a) => a.doctor_id === filters.doctor_id);
    if (filters?.patient_id) appointments = appointments.filter((a) => a.patient_id === filters.patient_id);
    if (filters?.status) appointments = appointments.filter((a) => a.status === filters.status);
    return { data: appointments };
  },
  async get(id: string): Promise<ApiResponse<Appointment>> {
    await delay(300);
    const appt = MOCK_APPOINTMENTS.find((a) => a.id === id);
    if (!appt) throw { message: 'Appointment not found', status: 404 };
    return { data: appt };
  },
  async getToday(): Promise<ApiResponse<Appointment[]>> {
    await delay(300);
    const today = new Date().toDateString();
    return {
      data: MOCK_APPOINTMENTS.filter((a) => new Date(a.scheduled_at).toDateString() === today),
    };
  },
};

// ============================================================================
// PRESCRIPTION API
// ============================================================================
export const prescriptionAPI = {
  async list(filters?: { patient_id?: string; doctor_id?: string }): Promise<ApiResponse<Prescription[]>> {
    await delay(400);
    let rxs = [...MOCK_PRESCRIPTIONS];
    if (filters?.patient_id) rxs = rxs.filter((r) => r.patient_id === filters.patient_id);
    if (filters?.doctor_id) rxs = rxs.filter((r) => r.doctor_id === filters.doctor_id);
    return { data: rxs };
  },
  async get(id: string): Promise<ApiResponse<Prescription>> {
    await delay(300);
    const rx = MOCK_PRESCRIPTIONS.find((r) => r.id === id);
    if (!rx) throw { message: 'Prescription not found', status: 404 };
    return { data: rx };
  },
};

// ============================================================================
// LAB TEST API
// ============================================================================
export const labAPI = {
  async list(filters?: { status?: string; patient_id?: string }): Promise<ApiResponse<LabTest[]>> {
    await delay(400);
    let tests = [...MOCK_LAB_TESTS];
    if (filters?.status) tests = tests.filter((t) => t.status === filters.status);
    if (filters?.patient_id) tests = tests.filter((t) => t.patient_id === filters.patient_id);
    return { data: tests };
  },
  async get(id: string): Promise<ApiResponse<LabTest>> {
    await delay(300);
    const test = MOCK_LAB_TESTS.find((t) => t.id === id);
    if (!test) throw { message: 'Lab test not found', status: 404 };
    return { data: test };
  },
};

// ============================================================================
// PHARMACY API
// ============================================================================
export const pharmacyAPI = {
  async listOrders(): Promise<ApiResponse<PharmacyOrder[]>> {
    await delay(400);
    return { data: MOCK_PHARMACY_ORDERS };
  },
  async listInventory(): Promise<ApiResponse<MedicineInventory[]>> {
    await delay(400);
    return { data: MOCK_INVENTORY };
  },
  async getLowStockItems(): Promise<ApiResponse<MedicineInventory[]>> {
    await delay(300);
    return { data: MOCK_INVENTORY.filter((i) => i.is_low_stock || i.is_out_of_stock) };
  },
};

// ============================================================================
// BED & WARD API
// ============================================================================
export const bedAPI = {
  async listWards(): Promise<ApiResponse<Ward[]>> {
    await delay(300);
    return { data: MOCK_WARDS };
  },
  async listBeds(wardId?: string): Promise<ApiResponse<Bed[]>> {
    await delay(300);
    let beds = [...MOCK_BEDS];
    if (wardId) beds = beds.filter((b) => b.ward_id === wardId);
    return { data: beds };
  },
};

// ============================================================================
// BILLING API
// ============================================================================
export const billingAPI = {
  async list(filters?: { status?: string; patient_id?: string }): Promise<ApiResponse<Bill[]>> {
    await delay(400);
    let bills = [...MOCK_BILLS];
    if (filters?.status) bills = bills.filter((b) => b.status === filters.status);
    if (filters?.patient_id) bills = bills.filter((b) => b.patient_id === filters.patient_id);
    return { data: bills };
  },
  async get(id: string): Promise<ApiResponse<Bill>> {
    await delay(300);
    const bill = MOCK_BILLS.find((b) => b.id === id);
    if (!bill) throw { message: 'Bill not found', status: 404 };
    return { data: bill };
  },
};

// ============================================================================
// ALERT API (HAS)
// ============================================================================
export const alertAPI = {
  async list(filters?: { severity?: string; status?: string }): Promise<ApiResponse<Alert[]>> {
    await delay(400);
    let alerts = [...MOCK_ALERTS];
    if (filters?.severity) alerts = alerts.filter((a) => a.severity === filters.severity);
    if (filters?.status) alerts = alerts.filter((a) => a.status === filters.status);
    return { data: alerts };
  },
  async getActive(): Promise<ApiResponse<Alert[]>> {
    await delay(300);
    return { data: MOCK_ALERTS.filter((a) => !a.acknowledged_at) };
  },
  async getNotifications(): Promise<ApiResponse<InAppNotification[]>> {
    await delay(300);
    return { data: MOCK_NOTIFICATIONS };
  },
  async acknowledge(_alertId: string): Promise<ApiResponse<{ success: boolean }>> {
    await delay(300);
    return { data: { success: true } };
  },
};

// ============================================================================
// EMERGENCY API
// ============================================================================
export const emergencyAPI = {
  async listActive(): Promise<ApiResponse<EmergencyRequest[]>> {
    await delay(400);
    return {
      data: MOCK_EMERGENCIES.filter((e) => !['cancelled', 'handed_over', 'false_alarm'].includes(e.status)),
    };
  },
  async triggerSOS(): Promise<ApiResponse<EmergencyRequest>> {
    await delay(500);
    const newReq: EmergencyRequest = {
      ...MOCK_EMERGENCIES[0],
      id: uuid(),
      request_number: `EMR-2026-${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`,
      status: 'sos_received',
      sos_received_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return { data: newReq, message: 'Emergency dispatcher alerted' };
  },
};

// ============================================================================
// USER/STAFF API
// ============================================================================
export const userAPI = {
  async list(): Promise<ApiResponse<User[]>> {
    await delay(400);
    return { data: MOCK_USERS.filter((u) => u.role !== 'super_admin' && u.role !== 'patient') };
  },
  async listDoctors(): Promise<ApiResponse<User[]>> {
    await delay(300);
    return { data: MOCK_USERS.filter((u) => u.role === 'doctor') };
  },
};
