export type DeliveryStatus = 'pending' | 'sent' | 'failed' | 'retried';
export type PaymentStatus = 'paid' | 'partial' | 'unpaid';
export type BedState = 'Available' | 'Occupied' | 'Reserved' | 'Under Maintenance';
export type StaffAccountStatus = 'Active' | 'Locked' | 'Suspended';
export type AlertPriority = 'critical' | 'high' | 'medium' | 'low';
export type AlertState = 'New' | 'Acknowledged' | 'Resolved';

export interface ActivityLogItem {
  id: string;
  actor: string;
  action: string;
  at: string;
  module: string;
}

export interface AlertFeedItem {
  id: string;
  title: string;
  message: string;
  priority: AlertPriority;
  status: AlertState;
  at: string;
  patient?: string;
  mrn?: string;
  channels?: string[];
  delivery?: DeliveryStatus;
}

export interface WardBedItem {
  id: string;
  ward: string;
  bed: string;
  state: BedState;
  patient?: string;
  mrn?: string;
}

export interface StaffItem {
  id: string;
  name: string;
  role: 'Doctor' | 'Nurse' | 'Lab Technician' | 'Pharmacist' | 'Receptionist' | 'Admin';
  department: string;
  status: StaffAccountStatus;
  permissions: string[];
  phone: string;
  email: string;
  bmdc?: string;
  failedLogins?: number;
}

export interface RevenuePoint {
  label: string;
  revenue: number;
}

export interface DoctorPerformanceRow {
  doctor: string;
  specialty: string;
  patientsSeen: number;
  revenue: number;
  avgDuration: number;
}

export interface AdminPatientRow {
  id: string;
  name: string;
  mrn: string;
  registrationSource: 'Walk-in' | 'Online' | 'Referral';
  appointmentCount: number;
  billingStatus: PaymentStatus;
  phone: string;
}

export interface AdminDepartmentCard {
  name: string;
  patients: number;
  revenue: number;
  utilization: number;
}

export interface ReceptionPatientRegistration {
  fullName: string;
  dateOfBirth: string;
  nid: string;
  gender: string;
  bloodGroup: string;
  phone: string;
  email: string;
  emergencyContact: string;
}

export interface ReceptionAppointment {
  id: string;
  patient: string;
  mrn: string;
  doctor: string;
  department: string;
  slot: string;
  status: 'Scheduled' | 'Checked in' | 'Completed' | 'Cancelled' | 'Rescheduled';
  smsStatus: 'Sent' | 'Pending' | 'Failed';
}

export interface WalkInRow {
  id: string;
  patient: string;
  mrn: string;
  queue: string;
  doctor: string;
  stage: 'Registration' | 'OPD' | 'IPD Admitted' | 'Discharged';
  at: string;
  actor: string;
}

export interface BillingSessionRow {
  id: string;
  patient: string;
  mrn: string;
  doctorFee: number;
  labFee: number;
  medicineFee: number;
  bedFee: number;
  procedureFee: number;
  status: PaymentStatus;
  method: 'bKash' | 'Nagad' | 'Card' | 'Cash';
}

export interface LabPendingTest {
  id: string;
  patient: string;
  mrn: string;
  test: string;
  orderingDoctor: string;
  requestedAt: string;
  priority: 'Routine' | 'Urgent' | 'Critical';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Critical';
}

export interface LabResultEntry {
  test: string;
  patient: string;
  mrn: string;
  result: string;
  unit: string;
  referenceRange: string;
  ageGender: string;
  flag: 'Normal' | 'Borderline' | 'Critical';
}

export interface LabReportRow {
  id: string;
  patient: string;
  mrn: string;
  reportStatus: 'Draft' | 'Generated' | 'Sent';
  technician: string;
  reportDate: string;
}

export interface ReferenceRangeRow {
  test: string;
  ageGroup: string;
  gender: string;
  normal: string;
  borderline: string;
  critical: string;
}

export interface PharmacyPrescriptionRow {
  id: string;
  patient: string;
  mrn: string;
  doctor: string;
  time: string;
  drugCount: number;
  status: 'New' | 'In Progress' | 'Partially Dispensed' | 'Dispensed';
}

export interface DispenseMedicineRow {
  name: string;
  generic: string;
  brand: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantityNeeded: number;
  stockAvailable: number;
}

export interface InventoryRow {
  id: string;
  drug: string;
  generic: string;
  brand: string;
  stock: number;
  threshold: number;
  expiry: string;
  batch: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Expiring Soon';
}

export interface AuditLogRow {
  id: string;
  pharmacist: string;
  at: string;
  patientMrn: string;
  prescriptionId: string;
  drug: string;
  quantity: number;
  action: string;
}

export const opsDashboardData = {
  admin: {
    kpis: {
      totalPatients: 3247,
      todaysAppointments: 142,
      occupiedBeds: 123,
      revenueToday: 284500,
      outstandingBills: 478200,
      criticalAlerts: 3,
    },
    departmentCards: [
      { name: 'Cardiology', patients: 38, revenue: 142000, utilization: 84 },
      { name: 'Medicine', patients: 54, revenue: 161000, utilization: 78 },
      { name: 'Pediatrics', patients: 29, revenue: 89000, utilization: 73 },
      { name: 'Diagnostics', patients: 64, revenue: 121000, utilization: 88 },
    ] satisfies AdminDepartmentCard[],
    financialTrend: [
      { label: 'Mon', revenue: 245000 },
      { label: 'Tue', revenue: 268000 },
      { label: 'Wed', revenue: 284500 },
      { label: 'Thu', revenue: 312000 },
      { label: 'Fri', revenue: 298000 },
      { label: 'Sat', revenue: 254000 },
      { label: 'Sun', revenue: 198000 },
    ] satisfies RevenuePoint[],
    patients: [
      { id: 'p-1', name: 'Nusrat Jahan', mrn: 'HAX-42851', registrationSource: 'Walk-in', appointmentCount: 7, billingStatus: 'partial', phone: '+880 1712-345678' },
      { id: 'p-2', name: 'Abdul Halim', mrn: 'HAX-38820', registrationSource: 'Referral', appointmentCount: 12, billingStatus: 'unpaid', phone: '+880 1715-998877' },
      { id: 'p-3', name: 'Farzana Akter', mrn: 'HAX-60717', registrationSource: 'Online', appointmentCount: 3, billingStatus: 'paid', phone: '+880 1912-334455' },
    ] satisfies AdminPatientRow[],
    wards: [
      { id: 'w-1', ward: 'ICU Ward 2', bed: 'ICU-01', state: 'Occupied', patient: 'Abdul Halim', mrn: 'HAX-38820' },
      { id: 'w-2', ward: 'ICU Ward 2', bed: 'ICU-02', state: 'Occupied', patient: 'Shamim Reza', mrn: 'HAX-38893' },
      { id: 'w-3', ward: 'General Ward A', bed: 'A-12', state: 'Reserved' },
      { id: 'w-4', ward: 'General Ward A', bed: 'A-13', state: 'Available' },
      { id: 'w-5', ward: 'Private Cabin', bed: 'C-03', state: 'Under Maintenance' },
      { id: 'w-6', ward: 'Maternity Ward', bed: 'M-08', state: 'Occupied', patient: 'Sadia Noor', mrn: 'HAX-53017' },
    ] satisfies WardBedItem[],
    alerts: [
      { id: 'a-1', title: 'Critical hemoglobin alert', message: 'Fatema Begum has critically low hemoglobin and doctor acknowledgement is pending.', priority: 'critical', status: 'New', at: '2026-04-24T10:10:00', patient: 'Fatema Begum', mrn: 'HAX-10087', channels: ['SMS', 'Email', 'In-app'], delivery: 'sent' },
      { id: 'a-2', title: 'ICU occupancy threshold approaching', message: 'ICU Ward 2 has reached 87.5% occupancy. Capacity threshold is set at 90%.', priority: 'high', status: 'Acknowledged', at: '2026-04-24T08:30:00', channels: ['Email', 'In-app'], delivery: 'sent' },
      { id: 'a-3', title: 'SMS provider retry occurred', message: 'Appointment reminder retried through secondary SMS gateway after primary timeout.', priority: 'medium', status: 'Resolved', at: '2026-04-24T07:50:00', channels: ['SMS', 'WhatsApp'], delivery: 'retried' },
    ] satisfies AlertFeedItem[],
    activityLog: [
      { id: 'log-1', actor: 'Fahmida Sultana', action: 'Approved elderly discount on invoice INV-2026-1287', at: '2026-04-24T10:05:00', module: 'Billing' },
      { id: 'log-2', actor: 'Dr. Masfiqur Rahman Nehal', action: 'Updated ICU occupancy rule threshold from 85% to 90%', at: '2026-04-24T09:20:00', module: 'HAS' },
      { id: 'log-3', actor: 'Sadia Rahman', action: 'Dispensed prescription RX-2026-0547', at: '2026-04-24T08:40:00', module: 'Pharmacy' },
    ] satisfies ActivityLogItem[],
    financeRows: [
      { department: 'Cardiology', revenue: 142000, outstanding: 42000, method: 'bKash', invoices: 38 },
      { department: 'Diagnostics', revenue: 121000, outstanding: 55000, method: 'Cash', invoices: 52 },
      { department: 'Medicine', revenue: 161000, outstanding: 73000, method: 'Card', invoices: 47 },
    ],
    staff: [
      { id: 's-1', name: 'Dr. Karim Hossain', role: 'Doctor', department: 'Cardiology', status: 'Active', permissions: ['Consult', 'Prescribe', 'Export'], phone: '+880 1712-345002', email: 'dr.karim@demo.hms.com.bd', bmdc: 'A-45678' },
      { id: 's-2', name: 'Rumana Begum', role: 'Nurse', department: 'ICU', status: 'Active', permissions: ['Vitals', 'Care Chart'], phone: '+880 1712-345004', email: 'sister.rumana@demo.hms.com.bd' },
      { id: 's-3', name: 'Nehal Tanvir', role: 'Lab Technician', department: 'Lab', status: 'Locked', permissions: ['Result Entry', 'Generate Report'], phone: '+880 1712-345005', email: 'lab.tanvir@demo.hms.com.bd', failedLogins: 5 },
      { id: 's-4', name: 'Sadia Rahman', role: 'Pharmacist', department: 'Pharmacy', status: 'Suspended', permissions: ['Dispense', 'Audit'], phone: '+880 1712-345006', email: 'pharm.sadia@demo.hms.com.bd' },
    ] satisfies StaffItem[],
    doctorPerformance: [
      { doctor: 'Dr. Karim Hossain', specialty: 'Cardiology', patientsSeen: 287, revenue: 430500, avgDuration: 28 },
      { doctor: 'Dr. Nasrin Akter', specialty: 'Pediatrics', patientsSeen: 342, revenue: 410400, avgDuration: 22 },
      { doctor: 'Dr. Sameer Hossain', specialty: 'Medicine', patientsSeen: 311, revenue: 389200, avgDuration: 24 },
    ] satisfies DoctorPerformanceRow[],
    analyticsStatus: 'Report generation completed at 10:12 AM',
  },
  reception: {
    kpis: {
      todaysAppointments: 142,
      walkIns: 18,
      pendingRegistrations: 4,
      waitingBilling: 9,
      availableBeds: 14,
    },
    registrationDraft: {
      fullName: 'Ayesha Sultana',
      dateOfBirth: '1993-06-18',
      nid: '1993123456789',
      gender: 'Female',
      bloodGroup: 'O+',
      phone: '+880 1717-443322',
      email: 'ayesha.sultana@example.com',
      emergencyContact: 'Rafiq Sultana / +880 1811-778899',
    } satisfies ReceptionPatientRegistration,
    generatedMrn: 'HAX-58124',
    appointments: [
      { id: 'ra-1', patient: 'Nusrat Jahan', mrn: 'HAX-42851', doctor: 'Dr. Karim Hossain', department: 'Cardiology', slot: '24/04/2026 10:30 AM', status: 'Scheduled', smsStatus: 'Sent' },
      { id: 'ra-2', patient: 'Farzana Akter', mrn: 'HAX-60717', doctor: 'Dr. Nasrin Akter', department: 'Pediatrics', slot: '24/04/2026 02:00 PM', status: 'Checked in', smsStatus: 'Sent' },
      { id: 'ra-3', patient: 'Hasib Rahman', mrn: 'HAX-51244', doctor: 'Dr. Sameer Hossain', department: 'Medicine', slot: '25/04/2026 09:00 AM', status: 'Rescheduled', smsStatus: 'Pending' },
    ] satisfies ReceptionAppointment[],
    walkIns: [
      { id: 'wi-1', patient: 'Abdul Halim', mrn: 'HAX-38820', queue: 'W-07', doctor: 'Medicine desk', stage: 'OPD', at: '2026-04-24T09:10:00', actor: 'Fahmida Sultana' },
      { id: 'wi-2', patient: 'Rokeya Begum', mrn: 'HAX-51290', queue: 'W-08', doctor: 'Cardiology', stage: 'Registration', at: '2026-04-24T09:20:00', actor: 'Desk 2' },
      { id: 'wi-3', patient: 'Nafisa Karim', mrn: 'HAX-51312', queue: 'W-09', doctor: 'Observation', stage: 'IPD Admitted', at: '2026-04-24T10:00:00', actor: 'Admission Desk' },
    ] satisfies WalkInRow[],
    beds: [
      { id: 'rb-1', ward: 'General Ward A', bed: 'A-13', state: 'Available' },
      { id: 'rb-2', ward: 'General Ward A', bed: 'A-14', state: 'Reserved' },
      { id: 'rb-3', ward: 'Maternity Ward', bed: 'M-09', state: 'Occupied', patient: 'Sadia Noor', mrn: 'HAX-53017' },
      { id: 'rb-4', ward: 'Private Cabin', bed: 'C-05', state: 'Under Maintenance' },
    ] satisfies WardBedItem[],
    billingSessions: [
      { id: 'bs-1', patient: 'Fatema Begum', mrn: 'HAX-10087', doctorFee: 1500, labFee: 800, medicineFee: 150, bedFee: 1050, procedureFee: 0, status: 'unpaid', method: 'Cash' },
      { id: 'bs-2', patient: 'Md. Rahim Uddin', mrn: 'HAX-10024', doctorFee: 1500, labFee: 1200, medicineFee: 360, bedFee: 0, procedureFee: 0, status: 'paid', method: 'Card' },
      { id: 'bs-3', patient: 'Nafisa Karim', mrn: 'HAX-51312', doctorFee: 1200, labFee: 0, medicineFee: 0, bedFee: 3000, procedureFee: 600, status: 'partial', method: 'bKash' },
    ] satisfies BillingSessionRow[],
    notifications: [
      { id: 'rn-1', title: 'OTP confirmation pending', message: 'Ayesha Sultana registration is awaiting SMS confirmation.', priority: 'medium', status: 'New', at: '2026-04-24T10:12:00', channels: ['SMS'], delivery: 'pending' },
      { id: 'rn-2', title: 'Double booking prevented', message: 'Slot 25/04/2026 09:00 AM for Dr. Karim Hossain was already reserved.', priority: 'high', status: 'Acknowledged', at: '2026-04-24T09:44:00', channels: ['In-app'], delivery: 'sent' },
    ] satisfies AlertFeedItem[],
  },
  lab: {
    kpis: {
      pending: 18,
      completedToday: 37,
      criticalToday: 4,
      reportsGenerated: 29,
      turnaround: '2h 18m',
    },
    pendingTests: [
      { id: 'lt-1', patient: 'Fatema Begum', mrn: 'HAX-10087', test: 'Complete Blood Count', orderingDoctor: 'Dr. Karim Hossain', requestedAt: '24/04/2026 08:10 AM', priority: 'Critical', status: 'Critical' },
      { id: 'lt-2', patient: 'Md. Rahim Uddin', mrn: 'HAX-10024', test: 'Lipid Profile', orderingDoctor: 'Dr. Karim Hossain', requestedAt: '24/04/2026 09:00 AM', priority: 'Routine', status: 'In Progress' },
      { id: 'lt-3', patient: 'Farzana Akter', mrn: 'HAX-60717', test: 'Serum Electrolytes', orderingDoctor: 'Dr. Sameer Hossain', requestedAt: '24/04/2026 09:25 AM', priority: 'Urgent', status: 'Pending' },
    ] satisfies LabPendingTest[],
    resultEntry: {
      test: 'Hemoglobin',
      patient: 'Fatema Begum',
      mrn: 'HAX-10087',
      result: '9.2',
      unit: 'g/dL',
      referenceRange: '12.0 - 15.5',
      ageGender: '63 years / Female',
      flag: 'Critical',
    } satisfies LabResultEntry,
    reports: [
      { id: 'lr-1', patient: 'Fatema Begum', mrn: 'HAX-10087', reportStatus: 'Generated', technician: 'Tanvir Islam', reportDate: '24/04/2026' },
      { id: 'lr-2', patient: 'Md. Rahim Uddin', mrn: 'HAX-10024', reportStatus: 'Draft', technician: 'Tanvir Islam', reportDate: '24/04/2026' },
      { id: 'lr-3', patient: 'Ayaan Chowdhury', mrn: 'HAX-10156', reportStatus: 'Sent', technician: 'Nabila Hoque', reportDate: '23/04/2026' },
    ] satisfies LabReportRow[],
    referenceRanges: [
      { test: 'Hemoglobin', ageGroup: 'Adult', gender: 'Female', normal: '12.0 - 15.5', borderline: '10.0 - 11.9', critical: '< 10.0' },
      { test: 'Platelets', ageGroup: 'Adult', gender: 'All', normal: '150 - 400', borderline: '120 - 149', critical: '< 120' },
      { test: 'Potassium', ageGroup: 'Adult', gender: 'All', normal: '3.5 - 5.1', borderline: '3.0 - 3.4 / 5.2 - 5.5', critical: '< 3.0 / > 5.5' },
    ] satisfies ReferenceRangeRow[],
    alerts: [
      { id: 'la-1', title: 'Critical result alert dispatched', message: 'Ordering doctor and patient were notified for low hemoglobin result.', priority: 'critical', status: 'Sent' as AlertState, at: '2026-04-24T10:16:00', patient: 'Fatema Begum', mrn: 'HAX-10087', channels: ['SMS', 'Email', 'In-app'], delivery: 'sent' },
      { id: 'la-2', title: 'SMS fallback triggered', message: 'Primary provider timed out and message was retried via failover gateway.', priority: 'medium', status: 'Acknowledged', at: '2026-04-24T10:18:00', channels: ['SMS'], delivery: 'retried' },
    ] satisfies AlertFeedItem[],
  },
  pharmacy: {
    kpis: {
      waiting: 7,
      dispensedToday: 31,
      lowStock: 6,
      expiringSoon: 4,
      partialCases: 2,
    },
    queue: [
      { id: 'pq-1', patient: 'Md. Rahim Uddin', mrn: 'HAX-10024', doctor: 'Dr. Karim Hossain', time: '24/04/2026 10:30 AM', drugCount: 2, status: 'New' },
      { id: 'pq-2', patient: 'Fatema Begum', mrn: 'HAX-10087', doctor: 'Dr. Sameer Hossain', time: '24/04/2026 09:55 AM', drugCount: 4, status: 'In Progress' },
      { id: 'pq-3', patient: 'Rokeya Begum', mrn: 'HAX-51290', doctor: 'Dr. Nasrin Akter', time: '24/04/2026 09:20 AM', drugCount: 3, status: 'Partially Dispensed' },
    ] satisfies PharmacyPrescriptionRow[],
    dispensingDraft: {
      patient: 'Md. Rahim Uddin',
      mrn: 'HAX-10024',
      pharmacistId: 'PHR-2018-5432',
      timestamp: '24/04/2026 10:42 AM',
      medicines: [
        { name: 'Amlodipine 5mg', generic: 'Amlodipine', brand: 'Amdocal', dosage: '1 tablet', frequency: 'Once daily', duration: '30 days', instructions: 'Morning after breakfast', quantityNeeded: 30, stockAvailable: 850 },
        { name: 'Atorvastatin 10mg', generic: 'Atorvastatin', brand: 'Atova', dosage: '1 tablet', frequency: 'At bedtime', duration: '30 days', instructions: 'Night dose', quantityNeeded: 30, stockAvailable: 18 },
      ] satisfies DispenseMedicineRow[],
    },
    inventory: [
      { id: 'inv-1', drug: 'Amoxicillin 500mg', generic: 'Amoxicillin', brand: 'Amoxil', stock: 45, threshold: 100, expiry: '31/10/2027', batch: 'B-2025-8821', status: 'Low Stock' },
      { id: 'inv-2', drug: 'Amlodipine 5mg', generic: 'Amlodipine', brand: 'Amdocal', stock: 850, threshold: 200, expiry: '14/01/2028', batch: 'B-2026-1104', status: 'In Stock' },
      { id: 'inv-3', drug: 'Atorvastatin 10mg', generic: 'Atorvastatin', brand: 'Atova', stock: 18, threshold: 150, expiry: '20/07/2026', batch: 'B-2026-0705', status: 'Low Stock' },
      { id: 'inv-4', drug: 'Ceftriaxone 1g', generic: 'Ceftriaxone', brand: 'Rocephin', stock: 0, threshold: 50, expiry: '15/11/2026', batch: 'B-2025-5512', status: 'Out of Stock' },
      { id: 'inv-5', drug: 'Metformin 500mg', generic: 'Metformin', brand: 'Comet', stock: 1200, threshold: 300, expiry: '09/09/2027', batch: 'B-2025-9933', status: 'In Stock' },
      { id: 'inv-6', drug: 'Omeprazole 20mg', generic: 'Omeprazole', brand: 'Losectil', stock: 94, threshold: 120, expiry: '10/06/2026', batch: 'B-2025-4412', status: 'Expiring Soon' },
    ] satisfies InventoryRow[],
    lowStockAlerts: [
      { id: 'ps-1', title: 'Amoxicillin below threshold', message: 'Suggested restock quantity: 300 units.', priority: 'high', status: 'New', at: '2026-04-24T08:00:00', delivery: 'sent' },
      { id: 'ps-2', title: 'Atorvastatin partial dispense risk', message: 'Outstanding quantities may increase if replenishment is delayed.', priority: 'medium', status: 'Acknowledged', at: '2026-04-24T09:30:00', delivery: 'sent' },
    ] satisfies AlertFeedItem[],
    expiryTracking: [
      { id: 'exp-1', drug: 'Omeprazole 20mg', generic: 'Omeprazole', brand: 'Losectil', stock: 94, threshold: 120, expiry: '10/06/2026', batch: 'B-2025-4412', status: 'Expiring Soon' },
      { id: 'exp-2', drug: 'Ceftriaxone 1g', generic: 'Ceftriaxone', brand: 'Rocephin', stock: 0, threshold: 50, expiry: '15/11/2026', batch: 'B-2025-5512', status: 'Out of Stock' },
    ] satisfies InventoryRow[],
    auditLogs: [
      { id: 'au-1', pharmacist: 'Sadia Rahman', at: '2026-04-24T10:42:00', patientMrn: 'HAX-10024', prescriptionId: 'RX-2026-0547', drug: 'Amlodipine 5mg', quantity: 30, action: 'Dispensed' },
      { id: 'au-2', pharmacist: 'Sadia Rahman', at: '2026-04-24T10:43:00', patientMrn: 'HAX-10024', prescriptionId: 'RX-2026-0547', drug: 'Atorvastatin 10mg', quantity: 18, action: 'Partial Dispense' },
      { id: 'au-3', pharmacist: 'Tanjila Noor', at: '2026-04-24T09:35:00', patientMrn: 'HAX-51290', prescriptionId: 'RX-2026-0583', drug: 'Ceftriaxone 1g', quantity: 0, action: 'Outstanding Quantity Created' },
    ] satisfies AuditLogRow[],
  },
};
