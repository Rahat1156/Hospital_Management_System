# HMS — Hospital Management System (Frontend)

Multi-tenant SaaS Hospital Management & Alert System for Bangladesh healthcare providers.

**Tech:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn-style components · Zustand · mock API (frontend-only phase)

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Copy env file
cp .env.local.example .env.local

# 3. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Credentials

All demo accounts use password: `Demo@2026`

| Role | Email |
|------|-------|
| Hospital Admin | admin@demo.hms.com.bd |
| Doctor (Cardiology) | dr.karim@demo.hms.com.bd |
| Doctor (Pediatrics) | dr.nasrin@demo.hms.com.bd |
| Nurse | sister.rumana@demo.hms.com.bd |
| Lab Technician | lab.tanvir@demo.hms.com.bd |
| Pharmacist | pharm.sadia@demo.hms.com.bd |
| Receptionist | reception@demo.hms.com.bd |
| Patient | rahim.patient@gmail.com |
| Super Admin | super@hms.com.bd |

On the login page, click **"Demo credentials"** to auto-fill.

**OTP code for registration demo:** `123456`

## Project Architecture

```
src/
├── app/                 Next.js App Router routes
│   ├── (auth)/          Login, register, OTP, 2FA, forgot-password
│   └── (dashboard)/     Role-based dashboards (admin, doctor, patient, etc.)
│
├── components/
│   ├── ui/              Pure UI primitives (Button, Input, Card, Badge…)
│   └── shared/          Reusable patterns (KPICard, PageHeader, EmptyState)
│
├── features/            Feature-scoped smart components (per module)
│
├── layouts/             Shell components (Sidebar, Topbar, DashboardShell)
│
├── lib/
│   ├── utils.ts         cn, formatBDT, formatDate, generateMRN…
│   ├── mock-api.ts      ⭐ SWAP POINT for real Laravel backend
│   ├── mock-data/       Realistic Bangladesh healthcare data
│   ├── auth-store.ts    Zustand auth state
│   └── navigation.ts    Role-based sidebar config
│
└── types/               API contract (13 SRS modules)
```

## What's Built

**Auth flow (complete):**
- Login (with demo-credentials helper)
- Register (patient self-registration)
- OTP verification (auto-issues MRN in HAX-XXXXX format)
- Forgot password
- 2FA setup (TOTP QR + backup codes)

**Dashboard shell (complete):**
- Role-based sidebar (8 roles) with collapse/expand
- Topbar with global search, notifications panel, profile menu
- Fully responsive (mobile drawer)

**Sample pages (complete):**
- Admin Dashboard — KPI cards, revenue chart, HAS alerts, today's appointments
- Patient Management — list, search, filters, add-patient modal with full form
- HAS Alert Center — master-detail view, severity filters, dispatch log, recipient tracking

**All other routes:** scaffolded as stub pages (no 404s). Ready to be built module by module.

## Swapping the Mock API for Real Backend

When Laravel backend is ready, edit `src/lib/mock-api.ts`. Each function signature is already the final contract — only replace function bodies:

```ts
// Before (mock):
async getPatients() {
  await delay();
  return { data: MOCK_PATIENTS };
}

// After (real):
async getPatients() {
  return (await axios.get('/api/v1/patients')).data;
}
```

UI code consuming these functions stays untouched.

## SRS Modules (13 total)

| # | Module | Status |
|---|--------|--------|
| 1 | Hospital Alert System (HAS) ⭐ | ✅ UI built |
| 2 | Patient Profile & Registration | ✅ UI built |
| 3 | Appointment & Scheduling | ⏳ Scaffolded |
| 4 | Digital Prescription | ⏳ Scaffolded |
| 5 | Lab Test Management | ⏳ Scaffolded |
| 6 | Medicine & Pharmacy | ⏳ Scaffolded |
| 7 | Emergency & Ambulance | ⏳ Scaffolded |
| 8 | Bed & Ward Management | ⏳ Scaffolded |
| 9 | OPD / IPD | ⏳ Scaffolded |
| 10 | Billing & Finance | ⏳ Scaffolded |
| 11 | Doctor & Staff | ⏳ Scaffolded |
| 12 | Multi-Tenant SaaS Admin | ⏳ Scaffolded |
| 13 | Analytics & Reporting | ⏳ Scaffolded |

## Next Steps

Pick any scaffolded module and build it out. All types, mock data, and API functions are already defined.

## License

Confidential — HMS Platform © 2026
