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
        { label: 'Overview', href: '/admin', icon: LayoutDashboard },
        { label: 'Patients', href: '/admin/patients', icon: Users },
        { label: 'Appointments', href: '/admin/appointments', icon: Calendar },
        { label: 'Bed & Ward', href: '/admin/beds', icon: Bed },
        { label: 'Alerts / HAS', href: '/admin/alerts', icon: AlertTriangle, badge: 3, highlight: true },
        { label: 'Billing & Finance', href: '/admin/billing', icon: CreditCard },
        { label: 'Staff Management', href: '/admin/staff', icon: UserCog },
        { label: 'Doctor Performance', href: '/admin/doctor-performance', icon: Stethoscope },
        { label: 'Analytics & Reports', href: '/admin/analytics', icon: BarChart3 },
        { label: 'Settings', href: '/admin/settings', icon: Settings },
      ],
    },
  ],
  doctor: [
    {
      items: [
        { label: 'Overview', href: '/doctor', icon: LayoutDashboard },
        { label: 'Patient Queue', href: '/doctor/appointments', icon: Calendar, badge: 8 },
        { label: 'Patients', href: '/doctor/patients', icon: Users },
        { label: 'Schedule', href: '/doctor/schedule', icon: ClipboardList },
        { label: 'Prescriptions', href: '/doctor/prescriptions', icon: FileText },
        { label: 'Lab Results', href: '/doctor/lab-orders', icon: FlaskConical },
        { label: 'Alerts', href: '/doctor/alerts', icon: AlertTriangle, badge: 3, highlight: true },
        { label: 'Performance', href: '/doctor/performance', icon: BarChart3 },
      ],
    },
  ],
  nurse: [
    {
      items: [
        { label: 'Overview', href: '/nurse', icon: LayoutDashboard },
        { label: 'Assigned Patients', href: '/nurse/patients', icon: Users },
        { label: 'Care Chart', href: '/nurse/care-chart', icon: ClipboardList },
        { label: 'Vitals', href: '/nurse/vitals', icon: HeartPulse, badge: 2 },
        { label: 'Ward Status', href: '/nurse/ward', icon: Bed },
        { label: 'Alerts', href: '/nurse/alerts', icon: AlertTriangle, badge: 2, highlight: true },
        { label: 'History', href: '/nurse/history', icon: FileText },
      ],
    },
  ],
  lab_technician: [
    {
      items: [
        { label: 'Overview', href: '/lab', icon: LayoutDashboard },
        { label: 'Pending Tests', href: '/lab/pending', icon: FlaskConical, badge: 18 },
        { label: 'Result Entry', href: '/lab/result-entry', icon: ClipboardList },
        { label: 'Reports', href: '/lab/reports', icon: FileText },
        { label: 'Critical Alerts', href: '/lab/critical-alerts', icon: AlertTriangle, badge: 2, highlight: true },
        { label: 'Reference Ranges', href: '/lab/reference-ranges', icon: ClipboardList },
        { label: 'Patient Lookup', href: '/lab/patient-lookup', icon: Users },
      ],
    },
  ],
  pharmacist: [
    {
      items: [
        { label: 'Overview', href: '/pharmacy', icon: LayoutDashboard },
        { label: 'Prescription Queue', href: '/pharmacy/prescription-queue', icon: Pill, badge: 7 },
        { label: 'Dispensing', href: '/pharmacy/dispensing', icon: ClipboardList },
        { label: 'Inventory', href: '/pharmacy/inventory', icon: Package },
        { label: 'Low Stock Alerts', href: '/pharmacy/low-stock', icon: AlertTriangle, badge: 2, highlight: true },
        { label: 'Expiry Tracking', href: '/pharmacy/expiry-tracking', icon: Calendar },
        { label: 'Audit Logs', href: '/pharmacy/audit', icon: ClipboardList },
      ],
    },
  ],
  receptionist: [
    {
      items: [
        { label: 'Overview', href: '/reception', icon: LayoutDashboard },
        { label: 'Register Patient', href: '/reception/register-patient', icon: Users },
        { label: 'Appointments', href: '/reception/appointments', icon: Calendar },
        { label: 'Walk-ins', href: '/reception/walk-ins', icon: ClipboardList },
        { label: 'OPD/IPD Flow', href: '/reception/opd-ipd', icon: Activity },
        { label: 'Bed Assignment', href: '/reception/bed-assignment', icon: Bed },
        { label: 'Billing', href: '/reception/billing', icon: CreditCard },
        { label: 'Patient Search', href: '/reception/patient-search', icon: Users },
        { label: 'Notifications', href: '/reception/notifications', icon: AlertTriangle, badge: 2 },
      ],
    },
  ],
  patient: [
    {
      items: [
        { label: 'Overview', href: '/patient', icon: Activity },
        { label: 'My Profile', href: '/patient/profile', icon: Users },
        { label: 'Appointments', href: '/patient/appointments', icon: Calendar },
        { label: 'Prescriptions', href: '/patient/prescriptions', icon: FileText },
        { label: 'Lab Reports', href: '/patient/lab-reports', icon: FlaskConical },
        { label: 'Billing & Payments', href: '/patient/bills', icon: CreditCard },
        { label: 'Health Timeline', href: '/patient/timeline', icon: ClipboardList },
        { label: 'Notifications', href: '/patient/notifications', icon: AlertTriangle, badge: 2 },
        { label: 'SOS Emergency', href: '/patient/sos', icon: LifeBuoy, highlight: true },
      ],
    },
  ],
  super_admin: [
    {
      items: [
        { label: 'Platform Overview', href: '/super-admin', icon: LayoutDashboard },
        { label: 'Tenants', href: '/super-admin/tenants', icon: Building2 },
        { label: 'Subscriptions', href: '/super-admin/subscriptions', icon: CreditCard },
        { label: 'Platform Alerts', href: '/super-admin/platform-alerts', icon: AlertTriangle },
      ],
    },
  ],
};

export const roleLabels: Record<UserRole, string> = {
  super_admin: 'Platform Admin',
  hospital_admin: 'Hospital Admin',
  doctor: 'Doctor',
  nurse: 'Nurse',
  lab_technician: 'Lab Technician',
  pharmacist: 'Pharmacist',
  receptionist: 'Receptionist',
  patient: 'Patient',
};

export const roleIcons: Record<UserRole, typeof LayoutDashboard> = {
  super_admin: Settings,
  hospital_admin: Building2,
  doctor: Stethoscope,
  nurse: HeartPulse,
  lab_technician: FlaskConical,
  pharmacist: Pill,
  receptionist: Users,
  patient: Activity,
};
