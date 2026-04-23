/**
 * Mock data for all modules. Realistic Bangladesh healthcare context.
 * This will be replaced by real API calls once backend is built.
 */

import type {
  Alert,
  Appointment,
  Bed,
  Bill,
  DashboardKPIs,
  DoctorPerformance,
  EmergencyRequest,
  HealthTimelineEvent,
  InAppNotification,
  LabTest,
  MedicineInventory,
  Patient,
  PharmacyOrder,
  Prescription,
  Tenant,
  User,
  Ward,
} from '@/types';

// ============================================================================
// TENANT (Hospital)
// ============================================================================
export const MOCK_TENANT: Tenant = {
  id: 'tenant-001',
  subdomain: 'demo',
  plan: 'business',
  status: 'active',
  branding: {
    hospital_name: 'Demo Medical Center',
    display_name: 'Demo Medical',
    tagline: 'Compassionate care, advanced medicine',
    primary_color: '#0b4f6c',
    support_email: 'support@demo.hms.com.bd',
    support_phone: '+880 9612 345 678',
  },
  address: {
    line1: 'Plot 42, Road 27',
    line2: 'Dhanmondi',
    city: 'Dhaka',
    district: 'Dhaka',
    division: 'Dhaka',
    postal_code: '1209',
    country: 'Bangladesh',
  },
  limits: {
    max_patients: 10000,
    max_beds: null,
    max_branches: 3,
    has_telemedicine: true,
    has_emergency_module: true,
    has_pharma_portal: false,
    has_white_label: false,
    has_ai_features: false,
    alert_channels: ['sms', 'email', 'whatsapp', 'in_app'],
    sla_response_hours: 12,
  },
  usage: {
    patient_count: 3247,
    bed_count: 145,
    branch_count: 1,
    active_staff_count: 68,
  },
  subscription_started_at: '2026-01-15T00:00:00Z',
  subscription_renews_at: '2026-05-15T00:00:00Z',
  created_at: '2026-01-15T00:00:00Z',
  updated_at: '2026-04-20T00:00:00Z',
};

// ============================================================================
// USERS (Staff + Patient Users)
// ============================================================================
export const MOCK_USERS: User[] = [
  {
    id: 'user-admin-001',
    tenant_id: 'tenant-001',
    role: 'hospital_admin',
    email: 'admin@demo.hms.com.bd',
    phone: { country_code: '+880', number: '1712345001' },
    full_name: 'Dr. Masfiqur Rahman Nehal',
    profile_photo_url: 'https://api.dicebear.com/9.x/initials/svg?seed=FA&backgroundColor=0b4f6c',
    gender: 'male',
    status: 'active',
    email_verified: true,
    phone_verified: true,
    two_factor_enabled: true,
    last_login_at: '2026-04-22T08:30:00Z',
    failed_login_attempts: 0,
    created_at: '2026-01-15T00:00:00Z',
    updated_at: '2026-04-22T08:30:00Z',
  },
  {
    id: 'user-doc-001',
    tenant_id: 'tenant-001',
    role: 'doctor',
    email: 'dr.karim@demo.hms.com.bd',
    phone: { country_code: '+880', number: '1712345002' },
    full_name: 'Dr. Karim Hossain',
    profile_photo_url: 'https://api.dicebear.com/9.x/initials/svg?seed=KH&backgroundColor=14b8a6',
    gender: 'male',
    status: 'active',
    email_verified: true,
    phone_verified: true,
    two_factor_enabled: true,
    last_login_at: '2026-04-22T09:15:00Z',
    failed_login_attempts: 0,
    doctor_profile: {
      bmdc_number: 'A-45678',
      specialty: 'Cardiology',
      sub_specialty: 'Interventional Cardiology',
      qualifications: ['MBBS', 'FCPS (Cardiology)', 'MD'],
      years_of_experience: 15,
      consultation_fee_bdt: 1500,
      languages: ['Bangla', 'English'],
      bio: 'Senior consultant cardiologist with 15 years of experience in interventional procedures.',
    },
    created_at: '2026-01-20T00:00:00Z',
    updated_at: '2026-04-22T09:15:00Z',
  },
  {
    id: 'user-doc-002',
    tenant_id: 'tenant-001',
    role: 'doctor',
    email: 'dr.nasrin@demo.hms.com.bd',
    phone: { country_code: '+880', number: '1712345003' },
    full_name: 'Dr. Nasrin Akter',
    profile_photo_url: 'https://api.dicebear.com/9.x/initials/svg?seed=NA&backgroundColor=a855f7',
    gender: 'female',
    status: 'active',
    email_verified: true,
    phone_verified: true,
    two_factor_enabled: false,
    failed_login_attempts: 0,
    doctor_profile: {
      bmdc_number: 'A-45912',
      specialty: 'Pediatrics',
      qualifications: ['MBBS', 'DCH', 'FCPS (Pediatrics)'],
      years_of_experience: 10,
      consultation_fee_bdt: 1200,
      languages: ['Bangla', 'English'],
    },
    created_at: '2026-01-20T00:00:00Z',
    updated_at: '2026-04-22T00:00:00Z',
  },
  {
    id: 'user-nurse-001',
    tenant_id: 'tenant-001',
    role: 'nurse',
    email: 'sister.rumana@demo.hms.com.bd',
    phone: { country_code: '+880', number: '1712345004' },
    full_name: 'Rumana Begum',
    profile_photo_url: 'https://api.dicebear.com/9.x/initials/svg?seed=RB&backgroundColor=ec4899',
    gender: 'female',
    status: 'active',
    email_verified: true,
    phone_verified: true,
    two_factor_enabled: false,
    failed_login_attempts: 0,
    nurse_profile: {
      license_number: 'NRS-2020-3456',
      ward_assigned: 'ICU Ward 2',
      shift: 'morning',
    },
    created_at: '2026-02-01T00:00:00Z',
    updated_at: '2026-04-22T00:00:00Z',
  },
  {
    id: 'user-lab-001',
    tenant_id: 'tenant-001',
    role: 'lab_technician',
    email: 'lab.tanvir@demo.hms.com.bd',
    phone: { country_code: '+880', number: '1712345005' },
    full_name: 'Nehal',
    profile_photo_url: 'https://api.dicebear.com/9.x/initials/svg?seed=TI&backgroundColor=f59e0b',
    gender: 'male',
    status: 'active',
    email_verified: true,
    phone_verified: true,
    two_factor_enabled: false,
    failed_login_attempts: 0,
    lab_tech_profile: {
      license_number: 'LAB-2019-8765',
      specializations: ['Hematology', 'Biochemistry'],
    },
    created_at: '2026-02-05T00:00:00Z',
    updated_at: '2026-04-22T00:00:00Z',
  },
  {
    id: 'user-pharm-001',
    tenant_id: 'tenant-001',
    role: 'pharmacist',
    email: 'pharm.sadia@demo.hms.com.bd',
    phone: { country_code: '+880', number: '1712345006' },
    full_name: 'Sadia Rahman',
    profile_photo_url: 'https://api.dicebear.com/9.x/initials/svg?seed=SR&backgroundColor=10b981',
    gender: 'female',
    status: 'active',
    email_verified: true,
    phone_verified: true,
    two_factor_enabled: false,
    failed_login_attempts: 0,
    pharmacist_profile: { license_number: 'PHR-2018-5432' },
    created_at: '2026-02-10T00:00:00Z',
    updated_at: '2026-04-22T00:00:00Z',
  },
  {
    id: 'user-recep-001',
    tenant_id: 'tenant-001',
    role: 'receptionist',
    email: 'reception@demo.hms.com.bd',
    phone: { country_code: '+880', number: '1712345007' },
    full_name: 'Fahmida Sultana',
    profile_photo_url: 'https://api.dicebear.com/9.x/initials/svg?seed=FS&backgroundColor=6366f1',
    gender: 'female',
    status: 'active',
    email_verified: true,
    phone_verified: true,
    two_factor_enabled: false,
    failed_login_attempts: 0,
    created_at: '2026-02-12T00:00:00Z',
    updated_at: '2026-04-22T00:00:00Z',
  },
  {
    id: 'user-patient-001',
    tenant_id: 'tenant-001',
    role: 'patient',
    email: 'rahim.patient@gmail.com',
    phone: { country_code: '+880', number: '1812345008' },
    full_name: 'Md. Rahim Uddin',
    profile_photo_url: 'https://api.dicebear.com/9.x/initials/svg?seed=RU&backgroundColor=0ea5e9',
    gender: 'male',
    date_of_birth: '1985-03-22',
    status: 'active',
    email_verified: true,
    phone_verified: true,
    two_factor_enabled: false,
    failed_login_attempts: 0,
    created_at: '2026-02-15T00:00:00Z',
    updated_at: '2026-04-22T00:00:00Z',
  },
  {
    id: 'user-super-001',
    role: 'super_admin',
    email: 'super@hms.com.bd',
    phone: { country_code: '+880', number: '1712345000' },
    full_name: 'Platform Super Admin',
    profile_photo_url: 'https://api.dicebear.com/9.x/initials/svg?seed=PA&backgroundColor=0b4f6c',
    gender: 'male',
    status: 'active',
    email_verified: true,
    phone_verified: true,
    two_factor_enabled: true,
    failed_login_attempts: 0,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-04-22T00:00:00Z',
  },
];

// Demo credentials for login
export const DEMO_CREDENTIALS = [
  { role: 'Hospital Admin', email: 'admin@demo.hms.com.bd', password: 'Demo@2026' },
  { role: 'Doctor (Cardiology)', email: 'dr.karim@demo.hms.com.bd', password: 'Demo@2026' },
  { role: 'Doctor (Pediatrics)', email: 'dr.nasrin@demo.hms.com.bd', password: 'Demo@2026' },
  { role: 'Nurse', email: 'sister.rumana@demo.hms.com.bd', password: 'Demo@2026' },
  { role: 'Lab Technician', email: 'lab.tanvir@demo.hms.com.bd', password: 'Demo@2026' },
  { role: 'Pharmacist', email: 'pharm.sadia@demo.hms.com.bd', password: 'Demo@2026' },
  { role: 'Receptionist', email: 'reception@demo.hms.com.bd', password: 'Demo@2026' },
  { role: 'Patient', email: 'rahim.patient@gmail.com', password: 'Demo@2026' },
  { role: 'Super Admin', email: 'super@hms.com.bd', password: 'Demo@2026' },
];

// ============================================================================
// PATIENTS
// ============================================================================
export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'patient-001',
    tenant_id: 'tenant-001',
    mrn: 'HAX-10024',
    full_name: 'Md. Rahim Uddin',
    date_of_birth: '1985-03-22',
    gender: 'male',
    marital_status: 'married',
    nid_number: '1990123456789',
    blood_group: 'B+',
    phone: { country_code: '+880', number: '1812345008' },
    email: 'rahim.patient@gmail.com',
    address: {
      line1: 'House 23, Road 5',
      line2: 'Mohammadpur',
      city: 'Dhaka',
      district: 'Dhaka',
      division: 'Dhaka',
      postal_code: '1207',
      country: 'Bangladesh',
    },
    occupation: 'Software Engineer',
    emergency_contacts: [
      { name: 'Ayesha Uddin', relationship: 'Wife', phone: { country_code: '+880', number: '1812345009' } },
    ],
    medical_history: {
      allergies: ['Penicillin'],
      chronic_conditions: ['Hypertension'],
      current_medications: ['Amlodipine 5mg'],
      past_surgeries: [],
      family_history: ['Diabetes (father)', 'Hypertension (mother)'],
    },
    patient_type: 'self_registered',
    age_years: 41,
    last_visit_date: '2026-04-10T00:00:00Z',
    total_visits: 7,
    outstanding_balance_bdt: 0,
    created_at: '2026-02-15T00:00:00Z',
    updated_at: '2026-04-22T00:00:00Z',
  },
  {
    id: 'patient-002',
    tenant_id: 'tenant-001',
    mrn: 'HAX-10087',
    full_name: 'Fatema Begum',
    date_of_birth: '1962-08-14',
    gender: 'female',
    marital_status: 'widowed',
    nid_number: '1967123456789',
    blood_group: 'A+',
    phone: { country_code: '+880', number: '1912345010' },
    address: {
      line1: 'Flat 3B, Lalmatia',
      city: 'Dhaka',
      district: 'Dhaka',
      division: 'Dhaka',
      postal_code: '1207',
      country: 'Bangladesh',
    },
    emergency_contacts: [
      { name: 'Sohel Rana', relationship: 'Son', phone: { country_code: '+880', number: '1912345011' } },
    ],
    medical_history: {
      allergies: [],
      chronic_conditions: ['Type 2 Diabetes', 'Hypertension', 'Osteoarthritis'],
      current_medications: ['Metformin 1000mg', 'Losartan 50mg'],
      past_surgeries: [{ procedure: 'Cataract surgery (right eye)', date: '2022-06-15' }],
      family_history: [],
    },
    patient_type: 'walk_in',
    age_years: 63,
    last_visit_date: '2026-04-18T00:00:00Z',
    total_visits: 23,
    outstanding_balance_bdt: 3500,
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2026-04-22T00:00:00Z',
  },
  {
    id: 'patient-003',
    tenant_id: 'tenant-001',
    mrn: 'HAX-10156',
    full_name: 'Ayaan Chowdhury',
    date_of_birth: '2020-11-03',
    gender: 'male',
    nid_number: undefined,
    birth_certificate_number: 'BC-2020-89012345',
    blood_group: 'O+',
    phone: { country_code: '+880', number: '1712345012' },
    address: {
      line1: 'House 15, Road 11',
      line2: 'Gulshan 2',
      city: 'Dhaka',
      district: 'Dhaka',
      division: 'Dhaka',
      postal_code: '1212',
      country: 'Bangladesh',
    },
    emergency_contacts: [
      { name: 'Tahmina Chowdhury', relationship: 'Mother', phone: { country_code: '+880', number: '1712345012' } },
    ],
    medical_history: {
      allergies: [],
      chronic_conditions: [],
      current_medications: [],
      past_surgeries: [],
      family_history: [],
    },
    patient_type: 'guardian_registered',
    guardian_id: 'guardian-001',
    age_years: 5,
    last_visit_date: '2026-04-20T00:00:00Z',
    total_visits: 4,
    outstanding_balance_bdt: 0,
    created_at: '2025-03-12T00:00:00Z',
    updated_at: '2026-04-22T00:00:00Z',
  },
];

// ============================================================================
// DASHBOARD KPIs
// ============================================================================
export const MOCK_KPIS: DashboardKPIs = {
  total_patients: 3247,
  total_patients_delta_percent: 12.5,
  appointments_today: 142,
  appointments_today_delta_percent: 8.3,
  revenue_today_bdt: 284500,
  revenue_today_delta_percent: 15.2,
  revenue_month_bdt: 6420000,
  revenue_month_delta_percent: 22.1,
  bed_occupancy_rate: 78.6,
  active_doctors: 24,
  pending_lab_tests: 18,
  pending_prescriptions: 7,
  active_alerts: 3,
  critical_alerts: 1,
};

// ============================================================================
// APPOINTMENTS
// ============================================================================
const now = new Date();
const todayAt = (h: number, m: number = 0): string => {
  const d = new Date(now);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'appt-001',
    tenant_id: 'tenant-001',
    appointment_number: 'APT-2026-0142',
    patient_id: 'patient-001',
    patient_mrn: 'HAX-10024',
    patient_name: 'Md. Rahim Uddin',
    patient_phone: '+880 1812-345008',
    doctor_id: 'user-doc-001',
    doctor_name: 'Dr. Karim Hossain',
    doctor_specialty: 'Cardiology',
    department: 'Cardiology',
    appointment_type: 'follow_up',
    status: 'confirmed',
    source: 'online_patient',
    scheduled_at: todayAt(10, 30),
    duration_minutes: 30,
    reason: 'Follow-up for hypertension management',
    fee_bdt: 1500,
    payment_status: 'paid',
    reminder_24h_sent: true,
    reminder_2h_sent: false,
    created_at: '2026-04-20T00:00:00Z',
    updated_at: '2026-04-22T00:00:00Z',
  },
  {
    id: 'appt-002',
    tenant_id: 'tenant-001',
    appointment_number: 'APT-2026-0143',
    patient_id: 'patient-002',
    patient_mrn: 'HAX-10087',
    patient_name: 'Fatema Begum',
    patient_phone: '+880 1912-345010',
    doctor_id: 'user-doc-001',
    doctor_name: 'Dr. Karim Hossain',
    doctor_specialty: 'Cardiology',
    appointment_type: 'consultation',
    status: 'checked_in',
    source: 'walk_in',
    scheduled_at: todayAt(11, 0),
    duration_minutes: 30,
    checked_in_at: todayAt(10, 45),
    reason: 'Chest discomfort for 3 days',
    fee_bdt: 1500,
    payment_status: 'paid',
    reminder_24h_sent: true,
    reminder_2h_sent: true,
    created_at: '2026-04-21T00:00:00Z',
    updated_at: '2026-04-22T00:00:00Z',
  },
  {
    id: 'appt-003',
    tenant_id: 'tenant-001',
    appointment_number: 'APT-2026-0144',
    patient_id: 'patient-003',
    patient_mrn: 'HAX-10156',
    patient_name: 'Ayaan Chowdhury',
    patient_phone: '+880 1712-345012',
    doctor_id: 'user-doc-002',
    doctor_name: 'Dr. Nasrin Akter',
    doctor_specialty: 'Pediatrics',
    appointment_type: 'teleconsultation',
    status: 'scheduled',
    source: 'online_patient',
    scheduled_at: todayAt(14, 0),
    duration_minutes: 20,
    reason: 'Fever and cough for 2 days',
    fee_bdt: 1200,
    payment_status: 'paid',
    video_link: 'https://meet.demo.hms.com.bd/room/apt-003',
    video_room_id: 'apt-003',
    reminder_24h_sent: true,
    reminder_2h_sent: false,
    created_at: '2026-04-21T00:00:00Z',
    updated_at: '2026-04-22T00:00:00Z',
  },
  {
    id: 'appt-004',
    tenant_id: 'tenant-001',
    appointment_number: 'APT-2026-0145',
    patient_id: 'patient-001',
    patient_mrn: 'HAX-10024',
    patient_name: 'Md. Rahim Uddin',
    patient_phone: '+880 1812-345008',
    doctor_id: 'user-doc-001',
    doctor_name: 'Dr. Karim Hossain',
    doctor_specialty: 'Cardiology',
    appointment_type: 'consultation',
    status: 'completed',
    source: 'online_patient',
    scheduled_at: '2026-04-10T10:00:00Z',
    duration_minutes: 30,
    completed_at: '2026-04-10T10:32:00Z',
    reason: 'Routine check-up',
    fee_bdt: 1500,
    payment_status: 'paid',
    reminder_24h_sent: true,
    reminder_2h_sent: true,
    created_at: '2026-04-05T00:00:00Z',
    updated_at: '2026-04-10T10:32:00Z',
  },
];

// ============================================================================
// LAB TESTS
// ============================================================================
export const MOCK_LAB_TESTS: LabTest[] = [
  {
    id: 'lab-001',
    tenant_id: 'tenant-001',
    test_number: 'LAB-2026-0891',
    patient_id: 'patient-002',
    patient_mrn: 'HAX-10087',
    patient_name: 'Fatema Begum',
    patient_age: 63,
    patient_gender: 'female',
    ordered_by_doctor_id: 'user-doc-001',
    ordered_by_doctor_name: 'Dr. Karim Hossain',
    catalog_item_id: 'cat-cbc',
    test_name: 'Complete Blood Count',
    test_code: 'CBC',
    category: 'Hematology',
    priority: 'routine',
    status: 'reported',
    ordered_at: '2026-04-21T09:00:00Z',
    sample_collected_at: '2026-04-21T10:30:00Z',
    result_entered_at: '2026-04-21T14:15:00Z',
    entered_by_technician_id: 'user-lab-001',
    entered_by_technician_name: 'Tanvir Islam',
    verified_at: '2026-04-21T15:00:00Z',
    reported_at: '2026-04-21T15:30:00Z',
    results: [
      { parameter_id: 'p-hgb', parameter_name: 'Hemoglobin', value: 9.2, unit: 'g/dL', flag: 'critical', reference_range_display: '12.0 - 15.5' },
      { parameter_id: 'p-wbc', parameter_name: 'WBC Count', value: 8.4, unit: '10³/μL', flag: 'normal', reference_range_display: '4.5 - 11.0' },
      { parameter_id: 'p-plt', parameter_name: 'Platelets', value: 145, unit: '10³/μL', flag: 'borderline', reference_range_display: '150 - 400' },
    ],
    overall_flag: 'critical',
    clinical_notes: 'Low hemoglobin suggests anemia. Recommend further iron studies.',
    price_bdt: 800,
    payment_status: 'paid',
    critical_alert_triggered: true,
    critical_alert_sent_at: '2026-04-21T14:15:30Z',
    created_at: '2026-04-21T09:00:00Z',
    updated_at: '2026-04-21T15:30:00Z',
  },
  {
    id: 'lab-002',
    tenant_id: 'tenant-001',
    test_number: 'LAB-2026-0892',
    patient_id: 'patient-001',
    patient_mrn: 'HAX-10024',
    patient_name: 'Md. Rahim Uddin',
    patient_age: 41,
    patient_gender: 'male',
    ordered_by_doctor_id: 'user-doc-001',
    ordered_by_doctor_name: 'Dr. Karim Hossain',
    catalog_item_id: 'cat-lipid',
    test_name: 'Lipid Profile',
    test_code: 'LIPID',
    category: 'Biochemistry',
    priority: 'routine',
    status: 'in_progress',
    ordered_at: '2026-04-22T08:00:00Z',
    sample_collected_at: '2026-04-22T09:00:00Z',
    overall_flag: 'normal',
    price_bdt: 1200,
    payment_status: 'paid',
    critical_alert_triggered: false,
    created_at: '2026-04-22T08:00:00Z',
    updated_at: '2026-04-22T09:00:00Z',
  },
];

// ============================================================================
// BEDS & WARDS
// ============================================================================
export const MOCK_WARDS: Ward[] = [
  {
    id: 'ward-001', tenant_id: 'tenant-001', name: 'General Ward A', ward_type: 'general',
    floor: '2nd Floor', total_beds: 24, available_beds: 6, occupied_beds: 16, reserved_beds: 2, maintenance_beds: 0,
    occupancy_rate: 66.7, capacity_threshold: 90, threshold_alert_sent: false, daily_rate_bdt: 1500,
    created_at: '2026-01-15T00:00:00Z', updated_at: '2026-04-22T00:00:00Z',
  },
  {
    id: 'ward-002', tenant_id: 'tenant-001', name: 'ICU Ward 2', ward_type: 'icu',
    floor: '4th Floor', total_beds: 8, available_beds: 1, occupied_beds: 7, reserved_beds: 0, maintenance_beds: 0,
    occupancy_rate: 87.5, capacity_threshold: 90, threshold_alert_sent: false, daily_rate_bdt: 12000,
    head_nurse_id: 'user-nurse-001', head_nurse_name: 'Rumana Begum',
    created_at: '2026-01-15T00:00:00Z', updated_at: '2026-04-22T00:00:00Z',
  },
  {
    id: 'ward-003', tenant_id: 'tenant-001', name: 'Private Cabin Block', ward_type: 'cabin',
    floor: '3rd Floor', total_beds: 12, available_beds: 4, occupied_beds: 8, reserved_beds: 0, maintenance_beds: 0,
    occupancy_rate: 66.7, capacity_threshold: 90, threshold_alert_sent: false, daily_rate_bdt: 5500,
    created_at: '2026-01-15T00:00:00Z', updated_at: '2026-04-22T00:00:00Z',
  },
  {
    id: 'ward-004', tenant_id: 'tenant-001', name: 'Maternity Ward', ward_type: 'maternity',
    floor: '5th Floor', total_beds: 16, available_beds: 3, occupied_beds: 12, reserved_beds: 1, maintenance_beds: 0,
    occupancy_rate: 81.3, capacity_threshold: 90, threshold_alert_sent: false, daily_rate_bdt: 3000,
    created_at: '2026-01-15T00:00:00Z', updated_at: '2026-04-22T00:00:00Z',
  },
];

export const MOCK_BEDS: Bed[] = [
  ...Array.from({ length: 24 }, (_, i): Bed => ({
    id: `bed-A-${i + 1}`, tenant_id: 'tenant-001', ward_id: 'ward-001', ward_name: 'General Ward A',
    bed_number: `A-${String(i + 1).padStart(3, '0')}`,
    status: i < 16 ? 'occupied' : i < 18 ? 'reserved' : 'available',
    has_oxygen: true, has_ventilator: false, has_monitor: false, daily_rate_bdt: 1500,
    ...(i < 16 && {
      current_patient_id: `patient-auto-${i}`, current_patient_mrn: `HAX-${10200 + i}`,
      current_patient_name: `Patient ${i + 1}`, admission_date: '2026-04-20T00:00:00Z',
    }),
    created_at: '2026-01-15T00:00:00Z', updated_at: '2026-04-22T00:00:00Z',
  })),
];

// ============================================================================
// ALERTS (HAS)
// ============================================================================
export const MOCK_ALERTS: Alert[] = [
  {
    id: 'alert-001', tenant_id: 'tenant-001', trigger_type: 'critical_lab_result',
    severity: 'critical', status: 'delivered',
    title: 'Critical Lab Result — Low Hemoglobin',
    message: 'Patient Fatema Begum (HAX-10087) has critically low Hemoglobin: 9.2 g/dL (normal: 12.0-15.5)',
    patient_id: 'patient-002', patient_mrn: 'HAX-10087', patient_name: 'Fatema Begum',
    reference_type: 'lab_test', reference_id: 'lab-001',
    recipients: [
      { user_id: 'user-doc-001', user_name: 'Dr. Karim Hossain', role: 'doctor', contact: '+880 1712-345002', acknowledged: true, acknowledged_at: '2026-04-21T14:18:00Z' },
    ],
    channels: ['sms', 'email', 'in_app'],
    dispatch_attempts: [
      { channel: 'sms', gateway: 'ssl_wireless', status: 'success', attempted_at: '2026-04-21T14:15:30Z', delivered_at: '2026-04-21T14:15:45Z', retry_count: 0 },
      { channel: 'email', gateway: 'sendgrid', status: 'success', attempted_at: '2026-04-21T14:15:30Z', delivered_at: '2026-04-21T14:15:50Z', retry_count: 0 },
    ],
    triggered_at: '2026-04-21T14:15:15Z', first_delivered_at: '2026-04-21T14:15:45Z',
    acknowledged_at: '2026-04-21T14:18:00Z', escalated: false,
    action_url: '/doctor/lab-tests/lab-001',
    created_at: '2026-04-21T14:15:15Z', updated_at: '2026-04-21T14:18:00Z',
  },
  {
    id: 'alert-002', tenant_id: 'tenant-001', trigger_type: 'bed_occupancy_threshold',
    severity: 'high', status: 'delivered',
    title: 'ICU Ward 2 reaching capacity',
    message: 'ICU Ward 2 is at 87.5% occupancy (7 of 8 beds occupied). Approaching 90% threshold.',
    reference_type: 'ward', reference_id: 'ward-002',
    recipients: [
      { user_id: 'user-admin-001', user_name: 'Dr. Farhan Ahmed', role: 'hospital_admin', contact: 'admin@demo.hms.com.bd', acknowledged: false },
    ],
    channels: ['email', 'in_app'],
    dispatch_attempts: [{ channel: 'email', gateway: 'sendgrid', status: 'success', attempted_at: '2026-04-22T07:30:00Z', delivered_at: '2026-04-22T07:30:12Z', retry_count: 0 }],
    triggered_at: '2026-04-22T07:30:00Z', first_delivered_at: '2026-04-22T07:30:12Z', escalated: false,
    action_url: '/admin/beds',
    created_at: '2026-04-22T07:30:00Z', updated_at: '2026-04-22T07:30:12Z',
  },
  {
    id: 'alert-003', tenant_id: 'tenant-001', trigger_type: 'low_stock',
    severity: 'medium', status: 'delivered',
    title: 'Low stock: Amoxicillin 500mg',
    message: 'Amoxicillin 500mg is below minimum threshold. Current: 45 units. Minimum: 100 units.',
    reference_type: 'medicine', reference_id: 'med-amox',
    recipients: [
      { user_id: 'user-pharm-001', user_name: 'Sadia Rahman', role: 'pharmacist', contact: 'pharm.sadia@demo.hms.com.bd', acknowledged: false },
    ],
    channels: ['email', 'in_app'],
    dispatch_attempts: [{ channel: 'email', gateway: 'sendgrid', status: 'success', attempted_at: '2026-04-22T06:00:00Z', delivered_at: '2026-04-22T06:00:10Z', retry_count: 0 }],
    triggered_at: '2026-04-22T06:00:00Z', escalated: false,
    action_url: '/pharmacist/inventory',
    created_at: '2026-04-22T06:00:00Z', updated_at: '2026-04-22T06:00:10Z',
  },
];

export const MOCK_NOTIFICATIONS: InAppNotification[] = MOCK_ALERTS.map((a) => ({
  id: `notif-${a.id}`,
  alert_id: a.id,
  user_id: a.recipients[0]?.user_id ?? '',
  title: a.title,
  message: a.message,
  severity: a.severity,
  is_read: a.recipients[0]?.acknowledged ?? false,
  read_at: a.acknowledged_at,
  action_url: a.action_url,
  created_at: a.triggered_at,
}));

// ============================================================================
// PRESCRIPTIONS
// ============================================================================
export const MOCK_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'rx-001', tenant_id: 'tenant-001', prescription_number: 'RX-2026-0547',
    appointment_id: 'appt-004', patient_id: 'patient-001', patient_mrn: 'HAX-10024',
    patient_name: 'Md. Rahim Uddin', patient_age: 41, patient_gender: 'male',
    doctor_id: 'user-doc-001', doctor_name: 'Dr. Karim Hossain', doctor_bmdc_number: 'A-45678',
    doctor_specialty: 'Cardiology',
    diagnosis: 'Essential Hypertension', diagnosis_icd10: 'I10',
    chief_complaint: 'Routine check-up, mild headache',
    vital_signs: { blood_pressure: '138/88', pulse: 76, temperature: 98.4, weight_kg: 72 },
    medicines: [
      { medicine_id: 'med-aml', generic_name: 'Amlodipine', brand_name: 'Amdocal', strength: '5mg',
        dosage: '1 tablet', frequency: 'once_daily', route: 'oral', duration_days: 30, quantity: 30,
        special_instructions: 'Take in the morning', dispensed_quantity: 30 },
      { medicine_id: 'med-ato', generic_name: 'Atorvastatin', brand_name: 'Atova', strength: '10mg',
        dosage: '1 tablet', frequency: 'at_bedtime', route: 'oral', duration_days: 30, quantity: 30,
        dispensed_quantity: 30 },
    ],
    advice: 'Maintain low-salt diet. Walk 30 min daily. Monitor BP weekly.',
    follow_up_date: '2026-05-10T10:00:00Z', follow_up_reminder_set: true,
    status: 'dispensed_full', signed_at: '2026-04-10T10:30:00Z',
    acknowledged_warnings: [],
    created_at: '2026-04-10T10:28:00Z', updated_at: '2026-04-10T10:30:00Z',
  },
];

// ============================================================================
// PHARMACY INVENTORY
// ============================================================================
export const MOCK_INVENTORY: MedicineInventory[] = [
  {
    id: 'inv-001', tenant_id: 'tenant-001', medicine_id: 'med-amox',
    generic_name: 'Amoxicillin', brand_name: 'Amoxil', strength: '500mg', manufacturer: 'Square Pharma',
    batch_number: 'B-2025-8821', manufacture_date: '2025-11-01', expiry_date: '2027-10-31',
    current_stock: 45, min_threshold: 100, max_threshold: 1000, unit_cost_bdt: 8, selling_price_bdt: 12,
    is_expired: false, is_low_stock: true, is_out_of_stock: false,
    created_at: '2025-11-15T00:00:00Z', updated_at: '2026-04-22T00:00:00Z',
  },
  {
    id: 'inv-002', tenant_id: 'tenant-001', medicine_id: 'med-aml',
    generic_name: 'Amlodipine', brand_name: 'Amdocal', strength: '5mg', manufacturer: 'Beximco Pharma',
    batch_number: 'B-2026-1104', manufacture_date: '2026-01-15', expiry_date: '2028-01-14',
    current_stock: 850, min_threshold: 200, max_threshold: 2000, unit_cost_bdt: 4, selling_price_bdt: 7,
    is_expired: false, is_low_stock: false, is_out_of_stock: false,
    created_at: '2026-01-20T00:00:00Z', updated_at: '2026-04-22T00:00:00Z',
  },
  {
    id: 'inv-003', tenant_id: 'tenant-001', medicine_id: 'med-met',
    generic_name: 'Metformin', brand_name: 'Comet', strength: '500mg', manufacturer: 'Incepta',
    batch_number: 'B-2025-9933', manufacture_date: '2025-09-10', expiry_date: '2027-09-09',
    current_stock: 1200, min_threshold: 300, max_threshold: 2500, unit_cost_bdt: 3, selling_price_bdt: 5,
    is_expired: false, is_low_stock: false, is_out_of_stock: false,
    created_at: '2025-09-20T00:00:00Z', updated_at: '2026-04-22T00:00:00Z',
  },
];

// ============================================================================
// BILLS
// ============================================================================
export const MOCK_BILLS: Bill[] = [
  {
    id: 'bill-001', tenant_id: 'tenant-001', bill_number: 'INV-2026-1287',
    patient_id: 'patient-002', patient_mrn: 'HAX-10087', patient_name: 'Fatema Begum',
    patient_phone: '+880 1912-345010',
    status: 'partial', bill_date: '2026-04-21T00:00:00Z',
    line_items: [
      { id: 'li-1', category: 'consultation', description: 'Cardiology Consultation - Dr. Karim Hossain',
        quantity: 1, unit_price_bdt: 1500, subtotal_bdt: 1500, tax_bdt: 0, discount_bdt: 0, total_bdt: 1500,
        date: '2026-04-21T00:00:00Z' },
      { id: 'li-2', category: 'lab_test', description: 'Complete Blood Count',
        quantity: 1, unit_price_bdt: 800, subtotal_bdt: 800, tax_bdt: 0, discount_bdt: 0, total_bdt: 800,
        date: '2026-04-21T00:00:00Z' },
      { id: 'li-3', category: 'medicine', description: 'Metformin 500mg × 30',
        quantity: 30, unit_price_bdt: 5, subtotal_bdt: 150, tax_bdt: 0, discount_bdt: 0, total_bdt: 150,
        date: '2026-04-21T00:00:00Z' },
      { id: 'li-4', category: 'bed_charge', description: 'General Ward A (1 day)',
        quantity: 1, unit_price_bdt: 1500, subtotal_bdt: 1500, tax_bdt: 0, discount_bdt: 450, total_bdt: 1050,
        date: '2026-04-21T00:00:00Z' },
    ],
    subtotal_bdt: 3950, total_tax_bdt: 0, total_discount_bdt: 450, total_amount_bdt: 3500,
    amount_paid_bdt: 0, amount_outstanding_bdt: 3500, payments: [],
    discount_applied_by: 'user-admin-001', discount_reason: 'Elderly patient discount',
    created_at: '2026-04-21T00:00:00Z', updated_at: '2026-04-21T00:00:00Z',
  },
];

// ============================================================================
// PHARMACY ORDERS
// ============================================================================
export const MOCK_PHARMACY_ORDERS: PharmacyOrder[] = [
  {
    id: 'po-001', tenant_id: 'tenant-001', order_number: 'PO-2026-0321',
    prescription_id: 'rx-001', prescription_number: 'RX-2026-0547',
    patient_id: 'patient-001', patient_mrn: 'HAX-10024', patient_name: 'Md. Rahim Uddin',
    patient_phone: '+880 1812-345008', doctor_name: 'Dr. Karim Hossain',
    status: 'dispensed', total_amount_bdt: 360,
    items: [
      { prescribed_medicine_id: 'pm-1', medicine_id: 'med-aml', medicine_name: 'Amlodipine 5mg',
        prescribed_quantity: 30, dispensed_quantity: 30, batch_number: 'B-2026-1104',
        unit_price_bdt: 7, total_price_bdt: 210 },
      { prescribed_medicine_id: 'pm-2', medicine_id: 'med-ato', medicine_name: 'Atorvastatin 10mg',
        prescribed_quantity: 30, dispensed_quantity: 30, batch_number: 'B-2026-0705',
        unit_price_bdt: 5, total_price_bdt: 150 },
    ],
    dispensed_by: 'user-pharm-001', dispensed_by_name: 'Sadia Rahman',
    dispensed_at: '2026-04-10T11:00:00Z', payment_status: 'paid',
    created_at: '2026-04-10T10:30:00Z', updated_at: '2026-04-10T11:00:00Z',
  },
];

// ============================================================================
// EMERGENCY REQUESTS
// ============================================================================
export const MOCK_EMERGENCIES: EmergencyRequest[] = [
  {
    id: 'emr-001', tenant_id: 'tenant-001', request_number: 'EMR-2026-0018',
    patient_name: 'Unknown', patient_phone: { country_code: '+880', number: '1712345099' },
    requester_name: 'Roadside caller', requester_relationship: 'stranger',
    pickup_location: { latitude: 23.8103, longitude: 90.4125, updated_at: '2026-04-22T09:45:00Z', address: 'Dhanmondi 27, Dhaka' },
    destination_hospital_id: 'tenant-001', destination_hospital_name: 'Demo Medical Center',
    status: 'en_route_to_patient', priority: 'high',
    chief_complaint: 'Motor vehicle accident, conscious but bleeding from leg',
    reported_vitals: { consciousness: 'alert', breathing: 'normal', bleeding: 'severe' },
    dispatcher_id: 'user-admin-001', dispatcher_name: 'Dr. Farhan Ahmed',
    ambulance_id: 'amb-001', ambulance_number: 'DHK-AMB-001',
    sos_received_at: '2026-04-22T09:42:00Z', dispatcher_assigned_at: '2026-04-22T09:43:00Z',
    ambulance_assigned_at: '2026-04-22T09:44:00Z', ambulance_dispatched_at: '2026-04-22T09:45:00Z',
    estimated_arrival_time: '2026-04-22T10:00:00Z',
    er_pre_notification_sent: true, er_pre_notification_sent_at: '2026-04-22T09:45:30Z',
    created_at: '2026-04-22T09:42:00Z', updated_at: '2026-04-22T09:45:30Z',
  },
];

// ============================================================================
// DOCTOR PERFORMANCE
// ============================================================================
export const MOCK_DOCTOR_PERFORMANCE: DoctorPerformance[] = [
  { doctor_id: 'user-doc-001', doctor_name: 'Dr. Karim Hossain', specialty: 'Cardiology',
    patients_seen: 287, revenue_generated_bdt: 430500, avg_appointment_minutes: 28, patient_satisfaction_score: 4.8 },
  { doctor_id: 'user-doc-002', doctor_name: 'Dr. Nasrin Akter', specialty: 'Pediatrics',
    patients_seen: 342, revenue_generated_bdt: 410400, avg_appointment_minutes: 22, patient_satisfaction_score: 4.9 },
];

// ============================================================================
// HEALTH TIMELINE
// ============================================================================
export const MOCK_HEALTH_TIMELINE: HealthTimelineEvent[] = [
  { id: 't-1', patient_id: 'patient-001', event_type: 'appointment', event_date: '2026-04-10T10:00:00Z',
    title: 'Cardiology Follow-up', description: 'Routine check-up. BP 138/88.',
    doctor_name: 'Dr. Karim Hossain', department: 'Cardiology', reference_id: 'appt-004' },
  { id: 't-2', patient_id: 'patient-001', event_type: 'prescription', event_date: '2026-04-10T10:30:00Z',
    title: 'Prescription RX-2026-0547', description: 'Amlodipine 5mg, Atorvastatin 10mg',
    doctor_name: 'Dr. Karim Hossain', reference_id: 'rx-001' },
  { id: 't-3', patient_id: 'patient-001', event_type: 'lab_test', event_date: '2026-04-22T08:00:00Z',
    title: 'Lipid Profile', description: 'Sample collected, in progress',
    doctor_name: 'Dr. Karim Hossain', reference_id: 'lab-002' },
];

// Chart data for revenue trend
export const MOCK_REVENUE_TREND = [
  { label: 'Mon', value: 245000 }, { label: 'Tue', value: 268000 },
  { label: 'Wed', value: 284500 }, { label: 'Thu', value: 312000 },
  { label: 'Fri', value: 298000 }, { label: 'Sat', value: 254000 },
  { label: 'Sun', value: 198000 },
];

export const MOCK_PATIENT_VISITS_TREND = [
  { label: 'Week 1', value: 820 }, { label: 'Week 2', value: 912 },
  { label: 'Week 3', value: 875 }, { label: 'Week 4', value: 968 },
];

export const MOCK_DEPARTMENT_REVENUE = [
  { label: 'Cardiology', value: 1420000 }, { label: 'Pediatrics', value: 890000 },
  { label: 'Gynecology', value: 760000 }, { label: 'Orthopedics', value: 680000 },
  { label: 'Neurology', value: 540000 }, { label: 'General Medicine', value: 420000 },
];
