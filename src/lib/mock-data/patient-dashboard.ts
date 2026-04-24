export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';
export type NotificationKind =
  | 'appointment'
  | 'follow_up'
  | 'medication'
  | 'lab'
  | 'billing'
  | 'emergency';

export interface PatientDashboardProfile {
  fullName: string;
  mrn: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  phone: string;
  email: string;
  nid: string;
  profilePhotoUrl?: string;
  address: string;
  preferredLanguage: string;
  guardian: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
  };
  emergencyContacts: Array<{
    name: string;
    relationship: string;
    phone: string;
    note: string;
  }>;
  linkedAccounts: Array<{
    id: string;
    name: string;
    relationship: string;
    mrn: string;
    lastActivity: string;
    permissions: string[];
  }>;
}

export interface QuickActionItem {
  label: string;
  href: string;
  helper: string;
}

export interface AppointmentItem {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  status: 'confirmed' | 'reminder_due' | 'completed' | 'cancelled';
  type: 'in_person' | 'teleconsultation';
  reason: string;
  queueNote: string;
  teleLinkStatus?: 'live' | 'available' | 'pending';
}

export interface DoctorAvailability {
  id: string;
  doctor: string;
  specialty: string;
  hospital: string;
  nextAvailable: string;
  slots: Array<{
    label: string;
    status: 'available' | 'limited' | 'full';
  }>;
}

export interface PrescriptionMedicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface PrescriptionItem {
  id: string;
  doctor: string;
  issuedOn: string;
  status: 'active' | 'completed' | 'refill_due';
  diagnosis: string;
  notes: string;
  medicines: PrescriptionMedicine[];
}

export interface LabParameter {
  name: string;
  value: string;
  unit: string;
  range: string;
  flag: 'normal' | 'borderline' | 'critical';
}

export interface LabReportItem {
  id: string;
  title: string;
  collectedOn: string;
  status: 'ready' | 'reviewed' | 'critical';
  orderingDoctor: string;
  summary: string;
  parameters: LabParameter[];
}

export interface BillLineItem {
  name: string;
  amount: number;
}

export interface BillItem {
  id: string;
  invoiceNumber: string;
  issuedOn: string;
  dueOn: string;
  status: 'paid' | 'unpaid' | 'partial';
  lineItems: BillLineItem[];
  paidAmount: number;
  paymentMethod?: 'bKash' | 'Nagad' | 'Card' | 'Cash';
}

export interface PaymentHistoryItem {
  id: string;
  date: string;
  amount: number;
  method: 'bKash' | 'Nagad' | 'Card' | 'Cash';
  status: 'success' | 'processing';
  reference: string;
}

export interface TimelineItem {
  id: string;
  date: string;
  type: 'visit' | 'diagnosis' | 'prescription' | 'lab_result' | 'report' | 'discharge_summary';
  title: string;
  location: string;
  clinician: string;
  detail: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  at: string;
  priority: PriorityLevel;
  kind: NotificationKind;
  unread: boolean;
}

export interface CareStage {
  label: string;
  status: 'done' | 'current' | 'upcoming';
  subtitle: string;
}

export interface VitalTrendPoint {
  label: string;
  systolic: number;
  diastolic: number;
  pulse: number;
}

export interface BalanceTrendPoint {
  label: string;
  billed: number;
  paid: number;
}

export interface EmergencyStatus {
  requestId: string;
  state: 'requested' | 'ambulance_dispatched' | 'en_route' | 'arriving';
  etaMinutes: number;
  ambulance: string;
  driver: string;
  location: string;
  familyVisible: boolean;
  hospitalDesk: string;
  lastUpdated: string;
}

export const patientDashboardData = {
  profile: {
    fullName: 'Nusrat Jahan',
    mrn: 'HAX-42851',
    dateOfBirth: '1991-09-16',
    gender: 'Female',
    bloodGroup: 'B+',
    phone: '+880 1712-345678',
    email: 'nusrat.jahan@example.com',
    nid: '1987654321098',
    profilePhotoUrl: '',
    address: 'Road 7, Dhanmondi, Dhaka 1209, Bangladesh',
    preferredLanguage: 'English (Bangla ready)',
    guardian: {
      name: 'Mahmud Hasan',
      relationship: 'Spouse',
      phone: '+880 1811-223344',
      email: 'mahmud.hasan@example.com',
    },
    emergencyContacts: [
      {
        name: 'Mahmud Hasan',
        relationship: 'Spouse',
        phone: '+880 1811-223344',
        note: 'Primary contact and payment approver',
      },
      {
        name: 'Rokeya Begum',
        relationship: 'Mother',
        phone: '+880 1911-667788',
        note: 'Available during daytime',
      },
    ],
    linkedAccounts: [
      {
        id: 'linked-1',
        name: 'Arisha Hasan',
        relationship: 'Daughter',
        mrn: 'HAX-51142',
        lastActivity: 'Vaccination follow-up due in 2 weeks',
        permissions: ['Appointments', 'Reports'],
      },
      {
        id: 'linked-2',
        name: 'Mahmud Hasan',
        relationship: 'Spouse',
        mrn: 'HAX-40193',
        lastActivity: 'Lab report reviewed yesterday',
        permissions: ['Appointments', 'Prescriptions', 'Billing'],
      },
      {
        id: 'linked-3',
        name: 'Rokeya Begum',
        relationship: 'Mother',
        mrn: 'HAX-30876',
        lastActivity: 'Next cardiology review on 30 Apr',
        permissions: ['Appointments', 'Billing'],
      },
    ],
  } satisfies PatientDashboardProfile,
  quickActions: [
    { label: 'Book Appointment', href: '/patient/appointments', helper: 'Schedule in under 2 minutes' },
    { label: 'View Reports', href: '/patient/lab-reports', helper: 'See latest labs and downloads' },
    { label: 'Pay Bill', href: '/patient/bills', helper: 'Use bKash, Nagad, card, or cash' },
    { label: 'View Prescriptions', href: '/patient/prescriptions', helper: 'Check dosage and instructions' },
  ] satisfies QuickActionItem[],
  appointments: [
    {
      id: 'apt-1',
      doctor: 'Dr. Samia Rahman',
      specialty: 'Cardiology',
      date: '2026-04-26',
      time: '10:30 AM',
      location: 'Heart Care OPD, Floor 3',
      status: 'confirmed',
      type: 'in_person',
      reason: 'Blood pressure review and medicine adjustment',
      queueNote: 'Arrive 20 minutes early for ECG desk check-in',
    },
    {
      id: 'apt-2',
      doctor: 'Dr. Imtiaz Karim',
      specialty: 'Internal Medicine',
      date: '2026-04-29',
      time: '08:00 PM',
      location: 'Teleconsultation',
      status: 'reminder_due',
      type: 'teleconsultation',
      reason: 'Post-lab follow-up consultation',
      queueNote: 'Video room opens 15 minutes before start time',
      teleLinkStatus: 'available',
    },
    {
      id: 'apt-3',
      doctor: 'Dr. Labiba Sultana',
      specialty: 'Endocrinology',
      date: '2026-04-12',
      time: '09:00 AM',
      location: 'Tower B, Room 512',
      status: 'completed',
      type: 'in_person',
      reason: 'Quarterly diabetes management review',
      queueNote: 'Completed with medicine refill advice',
    },
    {
      id: 'apt-4',
      doctor: 'Dr. Tareq Hossain',
      specialty: 'Dermatology',
      date: '2026-03-18',
      time: '05:30 PM',
      location: 'Virtual OPD',
      status: 'cancelled',
      type: 'teleconsultation',
      reason: 'Skin allergy follow-up',
      queueNote: 'Cancelled by patient and rescheduled to next month',
      teleLinkStatus: 'pending',
    },
  ] satisfies AppointmentItem[],
  doctorAvailability: [
    {
      id: 'doc-1',
      doctor: 'Dr. Samia Rahman',
      specialty: 'Cardiology',
      hospital: 'Main Hospital, Dhaka',
      nextAvailable: 'Sat, 26 Apr',
      slots: [
        { label: '09:30 AM', status: 'limited' },
        { label: '10:30 AM', status: 'available' },
        { label: '11:30 AM', status: 'full' },
      ],
    },
    {
      id: 'doc-2',
      doctor: 'Dr. Imtiaz Karim',
      specialty: 'Internal Medicine',
      hospital: 'Teleconsultation Hub',
      nextAvailable: 'Tue, 29 Apr',
      slots: [
        { label: '07:30 PM', status: 'available' },
        { label: '08:00 PM', status: 'available' },
        { label: '08:30 PM', status: 'limited' },
      ],
    },
    {
      id: 'doc-3',
      doctor: 'Dr. Labiba Sultana',
      specialty: 'Endocrinology',
      hospital: 'Day Care Center',
      nextAvailable: 'Thu, 01 May',
      slots: [
        { label: '09:00 AM', status: 'full' },
        { label: '10:00 AM', status: 'limited' },
        { label: '11:00 AM', status: 'available' },
      ],
    },
  ] satisfies DoctorAvailability[],
  prescriptions: [
    {
      id: 'rx-1',
      doctor: 'Dr. Labiba Sultana',
      issuedOn: '2026-04-12',
      status: 'active',
      diagnosis: 'Type 2 diabetes with borderline hypertension',
      notes: 'Take medicines after breakfast unless instructed otherwise.',
      medicines: [
        {
          name: 'Metformin XR 500 mg',
          dosage: '1 tablet',
          frequency: 'Twice daily',
          duration: '30 days',
          instructions: 'After breakfast and dinner',
        },
        {
          name: 'Telmisartan 20 mg',
          dosage: '1 tablet',
          frequency: 'Once daily',
          duration: '30 days',
          instructions: 'Take in the morning and monitor BP weekly',
        },
      ],
    },
    {
      id: 'rx-2',
      doctor: 'Dr. Samia Rahman',
      issuedOn: '2026-03-03',
      status: 'refill_due',
      diagnosis: 'Palpitations and stress-induced tachycardia',
      notes: 'Keep hydration intake above 2 liters per day.',
      medicines: [
        {
          name: 'Propranolol 10 mg',
          dosage: '1 tablet',
          frequency: 'As needed',
          duration: '14 days',
          instructions: 'Use only if pulse remains above target after rest',
        },
      ],
    },
    {
      id: 'rx-3',
      doctor: 'Dr. Tareq Hossain',
      issuedOn: '2026-01-21',
      status: 'completed',
      diagnosis: 'Seasonal allergic dermatitis',
      notes: 'Completed without further flare-up reported.',
      medicines: [
        {
          name: 'Cetirizine 10 mg',
          dosage: '1 tablet',
          frequency: 'Once daily',
          duration: '10 days',
          instructions: 'Take at night if drowsy',
        },
      ],
    },
  ] satisfies PrescriptionItem[],
  labReports: [
    {
      id: 'lab-1',
      title: 'Complete Blood Count',
      collectedOn: '2026-04-20',
      status: 'reviewed',
      orderingDoctor: 'Dr. Imtiaz Karim',
      summary: 'Hemoglobin improved, WBC normal, platelets stable.',
      parameters: [
        { name: 'Hemoglobin', value: '11.7', unit: 'g/dL', range: '12.0 - 15.5', flag: 'borderline' },
        { name: 'WBC', value: '7.4', unit: '10^9/L', range: '4.0 - 11.0', flag: 'normal' },
        { name: 'Platelets', value: '252', unit: '10^9/L', range: '150 - 450', flag: 'normal' },
      ],
    },
    {
      id: 'lab-2',
      title: 'Fasting Blood Sugar and HbA1c',
      collectedOn: '2026-04-18',
      status: 'critical',
      orderingDoctor: 'Dr. Labiba Sultana',
      summary: 'HbA1c needs clinical review within 48 hours.',
      parameters: [
        { name: 'Fasting Blood Sugar', value: '8.7', unit: 'mmol/L', range: '3.9 - 5.5', flag: 'critical' },
        { name: 'HbA1c', value: '7.9', unit: '%', range: '4.0 - 5.6', flag: 'critical' },
      ],
    },
    {
      id: 'lab-3',
      title: 'Lipid Profile',
      collectedOn: '2026-03-10',
      status: 'ready',
      orderingDoctor: 'Dr. Samia Rahman',
      summary: 'LDL slightly above target, lifestyle advice shared.',
      parameters: [
        { name: 'LDL Cholesterol', value: '134', unit: 'mg/dL', range: 'Below 130', flag: 'borderline' },
        { name: 'HDL Cholesterol', value: '52', unit: 'mg/dL', range: 'Above 40', flag: 'normal' },
        { name: 'Triglycerides', value: '146', unit: 'mg/dL', range: 'Below 150', flag: 'normal' },
      ],
    },
  ] satisfies LabReportItem[],
  bills: [
    {
      id: 'bill-1',
      invoiceNumber: 'INV-2026-0408',
      issuedOn: '2026-04-18',
      dueOn: '2026-04-28',
      status: 'partial',
      lineItems: [
        { name: 'Consultation fee', amount: 1200 },
        { name: 'Lab package', amount: 3400 },
        { name: 'ECG', amount: 800 },
      ],
      paidAmount: 3000,
      paymentMethod: 'bKash',
    },
    {
      id: 'bill-2',
      invoiceNumber: 'INV-2026-0217',
      issuedOn: '2026-02-17',
      dueOn: '2026-02-17',
      status: 'paid',
      lineItems: [
        { name: 'Teleconsultation', amount: 900 },
        { name: 'E-prescription service', amount: 150 },
      ],
      paidAmount: 1050,
      paymentMethod: 'Card',
    },
    {
      id: 'bill-3',
      invoiceNumber: 'INV-2026-0105',
      issuedOn: '2026-01-05',
      dueOn: '2026-01-15',
      status: 'unpaid',
      lineItems: [
        { name: 'Dietitian consultation', amount: 700 },
        { name: 'Follow-up nursing call', amount: 300 },
      ],
      paidAmount: 0,
    },
  ] satisfies BillItem[],
  paymentHistory: [
    {
      id: 'pay-1',
      date: '2026-04-19',
      amount: 3000,
      method: 'bKash',
      status: 'success',
      reference: 'BK-948321',
    },
    {
      id: 'pay-2',
      date: '2026-02-17',
      amount: 1050,
      method: 'Card',
      status: 'success',
      reference: 'CRD-223809',
    },
    {
      id: 'pay-3',
      date: '2026-01-10',
      amount: 500,
      method: 'Nagad',
      status: 'processing',
      reference: 'NG-112904',
    },
  ] satisfies PaymentHistoryItem[],
  timeline: [
    {
      id: 'time-1',
      date: '2026-04-20T09:30:00',
      type: 'lab_result',
      title: 'Critical diabetes markers reviewed',
      location: 'Digital Lab Portal',
      clinician: 'Dr. Labiba Sultana',
      detail: 'HbA1c and fasting sugar were marked high and follow-up was scheduled.',
    },
    {
      id: 'time-2',
      date: '2026-04-18T08:15:00',
      type: 'report',
      title: 'Blood test report published',
      location: 'Central Diagnostic Unit',
      clinician: 'Lab Team',
      detail: 'Complete blood count and metabolic panel report became available for download.',
    },
    {
      id: 'time-3',
      date: '2026-04-12T09:00:00',
      type: 'prescription',
      title: 'Prescription updated after endocrine review',
      location: 'Tower B, Room 512',
      clinician: 'Dr. Labiba Sultana',
      detail: 'Metformin and Telmisartan were started with 30-day instructions.',
    },
    {
      id: 'time-4',
      date: '2026-04-12T08:40:00',
      type: 'diagnosis',
      title: 'Borderline hypertension documented',
      location: 'Endocrinology OPD',
      clinician: 'Dr. Labiba Sultana',
      detail: 'Counseling provided on diet, home BP log, and repeat review timeline.',
    },
    {
      id: 'time-5',
      date: '2026-04-12T08:15:00',
      type: 'visit',
      title: 'Quarterly diabetes follow-up visit',
      location: 'Endocrinology OPD',
      clinician: 'Dr. Labiba Sultana',
      detail: 'Vitals taken, medication adherence discussed, and labs ordered.',
    },
    {
      id: 'time-6',
      date: '2025-11-03T03:30:00',
      type: 'discharge_summary',
      title: 'Day-care chest pain observation discharge',
      location: 'Cardiac Observation Unit',
      clinician: 'Dr. Samia Rahman',
      detail: 'Discharged stable after monitoring and normal ECG trend.',
    },
  ] satisfies TimelineItem[],
  notifications: [
    {
      id: 'notif-1',
      title: 'Teleconsultation tomorrow at 8:00 PM',
      message: 'Your follow-up with Dr. Imtiaz Karim is confirmed. Join link is ready.',
      at: '2026-04-24T09:10:00',
      priority: 'high',
      kind: 'appointment',
      unread: true,
    },
    {
      id: 'notif-2',
      title: 'Critical lab alert requires review',
      message: 'HbA1c result is above target. Please keep your follow-up appointment.',
      at: '2026-04-23T18:25:00',
      priority: 'critical',
      kind: 'lab',
      unread: true,
    },
    {
      id: 'notif-3',
      title: 'Medicine refill due in 3 days',
      message: 'Metformin refill can be requested online before Monday.',
      at: '2026-04-23T10:00:00',
      priority: 'medium',
      kind: 'medication',
      unread: false,
    },
    {
      id: 'notif-4',
      title: 'Partial payment received',
      message: 'Invoice INV-2026-0408 has an outstanding balance remaining.',
      at: '2026-04-19T12:40:00',
      priority: 'medium',
      kind: 'billing',
      unread: false,
    },
    {
      id: 'notif-5',
      title: 'Emergency contacts verified',
      message: 'Family visibility is active for SOS requests.',
      at: '2026-04-17T16:30:00',
      priority: 'low',
      kind: 'emergency',
      unread: false,
    },
  ] satisfies NotificationItem[],
  careJourney: [
    { label: 'Registration', status: 'done', subtitle: 'Profile and NID verified' },
    { label: 'OPD', status: 'done', subtitle: 'Active follow-up under medicine and endocrine care' },
    { label: 'IPD admitted', status: 'upcoming', subtitle: 'No active admission' },
    { label: 'Discharged', status: 'current', subtitle: 'Last day-care discharge on 03 Nov 2025' },
  ] satisfies CareStage[],
  vitalsTrend: [
    { label: 'Jan', systolic: 142, diastolic: 94, pulse: 88 },
    { label: 'Feb', systolic: 138, diastolic: 90, pulse: 84 },
    { label: 'Mar', systolic: 134, diastolic: 88, pulse: 82 },
    { label: 'Apr', systolic: 130, diastolic: 84, pulse: 79 },
  ] satisfies VitalTrendPoint[],
  balanceTrend: [
    { label: 'Jan', billed: 1000, paid: 500 },
    { label: 'Feb', billed: 1050, paid: 1050 },
    { label: 'Mar', billed: 0, paid: 0 },
    { label: 'Apr', billed: 5400, paid: 3000 },
  ] satisfies BalanceTrendPoint[],
  emergency: {
    requestId: 'SOS-2026-24017',
    state: 'en_route',
    etaMinutes: 9,
    ambulance: 'Ambulance 12',
    driver: 'Shafiqul Islam',
    location: 'Dhanmondi 7 to Main Emergency Gate',
    familyVisible: true,
    hospitalDesk: 'Emergency Desk notified',
    lastUpdated: '2026-04-24T14:20:00',
  } satisfies EmergencyStatus,
};

export const patientDashboardSummary = {
  outstandingBalance: patientDashboardData.bills.reduce((sum, bill) => {
    const total = bill.lineItems.reduce((lineTotal, item) => lineTotal + item.amount, 0);
    return sum + Math.max(total - bill.paidAmount, 0);
  }, 0),
  upcomingAppointments: patientDashboardData.appointments.filter(
    (appointment) => new Date(appointment.date) >= new Date('2026-04-24'),
  ),
  recentPrescriptions: patientDashboardData.prescriptions.slice(0, 2),
  recentReports: patientDashboardData.labReports.slice(0, 2),
  unreadNotifications: patientDashboardData.notifications.filter((notification) => notification.unread),
};
