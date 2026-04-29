import {
  Activity, AlertTriangle, Ambulance, BarChart3, Bed, Building2, Calendar, CreditCard,
  FileText, FlaskConical, LayoutDashboard, Pill, Settings, Stethoscope, Users, UserCog,
  LifeBuoy, HeartPulse, ClipboardList, Package,
} from 'lucide-react';
import type { UserRole } from '@/types';

export interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: string | number;
  highlight?: boolean;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export const navigationByRole: Record<UserRole, NavGroup[]> = {
  hospital_admin: [
    {
      items: [
        { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { label: 'HAS Alerts', href: '/admin/alerts', icon: AlertTriangle, badge: 3, highlight: true },
      ],
    },
    {
      label: 'Clinical',
      items: [
        { label: 'Patients', href: '/admin/patients', icon: Users },
        { label: 'Appointments', href: '/admin/appointments', icon: Calendar },
        { label: 'Prescriptions', href: '/admin/prescriptions', icon: FileText },
        { label: 'Lab Tests', href: '/admin/lab', icon: FlaskConical, badge: 18 },
        { label: 'Pharmacy', href: '/admin/pharmacy', icon: Pill },
        { label: 'Emergency', href: '/admin/emergency', icon: Ambulance },
      ],
    },
    {
      label: 'Operations',
      items: [
        { label: 'Beds & Wards', href: '/admin/beds', icon: Bed },
        { label: 'OPD / IPD', href: '/admin/opd-ipd', icon: ClipboardList },
        { label: 'Billing', href: '/admin/billing', icon: CreditCard },
      ],
    },
    {
      label: 'Management',
      items: [
        { label: 'Doctors & Staff', href: '/admin/staff', icon: UserCog },
        { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
        { label: 'Settings', href: '/admin/settings', icon: Settings },
      ],
    },
  ],
  doctor: [
    {
      items: [
        { label: 'My Dashboard', href: '/doctor', icon: LayoutDashboard },
        { label: 'Appointments', href: '/doctor/appointments', icon: Calendar },
        { label: 'Prescriptions', href: '/doctor/prescriptions', icon: FileText },
        { label: 'Patients', href: '/doctor/patients', icon: Users },
        { label: 'Lab Orders', href: '/doctor/lab-orders', icon: FlaskConical },
      ],
    },
  ],
  nurse: [
    {
      items: [
        { label: 'Dashboard', href: '/nurse', icon: LayoutDashboard },
        { label: 'Vitals Entry', href: '/nurse/vitals', icon: HeartPulse },
        { label: 'Ward View', href: '/nurse/ward', icon: Bed },
      ],
    },
  ],
  lab_technician: [
    {
      items: [
        { label: 'Dashboard', href: '/lab', icon: LayoutDashboard },
        { label: 'Pending Tests', href: '/lab/pending', icon: FlaskConical, badge: 18 },
        { label: 'Reference Ranges', href: '/lab/reference-ranges', icon: ClipboardList },
      ],
    },
  ],
  pharmacist: [
    {
      items: [
        { label: 'Dispensing Queue', href: '/pharmacy', icon: Pill, badge: 7 },
        { label: 'Inventory', href: '/pharmacy/inventory', icon: Package },
        { label: 'Audit Log', href: '/pharmacy/audit', icon: ClipboardList },
      ],
    },
  ],
  receptionist: [
    {
      items: [
        { label: 'Today', href: '/reception', icon: LayoutDashboard },
        { label: 'Register Patient', href: '/reception/register-patient', icon: Users },
        { label: 'Appointments', href: '/reception/appointments', icon: Calendar },
      ],
    },
  ],
  patient: [
    {
      items: [
        { label: 'My Health', href: '/patient', icon: Activity },
        { label: 'Appointments', href: '/patient/appointments', icon: Calendar },
        { label: 'Prescriptions', href: '/patient/prescriptions', icon: FileText },
        { label: 'Lab Reports', href: '/patient/lab-reports', icon: FlaskConical },
        { label: 'Bills', href: '/patient/bills', icon: CreditCard },
        { label: 'Health Timeline', href: '/patient/timeline', icon: ClipboardList },
        { label: 'SOS Emergency', href: '/patient/sos', icon: LifeBuoy, highlight: true },
      ],
    },
  ],
};

export const roleLabels: Record<UserRole, string> = {
  hospital_admin: 'Hospital Admin',
  doctor: 'Doctor',
  nurse: 'Nurse',
  lab_technician: 'Lab Technician',
  pharmacist: 'Pharmacist',
  receptionist: 'Receptionist',
  patient: 'Patient',
};

export const roleIcons: Record<UserRole, typeof LayoutDashboard> = {
  hospital_admin: Building2,
  doctor: Stethoscope,
  nurse: HeartPulse,
  lab_technician: FlaskConical,
  pharmacist: Pill,
  receptionist: Users,
  patient: Activity,
};
