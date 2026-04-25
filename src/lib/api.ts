import * as mock from './mock-api';
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

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';
const now = () => new Date().toISOString();

async function apiFetch<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw { message: payload.message ?? 'Backend request failed', errors: payload.errors, status: response.status };
  }

  return payload;
}

export const erdAPI = {
  async list<T = any>(resource: string, filters?: Record<string, string | number | undefined>): Promise<ApiResponse<T[]>> {
    const params = new URLSearchParams();
    Object.entries(filters ?? {}).forEach(([key, value]) => {
      if (value !== undefined && value !== '') params.set(key, String(value));
    });
    return apiFetch<T[]>(`/${resource}${params.toString() ? `?${params.toString()}` : ''}`);
  },
  async create<T = any>(resource: string, payload: Record<string, unknown>): Promise<ApiResponse<T>> {
    return apiFetch<T>(`/${resource}`, { method: 'POST', body: JSON.stringify(payload) });
  },
  async update<T = any>(resource: string, id: string | number, payload: Record<string, unknown>): Promise<ApiResponse<T>> {
    return apiFetch<T>(`/${resource}/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
  },
};

const phone = (value?: string | null) => ({ country_code: '+880', number: value ?? '' });
const id = (value: unknown) => String(value ?? '');

function toUser(raw: any, roleName = raw.role?.role_name ?? 'hospital_admin'): User {
  return {
    id: id(raw.user_id),
    tenant_id: raw.tenant_id ? id(raw.tenant_id) : undefined,
    role: roleName === 'admin' ? 'hospital_admin' : roleName,
    email: raw.email ?? '',
    phone: phone(raw.phone),
    full_name: raw.name ?? '',
    display_name: raw.name ?? '',
    status: raw.status ?? 'active',
    email_verified: Boolean(raw.email_verified_at),
    phone_verified: Boolean(raw.phone),
    two_factor_enabled: false,
    failed_login_attempts: 0,
    created_at: raw.created_at ?? now(),
    updated_at: raw.updated_at ?? raw.created_at ?? now(),
    doctor_profile: roleName === 'doctor' ? {
      bmdc_number: '',
      specialty: 'General Medicine',
      qualifications: [],
      years_of_experience: 0,
      consultation_fee_bdt: 0,
      languages: ['Bangla', 'English'],
    } : undefined,
  } as User;
}

function toTenant(raw: any): Tenant {
  return {
    id: id(raw.tenant_id),
    subdomain: raw.subdomain ?? 'main',
    plan: raw.plan ?? 'starter',
    status: raw.status ?? 'active',
    branding: {
      hospital_name: raw.name ?? 'Hospital',
      display_name: raw.name ?? 'Hospital',
    },
    address: { line1: '', city: '', district: '', division: '', postal_code: '', country: 'Bangladesh' },
    limits: {
      max_patients: null,
      max_beds: null,
      max_branches: null,
      has_telemedicine: false,
      has_emergency_module: true,
      has_pharma_portal: true,
      has_white_label: false,
      has_ai_features: false,
      alert_channels: ['in_app'],
      sla_response_hours: 24,
    },
    usage: { patient_count: 0, bed_count: 0, branch_count: 1, active_staff_count: 0 },
    created_at: raw.created_at ?? now(),
    updated_at: raw.created_at ?? now(),
  };
}

function toPatient(raw: any): Patient {
  return {
    id: id(raw.patient_id),
    tenant_id: id(raw.tenant_id),
    mrn: raw.mrn ?? '',
    full_name: raw.name ?? '',
    date_of_birth: raw.dob ?? '',
    gender: raw.gender ?? 'other',
    nid_number: raw.nid ?? undefined,
    blood_group: raw.blood_group ?? undefined,
    phone: phone(raw.phone),
    email: raw.email ?? undefined,
    address: { line1: '', city: '', district: '', division: '', postal_code: '', country: 'Bangladesh' },
    emergency_contacts: [],
    medical_history: { allergies: [], chronic_conditions: [], current_medications: [], past_surgeries: [], family_history: [] },
    patient_type: 'walk_in',
    created_at: raw.created_at ?? now(),
    updated_at: raw.updated_at ?? raw.created_at ?? now(),
  };
}

async function rolesById() {
  const roles = (await apiFetch<any[]>('/roles')).data;
  return new Map(roles.map((role) => [role.role_id, role.role_name]));
}

async function usersById() {
  const [users, roles] = await Promise.all([apiFetch<any[]>('/users'), rolesById()]);
  return new Map(users.data.map((user) => [user.user_id, toUser(user, roles.get(user.role_id))]));
}

async function patientsById() {
  const patients = (await apiFetch<any[]>('/patients')).data;
  return new Map(patients.map((patient) => [patient.patient_id, toPatient(patient)]));
}

export const authAPI = USE_MOCK ? mock.authAPI : {
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthSession>> {
    const response = await apiFetch<any>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
    return {
      data: {
        ...response.data,
        user: toUser(response.data.user, response.data.user?.role?.role_name),
        tenant: response.data.tenant ? toTenant(response.data.tenant) : undefined,
      },
      message: response.message,
    };
  },
  async register(payload: RegisterData) {
    return apiFetch<{ user_id: string; otp_sent_to: string }>('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
  },
  async verifyOtp(_payload: OtpVerification) {
    return { data: { verified: true, mrn: undefined }, message: 'OTP verified locally' };
  },
  async requestPasswordReset(email: string) {
    return { data: { sent: true }, message: `Reset link requested for ${email}` };
  },
  async setup2FA() {
    return { data: { qr_code_url: '', secret: '', backup_codes: [] } };
  },
  async logout() {
    return apiFetch<{ success: boolean }>('/auth/logout', { method: 'POST' });
  },
  async getCurrentUser(): Promise<ApiResponse<AuthSession>> {
    const response = await apiFetch<any>('/auth/me');
    return {
      data: {
        ...response.data,
        user: response.data.user ? toUser(response.data.user, response.data.user?.role?.role_name) : undefined,
        tenant: response.data.tenant ? toTenant(response.data.tenant) : undefined,
      },
    };
  },
};

export const tenantAPI = USE_MOCK ? mock.tenantAPI : {
  async getCurrent(): Promise<ApiResponse<Tenant>> {
    const tenants = (await apiFetch<any[]>('/tenants')).data;
    return { data: toTenant(tenants[0] ?? {}) };
  },
};

export const dashboardAPI = USE_MOCK ? mock.dashboardAPI : {
  async getKPIs(): Promise<ApiResponse<DashboardKPIs>> {
    const [patients, appointments, bills, alerts] = await Promise.all([
      apiFetch<any[]>('/patients'),
      apiFetch<any[]>('/appointments'),
      apiFetch<any[]>('/bills'),
      apiFetch<any[]>('/alerts'),
    ]);
    return {
      data: {
        total_patients: patients.data.length,
        total_patients_delta_percent: 0,
        appointments_today: appointments.data.length,
        appointments_today_delta_percent: 0,
        revenue_today_bdt: bills.data.reduce((sum, bill) => sum + Number(bill.total ?? 0), 0),
        revenue_today_delta_percent: 0,
        revenue_month_bdt: bills.data.reduce((sum, bill) => sum + Number(bill.total ?? 0), 0),
        revenue_month_delta_percent: 0,
        bed_occupancy_rate: 0,
        active_doctors: 0,
        pending_lab_tests: 0,
        pending_prescriptions: 0,
        active_alerts: alerts.data.length,
        critical_alerts: alerts.data.length,
      } as DashboardKPIs,
    };
  },
  async getRevenueTrend(): Promise<ApiResponse<ChartDataPoint[]>> {
    const bills = (await apiFetch<any[]>('/bills')).data;
    return { data: [{ label: 'Current', value: bills.reduce((sum, bill) => sum + Number(bill.total ?? 0), 0) }] };
  },
  async getPatientVisitsTrend(): Promise<ApiResponse<ChartDataPoint[]>> {
    const appointments = (await apiFetch<any[]>('/appointments')).data;
    return { data: [{ label: 'Visits', value: appointments.length }] };
  },
  async getDepartmentRevenue(): Promise<ApiResponse<ChartDataPoint[]>> {
    const bills = (await apiFetch<any[]>('/bills')).data;
    return { data: [{ label: 'Hospital', value: bills.reduce((sum, bill) => sum + Number(bill.total ?? 0), 0) }] };
  },
  async getDoctorPerformance(): Promise<ApiResponse<DoctorPerformance[]>> {
    const [users, roles, appointments] = await Promise.all([apiFetch<any[]>('/users'), rolesById(), apiFetch<any[]>('/appointments')]);
    return {
      data: users.data
        .filter((user) => roles.get(user.role_id) === 'doctor')
        .map((doctor) => ({
          doctor_id: id(doctor.user_id),
          doctor_name: doctor.name,
          specialty: 'General Medicine',
          patients_seen: appointments.data.filter((appointment) => appointment.doctor_id === doctor.user_id).length,
          revenue_generated_bdt: 0,
          avg_appointment_minutes: 30,
          patient_satisfaction_score: 5,
        })),
    };
  },
};

export const patientAPI = USE_MOCK ? mock.patientAPI : {
  async list(): Promise<ApiResponse<Patient[]>> {
    return { data: (await apiFetch<any[]>('/patients')).data.map(toPatient) };
  },
  async get(patientId: string): Promise<ApiResponse<Patient>> {
    return { data: toPatient((await apiFetch<any>(`/patients/${patientId}`)).data) };
  },
  async getByMRN(mrn: string): Promise<ApiResponse<Patient>> {
    const patient = (await apiFetch<any[]>(`/patients?mrn=${encodeURIComponent(mrn)}`)).data[0];
    if (!patient) throw { message: 'Patient not found', status: 404 };
    return { data: toPatient(patient) };
  },
  async getHealthTimeline(patientId: string): Promise<ApiResponse<HealthTimelineEvent[]>> {
    const [appointments, prescriptions, labs, bills] = await Promise.all([
      apiFetch<any[]>(`/appointments?patient_id=${patientId}`),
      apiFetch<any[]>(`/prescriptions?patient_id=${patientId}`),
      apiFetch<any[]>(`/lab-tests?patient_id=${patientId}`),
      apiFetch<any[]>(`/bills?patient_id=${patientId}`),
    ]);
    return {
      data: [
        ...appointments.data.map((item) => ({ id: `appt-${item.appt_id}`, patient_id: patientId, event_type: 'appointment', event_date: item.slot_datetime, title: 'Appointment', reference_id: id(item.appt_id) })),
        ...prescriptions.data.map((item) => ({ id: `rx-${item.rx_id}`, patient_id: patientId, event_type: 'prescription', event_date: item.signed_at ?? now(), title: 'Prescription', description: item.diagnosis, reference_id: id(item.rx_id) })),
        ...labs.data.map((item) => ({ id: `lab-${item.lab_id}`, patient_id: patientId, event_type: 'lab_test', event_date: now(), title: item.test_type, reference_id: id(item.lab_id) })),
        ...bills.data.map((item) => ({ id: `bill-${item.bill_id}`, patient_id: patientId, event_type: 'bill', event_date: now(), title: 'Bill', reference_id: id(item.bill_id) })),
      ] as HealthTimelineEvent[],
    };
  },
  async search(query: string): Promise<ApiResponse<Patient[]>> {
    const patients = (await apiFetch<any[]>('/patients')).data.map(toPatient);
    const q = query.toLowerCase();
    return { data: patients.filter((patient) => `${patient.full_name} ${patient.mrn} ${patient.phone.number}`.toLowerCase().includes(q)) };
  },
};

export const appointmentAPI = USE_MOCK ? mock.appointmentAPI : {
  async list(filters?: { doctor_id?: string; patient_id?: string; status?: string }): Promise<ApiResponse<Appointment[]>> {
    const query = new URLSearchParams(filters as Record<string, string>).toString();
    const [appointments, patients, users] = await Promise.all([apiFetch<any[]>(`/appointments${query ? `?${query}` : ''}`), patientsById(), usersById()]);
    return {
      data: appointments.data.map((item) => {
        const patient = patients.get(item.patient_id);
        const doctor = users.get(item.doctor_id);
        return {
          id: id(item.appt_id),
          tenant_id: id(item.tenant_id),
          appointment_number: `APT-${item.appt_id}`,
          patient_id: id(item.patient_id),
          patient_mrn: patient?.mrn ?? '',
          patient_name: patient?.full_name ?? '',
          patient_phone: patient?.phone.number ?? '',
          doctor_id: id(item.doctor_id),
          doctor_name: doctor?.full_name ?? '',
          doctor_specialty: doctor?.doctor_profile?.specialty ?? 'General Medicine',
          appointment_type: 'consultation',
          status: item.status ?? 'scheduled',
          source: 'walk_in',
          scheduled_at: item.slot_datetime,
          duration_minutes: 30,
          reason: '',
          fee_bdt: 0,
          payment_status: 'pending',
          reminder_24h_sent: false,
          reminder_2h_sent: false,
          created_at: item.created_at ?? now(),
          updated_at: item.updated_at ?? item.created_at ?? now(),
        } as Appointment;
      }),
    };
  },
  async get(appointmentId: string): Promise<ApiResponse<Appointment>> {
    return { data: (await this.list()).data.find((item) => item.id === appointmentId) as Appointment };
  },
  async getToday(): Promise<ApiResponse<Appointment[]>> {
    const appointments = (await this.list()).data;
    return { data: appointments.filter((item) => new Date(item.scheduled_at).toDateString() === new Date().toDateString()) };
  },
};

export const prescriptionAPI = USE_MOCK ? mock.prescriptionAPI : {
  async list(filters?: { patient_id?: string; doctor_id?: string }): Promise<ApiResponse<Prescription[]>> {
    const query = new URLSearchParams(filters as Record<string, string>).toString();
    const [rxs, items, medicines, patients, users] = await Promise.all([
      apiFetch<any[]>(`/prescriptions${query ? `?${query}` : ''}`),
      apiFetch<any[]>('/prescription-items'),
      apiFetch<any[]>('/medicines'),
      patientsById(),
      usersById(),
    ]);
    const medicineMap = new Map(medicines.data.map((medicine) => [medicine.medicine_id, medicine]));
    return {
      data: rxs.data.map((rx) => {
        const patient = patients.get(rx.patient_id);
        const doctor = users.get(rx.doctor_id);
        return {
          id: id(rx.rx_id),
          tenant_id: patient?.tenant_id ?? '',
          prescription_number: `RX-${rx.rx_id}`,
          appointment_id: rx.appt_id ? id(rx.appt_id) : undefined,
          patient_id: id(rx.patient_id),
          patient_mrn: patient?.mrn ?? '',
          patient_name: patient?.full_name ?? '',
          patient_age: 0,
          patient_gender: patient?.gender ?? '',
          doctor_id: id(rx.doctor_id),
          doctor_name: doctor?.full_name ?? '',
          doctor_bmdc_number: '',
          doctor_specialty: doctor?.doctor_profile?.specialty ?? 'General Medicine',
          diagnosis: rx.diagnosis ?? '',
          chief_complaint: '',
          medicines: items.data.filter((item) => item.rx_id === rx.rx_id).map((item) => {
            const medicine = medicineMap.get(item.medicine_id);
            return {
              medicine_id: id(item.medicine_id),
              generic_name: medicine?.generic_name ?? '',
              brand_name: medicine?.name ?? '',
              strength: '',
              dosage: item.dosage ?? '',
              frequency: item.frequency ?? 'once_daily',
              route: 'oral',
              duration_days: Number.parseInt(item.duration ?? '0', 10) || 0,
              quantity: 0,
              dispensed_quantity: 0,
            };
          }),
          follow_up_reminder_set: false,
          status: rx.signed_at ? 'signed' : 'draft',
          signed_at: rx.signed_at ?? undefined,
          acknowledged_warnings: [],
          created_at: rx.created_at ?? now(),
          updated_at: rx.updated_at ?? rx.created_at ?? now(),
        } as Prescription;
      }),
    };
  },
  async get(prescriptionId: string): Promise<ApiResponse<Prescription>> {
    return { data: (await this.list()).data.find((item) => item.id === prescriptionId) as Prescription };
  },
};

export const labAPI = USE_MOCK ? mock.labAPI : {
  async list(filters?: { status?: string; patient_id?: string }): Promise<ApiResponse<LabTest[]>> {
    const query = new URLSearchParams(filters as Record<string, string>).toString();
    const [tests, results, patients, users] = await Promise.all([apiFetch<any[]>(`/lab-tests${query ? `?${query}` : ''}`), apiFetch<any[]>('/lab-results'), patientsById(), usersById()]);
    return {
      data: tests.data.map((test) => {
        const patient = patients.get(test.patient_id);
        const technician = users.get(test.technician_id);
        return {
          id: id(test.lab_id),
          tenant_id: patient?.tenant_id ?? '',
          order_number: `LAB-${test.lab_id}`,
          patient_id: id(test.patient_id),
          patient_mrn: patient?.mrn ?? '',
          patient_name: patient?.full_name ?? '',
          test_name: test.test_type,
          test_category: '',
          status: 'pending',
          priority: 'routine',
          ordered_by_doctor_id: '',
          ordered_by_doctor_name: technician?.full_name ?? '',
          ordered_at: now(),
          overall_flag: 'normal',
          results: results.data.filter((result) => result.lab_id === test.lab_id).map((result) => ({
            parameter_id: id(result.result_id),
            parameter_name: test.test_type,
            value: result.result_value ?? '',
            unit: '',
            reference_range_display: '',
            flag: result.flag ?? 'normal',
          })),
          created_at: now(),
          updated_at: now(),
        } as unknown as LabTest;
      }),
    };
  },
  async get(labId: string): Promise<ApiResponse<LabTest>> {
    return { data: (await this.list()).data.find((item) => item.id === labId) as LabTest };
  },
};

export const pharmacyAPI = USE_MOCK ? mock.pharmacyAPI : {
  async listOrders(): Promise<ApiResponse<PharmacyOrder[]>> {
    return { data: [] };
  },
  async listInventory(): Promise<ApiResponse<MedicineInventory[]>> {
    const [inventory, medicines] = await Promise.all([apiFetch<any[]>('/inventory'), apiFetch<any[]>('/medicines')]);
    const medicineMap = new Map(medicines.data.map((medicine) => [medicine.medicine_id, medicine]));
    return {
      data: inventory.data.map((item) => {
        const medicine = medicineMap.get(item.medicine_id);
        const currentStock = Number(item.quantity ?? medicine?.stock ?? 0);
        return {
          id: id(item.inventory_id),
          tenant_id: '',
          medicine_id: id(item.medicine_id),
          generic_name: medicine?.generic_name ?? '',
          brand_name: medicine?.name ?? '',
          strength: '',
          manufacturer: '',
          batch_number: '',
          manufacture_date: '',
          expiry_date: item.expiry_date ?? '',
          current_stock: currentStock,
          min_threshold: 10,
          max_threshold: 100,
          unit_cost_bdt: 0,
          selling_price_bdt: 0,
          is_expired: item.expiry_date ? new Date(item.expiry_date) < new Date() : false,
          is_low_stock: currentStock <= 10,
          is_out_of_stock: currentStock <= 0,
          created_at: now(),
          updated_at: now(),
        } as MedicineInventory;
      }),
    };
  },
  async getLowStockItems(): Promise<ApiResponse<MedicineInventory[]>> {
    const inventory = (await this.listInventory()).data;
    return { data: inventory.filter((item) => item.is_low_stock || item.is_out_of_stock) };
  },
};

export const bedAPI = USE_MOCK ? mock.bedAPI : {
  async listWards(): Promise<ApiResponse<Ward[]>> {
    const [wards, beds] = await Promise.all([apiFetch<any[]>('/wards'), apiFetch<any[]>('/beds')]);
    return {
      data: wards.data.map((ward) => {
        const wardBeds = beds.data.filter((bed) => bed.ward_id === ward.ward_id);
        const available = wardBeds.filter((bed) => bed.status === 'available').length;
        return {
          id: id(ward.ward_id),
          tenant_id: id(ward.tenant_id),
          name: ward.name,
          ward_type: 'general',
          floor: '',
          total_beds: wardBeds.length,
          available_beds: available,
          occupied_beds: wardBeds.filter((bed) => bed.status === 'occupied').length,
          reserved_beds: wardBeds.filter((bed) => bed.status === 'reserved').length,
          maintenance_beds: wardBeds.filter((bed) => bed.status === 'maintenance').length,
          occupancy_rate: wardBeds.length ? ((wardBeds.length - available) / wardBeds.length) * 100 : 0,
          capacity_threshold: 90,
          threshold_alert_sent: false,
          created_at: now(),
          updated_at: now(),
        } as Ward;
      }),
    };
  },
  async listBeds(wardId?: string): Promise<ApiResponse<Bed[]>> {
    const query = wardId ? `?ward_id=${wardId}` : '';
    const [beds, wards] = await Promise.all([apiFetch<any[]>(`/beds${query}`), apiFetch<any[]>('/wards')]);
    const wardMap = new Map(wards.data.map((ward) => [ward.ward_id, ward]));
    return {
      data: beds.data.map((bed) => {
        const ward = wardMap.get(bed.ward_id);
        return {
          id: id(bed.bed_id),
          tenant_id: id(ward?.tenant_id),
          ward_id: id(bed.ward_id),
          ward_name: ward?.name ?? '',
          bed_number: bed.bed_number,
          status: bed.status ?? 'available',
          has_oxygen: false,
          has_ventilator: false,
          has_monitor: false,
          daily_rate_bdt: 0,
          created_at: now(),
          updated_at: now(),
        } as Bed;
      }),
    };
  },
};

export const billingAPI = USE_MOCK ? mock.billingAPI : {
  async list(filters?: { status?: string; patient_id?: string }): Promise<ApiResponse<Bill[]>> {
    const query = new URLSearchParams(filters as Record<string, string>).toString();
    const [bills, items, payments, patients] = await Promise.all([apiFetch<any[]>(`/bills${query ? `?${query}` : ''}`), apiFetch<any[]>('/bill-items'), apiFetch<any[]>('/payments'), patientsById()]);
    return {
      data: bills.data.map((bill) => {
        const patient = patients.get(bill.patient_id);
        const billItems = items.data.filter((item) => item.bill_id === bill.bill_id);
        const billPayments = payments.data.filter((payment) => payment.bill_id === bill.bill_id);
        const paid = billPayments.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
        return {
          id: id(bill.bill_id),
          tenant_id: id(bill.tenant_id),
          bill_number: `BILL-${bill.bill_id}`,
          patient_id: id(bill.patient_id),
          patient_mrn: patient?.mrn ?? '',
          patient_name: patient?.full_name ?? '',
          patient_phone: patient?.phone.number ?? '',
          status: bill.status ?? 'pending',
          bill_date: now(),
          line_items: billItems.map((item) => ({
            id: id(item.item_id),
            category: 'other',
            description: item.description,
            quantity: 1,
            unit_price_bdt: Number(item.amount ?? 0),
            subtotal_bdt: Number(item.amount ?? 0),
            tax_bdt: 0,
            discount_bdt: 0,
            total_bdt: Number(item.amount ?? 0),
            date: now(),
          })),
          subtotal_bdt: Number(bill.total ?? 0),
          total_tax_bdt: 0,
          total_discount_bdt: 0,
          total_amount_bdt: Number(bill.total ?? 0),
          amount_paid_bdt: paid,
          amount_outstanding_bdt: Number(bill.total ?? 0) - paid,
          payments: billPayments.map((payment) => ({
            id: id(payment.payment_id),
            bill_id: id(payment.bill_id),
            amount_bdt: Number(payment.amount ?? 0),
            method: payment.method ?? 'cash',
            status: 'success',
            paid_at: payment.paid_at ?? now(),
          })),
          created_at: now(),
          updated_at: now(),
        } as Bill;
      }),
    };
  },
  async get(billId: string): Promise<ApiResponse<Bill>> {
    return { data: (await this.list()).data.find((item) => item.id === billId) as Bill };
  },
};

export const alertAPI = USE_MOCK ? mock.alertAPI : {
  async list(filters?: { severity?: string; status?: string }): Promise<ApiResponse<Alert[]>> {
    const query = new URLSearchParams({ status: filters?.status ?? '' }).toString();
    const alerts = (await apiFetch<any[]>(`/alerts${query ? `?${query}` : ''}`)).data;
    return { data: alerts.map((alert) => ({
      id: id(alert.alert_id),
      tenant_id: id(alert.tenant_id),
      alert_type: alert.trigger_type,
      severity: filters?.severity ?? 'medium',
      title: alert.trigger_type,
      message: alert.trigger_type,
      status: alert.status ?? 'pending',
      acknowledged_at: alert.ack_at ?? undefined,
      created_at: alert.sent_at ?? now(),
      updated_at: alert.ack_at ?? alert.sent_at ?? now(),
    } as unknown as Alert)) };
  },
  async getActive(): Promise<ApiResponse<Alert[]>> {
    const alerts = (await this.list()).data;
    return { data: alerts.filter((alert) => !alert.acknowledged_at) };
  },
  async getNotifications(): Promise<ApiResponse<InAppNotification[]>> {
    return { data: [] };
  },
  async acknowledge(alertId: string): Promise<ApiResponse<{ success: boolean }>> {
    await apiFetch(`/alerts/${alertId}`, { method: 'PATCH', body: JSON.stringify({ ack_at: now(), status: 'acknowledged' }) });
    return { data: { success: true } };
  },
};

export const emergencyAPI = USE_MOCK ? mock.emergencyAPI : {
  async listActive(): Promise<ApiResponse<EmergencyRequest[]>> {
    const [requests, patients] = await Promise.all([apiFetch<any[]>('/emergency-requests'), patientsById()]);
    return {
      data: requests.data.map((request) => {
        const patient = patients.get(request.patient_id);
        return {
          id: id(request.emergency_id),
          tenant_id: patient?.tenant_id ?? '',
          request_number: `EMR-${request.emergency_id}`,
          patient_id: id(request.patient_id),
          patient_mrn: patient?.mrn ?? '',
          patient_name: patient?.full_name ?? '',
          patient_phone: patient?.phone.number ?? '',
          status: request.status ?? 'open',
          created_at: request.created_at ?? now(),
          updated_at: request.created_at ?? now(),
        } as unknown as EmergencyRequest;
      }),
    };
  },
  async triggerSOS(): Promise<ApiResponse<EmergencyRequest>> {
    const response = await apiFetch<any>('/emergency-requests', { method: 'POST', body: JSON.stringify({ patient_id: 1, status: 'sos_received' }) });
    return { data: { id: id(response.data.emergency_id), status: response.data.status, created_at: response.data.created_at, updated_at: response.data.created_at } as unknown as EmergencyRequest };
  },
};

export const userAPI = USE_MOCK ? mock.userAPI : {
  async list(): Promise<ApiResponse<User[]>> {
    const [users, roles] = await Promise.all([apiFetch<any[]>('/users'), rolesById()]);
    return { data: users.data.map((user) => toUser(user, roles.get(user.role_id))).filter((user) => user.role !== 'patient' && user.role !== 'super_admin') };
  },
  async listDoctors(): Promise<ApiResponse<User[]>> {
    const users = (await this.list()).data;
    return { data: users.filter((user) => user.role === 'doctor') };
  },
};
