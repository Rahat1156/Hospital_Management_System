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

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api').replace(/\/$/, '');

function withQuery(path: string, query?: Record<string, string | number | undefined>): string {
  if (!query) return path;
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
  });
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

async function request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  let res: globalThis.Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
      cache: 'no-store',
    });
  } catch {
    throw {
      message: `Cannot connect to backend API at ${API_BASE}. Start Laravel server and check CORS.`,
      status: 0,
    };
  }

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw { message: body?.message || 'Request failed', status: res.status, errors: body?.errors };
  }
  return body as ApiResponse<T>;
}

export const authAPI = {
  login(credentials: LoginCredentials): Promise<ApiResponse<AuthSession>> {
    return request<AuthSession>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
  },
  register(payload: RegisterData): Promise<ApiResponse<{ user_id: string; otp_sent_to: string }>> {
    return request('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
  },
  verifyOtp(payload: OtpVerification): Promise<ApiResponse<{ verified: boolean; mrn?: string }>> {
    return request('/auth/verify-otp', { method: 'POST', body: JSON.stringify(payload) });
  },
  resendOtp(payload: { identifier: string; purpose: OtpVerification['purpose'] }): Promise<ApiResponse<{ sent: boolean; otp_sent_to: string }>> {
    return request('/auth/resend-otp', { method: 'POST', body: JSON.stringify(payload) });
  },
  requestPasswordReset(email: string): Promise<ApiResponse<{ sent: boolean }>> {
    return request('/auth/request-password-reset', { method: 'POST', body: JSON.stringify({ email }) });
  },
  setup2FA(): Promise<ApiResponse<{ qr_code_url: string; secret: string; backup_codes: string[] }>> {
    return request('/auth/setup-2fa');
  },
  logout(): Promise<ApiResponse<{ success: boolean }>> {
    return request('/auth/logout', { method: 'POST' });
  },
  getCurrentUser(): Promise<ApiResponse<AuthSession>> {
    return request('/auth/me');
  },
};

export const tenantAPI = {
  getCurrent(): Promise<ApiResponse<Tenant>> {
    return request('/tenant/current');
  },
};

export const dashboardAPI = {
  getKPIs(): Promise<ApiResponse<DashboardKPIs>> {
    return request('/dashboard/kpis');
  },
  getRevenueTrend(): Promise<ApiResponse<ChartDataPoint[]>> {
    return request('/dashboard/revenue-trend');
  },
  getPatientVisitsTrend(): Promise<ApiResponse<ChartDataPoint[]>> {
    return request('/dashboard/patient-visits-trend');
  },
  getDepartmentRevenue(): Promise<ApiResponse<ChartDataPoint[]>> {
    return request('/dashboard/department-revenue');
  },
  getDoctorPerformance(): Promise<ApiResponse<DoctorPerformance[]>> {
    return request('/dashboard/doctor-performance');
  },
};

export interface WalkInPatientPayload {
  full_name: string;
  father_name?: string;
  mother_name?: string;
  phone_country_code: string;
  phone_number: string;
  date_of_birth: string;
  gender: string;
  marital_status?: string;
  religion?: string;
  occupation?: string;
  nid_number?: string;
  birth_certificate_number?: string;
  blood_group?: string;
  email?: string;
  address_line1?: string;
  address_city?: string;
  address_district?: string;
  address_division?: string;
  address_postal_code?: string;
  emergency_contact_name?: string;
  emergency_contact_relation?: string;
  emergency_contact_phone?: string;
  allergies?: string;
  chronic_conditions?: string;
}

export const patientAPI = {
  list(): Promise<ApiResponse<Patient[]>> {
    return request('/patients');
  },
  get(id: string): Promise<ApiResponse<Patient>> {
    return request(`/patients/${encodeURIComponent(id)}`);
  },
  getByMRN(mrn: string): Promise<ApiResponse<Patient>> {
    return request(`/patients/mrn/${encodeURIComponent(mrn)}`);
  },
  getHealthTimeline(patientId: string): Promise<ApiResponse<HealthTimelineEvent[]>> {
    return request(`/patients/${encodeURIComponent(patientId)}/health-timeline`);
  },
  search(query: string): Promise<ApiResponse<Patient[]>> {
    return request(withQuery('/patients/search', { q: query }));
  },
  registerWalkIn(payload: WalkInPatientPayload): Promise<ApiResponse<Patient>> {
    return request('/patients', { method: 'POST', body: JSON.stringify(payload) });
  },
};

export const appointmentAPI = {
  list(filters?: { doctor_id?: string; patient_id?: string; status?: string }): Promise<ApiResponse<Appointment[]>> {
    return request(withQuery('/appointments', filters));
  },
  create(payload: {
    patient_id: string;
    doctor_id: string;
    appointment_type: string;
    scheduled_at: string;
    reason: string;
    duration_minutes?: number;
  }): Promise<ApiResponse<Appointment>> {
    return request('/appointments', { method: 'POST', body: JSON.stringify(payload) });
  },
  get(id: string): Promise<ApiResponse<Appointment>> {
    return request(`/appointments/${encodeURIComponent(id)}`);
  },
  getToday(): Promise<ApiResponse<Appointment[]>> {
    return request('/appointments/today');
  },
  createPaymentIntent(appointmentId: string): Promise<ApiResponse<{
    client_secret: string;
    payment_intent_id: string;
    amount_usd_cents: number;
    fee_bdt: number;
    appointment_number: string;
    doctor_name: string;
  }>> {
    return request(`/appointments/${encodeURIComponent(appointmentId)}/payment-intent`, { method: 'POST' });
  },
  markPaid(appointmentId: string, payload: { payment_intent_id: string; fee_bdt: number }): Promise<ApiResponse<Appointment>> {
    return request(`/appointments/${encodeURIComponent(appointmentId)}/mark-paid`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  payDirect(appointmentId: string, payload: {
    card_number: string;
    exp_month: number;
    exp_year: number;
    cvc: string;
    card_name?: string;
  }): Promise<ApiResponse<{ payment_intent_id: string; amount_bdt: number; amount_usd_cents: number }>> {
    return request(`/appointments/${encodeURIComponent(appointmentId)}/pay-direct`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

export const prescriptionAPI = {
  list(filters?: { patient_id?: string; doctor_id?: string }): Promise<ApiResponse<Prescription[]>> {
    return request(withQuery('/prescriptions', filters));
  },
  get(id: string): Promise<ApiResponse<Prescription>> {
    return request(`/prescriptions/${encodeURIComponent(id)}`);
  },
};

export const labAPI = {
  list(filters?: { status?: string; patient_id?: string }): Promise<ApiResponse<LabTest[]>> {
    return request(withQuery('/lab-tests', filters));
  },
  get(id: string): Promise<ApiResponse<LabTest>> {
    return request(`/lab-tests/${encodeURIComponent(id)}`);
  },
};

export const pharmacyAPI = {
  listOrders(): Promise<ApiResponse<PharmacyOrder[]>> {
    return request('/pharmacy/orders');
  },
  listInventory(): Promise<ApiResponse<MedicineInventory[]>> {
    return request('/pharmacy/inventory');
  },
  getLowStockItems(): Promise<ApiResponse<MedicineInventory[]>> {
    return request('/pharmacy/inventory/low-stock');
  },
};

export const bedAPI = {
  listWards(): Promise<ApiResponse<Ward[]>> {
    return request('/wards');
  },
  listBeds(wardId?: string): Promise<ApiResponse<Bed[]>> {
    return request(withQuery('/beds', { ward_id: wardId }));
  },
};

export const billingAPI = {
  list(filters?: { status?: string; patient_id?: string }): Promise<ApiResponse<Bill[]>> {
    return request(withQuery('/bills', filters));
  },
  get(id: string): Promise<ApiResponse<Bill>> {
    return request(`/bills/${encodeURIComponent(id)}`);
  },
  createPaymentIntent(billId: string): Promise<ApiResponse<{
    client_secret: string;
    payment_intent_id: string;
    amount_usd_cents: number;
    amount_bdt: number;
  }>> {
    return request(`/billing/${encodeURIComponent(billId)}/payment-intent`, { method: 'POST' });
  },
  markPaid(billId: string, payload: { payment_intent_id: string; amount_bdt: number }): Promise<ApiResponse<Bill>> {
    return request(`/billing/${encodeURIComponent(billId)}/mark-paid`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  payDirect(billId: string, payload: {
    card_number: string;
    exp_month: number;
    exp_year: number;
    cvc: string;
    card_name?: string;
  }): Promise<ApiResponse<{ bill: Bill; payment_intent_id: string; amount_bdt: number; amount_usd_cents: number }>> {
    return request(`/billing/${encodeURIComponent(billId)}/pay-direct`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

export const alertAPI = {
  list(filters?: { severity?: string; status?: string }): Promise<ApiResponse<Alert[]>> {
    return request(withQuery('/alerts', filters));
  },
  getActive(): Promise<ApiResponse<Alert[]>> {
    return request('/alerts/active');
  },
  getNotifications(): Promise<ApiResponse<InAppNotification[]>> {
    return request('/alerts/notifications');
  },
  acknowledge(alertId: string): Promise<ApiResponse<{ success: boolean }>> {
    return request(`/alerts/${encodeURIComponent(alertId)}/acknowledge`, { method: 'POST' });
  },
};

export const emergencyAPI = {
  listActive(): Promise<ApiResponse<EmergencyRequest[]>> {
    return request('/emergencies/active');
  },
  triggerSOS(): Promise<ApiResponse<EmergencyRequest>> {
    return request('/emergencies/trigger-sos', { method: 'POST' });
  },
};

export const userAPI = {
  list(): Promise<ApiResponse<User[]>> {
    return request('/users');
  },
  listDoctors(): Promise<ApiResponse<User[]>> {
    return request('/users/doctors');
  },
};
