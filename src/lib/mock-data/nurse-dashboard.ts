export type NurseAlertPriority = 'critical' | 'high' | 'medium' | 'low';
export type NurseAlertStatus = 'new' | 'acknowledged' | 'resolved';
export type NurseCareStage = 'Registration' | 'OPD' | 'IPD Admitted' | 'Discharged';

export interface NurseProfile {
  name: string;
  role: string;
  ward: string;
  shift: string;
  status: 'On duty' | 'On break' | 'Handover soon';
}

export interface AssignedPatient {
  id: string;
  name: string;
  mrn: string;
  age: number;
  gender: string;
  bed: string;
  ward: string;
  currentStatus: 'Stable' | 'Needs review' | 'Critical' | 'Discharged';
  careStage: NurseCareStage;
  alertState: 'none' | 'watch' | 'critical';
  lastVitalsAt: string;
  admissionDate: string;
  bloodGroup: string;
  allergies: string[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  expectedDischarge?: string;
}

export interface VitalReading {
  timestamp: string;
  recordedBy: string;
  temperatureC: number;
  systolic: number;
  diastolic: number;
  pulse: number;
  spo2: number;
  status: 'Stable' | 'Needs review' | 'Critical';
}

export interface PatientHistoryItem {
  id: string;
  date: string;
  type: 'visit' | 'diagnosis' | 'prescription' | 'lab_result' | 'report' | 'discharge_summary';
  title: string;
  detail: string;
  clinician: string;
}

export interface BedStatusItem {
  id: string;
  ward: string;
  bedLabel: string;
  state: 'Available' | 'Occupied' | 'Reserved' | 'Under Maintenance';
  patientName?: string;
  mrn?: string;
}

export interface WardOccupancy {
  ward: string;
  totalBeds: number;
  occupiedBeds: number;
  reservedBeds: number;
  maintenanceBeds: number;
}

export interface NurseAlert {
  id: string;
  title: string;
  detail: string;
  patientName?: string;
  mrn?: string;
  category: 'Critical lab' | 'Ward' | 'Patient' | 'Reminder' | 'System';
  priority: NurseAlertPriority;
  status: NurseAlertStatus;
  timestamp: string;
  unread: boolean;
}

export interface CareStageEvent {
  stage: NurseCareStage;
  timestamp: string;
  actor: string;
}

export const nurseDashboardData = {
  nurse: {
    name: 'Sharmeen Akter',
    role: 'Senior Staff Nurse',
    ward: 'Medical Ward B',
    shift: '07:00 AM - 03:00 PM',
    status: 'On duty',
  } satisfies NurseProfile,
  assignedPatients: [
    {
      id: 'npt-1',
      name: 'Nusrat Jahan',
      mrn: 'HAX-42851',
      age: 34,
      gender: 'Female',
      bed: 'B-12',
      ward: 'Medical Ward B',
      currentStatus: 'Needs review',
      careStage: 'IPD Admitted',
      alertState: 'watch',
      lastVitalsAt: '2026-04-24T09:20:00',
      admissionDate: '2026-04-22',
      bloodGroup: 'B+',
      allergies: ['Penicillin', 'Shellfish'],
      emergencyContact: {
        name: 'Mahmud Hasan',
        relationship: 'Spouse',
        phone: '+880 1811-223344',
      },
      expectedDischarge: '2026-04-27',
    },
    {
      id: 'npt-2',
      name: 'Abdul Halim',
      mrn: 'HAX-38820',
      age: 62,
      gender: 'Male',
      bed: 'B-14',
      ward: 'Medical Ward B',
      currentStatus: 'Critical',
      careStage: 'IPD Admitted',
      alertState: 'critical',
      lastVitalsAt: '2026-04-24T10:05:00',
      admissionDate: '2026-04-20',
      bloodGroup: 'O+',
      allergies: ['NSAIDs'],
      emergencyContact: {
        name: 'Abida Halim',
        relationship: 'Daughter',
        phone: '+880 1715-998877',
      },
    },
    {
      id: 'npt-3',
      name: 'Farzana Akter',
      mrn: 'HAX-60717',
      age: 29,
      gender: 'Female',
      bed: 'Observation-03',
      ward: 'OPD Observation',
      currentStatus: 'Stable',
      careStage: 'OPD',
      alertState: 'none',
      lastVitalsAt: '2026-04-24T08:50:00',
      admissionDate: '2026-04-24',
      bloodGroup: 'A+',
      allergies: ['None known'],
      emergencyContact: {
        name: 'Rashed Khan',
        relationship: 'Brother',
        phone: '+880 1912-334455',
      },
    },
    {
      id: 'npt-4',
      name: 'Hasib Rahman',
      mrn: 'HAX-51244',
      age: 47,
      gender: 'Male',
      bed: 'Discharge Lounge 2',
      ward: 'Stepdown Unit',
      currentStatus: 'Discharged',
      careStage: 'Discharged',
      alertState: 'none',
      lastVitalsAt: '2026-04-24T07:40:00',
      admissionDate: '2026-04-21',
      bloodGroup: 'O+',
      allergies: ['NSAIDs'],
      emergencyContact: {
        name: 'Rumana Rahman',
        relationship: 'Wife',
        phone: '+880 1711-445566',
      },
      expectedDischarge: '2026-04-24',
    },
  ] satisfies AssignedPatient[],
  vitalsByPatient: {
    'npt-1': [
      { timestamp: '2026-04-24T03:00:00', recordedBy: 'Sharmeen Akter', temperatureC: 37.6, systolic: 136, diastolic: 88, pulse: 84, spo2: 98, status: 'Needs review' },
      { timestamp: '2026-04-24T06:00:00', recordedBy: 'Sharmeen Akter', temperatureC: 37.5, systolic: 134, diastolic: 86, pulse: 82, spo2: 98, status: 'Needs review' },
      { timestamp: '2026-04-24T09:20:00', recordedBy: 'Sharmeen Akter', temperatureC: 37.4, systolic: 132, diastolic: 84, pulse: 80, spo2: 99, status: 'Stable' },
    ],
    'npt-2': [
      { timestamp: '2026-04-24T02:30:00', recordedBy: 'Amina Sultana', temperatureC: 38.2, systolic: 152, diastolic: 94, pulse: 110, spo2: 93, status: 'Critical' },
      { timestamp: '2026-04-24T06:30:00', recordedBy: 'Sharmeen Akter', temperatureC: 38.0, systolic: 148, diastolic: 92, pulse: 106, spo2: 94, status: 'Critical' },
      { timestamp: '2026-04-24T10:05:00', recordedBy: 'Sharmeen Akter', temperatureC: 37.9, systolic: 146, diastolic: 90, pulse: 102, spo2: 95, status: 'Needs review' },
    ],
  } as Record<string, VitalReading[]>,
  patientHistory: {
    'npt-1': [
      {
        id: 'hist-1',
        date: '2026-04-24T08:15:00',
        type: 'lab_result',
        title: 'Repeat blood glucose reviewed',
        detail: 'Morning value remained above target; nurse instructed to monitor intake and record next reading.',
        clinician: 'Dr. Mahmudul Karim',
      },
      {
        id: 'hist-2',
        date: '2026-04-23T05:40:00',
        type: 'prescription',
        title: 'Insulin sliding scale updated',
        detail: 'Ward medication sheet updated for evening review.',
        clinician: 'Dr. Mahmudul Karim',
      },
      {
        id: 'hist-3',
        date: '2026-04-22T11:20:00',
        type: 'diagnosis',
        title: 'Hyperglycemia with dehydration',
        detail: 'Observed for IV fluids and glucose monitoring.',
        clinician: 'Emergency Team',
      },
    ],
    'npt-2': [
      {
        id: 'hist-4',
        date: '2026-04-24T09:50:00',
        type: 'report',
        title: 'Renal panel flagged critical',
        detail: 'Creatinine increased. Nephrology review requested.',
        clinician: 'Lab Services',
      },
      {
        id: 'hist-5',
        date: '2026-04-22T03:30:00',
        type: 'visit',
        title: 'Bedside consultant review',
        detail: 'Ongoing monitoring advised with 4-hourly vitals.',
        clinician: 'Dr. Sameer Hossain',
      },
      {
        id: 'hist-6',
        date: '2026-04-20T12:00:00',
        type: 'diagnosis',
        title: 'AKI with fluid overload',
        detail: 'Admitted to medical ward for close observation.',
        clinician: 'Emergency Team',
      },
    ],
  } as Record<string, PatientHistoryItem[]>,
  careStageByPatient: {
    'npt-1': [
      { stage: 'Registration', timestamp: '2026-04-22T07:50:00', actor: 'Reception Desk' },
      { stage: 'OPD', timestamp: '2026-04-22T08:25:00', actor: 'Medicine OPD' },
      { stage: 'IPD Admitted', timestamp: '2026-04-22T10:05:00', actor: 'Ward Admission Nurse' },
    ],
    'npt-2': [
      { stage: 'Registration', timestamp: '2026-04-20T08:00:00', actor: 'Reception Desk' },
      { stage: 'OPD', timestamp: '2026-04-20T08:35:00', actor: 'Emergency Desk' },
      { stage: 'IPD Admitted', timestamp: '2026-04-20T10:10:00', actor: 'Ward Admission Nurse' },
    ],
    'npt-4': [
      { stage: 'Registration', timestamp: '2026-04-21T10:10:00', actor: 'Reception Desk' },
      { stage: 'OPD', timestamp: '2026-04-21T11:00:00', actor: 'Medicine OPD' },
      { stage: 'IPD Admitted', timestamp: '2026-04-21T02:00:00', actor: 'Stepdown Nurse' },
      { stage: 'Discharged', timestamp: '2026-04-24T09:10:00', actor: 'Discharge Nurse' },
    ],
  } as Record<string, CareStageEvent[]>,
  recentPrescriptions: [
    { patientId: 'npt-1', item: 'Metformin XR + insulin coverage update', by: 'Dr. Mahmudul Karim' },
    { patientId: 'npt-2', item: 'IV diuretic timing revised', by: 'Dr. Sameer Hossain' },
  ],
  recentLabs: [
    { patientId: 'npt-1', item: 'Fasting glucose 8.7 mmol/L', flag: 'borderline' },
    { patientId: 'npt-2', item: 'Creatinine 2.4 mg/dL', flag: 'critical' },
  ],
  dischargeSummaries: [
    { patientId: 'npt-4', preview: 'Discharged stable with CBC follow-up in 1 week and oral iron continuation.' },
  ],
  beds: [
    { id: 'bed-1', ward: 'Medical Ward B', bedLabel: 'B-11', state: 'Occupied', patientName: 'Rafiqul Islam', mrn: 'HAX-72111' },
    { id: 'bed-2', ward: 'Medical Ward B', bedLabel: 'B-12', state: 'Occupied', patientName: 'Nusrat Jahan', mrn: 'HAX-42851' },
    { id: 'bed-3', ward: 'Medical Ward B', bedLabel: 'B-13', state: 'Available' },
    { id: 'bed-4', ward: 'Medical Ward B', bedLabel: 'B-14', state: 'Occupied', patientName: 'Abdul Halim', mrn: 'HAX-38820' },
    { id: 'bed-5', ward: 'Medical Ward B', bedLabel: 'B-15', state: 'Reserved' },
    { id: 'bed-6', ward: 'Medical Ward B', bedLabel: 'B-16', state: 'Under Maintenance' },
    { id: 'bed-7', ward: 'OPD Observation', bedLabel: 'OBS-03', state: 'Occupied', patientName: 'Farzana Akter', mrn: 'HAX-60717' },
    { id: 'bed-8', ward: 'Stepdown Unit', bedLabel: 'SD-02', state: 'Occupied', patientName: 'Hasib Rahman', mrn: 'HAX-51244' },
  ] satisfies BedStatusItem[],
  occupancy: [
    { ward: 'Medical Ward B', totalBeds: 16, occupiedBeds: 13, reservedBeds: 1, maintenanceBeds: 1 },
    { ward: 'OPD Observation', totalBeds: 6, occupiedBeds: 4, reservedBeds: 0, maintenanceBeds: 0 },
    { ward: 'Stepdown Unit', totalBeds: 8, occupiedBeds: 6, reservedBeds: 1, maintenanceBeds: 0 },
  ] satisfies WardOccupancy[],
  alerts: [
    {
      id: 'n-alert-1',
      title: 'Critical renal lab for Abdul Halim',
      detail: 'Creatinine has risen. Continue close monitoring and keep fluid chart updated.',
      patientName: 'Abdul Halim',
      mrn: 'HAX-38820',
      category: 'Critical lab',
      priority: 'critical',
      status: 'new',
      timestamp: '2026-04-24T10:20:00',
      unread: true,
    },
    {
      id: 'n-alert-2',
      title: 'Vitals due for Nusrat Jahan',
      detail: 'Next 4-hour vitals check is pending in 20 minutes.',
      patientName: 'Nusrat Jahan',
      mrn: 'HAX-42851',
      category: 'Reminder',
      priority: 'high',
      status: 'new',
      timestamp: '2026-04-24T10:00:00',
      unread: true,
    },
    {
      id: 'n-alert-3',
      title: 'Ward occupancy nearing threshold',
      detail: 'Medical Ward B is above 80 percent occupancy.',
      category: 'Ward',
      priority: 'medium',
      status: 'acknowledged',
      timestamp: '2026-04-24T08:40:00',
      unread: false,
    },
    {
      id: 'n-alert-4',
      title: 'Discharge handover ready',
      detail: 'Hasib Rahman discharge instructions are ready for final review.',
      patientName: 'Hasib Rahman',
      mrn: 'HAX-51244',
      category: 'Patient',
      priority: 'low',
      status: 'resolved',
      timestamp: '2026-04-24T07:55:00',
      unread: false,
    },
  ] satisfies NurseAlert[],
};

export const nurseDashboardSummary = {
  vitalsPending: nurseDashboardData.assignedPatients.filter((patient) => patient.alertState !== 'none').length,
  criticalPatients: nurseDashboardData.assignedPatients.filter((patient) => patient.currentStatus === 'Critical').length,
  occupiedBeds: nurseDashboardData.beds.filter((bed) => bed.state === 'Occupied').length,
  patientsNeedingVitals: nurseDashboardData.assignedPatients.filter((patient) => patient.currentStatus === 'Needs review' || patient.currentStatus === 'Critical'),
};
