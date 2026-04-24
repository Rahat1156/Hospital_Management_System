export type DoctorAlertPriority = 'critical' | 'high' | 'medium' | 'low';
export type DoctorAlertStatus = 'new' | 'acknowledged' | 'resolved';

export interface DoctorProfile {
  name: string;
  specialty: string;
  bmdc: string;
  hospital: string;
  shift: string;
  nextBreak: string;
}

export interface DoctorQuickStat {
  label: string;
  value: string | number;
  helper: string;
}

export interface DoctorAppointment {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  age: number;
  gender: string;
  time: string;
  date: string;
  visitType: 'OPD' | 'Follow-up' | 'Teleconsultation' | 'IPD Review';
  status: 'checked_in' | 'waiting' | 'in_consultation' | 'completed' | 'upcoming';
  concern: string;
  room: string;
  teleStatus?: 'ready' | 'pending' | 'live';
}

export interface PatientVitalsPoint {
  label: string;
  systolic: number;
  diastolic: number;
  pulse: number;
}

export interface PatientTimelineItem {
  id: string;
  date: string;
  type: 'visit' | 'diagnosis' | 'prescription' | 'lab_report' | 'discharge_summary';
  title: string;
  detail: string;
  clinician: string;
  location: string;
}

export interface PatientSummary {
  id: string;
  name: string;
  mrn: string;
  age: number;
  gender: string;
  bloodGroup: string;
  allergies: string[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  currentCareStage: 'Registration' | 'OPD' | 'IPD admitted' | 'Discharged';
  diagnosisSummary: string;
  treatmentSummary: string;
  dischargePreview: string;
  recentVitals: Array<{
    label: string;
    value: string;
  }>;
  labPreview: Array<{
    test: string;
    result: string;
    flag: 'normal' | 'borderline' | 'critical';
  }>;
  notesPlaceholder: string;
  vitalsTrend: PatientVitalsPoint[];
  timeline: PatientTimelineItem[];
}

export interface ScheduleSlot {
  day: string;
  date: string;
  start: string;
  end: string;
  mode: 'In-person' | 'Tele';
  specialty: string;
  status: 'available' | 'booked' | 'break' | 'blocked';
}

export interface PrescriptionDrug {
  id: string;
  genericName: string;
  brandName: string;
  dosage: string;
  contraindications: string[];
}

export interface PrescriptionMedicine {
  drugName: string;
  genericName: string;
  brandName: string;
  dosage: string;
  frequency: string;
  duration: string;
  contraindications: string;
  specialInstructions: string;
}

export interface PrescriptionRecord {
  id: string;
  patientName: string;
  mrn: string;
  diagnosis: string;
  createdAt: string;
  status: 'draft' | 'signed' | 'sent';
  pdfReady: boolean;
  medicines: PrescriptionMedicine[];
}

export interface DrugInteractionWarning {
  severity: 'blocking' | 'warning';
  title: string;
  detail: string;
  requiresAcknowledgement: boolean;
}

export interface LabResult {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  testName: string;
  date: string;
  value: string;
  referenceRange: string;
  flag: 'normal' | 'borderline' | 'critical';
  detail: string;
}

export interface FollowUpItem {
  id: string;
  patientName: string;
  mrn: string;
  dueAt: string;
  reason: string;
  priority: DoctorAlertPriority;
  status: DoctorAlertStatus;
}

export interface DoctorAlert {
  id: string;
  title: string;
  detail: string;
  category: 'Critical lab' | 'Follow-up' | 'Teleconsultation' | 'Schedule' | 'System';
  at: string;
  priority: DoctorAlertPriority;
  status: DoctorAlertStatus;
  unread: boolean;
}

export interface PerformancePoint {
  label: string;
  patientsSeen: number;
  revenue: number;
  avgDuration: number;
}

export const doctorDashboardData = {
  doctor: {
    name: 'Dr. Mahmudul Karim',
    specialty: 'Internal Medicine',
    bmdc: 'BMDC-A-45872',
    hospital: 'Shahbagh Medical Centre',
    shift: '09:00 AM - 05:00 PM',
    nextBreak: '01:15 PM',
  } satisfies DoctorProfile,
  quickStats: [
    { label: 'Patients seen today', value: 14, helper: '2 more than yesterday' },
    { label: 'Appointments scheduled', value: 22, helper: 'Includes 4 teleconsultations' },
    { label: 'Pending reports', value: 5, helper: 'Lab and imaging reviews pending' },
    { label: 'Prescriptions issued', value: 11, helper: '6 signed, 5 sent' },
  ] satisfies DoctorQuickStat[],
  appointments: [
    {
      id: 'apt-d-1',
      patientId: 'pt-1',
      patientName: 'Nusrat Jahan',
      mrn: 'HAX-42851',
      age: 34,
      gender: 'Female',
      time: '09:30 AM',
      date: '2026-04-24',
      visitType: 'Follow-up',
      status: 'checked_in',
      concern: 'Diabetes review and BP management',
      room: 'Room 302',
    },
    {
      id: 'apt-d-2',
      patientId: 'pt-2',
      patientName: 'Hasib Rahman',
      mrn: 'HAX-51244',
      age: 47,
      gender: 'Male',
      time: '10:00 AM',
      date: '2026-04-24',
      visitType: 'Teleconsultation',
      status: 'waiting',
      concern: 'Post-discharge weakness and medication review',
      room: 'Tele Room 2',
      teleStatus: 'ready',
    },
    {
      id: 'apt-d-3',
      patientId: 'pt-3',
      patientName: 'Farzana Akter',
      mrn: 'HAX-60717',
      age: 29,
      gender: 'Female',
      time: '10:30 AM',
      date: '2026-04-24',
      visitType: 'OPD',
      status: 'in_consultation',
      concern: 'Acute gastritis symptoms',
      room: 'Room 302',
    },
    {
      id: 'apt-d-4',
      patientId: 'pt-4',
      patientName: 'Abdul Halim',
      mrn: 'HAX-38820',
      age: 62,
      gender: 'Male',
      time: '11:15 AM',
      date: '2026-04-24',
      visitType: 'IPD Review',
      status: 'upcoming',
      concern: 'Renal function follow-up',
      room: 'Ward B-12',
    },
    {
      id: 'apt-d-5',
      patientId: 'pt-1',
      patientName: 'Nusrat Jahan',
      mrn: 'HAX-42851',
      age: 34,
      gender: 'Female',
      time: '08:45 AM',
      date: '2026-04-23',
      visitType: 'Teleconsultation',
      status: 'completed',
      concern: 'Lab result discussion',
      room: 'Tele Room 2',
      teleStatus: 'live',
    },
  ] satisfies DoctorAppointment[],
  patients: [
    {
      id: 'pt-1',
      name: 'Nusrat Jahan',
      mrn: 'HAX-42851',
      age: 34,
      gender: 'Female',
      bloodGroup: 'B+',
      allergies: ['Penicillin', 'Shellfish'],
      emergencyContact: {
        name: 'Mahmud Hasan',
        relationship: 'Spouse',
        phone: '+880 1811-223344',
      },
      currentCareStage: 'OPD',
      diagnosisSummary: 'Type 2 diabetes with borderline hypertension',
      treatmentSummary: 'Metformin XR, Telmisartan, dietary changes, home BP monitoring',
      dischargePreview: 'No active admission. Last day-care discharge noted in Nov 2025 after stable chest pain observation.',
      recentVitals: [
        { label: 'BP', value: '130/84 mmHg' },
        { label: 'Pulse', value: '79 bpm' },
        { label: 'SpO2', value: '98%' },
        { label: 'Weight', value: '66 kg' },
      ],
      labPreview: [
        { test: 'HbA1c', result: '7.9%', flag: 'critical' },
        { test: 'Fasting glucose', result: '8.7 mmol/L', flag: 'critical' },
        { test: 'Hemoglobin', result: '11.7 g/dL', flag: 'borderline' },
      ],
      notesPlaceholder: 'Clinical notes placeholder for assessment, plan, counseling, and follow-up instructions.',
      vitalsTrend: [
        { label: 'Jan', systolic: 142, diastolic: 94, pulse: 88 },
        { label: 'Feb', systolic: 138, diastolic: 90, pulse: 84 },
        { label: 'Mar', systolic: 134, diastolic: 88, pulse: 82 },
        { label: 'Apr', systolic: 130, diastolic: 84, pulse: 79 },
      ],
      timeline: [
        {
          id: 'tl-1',
          date: '2026-04-20T09:30:00',
          type: 'lab_report',
          title: 'Critical diabetes markers reviewed',
          detail: 'HbA1c and fasting glucose remain above target; medication adjustment advised.',
          clinician: 'Dr. Mahmudul Karim',
          location: 'Digital Lab Portal',
        },
        {
          id: 'tl-2',
          date: '2026-04-12T08:40:00',
          type: 'diagnosis',
          title: 'Borderline hypertension documented',
          detail: 'Lifestyle counseling reinforced with home BP charting plan.',
          clinician: 'Dr. Mahmudul Karim',
          location: 'Medicine OPD',
        },
        {
          id: 'tl-3',
          date: '2026-04-12T08:15:00',
          type: 'visit',
          title: 'Quarterly diabetes follow-up visit',
          detail: 'Patient discussed medicine adherence and fatigue symptoms.',
          clinician: 'Dr. Mahmudul Karim',
          location: 'Medicine OPD',
        },
        {
          id: 'tl-4',
          date: '2026-04-12T08:10:00',
          type: 'prescription',
          title: 'Metformin and Telmisartan prescribed',
          detail: '30-day prescription signed and sent to patient portal.',
          clinician: 'Dr. Mahmudul Karim',
          location: 'E-prescription',
        },
        {
          id: 'tl-5',
          date: '2025-11-03T03:30:00',
          type: 'discharge_summary',
          title: 'Chest pain observation discharge',
          detail: 'Discharged stable after cardiac observation and normal serial ECGs.',
          clinician: 'Cardiac Unit',
          location: 'Observation Ward',
        },
      ],
    },
    {
      id: 'pt-2',
      name: 'Hasib Rahman',
      mrn: 'HAX-51244',
      age: 47,
      gender: 'Male',
      bloodGroup: 'O+',
      allergies: ['NSAIDs'],
      emergencyContact: {
        name: 'Rumana Rahman',
        relationship: 'Wife',
        phone: '+880 1711-445566',
      },
      currentCareStage: 'Discharged',
      diagnosisSummary: 'Post-viral fatigue with mild anemia',
      treatmentSummary: 'Oral iron supplement, hydration plan, repeat CBC in 2 weeks',
      dischargePreview: 'Recently discharged from day care after dizziness evaluation. No active admission.',
      recentVitals: [
        { label: 'BP', value: '118/74 mmHg' },
        { label: 'Pulse', value: '86 bpm' },
        { label: 'Temp', value: '98.3 F' },
        { label: 'Weight', value: '73 kg' },
      ],
      labPreview: [
        { test: 'Hemoglobin', result: '10.8 g/dL', flag: 'borderline' },
        { test: 'Ferritin', result: '18 ng/mL', flag: 'borderline' },
      ],
      notesPlaceholder: 'Clinical notes placeholder for teleconsultation follow-up.',
      vitalsTrend: [
        { label: 'Jan', systolic: 124, diastolic: 80, pulse: 92 },
        { label: 'Feb', systolic: 122, diastolic: 78, pulse: 90 },
        { label: 'Mar', systolic: 120, diastolic: 76, pulse: 88 },
        { label: 'Apr', systolic: 118, diastolic: 74, pulse: 86 },
      ],
      timeline: [],
    },
  ] satisfies PatientSummary[],
  schedule: [
    { day: 'Mon', date: '27 Apr', start: '09:00', end: '11:30', mode: 'In-person', specialty: 'Internal Medicine', status: 'booked' },
    { day: 'Mon', date: '27 Apr', start: '11:30', end: '12:00', mode: 'In-person', specialty: 'Break', status: 'break' },
    { day: 'Mon', date: '27 Apr', start: '12:00', end: '02:00', mode: 'Tele', specialty: 'Follow-up Clinic', status: 'available' },
    { day: 'Tue', date: '28 Apr', start: '09:00', end: '01:00', mode: 'In-person', specialty: 'Internal Medicine', status: 'booked' },
    { day: 'Tue', date: '28 Apr', start: '02:00', end: '04:00', mode: 'Tele', specialty: 'Chronic Care', status: 'available' },
    { day: 'Wed', date: '29 Apr', start: '09:00', end: '10:00', mode: 'In-person', specialty: 'Ward Round', status: 'blocked' },
    { day: 'Wed', date: '29 Apr', start: '10:30', end: '01:00', mode: 'In-person', specialty: 'General OPD', status: 'booked' },
    { day: 'Thu', date: '30 Apr', start: '09:00', end: '12:00', mode: 'Tele', specialty: 'Follow-up Clinic', status: 'available' },
    { day: 'Thu', date: '30 Apr', start: '01:00', end: '03:00', mode: 'In-person', specialty: 'Internal Medicine', status: 'available' },
    { day: 'Fri', date: '01 May', start: '09:00', end: '12:00', mode: 'In-person', specialty: 'Weekend Clinic', status: 'available' },
  ] satisfies ScheduleSlot[],
  drugDatabase: [
    {
      id: 'drug-1',
      genericName: 'Metformin',
      brandName: 'Comet XR',
      dosage: '500 mg XR',
      contraindications: ['Severe renal impairment', 'Metabolic acidosis'],
    },
    {
      id: 'drug-2',
      genericName: 'Telmisartan',
      brandName: 'Micardis',
      dosage: '20 mg',
      contraindications: ['Pregnancy', 'Hyperkalemia'],
    },
    {
      id: 'drug-3',
      genericName: 'Ibuprofen',
      brandName: 'Brufen',
      dosage: '400 mg',
      contraindications: ['NSAID allergy', 'Peptic ulcer disease'],
    },
    {
      id: 'drug-4',
      genericName: 'Ciprofloxacin',
      brandName: 'Ciprocin',
      dosage: '500 mg',
      contraindications: ['Tendon disorder history', 'QT prolongation risk'],
    },
  ] satisfies PrescriptionDrug[],
  interactionWarnings: [
    {
      severity: 'blocking',
      title: 'Potential high-risk interaction',
      detail: 'Ibuprofen may worsen renal function risk when paired with Telmisartan in vulnerable patients.',
      requiresAcknowledgement: true,
    },
    {
      severity: 'warning',
      title: 'Allergy check recommended',
      detail: 'Patient has documented NSAID sensitivity in prior chart notes. Please confirm before signing.',
      requiresAcknowledgement: true,
    },
  ] satisfies DrugInteractionWarning[],
  prescriptionDraft: {
    id: 'rx-draft-1',
    patientName: 'Nusrat Jahan',
    mrn: 'HAX-42851',
    diagnosis: 'Type 2 diabetes with borderline hypertension',
    createdAt: '2026-04-24T09:35:00',
    status: 'draft',
    pdfReady: false,
    medicines: [
      {
        drugName: 'Metformin XR 500 mg',
        genericName: 'Metformin',
        brandName: 'Comet XR',
        dosage: '1 tablet',
        frequency: 'Twice daily',
        duration: '30 days',
        contraindications: 'Avoid if eGFR severely reduced',
        specialInstructions: 'Take after breakfast and dinner',
      },
      {
        drugName: 'Telmisartan 20 mg',
        genericName: 'Telmisartan',
        brandName: 'Micardis',
        dosage: '1 tablet',
        frequency: 'Once daily',
        duration: '30 days',
        contraindications: 'Monitor potassium in renal disease',
        specialInstructions: 'Morning dose, continue BP log',
      },
    ],
  } satisfies PrescriptionRecord,
  prescriptionHistory: [
    {
      id: 'rx-1',
      patientName: 'Nusrat Jahan',
      mrn: 'HAX-42851',
      diagnosis: 'Type 2 diabetes with borderline hypertension',
      createdAt: '2026-04-12T08:10:00',
      status: 'signed',
      pdfReady: true,
      medicines: [],
    },
    {
      id: 'rx-2',
      patientName: 'Hasib Rahman',
      mrn: 'HAX-51244',
      diagnosis: 'Post-viral fatigue with mild anemia',
      createdAt: '2026-04-22T06:00:00',
      status: 'sent',
      pdfReady: true,
      medicines: [],
    },
  ] satisfies PrescriptionRecord[],
  labResults: [
    {
      id: 'lab-d-1',
      patientId: 'pt-1',
      patientName: 'Nusrat Jahan',
      mrn: 'HAX-42851',
      testName: 'HbA1c',
      date: '2026-04-20',
      value: '7.9%',
      referenceRange: '4.0 - 5.6%',
      flag: 'critical',
      detail: 'Diabetes control outside target range',
    },
    {
      id: 'lab-d-2',
      patientId: 'pt-1',
      patientName: 'Nusrat Jahan',
      mrn: 'HAX-42851',
      testName: 'Hemoglobin',
      date: '2026-04-20',
      value: '11.7 g/dL',
      referenceRange: '12.0 - 15.5 g/dL',
      flag: 'borderline',
      detail: 'Mild anemia trend persists',
    },
    {
      id: 'lab-d-3',
      patientId: 'pt-2',
      patientName: 'Hasib Rahman',
      mrn: 'HAX-51244',
      testName: 'Ferritin',
      date: '2026-04-22',
      value: '18 ng/mL',
      referenceRange: '24 - 336 ng/mL',
      flag: 'borderline',
      detail: 'Iron stores remain low',
    },
    {
      id: 'lab-d-4',
      patientId: 'pt-4',
      patientName: 'Abdul Halim',
      mrn: 'HAX-38820',
      testName: 'Creatinine',
      date: '2026-04-24',
      value: '2.4 mg/dL',
      referenceRange: '0.7 - 1.3 mg/dL',
      flag: 'critical',
      detail: 'Urgent renal review advised',
    },
  ] satisfies LabResult[],
  followUps: [
    {
      id: 'fup-1',
      patientName: 'Nusrat Jahan',
      mrn: 'HAX-42851',
      dueAt: '2026-04-25T10:00:00',
      reason: 'Review repeat glucose log after medication change',
      priority: 'high',
      status: 'new',
    },
    {
      id: 'fup-2',
      patientName: 'Abdul Halim',
      mrn: 'HAX-38820',
      dueAt: '2026-04-24T12:00:00',
      reason: 'Critical creatinine alert, inpatient review required',
      priority: 'critical',
      status: 'acknowledged',
    },
    {
      id: 'fup-3',
      patientName: 'Hasib Rahman',
      mrn: 'HAX-51244',
      dueAt: '2026-04-26T06:30:00',
      reason: 'Repeat CBC and fatigue symptom update',
      priority: 'medium',
      status: 'new',
    },
  ] satisfies FollowUpItem[],
  alerts: [
    {
      id: 'alert-1',
      title: 'Critical creatinine for Abdul Halim',
      detail: 'Renal function has worsened. Ward review requested by nursing team.',
      category: 'Critical lab',
      at: '2026-04-24T11:05:00',
      priority: 'critical',
      status: 'new',
      unread: true,
    },
    {
      id: 'alert-2',
      title: 'Teleconsultation room ready',
      detail: 'Hasib Rahman joined waiting room 8 minutes early.',
      category: 'Teleconsultation',
      at: '2026-04-24T09:52:00',
      priority: 'high',
      status: 'new',
      unread: true,
    },
    {
      id: 'alert-3',
      title: 'Follow-up due tomorrow',
      detail: 'Nusrat Jahan needs review after medicine adjustment.',
      category: 'Follow-up',
      at: '2026-04-24T08:15:00',
      priority: 'medium',
      status: 'acknowledged',
      unread: false,
    },
    {
      id: 'alert-4',
      title: 'Schedule updated for Thursday teleclinic',
      detail: 'Two follow-up slots were opened after admin change.',
      category: 'Schedule',
      at: '2026-04-23T04:30:00',
      priority: 'low',
      status: 'resolved',
      unread: false,
    },
    {
      id: 'alert-5',
      title: 'System notice: e-signature synced',
      detail: 'Doctor signature certificate refreshed successfully.',
      category: 'System',
      at: '2026-04-22T03:40:00',
      priority: 'low',
      status: 'resolved',
      unread: false,
    },
  ] satisfies DoctorAlert[],
  performanceRangeOptions: ['This week', 'This month', 'Last 3 months'],
  performanceSummary: {
    patientsSeen: 186,
    revenue: 412000,
    avgDuration: 17,
    followUpRate: '68%',
  },
  performanceChart: [
    { label: 'Week 1', patientsSeen: 42, revenue: 98000, avgDuration: 18 },
    { label: 'Week 2', patientsSeen: 45, revenue: 101000, avgDuration: 16 },
    { label: 'Week 3', patientsSeen: 47, revenue: 106000, avgDuration: 17 },
    { label: 'Week 4', patientsSeen: 52, revenue: 107000, avgDuration: 16 },
  ] satisfies PerformancePoint[],
};

export const doctorDashboardSummary = {
  todaysAppointments: doctorDashboardData.appointments.filter((item) => item.date === '2026-04-24'),
  upcomingConsultations: doctorDashboardData.appointments.filter((item) => item.status === 'upcoming' || item.status === 'waiting'),
  criticalAlerts: doctorDashboardData.alerts.filter((item) => item.priority === 'critical' || item.priority === 'high').slice(0, 3),
  recentLabs: doctorDashboardData.labResults.slice(0, 3),
};
