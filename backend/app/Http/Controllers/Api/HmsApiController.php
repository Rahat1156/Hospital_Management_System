<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class HmsApiController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        /** @var User|null $user */
        $user = User::where('email', strtolower($data['email']))->first();
        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return $this->error('Invalid email or password', Response::HTTP_UNAUTHORIZED);
        }

        if ($user->status === 'locked' || ($user->locked_until && Carbon::parse($user->locked_until)->isFuture())) {
            return $this->error('Account is locked. Contact admin.', Response::HTTP_LOCKED);
        }

        $user->last_login_at = now();
        $user->last_login_ip = $request->ip();
        $user->failed_login_attempts = 0;
        $user->save();

        $tenant = $user->tenant_id ? $this->tenantById($user->tenant_id) : null;

        return $this->ok([
            'user' => $this->mapUser($user),
            'tenant' => $tenant,
            'access_token' => 'mock-token-'.Str::uuid(),
            'refresh_token' => 'mock-refresh-'.Str::uuid(),
            'expires_at' => now()->addMinutes(30)->toIso8601String(),
        ], 'Login successful');
    }

    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone.country_code' => ['required', 'string', 'max:8'],
            'phone.number' => ['required', 'string', 'max:20'],
            'password' => ['required', 'string', 'confirmed', 'min:8'],
            'date_of_birth' => ['required', 'date'],
            'gender' => ['required', 'in:male,female,other'],
            'nid_number' => ['nullable', 'string', 'max:32', 'unique:patients,nid_number'],
            'agreed_to_terms' => ['required', 'accepted'],
        ]);

        try {
            $result = DB::transaction(function () use ($data) {
                $tenantId = DB::table('tenants')->value('id') ?? 'tenant-001';
                if (! DB::table('tenants')->where('id', $tenantId)->exists()) {
                    DB::table('tenants')->insert([
                        'id' => $tenantId,
                        'subdomain' => 'demo',
                        'plan' => 'business',
                        'status' => 'active',
                        'branding' => json_encode(['hospital_name' => 'Demo Medical Center']),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                $user = User::create([
                    'tenant_id' => $tenantId,
                    'name' => $data['full_name'],
                    'full_name' => $data['full_name'],
                    'role' => 'patient',
                    'email' => strtolower($data['email']),
                    'phone_country_code' => $data['phone']['country_code'],
                    'phone_number' => $data['phone']['number'],
                    'gender' => $data['gender'],
                    'date_of_birth' => $data['date_of_birth'],
                    'status' => 'pending_verification',
                    'email_verified' => false,
                    'phone_verified' => false,
                    'two_factor_enabled' => false,
                    'password' => $data['password'],
                ]);

                $patientId = 'patient-'.str_pad((string) (DB::table('patients')->count() + 1), 3, '0', STR_PAD_LEFT);
                $mrn = $this->generateMrn();
                DB::table('patients')->insert([
                    'id' => $patientId,
                    'tenant_id' => $tenantId,
                    'user_id' => $user->id,
                    'mrn' => $mrn,
                    'full_name' => $data['full_name'],
                    'date_of_birth' => $data['date_of_birth'],
                    'gender' => $data['gender'],
                    'nid_number' => $data['nid_number'] ?? null,
                    'phone_country_code' => $data['phone']['country_code'],
                    'phone_number' => $data['phone']['number'],
                    'email' => strtolower($data['email']),
                    'address' => json_encode([
                        'line1' => '',
                        'city' => '',
                        'district' => '',
                        'division' => '',
                        'postal_code' => '',
                        'country' => 'Bangladesh',
                    ]),
                    'emergency_contacts' => json_encode([]),
                    'medical_history' => json_encode([
                        'allergies' => [],
                        'chronic_conditions' => [],
                        'current_medications' => [],
                        'past_surgeries' => [],
                        'family_history' => [],
                    ]),
                    'patient_type' => 'self_registered',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                return ['user_id' => (string) $user->id, 'identifier' => strtolower($data['email'])];
            });
        } catch (\Throwable $e) {
            Log::error('Registration DB write failed', ['error' => $e->getMessage()]);
            return $this->error('Database write failed during registration. Please try again.', Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        try {
            $this->issueOtp($result['identifier'], 'registration', 'email', $result['user_id']);
        } catch (\Throwable $e) {
            Log::error('Registration OTP send failed', ['error' => $e->getMessage(), 'identifier' => $result['identifier']]);
            return $this->error('Registration created, but OTP email could not be sent. Please retry OTP.', Response::HTTP_SERVICE_UNAVAILABLE);
        }

        return $this->ok([
            'user_id' => $result['user_id'],
            'otp_sent_to' => $result['identifier'],
        ], 'OTP sent to your email');
    }

    public function verifyOtp(Request $request): JsonResponse
    {
        $data = $request->validate([
            'identifier' => ['required', 'string'],
            'otp_code' => ['required', 'string'],
            'purpose' => ['required', 'string'],
        ]);

        $identifier = strtolower(trim($data['identifier']));
        $otp = DB::table('otp_verifications')
            ->where('identifier', $identifier)
            ->where('purpose', $data['purpose'])
            ->whereNull('verified_at')
            ->orderByDesc('id')
            ->first();

        if (! $otp) {
            return $this->error('OTP not found. Please request a new code.', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (Carbon::parse($otp->expires_at)->isPast()) {
            return $this->error('OTP has expired. Please request a new code.', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if ((int) $otp->attempts >= (int) $otp->max_attempts) {
            return $this->error('Too many invalid attempts. Please request a new OTP.', Response::HTTP_TOO_MANY_REQUESTS);
        }

        if (! Hash::check($data['otp_code'], $otp->otp_hash)) {
            DB::table('otp_verifications')->where('id', $otp->id)->update([
                'attempts' => (int) $otp->attempts + 1,
                'updated_at' => now(),
            ]);
            return $this->error('Invalid OTP code', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        DB::table('otp_verifications')->where('id', $otp->id)->update([
            'verified_at' => now(),
            'updated_at' => now(),
        ]);

        $payload = ['verified' => true];
        if ($data['purpose'] === 'registration') {
            User::where('email', $identifier)->update([
                'email_verified' => true,
                'status' => 'active',
                'updated_at' => now(),
            ]);
            $payload['mrn'] = DB::table('patients')
                ->where('email', $identifier)
                ->value('mrn') ?: $this->generateMrn();
        }

        return $this->ok($payload, 'OTP verified');
    }

    public function resendOtp(Request $request): JsonResponse
    {
        $data = $request->validate([
            'identifier' => ['required', 'string'],
            'purpose' => ['required', 'string'],
        ]);

        $identifier = strtolower(trim($data['identifier']));
        try {
            $this->issueOtp($identifier, $data['purpose'], 'email', null);
        } catch (\Throwable $e) {
            Log::error('Resend OTP failed', ['error' => $e->getMessage(), 'identifier' => $identifier, 'purpose' => $data['purpose']]);
            return $this->error('Could not send OTP right now. Please check SMTP settings and try again.', Response::HTTP_SERVICE_UNAVAILABLE);
        }

        return $this->ok(['sent' => true, 'otp_sent_to' => $identifier], 'A new OTP has been sent');
    }

    public function requestPasswordReset(Request $request): JsonResponse
    {
        $data = $request->validate(['email' => ['required', 'email']]);
        return $this->ok(['sent' => true], "Reset link sent to {$data['email']}");
    }

    public function setup2FA(): JsonResponse
    {
        return $this->ok([
            'qr_code_url' => 'otpauth://totp/HMS:admin@demo.hms.com.bd?secret=JBSWY3DPEHPK3PXP&issuer=HMS',
            'secret' => 'JBSWY3DPEHPK3PXP',
            'backup_codes' => collect(range(1, 8))->map(fn () => strtoupper(Str::random(8)))->values(),
        ]);
    }

    public function logout(): JsonResponse
    {
        return $this->ok(['success' => true]);
    }

    public function currentUser(): JsonResponse
    {
        $user = User::orderBy('id')->first();
        if (! $user) {
            return $this->error('No user found', Response::HTTP_NOT_FOUND);
        }

        return $this->ok([
            'user' => $this->mapUser($user),
            'tenant' => $user->tenant_id ? $this->tenantById($user->tenant_id) : null,
            'access_token' => 'mock-token',
            'refresh_token' => 'mock-refresh',
            'expires_at' => now()->addMinutes(30)->toIso8601String(),
        ]);
    }

    public function currentTenant(): JsonResponse
    {
        $tenant = DB::table('tenants')->orderBy('id')->first();
        return $tenant
            ? $this->ok($this->mapTenant($tenant))
            : $this->error('Tenant not found', Response::HTTP_NOT_FOUND);
    }

    public function dashboardKpis(): JsonResponse
    {
        $today = now()->startOfDay();

        $totalPatients = DB::table('patients')->count();
        $appointmentsToday = DB::table('appointments')->where('scheduled_at', '>=', $today)->count();
        $revenueToday = (float) DB::table('bills')->where('bill_date', '>=', $today)->sum('amount_paid_bdt');
        $revenueMonth = (float) DB::table('bills')->where('bill_date', '>=', now()->startOfMonth())->sum('amount_paid_bdt');
        $totalBeds = DB::table('beds')->count();
        $occupiedBeds = DB::table('beds')->where('status', 'occupied')->count();
        $bedOccupancy = $totalBeds > 0 ? round(($occupiedBeds / $totalBeds) * 100, 1) : 0;

        return $this->ok([
            'total_patients' => $totalPatients,
            'total_patients_delta_percent' => 0,
            'appointments_today' => $appointmentsToday,
            'appointments_today_delta_percent' => 0,
            'revenue_today_bdt' => $revenueToday,
            'revenue_today_delta_percent' => 0,
            'revenue_month_bdt' => $revenueMonth,
            'revenue_month_delta_percent' => 0,
            'bed_occupancy_rate' => $bedOccupancy,
            'active_doctors' => DB::table('users')->where('role', 'doctor')->where('status', 'active')->count(),
            'pending_lab_tests' => DB::table('lab_tests')->whereIn('status', ['ordered', 'sample_collected', 'in_progress'])->count(),
            'pending_prescriptions' => DB::table('prescriptions')->whereIn('status', ['draft', 'signed'])->count(),
            'active_alerts' => DB::table('alerts')->whereNull('acknowledged_at')->count(),
            'critical_alerts' => DB::table('alerts')->where('severity', 'critical')->whereNull('acknowledged_at')->count(),
        ]);
    }

    public function chartSeries(string $key): JsonResponse
    {
        $rows = DB::table('analytics_series')
            ->where('series_key', $key)
            ->orderBy('id')
            ->get()
            ->map(fn ($row) => ['label' => $row->label, 'value' => (float) $row->value])
            ->values();

        return $this->ok($rows);
    }

    public function doctorPerformance(): JsonResponse
    {
        $rows = DB::table('doctor_performances as dp')
            ->join('users as u', 'u.id', '=', 'dp.doctor_id')
            ->select('dp.*', 'u.full_name', 'u.doctor_profile')
            ->orderBy('dp.id')
            ->get()
            ->map(function ($row) {
                $doctorProfile = $this->decodeJson($row->doctor_profile ?? null);
                return [
                    'doctor_id' => (string) $row->doctor_id,
                    'doctor_name' => $row->full_name,
                    'specialty' => $doctorProfile['specialty'] ?? 'General',
                    'patients_seen' => (int) $row->patients_seen,
                    'revenue_generated_bdt' => (float) $row->revenue_generated_bdt,
                    'avg_appointment_minutes' => (int) $row->avg_appointment_minutes,
                    'patient_satisfaction_score' => (float) $row->patient_satisfaction_score,
                ];
            })
            ->values();

        return $this->ok($rows);
    }

    public function listPatients(Request $request): JsonResponse
    {
        $query = DB::table('patients');

        if ($request->filled('q')) {
            $q = strtolower((string) $request->string('q'));
            $query->where(function ($inner) use ($q) {
                $inner
                    ->whereRaw('lower(full_name) like ?', ["%{$q}%"])
                    ->orWhereRaw('lower(mrn) like ?', ["%{$q}%"])
                    ->orWhereRaw('lower(phone_number) like ?', ["%{$q}%"]);
            });
        }

        return $this->ok($query->orderBy('created_at', 'desc')->get()->map(fn ($row) => $this->mapPatient($row))->values());
    }

    public function getPatient(string $id): JsonResponse
    {
        $row = DB::table('patients')->where('id', $id)->first();
        return $row ? $this->ok($this->mapPatient($row)) : $this->error('Patient not found', Response::HTTP_NOT_FOUND);
    }

    public function getPatientByMrn(string $mrn): JsonResponse
    {
        $row = DB::table('patients')->where('mrn', $mrn)->first();
        return $row ? $this->ok($this->mapPatient($row)) : $this->error('Patient not found', Response::HTTP_NOT_FOUND);
    }

    public function patientTimeline(string $patientId): JsonResponse
    {
        $lookupId = $this->resolvePatientId($patientId);
        $rows = DB::table('health_timeline_events')
            ->where('patient_id', $lookupId)
            ->orderByDesc('event_date')
            ->get()
            ->map(fn ($row) => [
                'id' => $row->id,
                'patient_id' => $row->patient_id,
                'event_type' => $row->event_type,
                'event_date' => $this->iso($row->event_date),
                'title' => $row->title,
                'description' => $row->description,
                'doctor_name' => $row->doctor_name,
                'department' => $row->department,
                'attachment_url' => $row->attachment_url,
                'reference_id' => $row->reference_id,
                'icon' => $row->icon,
            ])
            ->values();

        return $this->ok($rows);
    }

    public function listAppointments(Request $request): JsonResponse
    {
        $query = DB::table('appointments as a')
            ->leftJoin('patients as p', 'p.id', '=', 'a.patient_id')
            ->leftJoin('users as d', 'd.id', '=', 'a.doctor_id')
            ->select('a.*', 'p.mrn as patient_mrn', 'p.full_name as patient_name', 'p.phone_country_code', 'p.phone_number', 'd.full_name as doctor_name', 'd.doctor_profile');

        if ($request->filled('doctor_id')) {
            $query->where('a.doctor_id', (string) $request->input('doctor_id'));
        }
        if ($request->filled('status')) {
            $query->where('a.status', (string) $request->input('status'));
        }
        if ($request->filled('patient_id')) {
            $patientFilter = (string) $request->input('patient_id');
            $resolved = $this->resolvePatientId($patientFilter);
            $query->where('a.patient_id', $resolved);
        }

        return $this->ok($query->orderByDesc('a.scheduled_at')->get()->map(fn ($row) => $this->mapAppointment($row))->values());
    }

    public function getTodayAppointments(): JsonResponse
    {
        $today = now()->toDateString();
        $rows = DB::table('appointments as a')
            ->leftJoin('patients as p', 'p.id', '=', 'a.patient_id')
            ->leftJoin('users as d', 'd.id', '=', 'a.doctor_id')
            ->select('a.*', 'p.mrn as patient_mrn', 'p.full_name as patient_name', 'p.phone_country_code', 'p.phone_number', 'd.full_name as doctor_name', 'd.doctor_profile')
            ->whereDate('a.scheduled_at', $today)
            ->orderBy('a.scheduled_at')
            ->get()
            ->map(fn ($row) => $this->mapAppointment($row))
            ->values();

        return $this->ok($rows);
    }

    public function getAppointment(string $id): JsonResponse
    {
        $row = DB::table('appointments as a')
            ->leftJoin('patients as p', 'p.id', '=', 'a.patient_id')
            ->leftJoin('users as d', 'd.id', '=', 'a.doctor_id')
            ->select('a.*', 'p.mrn as patient_mrn', 'p.full_name as patient_name', 'p.phone_country_code', 'p.phone_number', 'd.full_name as doctor_name', 'd.doctor_profile')
            ->where('a.id', $id)
            ->first();

        return $row ? $this->ok($this->mapAppointment($row)) : $this->error('Appointment not found', Response::HTTP_NOT_FOUND);
    }

    public function createAppointment(Request $request): JsonResponse
    {
        $data = $request->validate([
            'patient_id' => ['required', 'string'],
            'doctor_id' => ['required', 'string'],
            'appointment_type' => ['required', 'in:consultation,follow_up,teleconsultation,procedure,emergency'],
            'scheduled_at' => ['required', 'date'],
            'duration_minutes' => ['nullable', 'integer', 'min:5', 'max:240'],
            'reason' => ['required', 'string', 'max:1500'],
            'notes' => ['nullable', 'string', 'max:3000'],
        ]);

        $resolvedPatientId = $this->resolvePatientId((string) $data['patient_id']);
        $patient = DB::table('patients')->where('id', $resolvedPatientId)->first();
        if (! $patient) {
            return $this->error('Patient not found', Response::HTTP_NOT_FOUND);
        }

        $doctor = DB::table('users')
            ->where('id', (string) $data['doctor_id'])
            ->where('role', 'doctor')
            ->first();
        if (! $doctor) {
            return $this->error('Doctor not found', Response::HTTP_NOT_FOUND);
        }

        $id = 'appt-'.Str::uuid();
        $appointmentNumber = $this->generateAppointmentNumber();
        $scheduledAt = Carbon::parse($data['scheduled_at']);
        $duration = (int) ($data['duration_minutes'] ?? 30);
        $tenantId = $patient->tenant_id ?: ($doctor->tenant_id ?: (DB::table('tenants')->value('id') ?? 'tenant-001'));
        $createdAt = now();

        DB::transaction(function () use ($id, $appointmentNumber, $resolvedPatientId, $patient, $doctor, $data, $scheduledAt, $duration, $tenantId, $createdAt): void {
            DB::table('appointments')->insert([
                'id' => $id,
                'tenant_id' => $tenantId,
                'appointment_number' => $appointmentNumber,
                'patient_id' => $resolvedPatientId,
                'doctor_id' => $doctor->id,
                'department' => null,
                'appointment_type' => $data['appointment_type'],
                'status' => 'scheduled',
                'source' => 'online_patient',
                'scheduled_at' => $scheduledAt,
                'duration_minutes' => $duration,
                'reason' => trim((string) $data['reason']),
                'notes' => isset($data['notes']) ? trim((string) $data['notes']) : null,
                'fee_bdt' => 0,
                'payment_status' => 'pending',
                'reminder_24h_sent' => false,
                'reminder_2h_sent' => false,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);

            DB::table('notifications')->insert([
                'id' => 'notif-'.Str::uuid(),
                'alert_id' => null,
                'user_id' => $doctor->id,
                'title' => 'New appointment booked',
                'message' => "{$patient->full_name} booked {$data['appointment_type']} on {$scheduledAt->format('M d, Y h:i A')}.",
                'severity' => 'info',
                'is_read' => false,
                'read_at' => null,
                'action_url' => '/doctor/appointments?appointment_id='.$id,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);
        });

        $row = DB::table('appointments as a')
            ->leftJoin('patients as p', 'p.id', '=', 'a.patient_id')
            ->leftJoin('users as d', 'd.id', '=', 'a.doctor_id')
            ->select('a.*', 'p.mrn as patient_mrn', 'p.full_name as patient_name', 'p.phone_country_code', 'p.phone_number', 'd.full_name as doctor_name', 'd.doctor_profile')
            ->where('a.id', $id)
            ->first();

        return $this->ok($this->mapAppointment($row), 'Appointment created');
    }

    public function listPrescriptions(Request $request): JsonResponse
    {
        $query = DB::table('prescriptions as pr')
            ->leftJoin('patients as p', 'p.id', '=', 'pr.patient_id')
            ->leftJoin('users as d', 'd.id', '=', 'pr.doctor_id')
            ->select('pr.*', 'p.mrn as patient_mrn', 'p.full_name as patient_name', 'p.gender as patient_gender', 'd.full_name as doctor_name', 'd.doctor_profile');

        if ($request->filled('doctor_id')) {
            $query->where('pr.doctor_id', (string) $request->input('doctor_id'));
        }
        if ($request->filled('patient_id')) {
            $resolved = $this->resolvePatientId((string) $request->input('patient_id'));
            $query->where('pr.patient_id', $resolved);
        }

        $rows = $query->orderByDesc('pr.created_at')->get()->map(fn ($row) => $this->mapPrescription($row))->values();
        return $this->ok($rows);
    }

    public function getPrescription(string $id): JsonResponse
    {
        $row = DB::table('prescriptions as pr')
            ->leftJoin('patients as p', 'p.id', '=', 'pr.patient_id')
            ->leftJoin('users as d', 'd.id', '=', 'pr.doctor_id')
            ->select('pr.*', 'p.mrn as patient_mrn', 'p.full_name as patient_name', 'p.gender as patient_gender', 'd.full_name as doctor_name', 'd.doctor_profile')
            ->where('pr.id', $id)
            ->first();

        return $row ? $this->ok($this->mapPrescription($row)) : $this->error('Prescription not found', Response::HTTP_NOT_FOUND);
    }

    public function listLabTests(Request $request): JsonResponse
    {
        $query = DB::table('lab_tests as lt')
            ->leftJoin('patients as p', 'p.id', '=', 'lt.patient_id')
            ->leftJoin('users as d', 'd.id', '=', 'lt.ordered_by_doctor_id')
            ->leftJoin('users as tech', 'tech.id', '=', 'lt.entered_by_technician_id')
            ->select(
                'lt.*',
                'p.mrn as patient_mrn',
                'p.full_name as patient_name',
                'p.gender as patient_gender',
                'd.full_name as doctor_name',
                'tech.full_name as tech_name'
            );

        if ($request->filled('status')) {
            $query->where('lt.status', (string) $request->input('status'));
        }
        if ($request->filled('patient_id')) {
            $resolved = $this->resolvePatientId((string) $request->input('patient_id'));
            $query->where('lt.patient_id', $resolved);
        }

        return $this->ok($query->orderByDesc('lt.created_at')->get()->map(fn ($row) => $this->mapLabTest($row))->values());
    }

    public function getLabTest(string $id): JsonResponse
    {
        $row = DB::table('lab_tests as lt')
            ->leftJoin('patients as p', 'p.id', '=', 'lt.patient_id')
            ->leftJoin('users as d', 'd.id', '=', 'lt.ordered_by_doctor_id')
            ->leftJoin('users as tech', 'tech.id', '=', 'lt.entered_by_technician_id')
            ->select(
                'lt.*',
                'p.mrn as patient_mrn',
                'p.full_name as patient_name',
                'p.gender as patient_gender',
                'd.full_name as doctor_name',
                'tech.full_name as tech_name'
            )
            ->where('lt.id', $id)
            ->first();

        return $row ? $this->ok($this->mapLabTest($row)) : $this->error('Lab test not found', Response::HTTP_NOT_FOUND);
    }

    public function listPharmacyOrders(): JsonResponse
    {
        $rows = DB::table('pharmacy_orders as po')
            ->leftJoin('prescriptions as pr', 'pr.id', '=', 'po.prescription_id')
            ->leftJoin('patients as p', 'p.id', '=', 'po.patient_id')
            ->leftJoin('users as d', 'd.id', '=', 'pr.doctor_id')
            ->leftJoin('users as disp', 'disp.id', '=', 'po.dispensed_by')
            ->select('po.*', 'pr.prescription_number', 'p.mrn as patient_mrn', 'p.full_name as patient_name', 'p.phone_country_code', 'p.phone_number', 'd.full_name as doctor_name', 'disp.full_name as dispensed_by_name')
            ->orderByDesc('po.created_at')
            ->get()
            ->map(fn ($row) => [
                'id' => $row->id,
                'tenant_id' => $row->tenant_id,
                'order_number' => $row->order_number,
                'prescription_id' => $row->prescription_id,
                'prescription_number' => $row->prescription_number,
                'patient_id' => $row->patient_id,
                'patient_mrn' => $row->patient_mrn,
                'patient_name' => $row->patient_name,
                'patient_phone' => trim(($row->phone_country_code ?? '').' '.($row->phone_number ?? '')),
                'doctor_name' => $row->doctor_name,
                'status' => $row->status,
                'total_amount_bdt' => (float) $row->total_amount_bdt,
                'items' => $this->decodeJson($row->items) ?? [],
                'dispensed_by' => $row->dispensed_by ? (string) $row->dispensed_by : null,
                'dispensed_by_name' => $row->dispensed_by_name,
                'dispensed_at' => $this->iso($row->dispensed_at),
                'payment_status' => $row->payment_status,
                'created_at' => $this->iso($row->created_at),
                'updated_at' => $this->iso($row->updated_at),
            ])
            ->values();

        return $this->ok($rows);
    }

    public function listInventory(): JsonResponse
    {
        $rows = DB::table('medicine_inventories')->orderBy('generic_name')->get()->map(function ($row) {
            return [
                'id' => $row->id,
                'tenant_id' => $row->tenant_id,
                'medicine_id' => $row->medicine_id,
                'generic_name' => $row->generic_name,
                'brand_name' => $row->brand_name,
                'strength' => $row->strength,
                'manufacturer' => $row->manufacturer,
                'batch_number' => $row->batch_number,
                'manufacture_date' => $row->manufacture_date,
                'expiry_date' => $row->expiry_date,
                'current_stock' => (int) $row->current_stock,
                'min_threshold' => (int) $row->min_threshold,
                'max_threshold' => (int) $row->max_threshold,
                'unit_cost_bdt' => (float) $row->unit_cost_bdt,
                'selling_price_bdt' => (float) $row->selling_price_bdt,
                'is_expired' => (bool) $row->is_expired,
                'is_low_stock' => (bool) $row->is_low_stock,
                'is_out_of_stock' => (bool) $row->is_out_of_stock,
                'created_at' => $this->iso($row->created_at),
                'updated_at' => $this->iso($row->updated_at),
            ];
        })->values();

        return $this->ok($rows);
    }

    public function listLowStockInventory(): JsonResponse
    {
        $rows = DB::table('medicine_inventories')
            ->where(function ($query) {
                $query->where('is_low_stock', true)->orWhere('is_out_of_stock', true);
            })
            ->orderBy('generic_name')
            ->get()
            ->map(fn ($row) => [
                'id' => $row->id,
                'tenant_id' => $row->tenant_id,
                'medicine_id' => $row->medicine_id,
                'generic_name' => $row->generic_name,
                'brand_name' => $row->brand_name,
                'strength' => $row->strength,
                'manufacturer' => $row->manufacturer,
                'batch_number' => $row->batch_number,
                'manufacture_date' => $row->manufacture_date,
                'expiry_date' => $row->expiry_date,
                'current_stock' => (int) $row->current_stock,
                'min_threshold' => (int) $row->min_threshold,
                'max_threshold' => (int) $row->max_threshold,
                'unit_cost_bdt' => (float) $row->unit_cost_bdt,
                'selling_price_bdt' => (float) $row->selling_price_bdt,
                'is_expired' => (bool) $row->is_expired,
                'is_low_stock' => (bool) $row->is_low_stock,
                'is_out_of_stock' => (bool) $row->is_out_of_stock,
                'created_at' => $this->iso($row->created_at),
                'updated_at' => $this->iso($row->updated_at),
            ])
            ->values();

        return $this->ok($rows);
    }

    public function listWards(): JsonResponse
    {
        $rows = DB::table('wards as w')
            ->leftJoin('users as nurse', 'nurse.id', '=', 'w.head_nurse_id')
            ->select('w.*', 'nurse.full_name as head_nurse_name')
            ->orderBy('w.name')
            ->get()
            ->map(fn ($row) => [
                'id' => $row->id,
                'tenant_id' => $row->tenant_id,
                'name' => $row->name,
                'ward_type' => $row->ward_type,
                'floor' => $row->floor,
                'total_beds' => (int) $row->total_beds,
                'available_beds' => (int) $row->available_beds,
                'occupied_beds' => (int) $row->occupied_beds,
                'reserved_beds' => (int) $row->reserved_beds,
                'maintenance_beds' => (int) $row->maintenance_beds,
                'occupancy_rate' => (float) $row->occupancy_rate,
                'capacity_threshold' => (int) $row->capacity_threshold,
                'threshold_alert_sent' => (bool) $row->threshold_alert_sent,
                'daily_rate_bdt' => (float) $row->daily_rate_bdt,
                'head_nurse_id' => $row->head_nurse_id ? (string) $row->head_nurse_id : null,
                'head_nurse_name' => $row->head_nurse_name,
                'created_at' => $this->iso($row->created_at),
                'updated_at' => $this->iso($row->updated_at),
            ])
            ->values();

        return $this->ok($rows);
    }

    public function listBeds(Request $request): JsonResponse
    {
        $query = DB::table('beds as b')
            ->leftJoin('wards as w', 'w.id', '=', 'b.ward_id')
            ->leftJoin('patients as p', 'p.id', '=', 'b.current_patient_id')
            ->select('b.*', 'w.name as ward_name', 'p.mrn as patient_mrn', 'p.full_name as patient_name');

        if ($request->filled('ward_id')) {
            $query->where('b.ward_id', (string) $request->input('ward_id'));
        }

        $rows = $query->orderBy('b.bed_number')->get()->map(fn ($row) => [
            'id' => $row->id,
            'tenant_id' => $row->tenant_id,
            'ward_id' => $row->ward_id,
            'ward_name' => $row->ward_name,
            'bed_number' => $row->bed_number,
            'status' => $row->status,
            'has_oxygen' => (bool) $row->has_oxygen,
            'has_ventilator' => (bool) $row->has_ventilator,
            'has_monitor' => (bool) $row->has_monitor,
            'daily_rate_bdt' => (float) $row->daily_rate_bdt,
            'current_patient_id' => $row->current_patient_id,
            'current_patient_mrn' => $row->patient_mrn,
            'current_patient_name' => $row->patient_name,
            'admission_date' => $this->iso($row->admission_date),
            'expected_discharge_date' => $this->iso($row->expected_discharge_date),
            'created_at' => $this->iso($row->created_at),
            'updated_at' => $this->iso($row->updated_at),
        ])->values();

        return $this->ok($rows);
    }

    public function listBills(Request $request): JsonResponse
    {
        $query = DB::table('bills as b')
            ->leftJoin('patients as p', 'p.id', '=', 'b.patient_id')
            ->select('b.*', 'p.mrn as patient_mrn', 'p.full_name as patient_name', 'p.phone_country_code', 'p.phone_number');

        if ($request->filled('status')) {
            $query->where('b.status', (string) $request->input('status'));
        }
        if ($request->filled('patient_id')) {
            $resolved = $this->resolvePatientId((string) $request->input('patient_id'));
            $query->where('b.patient_id', $resolved);
        }

        $rows = $query->orderByDesc('b.bill_date')->get()->map(fn ($row) => $this->mapBill($row))->values();
        return $this->ok($rows);
    }

    public function getBill(string $id): JsonResponse
    {
        $row = DB::table('bills as b')
            ->leftJoin('patients as p', 'p.id', '=', 'b.patient_id')
            ->select('b.*', 'p.mrn as patient_mrn', 'p.full_name as patient_name', 'p.phone_country_code', 'p.phone_number')
            ->where('b.id', $id)
            ->first();
        return $row ? $this->ok($this->mapBill($row)) : $this->error('Bill not found', Response::HTTP_NOT_FOUND);
    }

    public function listAlerts(Request $request): JsonResponse
    {
        $query = DB::table('alerts');
        if ($request->filled('severity')) {
            $query->where('severity', (string) $request->input('severity'));
        }
        if ($request->filled('status')) {
            $query->where('status', (string) $request->input('status'));
        }
        $rows = $query->orderByDesc('created_at')->get()->map(fn ($row) => $this->mapAlert($row))->values();
        return $this->ok($rows);
    }

    public function activeAlerts(): JsonResponse
    {
        $rows = DB::table('alerts')
            ->whereNull('acknowledged_at')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($row) => $this->mapAlert($row))
            ->values();
        return $this->ok($rows);
    }

    public function notifications(Request $request): JsonResponse
    {
        $data = $request->validate([
            'user_id' => ['nullable', 'string'],
            'unread_only' => ['nullable', 'boolean'],
        ]);

        $query = DB::table('notifications');
        if (! empty($data['user_id'])) {
            $query->where('user_id', (string) $data['user_id']);
        }
        if (! empty($data['unread_only'])) {
            $query->where('is_read', false);
        }

        $rows = $query
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($row) => [
                'id' => $row->id,
                'alert_id' => $row->alert_id,
                'user_id' => $row->user_id ? (string) $row->user_id : null,
                'title' => $row->title,
                'message' => $row->message,
                'severity' => $row->severity,
                'is_read' => (bool) $row->is_read,
                'read_at' => $this->iso($row->read_at),
                'action_url' => $row->action_url,
                'created_at' => $this->iso($row->created_at),
            ])
            ->values();
        return $this->ok($rows);
    }

    public function markNotificationRead(Request $request, string $id): JsonResponse
    {
        $data = $request->validate([
            'user_id' => ['required', 'string'],
        ]);

        $updated = DB::table('notifications')
            ->where('id', $id)
            ->where('user_id', (string) $data['user_id'])
            ->update([
                'is_read' => true,
                'read_at' => now(),
                'updated_at' => now(),
            ]);

        if (! $updated) {
            return $this->error('Notification not found', Response::HTTP_NOT_FOUND);
        }

        $row = DB::table('notifications')->where('id', $id)->first();

        return $this->ok([
            'id' => $row->id,
            'alert_id' => $row->alert_id,
            'user_id' => $row->user_id ? (string) $row->user_id : null,
            'title' => $row->title,
            'message' => $row->message,
            'severity' => $row->severity,
            'is_read' => (bool) $row->is_read,
            'read_at' => $this->iso($row->read_at),
            'action_url' => $row->action_url,
            'created_at' => $this->iso($row->created_at),
        ], 'Notification marked as read');
    }

    public function acknowledgeAlert(string $id): JsonResponse
    {
        DB::table('alerts')->where('id', $id)->update([
            'acknowledged_at' => now(),
            'updated_at' => now(),
        ]);
        return $this->ok(['success' => true]);
    }

    public function activeEmergencies(): JsonResponse
    {
        $rows = DB::table('emergency_requests')
            ->whereNotIn('status', ['cancelled', 'handed_over', 'false_alarm'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($row) => $this->mapEmergency($row))
            ->values();
        return $this->ok($rows);
    }

    public function triggerSos(): JsonResponse
    {
        $id = 'emr-'.str_pad((string) (DB::table('emergency_requests')->count() + 1), 3, '0', STR_PAD_LEFT);
        $requestNumber = 'EMR-'.now()->format('Y').'-'.str_pad((string) random_int(1, 9999), 4, '0', STR_PAD_LEFT);
        DB::table('emergency_requests')->insert([
            'id' => $id,
            'tenant_id' => DB::table('tenants')->value('id') ?? 'tenant-001',
            'request_number' => $requestNumber,
            'patient_name' => 'Unknown',
            'patient_phone_country_code' => '+880',
            'patient_phone_number' => '1712345000',
            'status' => 'sos_received',
            'priority' => 'high',
            'pickup_location' => json_encode(['latitude' => 23.8103, 'longitude' => 90.4125, 'address' => 'Dhaka', 'updated_at' => now()->toIso8601String()]),
            'sos_received_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $row = DB::table('emergency_requests')->where('id', $id)->first();
        return $this->ok($this->mapEmergency($row), 'Emergency dispatcher alerted');
    }

    public function listUsers(): JsonResponse
    {
        $rows = User::query()
            ->whereNotIn('role', ['super_admin', 'patient'])
            ->orderBy('full_name')
            ->get()
            ->map(fn ($user) => $this->mapUser($user))
            ->values();
        return $this->ok($rows);
    }

    public function updateUserProfile(Request $request, string $id): JsonResponse
    {
        /** @var User|null $user */
        $user = User::query()->find($id);
        if (! $user) {
            return $this->error('User not found', Response::HTTP_NOT_FOUND);
        }

        $data = $request->validate([
            'full_name' => ['nullable', 'string', 'max:255'],
            'phone_country_code' => ['nullable', 'string', 'max:8'],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'profile_photo_url' => ['nullable', 'string', 'max:2048'],
            'profile_photo_data' => ['nullable', 'string'],
        ]);

        $updates = [];

        if (array_key_exists('full_name', $data)) {
            $fullName = trim((string) $data['full_name']);
            if ($fullName === '') {
                return $this->error('Full name is required', Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            $updates['full_name'] = $fullName;
            $updates['name'] = $fullName;
        }

        if (array_key_exists('phone_country_code', $data)) {
            $updates['phone_country_code'] = trim((string) $data['phone_country_code']);
        }
        if (array_key_exists('phone_number', $data)) {
            $updates['phone_number'] = trim((string) $data['phone_number']);
        }

        $profilePhotoUrl = array_key_exists('profile_photo_url', $data)
            ? trim((string) ($data['profile_photo_url'] ?? ''))
            : null;

        if (! empty($data['profile_photo_data'])) {
            try {
                $profilePhotoUrl = $this->persistProfilePhotoDataUrl($request, (string) $data['profile_photo_data'], (string) $user->id);
            } catch (\RuntimeException $e) {
                return $this->error($e->getMessage(), $e->getCode() > 0 ? $e->getCode() : Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        if (array_key_exists('profile_photo_url', $data) || ! empty($data['profile_photo_data'])) {
            $updates['profile_photo_url'] = $profilePhotoUrl !== '' ? $profilePhotoUrl : null;
        }

        if (count($updates) === 0) {
            return $this->ok($this->mapUser($user), 'No profile changes provided');
        }

        $updates['updated_at'] = now();
        DB::table('users')->where('id', $user->id)->update($updates);

        /** @var User|null $freshUser */
        $freshUser = User::query()->find($user->id);
        if (! $freshUser) {
            return $this->error('User not found after update', Response::HTTP_NOT_FOUND);
        }

        return $this->ok($this->mapUser($freshUser), 'Profile updated successfully');
    }

    public function listDoctors(): JsonResponse
    {
        $rows = User::query()
            ->where('role', 'doctor')
            ->orderBy('full_name')
            ->get()
            ->map(fn ($user) => $this->mapUser($user))
            ->values();
        return $this->ok($rows);
    }

    private function mapTenant(object $row): array
    {
        return [
            'id' => $row->id,
            'subdomain' => $row->subdomain,
            'plan' => $row->plan,
            'status' => $row->status,
            'branding' => $this->decodeJson($row->branding) ?? new \stdClass(),
            'address' => $this->decodeJson($row->address) ?? new \stdClass(),
            'limits' => $this->decodeJson($row->limits) ?? new \stdClass(),
            'usage' => $this->decodeJson($row->usage) ?? new \stdClass(),
            'subscription_started_at' => $this->iso($row->subscription_started_at),
            'subscription_renews_at' => $this->iso($row->subscription_renews_at),
            'created_at' => $this->iso($row->created_at),
            'updated_at' => $this->iso($row->updated_at),
        ];
    }

    private function mapUser(mixed $user): array
    {
        if ($user instanceof User) {
            $arr = $user->toArray();
        } else {
            $arr = is_array($user) ? $user : (array) $user;
        }

        return [
            'id' => (string) $arr['id'],
            'tenant_id' => $arr['tenant_id'] ?? null,
            'role' => $arr['role'] ?? 'patient',
            'email' => $arr['email'],
            'phone' => [
                'country_code' => $arr['phone_country_code'] ?? '+880',
                'number' => $arr['phone_number'] ?? '',
            ],
            'full_name' => $arr['full_name'] ?? $arr['name'] ?? '',
            'profile_photo_url' => $arr['profile_photo_url'] ?? null,
            'gender' => $arr['gender'] ?? null,
            'date_of_birth' => $arr['date_of_birth'] ?? null,
            'status' => $arr['status'] ?? 'active',
            'email_verified' => (bool) ($arr['email_verified'] ?? false),
            'phone_verified' => (bool) ($arr['phone_verified'] ?? false),
            'two_factor_enabled' => (bool) ($arr['two_factor_enabled'] ?? false),
            'last_login_at' => $this->iso($arr['last_login_at'] ?? null),
            'failed_login_attempts' => (int) ($arr['failed_login_attempts'] ?? 0),
            'doctor_profile' => $this->decodeJson($arr['doctor_profile'] ?? null),
            'nurse_profile' => $this->decodeJson($arr['nurse_profile'] ?? null),
            'lab_tech_profile' => $this->decodeJson($arr['lab_tech_profile'] ?? null),
            'pharmacist_profile' => $this->decodeJson($arr['pharmacist_profile'] ?? null),
            'patient_id' => ($arr['role'] ?? '') === 'patient'
                ? DB::table('patients')->where('user_id', $arr['id'])->value('id')
                : null,
            'mrn' => ($arr['role'] ?? '') === 'patient'
                ? DB::table('patients')->where('user_id', $arr['id'])->value('mrn')
                : null,
            'created_at' => $this->iso($arr['created_at'] ?? null),
            'updated_at' => $this->iso($arr['updated_at'] ?? null),
        ];
    }

    private function mapPatient(object $row): array
    {
        return [
            'id' => $row->id,
            'tenant_id' => $row->tenant_id,
            'mrn' => $row->mrn,
            'full_name' => $row->full_name,
            'father_name' => $row->father_name ?? null,
            'mother_name' => $row->mother_name ?? null,
            'date_of_birth' => $row->date_of_birth,
            'gender' => $row->gender,
            'marital_status' => $row->marital_status,
            'religion' => $row->religion ?? null,
            'occupation' => $row->occupation ?? null,
            'nid_number' => $row->nid_number,
            'birth_certificate_number' => $row->birth_certificate_number,
            'blood_group' => $row->blood_group,
            'phone' => [
                'country_code' => $row->phone_country_code,
                'number' => $row->phone_number,
            ],
            'email' => $row->email,
            'profile_photo_url' => $row->profile_photo_url,
            'address' => $this->decodeJson($row->address) ?? new \stdClass(),
            'occupation' => $row->occupation,
            'emergency_contacts' => $this->decodeJson($row->emergency_contacts) ?? [],
            'medical_history' => $this->decodeJson($row->medical_history) ?? [
                'allergies' => [],
                'chronic_conditions' => [],
                'current_medications' => [],
                'past_surgeries' => [],
                'family_history' => [],
            ],
            'patient_type' => $row->patient_type,
            'guardian_id' => $row->guardian_id,
            'age_years' => $row->age_years ? (int) $row->age_years : null,
            'last_visit_date' => $this->iso($row->last_visit_date),
            'total_visits' => (int) $row->total_visits,
            'outstanding_balance_bdt' => (float) $row->outstanding_balance_bdt,
            'created_at' => $this->iso($row->created_at),
            'updated_at' => $this->iso($row->updated_at),
        ];
    }

    private function mapAppointment(object $row): array
    {
        $doctorProfile = $this->decodeJson($row->doctor_profile ?? null);
        return [
            'id' => $row->id,
            'tenant_id' => $row->tenant_id,
            'appointment_number' => $row->appointment_number,
            'patient_id' => $row->patient_id,
            'patient_mrn' => $row->patient_mrn,
            'patient_name' => $row->patient_name,
            'patient_phone' => trim(($row->phone_country_code ?? '').' '.($row->phone_number ?? '')),
            'doctor_id' => (string) $row->doctor_id,
            'doctor_name' => $row->doctor_name,
            'doctor_specialty' => $doctorProfile['specialty'] ?? 'General',
            'department' => $row->department,
            'appointment_type' => $row->appointment_type,
            'status' => $row->status,
            'source' => $row->source,
            'scheduled_at' => $this->iso($row->scheduled_at),
            'duration_minutes' => (int) $row->duration_minutes,
            'reason' => $row->reason ?? '',
            'notes' => $row->notes,
            'checked_in_at' => $this->iso($row->checked_in_at),
            'started_at' => $this->iso($row->started_at),
            'completed_at' => $this->iso($row->completed_at),
            'cancelled_at' => $this->iso($row->cancelled_at),
            'cancellation_reason' => $row->cancellation_reason,
            'cancelled_by' => $row->cancelled_by ? (string) $row->cancelled_by : null,
            'fee_bdt' => (float) $row->fee_bdt,
            'payment_status' => $row->payment_status,
            'video_link' => $row->video_link,
            'video_room_id' => $row->video_room_id,
            'reminder_24h_sent' => (bool) $row->reminder_24h_sent,
            'reminder_2h_sent' => (bool) $row->reminder_2h_sent,
            'created_at' => $this->iso($row->created_at),
            'updated_at' => $this->iso($row->updated_at),
        ];
    }

    private function mapPrescription(object $row): array
    {
        $doctorProfile = $this->decodeJson($row->doctor_profile ?? null);
        return [
            'id' => $row->id,
            'tenant_id' => $row->tenant_id,
            'prescription_number' => $row->prescription_number,
            'appointment_id' => $row->appointment_id,
            'patient_id' => $row->patient_id,
            'patient_mrn' => $row->patient_mrn,
            'patient_name' => $row->patient_name,
            'patient_age' => null,
            'patient_gender' => $row->patient_gender,
            'doctor_id' => (string) $row->doctor_id,
            'doctor_name' => $row->doctor_name,
            'doctor_bmdc_number' => $doctorProfile['bmdc_number'] ?? null,
            'doctor_specialty' => $doctorProfile['specialty'] ?? 'General',
            'diagnosis' => $row->diagnosis,
            'diagnosis_icd10' => $row->diagnosis_icd10,
            'chief_complaint' => $row->chief_complaint,
            'vital_signs' => $this->decodeJson($row->vital_signs) ?? new \stdClass(),
            'medicines' => $this->decodeJson($row->medicines) ?? [],
            'advice' => $row->advice,
            'follow_up_date' => $this->iso($row->follow_up_date),
            'follow_up_reminder_set' => (bool) $row->follow_up_reminder_set,
            'status' => $row->status,
            'signed_at' => $this->iso($row->signed_at),
            'acknowledged_warnings' => $this->decodeJson($row->acknowledged_warnings) ?? [],
            'created_at' => $this->iso($row->created_at),
            'updated_at' => $this->iso($row->updated_at),
        ];
    }

    private function mapLabTest(object $row): array
    {
        return [
            'id' => $row->id,
            'tenant_id' => $row->tenant_id,
            'test_number' => $row->test_number,
            'patient_id' => $row->patient_id,
            'patient_mrn' => $row->patient_mrn,
            'patient_name' => $row->patient_name,
            'patient_age' => null,
            'patient_gender' => $row->patient_gender,
            'ordered_by_doctor_id' => $row->ordered_by_doctor_id ? (string) $row->ordered_by_doctor_id : null,
            'ordered_by_doctor_name' => $row->doctor_name,
            'catalog_item_id' => $row->catalog_item_id,
            'test_name' => $row->test_name,
            'test_code' => $row->test_code,
            'category' => $row->category,
            'priority' => $row->priority,
            'status' => $row->status,
            'ordered_at' => $this->iso($row->ordered_at),
            'sample_collected_at' => $this->iso($row->sample_collected_at),
            'result_entered_at' => $this->iso($row->result_entered_at),
            'entered_by_technician_id' => $row->entered_by_technician_id ? (string) $row->entered_by_technician_id : null,
            'entered_by_technician_name' => $row->tech_name,
            'verified_at' => $this->iso($row->verified_at),
            'reported_at' => $this->iso($row->reported_at),
            'results' => $this->decodeJson($row->results) ?? [],
            'overall_flag' => $row->overall_flag,
            'clinical_notes' => $row->clinical_notes,
            'price_bdt' => (float) $row->price_bdt,
            'payment_status' => $row->payment_status,
            'critical_alert_triggered' => (bool) $row->critical_alert_triggered,
            'critical_alert_sent_at' => $this->iso($row->critical_alert_sent_at),
            'created_at' => $this->iso($row->created_at),
            'updated_at' => $this->iso($row->updated_at),
        ];
    }

    private function mapBill(object $row): array
    {
        return [
            'id' => $row->id,
            'tenant_id' => $row->tenant_id,
            'bill_number' => $row->bill_number,
            'patient_id' => $row->patient_id,
            'patient_mrn' => $row->patient_mrn,
            'patient_name' => $row->patient_name,
            'patient_phone' => trim(($row->phone_country_code ?? '').' '.($row->phone_number ?? '')),
            'status' => $row->status,
            'bill_date' => $this->iso($row->bill_date),
            'line_items' => $this->decodeJson($row->line_items) ?? [],
            'subtotal_bdt' => (float) $row->subtotal_bdt,
            'total_tax_bdt' => (float) $row->total_tax_bdt,
            'total_discount_bdt' => (float) $row->total_discount_bdt,
            'total_amount_bdt' => (float) $row->total_amount_bdt,
            'amount_paid_bdt' => (float) $row->amount_paid_bdt,
            'amount_outstanding_bdt' => (float) $row->amount_outstanding_bdt,
            'payments' => $this->decodeJson($row->payments) ?? [],
            'discount_applied_by' => $row->discount_applied_by ? (string) $row->discount_applied_by : null,
            'discount_reason' => $row->discount_reason,
            'created_at' => $this->iso($row->created_at),
            'updated_at' => $this->iso($row->updated_at),
        ];
    }

    private function mapAlert(object $row): array
    {
        return [
            'id' => $row->id,
            'tenant_id' => $row->tenant_id,
            'trigger_type' => $row->trigger_type,
            'severity' => $row->severity,
            'status' => $row->status,
            'title' => $row->title,
            'message' => $row->message,
            'patient_id' => $row->patient_id,
            'reference_type' => $row->reference_type,
            'reference_id' => $row->reference_id,
            'recipients' => $this->decodeJson($row->recipients) ?? [],
            'channels' => $this->decodeJson($row->channels) ?? [],
            'dispatch_attempts' => $this->decodeJson($row->dispatch_attempts) ?? [],
            'triggered_at' => $this->iso($row->triggered_at),
            'first_delivered_at' => $this->iso($row->first_delivered_at),
            'acknowledged_at' => $this->iso($row->acknowledged_at),
            'escalated' => (bool) $row->escalated,
            'action_url' => $row->action_url,
            'created_at' => $this->iso($row->created_at),
            'updated_at' => $this->iso($row->updated_at),
        ];
    }

    private function mapEmergency(object $row): array
    {
        return [
            'id' => $row->id,
            'tenant_id' => $row->tenant_id,
            'request_number' => $row->request_number,
            'patient_id' => $row->patient_id,
            'patient_name' => $row->patient_name,
            'patient_phone' => [
                'country_code' => $row->patient_phone_country_code ?? '+880',
                'number' => $row->patient_phone_number ?? '',
            ],
            'requester_name' => $row->requester_name,
            'requester_relationship' => $row->requester_relationship,
            'pickup_location' => $this->decodeJson($row->pickup_location) ?? new \stdClass(),
            'destination_hospital_id' => $row->destination_hospital_id,
            'destination_hospital_name' => $row->destination_hospital_name,
            'status' => $row->status,
            'priority' => $row->priority,
            'chief_complaint' => $row->chief_complaint,
            'reported_vitals' => $this->decodeJson($row->reported_vitals) ?? new \stdClass(),
            'dispatcher_id' => $row->dispatcher_id ? (string) $row->dispatcher_id : null,
            'dispatcher_name' => $row->dispatcher_name,
            'ambulance_id' => $row->ambulance_id,
            'ambulance_number' => $row->ambulance_number,
            'sos_received_at' => $this->iso($row->sos_received_at),
            'dispatcher_assigned_at' => $this->iso($row->dispatcher_assigned_at),
            'ambulance_assigned_at' => $this->iso($row->ambulance_assigned_at),
            'ambulance_dispatched_at' => $this->iso($row->ambulance_dispatched_at),
            'estimated_arrival_time' => $this->iso($row->estimated_arrival_time),
            'er_pre_notification_sent' => (bool) $row->er_pre_notification_sent,
            'er_pre_notification_sent_at' => $this->iso($row->er_pre_notification_sent_at),
            'created_at' => $this->iso($row->created_at),
            'updated_at' => $this->iso($row->updated_at),
        ];
    }

    private function resolvePatientId(string $patientIdOrUserId): string
    {
        if (DB::table('patients')->where('id', $patientIdOrUserId)->exists()) {
            return $patientIdOrUserId;
        }

        $match = DB::table('patients')->where('user_id', $patientIdOrUserId)->value('id');
        return $match ?: $patientIdOrUserId;
    }

    private function generateMrn(): string
    {
        $existing = DB::table('patients')->where('mrn', 'like', 'HAX-%')->pluck('mrn');
        $max = $existing
            ->map(function ($mrn) {
                $parts = explode('-', (string) $mrn);
                return isset($parts[1]) ? (int) $parts[1] : 0;
            })
            ->max() ?? 10000;

        return 'HAX-'.str_pad((string) ($max + 1), 5, '0', STR_PAD_LEFT);
    }

    private function generateAppointmentNumber(): string
    {
        $year = now()->format('Y');
        for ($attempt = 0; $attempt < 20; $attempt++) {
            $candidate = 'APT-'.$year.'-'.str_pad((string) random_int(1, 9999), 4, '0', STR_PAD_LEFT);
            $exists = DB::table('appointments')->where('appointment_number', $candidate)->exists();
            if (! $exists) {
                return $candidate;
            }
        }

        return 'APT-'.$year.'-'.str_pad((string) (DB::table('appointments')->count() + 1), 4, '0', STR_PAD_LEFT);
    }

    private function decodeJson(mixed $value): mixed
    {
        if ($value === null || $value === '') {
            return null;
        }
        if (is_array($value) || is_object($value)) {
            return $value;
        }
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            return json_last_error() === JSON_ERROR_NONE ? $decoded : null;
        }
        return null;
    }

    private function iso(mixed $value): ?string
    {
        if (! $value) {
            return null;
        }
        return Carbon::parse($value)->toIso8601String();
    }

    private function tenantById(string $tenantId): ?array
    {
        $row = DB::table('tenants')->where('id', $tenantId)->first();
        return $row ? $this->mapTenant($row) : null;
    }

    private function persistProfilePhotoDataUrl(Request $request, string $dataUrl, string $userId): string
    {
        if (! preg_match('/^data:image\/([a-zA-Z0-9\+\-]+);base64,(.*)$/', $dataUrl, $matches)) {
            throw new \RuntimeException('Invalid profile photo data.', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $rawBase64 = str_replace(' ', '+', $matches[2]);
        $binary = base64_decode($rawBase64, true);
        if ($binary === false) {
            throw new \RuntimeException('Invalid profile photo encoding.', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $maxSizeBytes = 2 * 1024 * 1024;
        if (strlen($binary) > $maxSizeBytes) {
            throw new \RuntimeException('Profile photo must be 2MB or less.', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $subtype = strtolower($matches[1]);
        $extensionMap = [
            'jpeg' => 'jpg',
            'jpg' => 'jpg',
            'png' => 'png',
            'webp' => 'webp',
            'gif' => 'gif',
        ];

        if (! isset($extensionMap[$subtype])) {
            throw new \RuntimeException('Unsupported profile photo format.', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $extension = $extensionMap[$subtype];
        $directory = public_path('uploads/profile-photos');
        if (! File::exists($directory)) {
            File::makeDirectory($directory, 0755, true);
        }

        $fileName = 'user-'.$userId.'-'.now()->format('YmdHis').'-'.Str::lower(Str::random(8)).'.'.$extension;
        File::put($directory.DIRECTORY_SEPARATOR.$fileName, $binary);

        return rtrim($request->getSchemeAndHttpHost(), '/').'/uploads/profile-photos/'.$fileName;
    }

    private function ok(mixed $data, ?string $message = null): JsonResponse
    {
        $payload = ['data' => $data];
        if ($message) {
            $payload['message'] = $message;
        }
        return response()->json($payload);
    }

    private function error(string $message, int $status): JsonResponse
    {
        return response()->json(['message' => $message, 'status' => $status], $status);
    }

    private function issueOtp(string $identifier, string $purpose, string $channel = 'email', ?string $userId = null): void
    {
        $code = (string) random_int(100000, 999999);

        DB::table('otp_verifications')
            ->where('identifier', $identifier)
            ->where('purpose', $purpose)
            ->whereNull('verified_at')
            ->update(['verified_at' => now(), 'updated_at' => now()]);

        DB::table('otp_verifications')->insert([
            'identifier' => $identifier,
            'purpose' => $purpose,
            'channel' => $channel,
            'otp_hash' => Hash::make($code),
            'attempts' => 0,
            'max_attempts' => 5,
            'expires_at' => now()->addMinutes(10),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        if ($channel === 'email') {
            $this->sendOtpEmail($identifier, $code, $purpose, $userId);
        }
    }

    public function registerWalkIn(Request $request): JsonResponse
    {
        $data = $request->validate([
            'full_name'                    => ['required', 'string', 'max:255'],
            'father_name'                  => ['nullable', 'string', 'max:255'],
            'mother_name'                  => ['nullable', 'string', 'max:255'],
            'phone_country_code'           => ['required', 'string', 'max:8'],
            'phone_number'                 => ['required', 'string', 'max:20'],
            'date_of_birth'                => ['required', 'date'],
            'gender'                       => ['required', 'in:male,female,other'],
            'marital_status'               => ['nullable', 'in:single,married,divorced,widowed'],
            'religion'                     => ['nullable', 'string', 'max:64'],
            'occupation'                   => ['nullable', 'string', 'max:128'],
            'nid_number'                   => ['nullable', 'string', 'max:32', 'unique:patients,nid_number'],
            'birth_certificate_number'     => ['nullable', 'string', 'max:32'],
            'blood_group'                  => ['nullable', 'string', 'max:5'],
            'email'                        => ['nullable', 'email', 'max:255'],
            'address_line1'                => ['nullable', 'string', 'max:255'],
            'address_city'                 => ['nullable', 'string', 'max:100'],
            'address_district'             => ['nullable', 'string', 'max:100'],
            'address_division'             => ['nullable', 'string', 'max:100'],
            'address_postal_code'          => ['nullable', 'string', 'max:20'],
            'emergency_contact_name'       => ['nullable', 'string', 'max:255'],
            'emergency_contact_relation'   => ['nullable', 'string', 'max:64'],
            'emergency_contact_phone'      => ['nullable', 'string', 'max:20'],
            'allergies'                    => ['nullable', 'string', 'max:500'],
            'chronic_conditions'           => ['nullable', 'string', 'max:500'],
        ]);

        try {
            $patient = DB::transaction(function () use ($data) {
                $tenantId = DB::table('tenants')->value('id');
                if (! $tenantId) {
                    $tenantId = 'tenant-001';
                    DB::table('tenants')->insert([
                        'id'         => $tenantId,
                        'subdomain'  => 'demo',
                        'plan'       => 'business',
                        'status'     => 'active',
                        'branding'   => json_encode(['hospital_name' => 'Demo Medical Center']),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                $patientId = 'patient-'.str_pad((string) (DB::table('patients')->count() + 1), 3, '0', STR_PAD_LEFT);
                $mrn = $this->generateMrn();

                $emergencyContacts = [];
                if (! empty($data['emergency_contact_name'])) {
                    $emergencyContacts[] = [
                        'name'         => $data['emergency_contact_name'],
                        'relationship' => $data['emergency_contact_relation'] ?? '',
                        'phone'        => [
                            'country_code' => '+880',
                            'number'       => $data['emergency_contact_phone'] ?? '',
                        ],
                    ];
                }

                DB::table('patients')->insert([
                    'id'                       => $patientId,
                    'tenant_id'                => $tenantId,
                    'user_id'                  => null,
                    'mrn'                      => $mrn,
                    'full_name'                => $data['full_name'],
                    'father_name'              => $data['father_name'] ?? null,
                    'mother_name'              => $data['mother_name'] ?? null,
                    'date_of_birth'            => $data['date_of_birth'],
                    'gender'                   => $data['gender'],
                    'marital_status'           => $data['marital_status'] ?? null,
                    'religion'                 => $data['religion'] ?? null,
                    'occupation'               => $data['occupation'] ?? null,
                    'nid_number'               => $data['nid_number'] ?? null,
                    'birth_certificate_number' => $data['birth_certificate_number'] ?? null,
                    'blood_group'              => $data['blood_group'] ?? null,
                    'phone_country_code'       => $data['phone_country_code'],
                    'phone_number'             => $data['phone_number'],
                    'email'                    => $data['email'] ?? null,
                    'address'                  => json_encode([
                        'line1'       => $data['address_line1'] ?? '',
                        'city'        => $data['address_city'] ?? '',
                        'district'    => $data['address_district'] ?? '',
                        'division'    => $data['address_division'] ?? '',
                        'postal_code' => $data['address_postal_code'] ?? '',
                        'country'     => 'Bangladesh',
                    ]),
                    'emergency_contacts'       => json_encode($emergencyContacts),
                    'medical_history'          => json_encode([
                        'allergies'           => array_filter(array_map('trim', explode(',', $data['allergies'] ?? ''))),
                        'chronic_conditions'  => array_filter(array_map('trim', explode(',', $data['chronic_conditions'] ?? ''))),
                        'current_medications' => [],
                        'past_surgeries'      => [],
                        'family_history'      => [],
                    ]),
                    'patient_type'             => 'walk_in',
                    'total_visits'             => 0,
                    'outstanding_balance_bdt'  => 0,
                    'created_at'               => now(),
                    'updated_at'               => now(),
                ]);

                return DB::table('patients')->where('id', $patientId)->first();
            });
        } catch (\Throwable $e) {
            Log::error('Walk-in patient registration failed', ['error' => $e->getMessage()]);
            return $this->error('Failed to register patient. Please try again.', Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return $this->ok($this->mapPatient($patient), 'Patient registered successfully');
    }

    public function appointmentPayDirect(Request $request, string $id): JsonResponse
    {
        $data = $request->validate([
            'card_number' => ['required', 'string'],
            'exp_month'   => ['nullable', 'integer'],
            'exp_year'    => ['nullable', 'integer'],
            'cvc'         => ['nullable', 'string'],
            'card_name'   => ['nullable', 'string', 'max:128'],
        ]);

        $appointment = DB::table('appointments')->where('id', $id)->first();
        if (! $appointment) {
            return $this->error('Appointment not found', Response::HTTP_NOT_FOUND);
        }
        if ($appointment->payment_status === 'paid') {
            return $this->error('This appointment fee has already been paid.', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $feeBdt      = (float) $appointment->fee_bdt;
        $amountCents = max(50, (int) round(($feeBdt / 110) * 100));
        $stripeKey   = config('services.stripe.secret');

        if (! $stripeKey) {
            return $this->error('Stripe is not configured on this server.', Response::HTTP_SERVICE_UNAVAILABLE);
        }

        try {
            \Stripe\Stripe::setApiKey($stripeKey);

            // Map test card numbers to Stripe's built-in test payment method tokens.
            // This avoids the raw card data API restriction while still creating
            // real transactions visible in the Stripe sandbox dashboard.
            $testTokenMap = [
                '4242424242424242' => 'pm_card_visa',
                '5555555555554444' => 'pm_card_mastercard',
                '4000056655665556' => 'pm_card_visa_debit',
                '4000000000000002' => 'pm_card_chargeDeclined',
            ];
            $rawNumber = preg_replace('/\s+/', '', $data['card_number']);
            $pmToken   = $testTokenMap[$rawNumber] ?? 'pm_card_visa';

            $intent = \Stripe\PaymentIntent::create([
                'amount'               => $amountCents,
                'currency'             => 'usd',
                'payment_method'       => $pmToken,
                'payment_method_types' => ['card'],
                'confirm'              => true,
                'description'          => "Appointment {$appointment->appointment_number} — Patient",
                'metadata'             => [
                    'appointment_id'     => (string) $id,
                    'appointment_number' => (string) $appointment->appointment_number,
                    'fee_bdt'            => (string) $feeBdt,
                ],
            ]);

            if ($intent->status !== 'succeeded') {
                return $this->error('Payment was not completed. Status: '.$intent->status, Response::HTTP_PAYMENT_REQUIRED);
            }

            DB::table('appointments')->where('id', $id)->update([
                'payment_status' => 'paid',
                'notes'          => trim(($appointment->notes ?? '').' | Stripe: '.$intent->id),
                'updated_at'     => now(),
            ]);

            return $this->ok([
                'payment_intent_id' => $intent->id,
                'amount_bdt'        => $feeBdt,
                'amount_usd_cents'  => $amountCents,
            ], 'Payment successful');
        } catch (\Stripe\Exception\CardException $e) {
            return $this->error('Card declined: '.$e->getMessage(), Response::HTTP_PAYMENT_REQUIRED);
        } catch (\Throwable $e) {
            Log::error('Appointment direct pay failed', ['id' => $id, 'error' => $e->getMessage()]);
            return $this->error('Payment failed: '.$e->getMessage(), Response::HTTP_BAD_GATEWAY);
        }
    }

    public function billPayDirect(Request $request, string $id): JsonResponse
    {
        $data = $request->validate([
            'card_number' => ['required', 'string'],
            'exp_month'   => ['nullable', 'integer'],
            'exp_year'    => ['nullable', 'integer'],
            'cvc'         => ['nullable', 'string'],
            'card_name'   => ['nullable', 'string', 'max:128'],
        ]);

        $bill = DB::table('bills')->where('id', $id)->first();
        if (! $bill) {
            return $this->error('Bill not found', Response::HTTP_NOT_FOUND);
        }

        $outstanding = (float) $bill->amount_outstanding_bdt;
        if ($outstanding <= 0) {
            return $this->error('This bill has no outstanding balance.', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $amountCents = max(50, (int) round(($outstanding / 110) * 100));
        $stripeKey   = config('services.stripe.secret');

        if (! $stripeKey) {
            return $this->error('Stripe is not configured on this server.', Response::HTTP_SERVICE_UNAVAILABLE);
        }

        try {
            \Stripe\Stripe::setApiKey($stripeKey);

            $testTokenMap = [
                '4242424242424242' => 'pm_card_visa',
                '5555555555554444' => 'pm_card_mastercard',
                '4000056655665556' => 'pm_card_visa_debit',
                '4000000000000002' => 'pm_card_chargeDeclined',
            ];
            $rawNumber = preg_replace('/\s+/', '', $data['card_number']);
            $pmToken   = $testTokenMap[$rawNumber] ?? 'pm_card_visa';

            $intent = \Stripe\PaymentIntent::create([
                'amount'               => $amountCents,
                'currency'             => 'usd',
                'payment_method'       => $pmToken,
                'payment_method_types' => ['card'],
                'confirm'              => true,
                'description'          => "Bill {$bill->bill_number}",
                'metadata'             => ['bill_id' => (string) $id, 'amount_bdt' => (string) $outstanding],
            ]);

            if ($intent->status !== 'succeeded') {
                return $this->error('Payment was not completed. Status: '.$intent->status, Response::HTTP_PAYMENT_REQUIRED);
            }

            $existing   = $this->decodeJson($bill->payments) ?? [];
            $existing[] = [
                'id'                => 'pay-'.Str::uuid(),
                'bill_id'           => $id,
                'amount_bdt'        => $outstanding,
                'method'            => 'stripe_card',
                'transaction_id'    => $intent->id,
                'gateway_reference' => $intent->id,
                'status'            => 'success',
                'paid_at'           => now()->toIso8601String(),
                'notes'             => 'Stripe sandbox direct charge',
            ];

            $newPaid        = (float) $bill->amount_paid_bdt + $outstanding;
            $newOutstanding = max(0.0, (float) $bill->total_amount_bdt - $newPaid);

            DB::table('bills')->where('id', $id)->update([
                'amount_paid_bdt'        => $newPaid,
                'amount_outstanding_bdt' => $newOutstanding,
                'status'                 => $newOutstanding <= 0 ? 'paid' : 'partial',
                'payments'               => json_encode($existing),
                'updated_at'             => now(),
            ]);

            $row = DB::table('bills as b')
                ->leftJoin('patients as p', 'p.id', '=', 'b.patient_id')
                ->select('b.*', 'p.mrn as patient_mrn', 'p.full_name as patient_name', 'p.phone_country_code', 'p.phone_number')
                ->where('b.id', $id)->first();

            return $this->ok([
                'bill'              => $this->mapBill($row),
                'payment_intent_id' => $intent->id,
                'amount_bdt'        => $outstanding,
                'amount_usd_cents'  => $amountCents,
            ], 'Payment successful');
        } catch (\Stripe\Exception\CardException $e) {
            return $this->error('Card declined: '.$e->getMessage(), Response::HTTP_PAYMENT_REQUIRED);
        } catch (\Throwable $e) {
            Log::error('Bill direct pay failed', ['id' => $id, 'error' => $e->getMessage()]);
            return $this->error('Payment failed: '.$e->getMessage(), Response::HTTP_BAD_GATEWAY);
        }
    }

    public function appointmentPaymentIntent(string $id): JsonResponse
    {
        $row = DB::table('appointments as a')
            ->leftJoin('users as u', 'u.id', '=', 'a.doctor_id')
            ->select('a.*', 'u.full_name as doctor_full_name')
            ->where('a.id', $id)
            ->first();

        if (! $row) {
            return $this->error('Appointment not found', Response::HTTP_NOT_FOUND);
        }

        if ($row->payment_status === 'paid') {
            return $this->error('This appointment fee has already been paid.', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $feeBdt = (float) $row->fee_bdt;
        if ($feeBdt <= 0) {
            return $this->error('This appointment has no fee to collect.', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $stripeKey = config('services.stripe.secret');
        if (! $stripeKey) {
            return $this->error('Stripe is not configured on this server.', Response::HTTP_SERVICE_UNAVAILABLE);
        }

        try {
            \Stripe\Stripe::setApiKey($stripeKey);

            $amountCents = max(50, (int) round(($feeBdt / 110) * 100));

            $intent = \Stripe\PaymentIntent::create([
                'amount'      => $amountCents,
                'currency'    => 'usd',
                'description' => "Appointment {$row->appointment_number} — {$row->doctor_full_name}",
                'metadata'    => [
                    'appointment_id'     => (string) $row->id,
                    'appointment_number' => (string) $row->appointment_number,
                    'patient_name'       => (string) $row->patient_name,
                    'doctor_name'        => (string) $row->doctor_full_name,
                    'fee_bdt'            => (string) $feeBdt,
                ],
            ]);

            return $this->ok([
                'client_secret'      => $intent->client_secret,
                'payment_intent_id'  => $intent->id,
                'amount_usd_cents'   => $amountCents,
                'fee_bdt'            => $feeBdt,
                'appointment_number' => $row->appointment_number,
                'doctor_name'        => $row->doctor_full_name,
            ]);
        } catch (\Throwable $e) {
            Log::error('Stripe appointment PaymentIntent failed', ['appointment_id' => $id, 'error' => $e->getMessage()]);
            return $this->error('Payment gateway error: '.$e->getMessage(), Response::HTTP_BAD_GATEWAY);
        }
    }

    public function markAppointmentPaid(Request $request, string $id): JsonResponse
    {
        $data = $request->validate([
            'payment_intent_id' => ['required', 'string'],
            'fee_bdt'           => ['required', 'numeric', 'min:0'],
        ]);

        $appointment = DB::table('appointments')->where('id', $id)->first();
        if (! $appointment) {
            return $this->error('Appointment not found', Response::HTTP_NOT_FOUND);
        }

        DB::table('appointments')->where('id', $id)->update([
            'payment_status' => 'paid',
            'notes'          => trim(($appointment->notes ?? '').' | Stripe: '.$data['payment_intent_id']),
            'updated_at'     => now(),
        ]);

        $row = DB::table('appointments as a')
            ->leftJoin('patients as p', 'p.id', '=', 'a.patient_id')
            ->leftJoin('users as u', 'u.id', '=', 'a.doctor_id')
            ->select(
                'a.*',
                'p.mrn as patient_mrn_col',
                'p.full_name as patient_full_name',
                'p.phone_country_code',
                'p.phone_number',
                'u.full_name as doctor_full_name',
                'u.doctor_profile'
            )
            ->where('a.id', $id)
            ->first();

        return $this->ok($this->mapAppointment($row), 'Payment recorded successfully');
    }

    public function createPaymentIntent(string $id): JsonResponse
    {
        $row = DB::table('bills as b')
            ->leftJoin('patients as p', 'p.id', '=', 'b.patient_id')
            ->select('b.*', 'p.full_name as patient_name', 'p.mrn as patient_mrn')
            ->where('b.id', $id)
            ->first();

        if (! $row) {
            return $this->error('Bill not found', Response::HTTP_NOT_FOUND);
        }

        $outstanding = (float) $row->amount_outstanding_bdt;
        if ($outstanding <= 0) {
            return $this->error('This bill has no outstanding balance.', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $stripeKey = config('services.stripe.secret');
        if (! $stripeKey) {
            return $this->error('Stripe is not configured on this server.', Response::HTTP_SERVICE_UNAVAILABLE);
        }

        try {
            \Stripe\Stripe::setApiKey($stripeKey);

            // Stripe does not support BDT; charge in USD (1 USD ≈ 110 BDT, min 50 cents)
            $amountCents = max(50, (int) round(($outstanding / 110) * 100));

            $intent = \Stripe\PaymentIntent::create([
                'amount'      => $amountCents,
                'currency'    => 'usd',
                'description' => "Bill {$row->bill_number} — Patient",
                'metadata'    => [
                    'bill_id'     => (string) $row->id,
                    'bill_number' => (string) $row->bill_number,
                    'patient_mrn' => (string) $row->patient_mrn,
                    'amount_bdt'  => (string) $outstanding,
                ],
            ]);

            return $this->ok([
                'client_secret'      => $intent->client_secret,
                'payment_intent_id'  => $intent->id,
                'amount_usd_cents'   => $amountCents,
                'amount_bdt'         => $outstanding,
            ]);
        } catch (\Throwable $e) {
            Log::error('Stripe PaymentIntent creation failed', ['bill_id' => $id, 'error' => $e->getMessage()]);
            return $this->error('Payment gateway error: '.$e->getMessage(), Response::HTTP_BAD_GATEWAY);
        }
    }

    public function markBillPaid(Request $request, string $id): JsonResponse
    {
        $data = $request->validate([
            'payment_intent_id' => ['required', 'string'],
            'amount_bdt'        => ['required', 'numeric', 'min:0'],
        ]);

        $bill = DB::table('bills')->where('id', $id)->first();
        if (! $bill) {
            return $this->error('Bill not found', Response::HTTP_NOT_FOUND);
        }

        $existing  = $this->decodeJson($bill->payments) ?? [];
        $existing[] = [
            'id'                => 'pay-'.Str::uuid(),
            'bill_id'           => $id,
            'amount_bdt'        => (float) $data['amount_bdt'],
            'method'            => 'stripe_card',
            'transaction_id'    => $data['payment_intent_id'],
            'gateway_reference' => $data['payment_intent_id'],
            'status'            => 'success',
            'paid_at'           => now()->toIso8601String(),
            'notes'             => 'Stripe sandbox payment',
        ];

        $newPaid        = (float) $bill->amount_paid_bdt + (float) $data['amount_bdt'];
        $newOutstanding = max(0.0, (float) $bill->total_amount_bdt - $newPaid);
        $newStatus      = $newOutstanding <= 0 ? 'paid' : 'partial';

        DB::table('bills')->where('id', $id)->update([
            'amount_paid_bdt'        => $newPaid,
            'amount_outstanding_bdt' => $newOutstanding,
            'status'                 => $newStatus,
            'payments'               => json_encode($existing),
            'updated_at'             => now(),
        ]);

        $row = DB::table('bills as b')
            ->leftJoin('patients as p', 'p.id', '=', 'b.patient_id')
            ->select('b.*', 'p.mrn as patient_mrn', 'p.full_name as patient_name', 'p.phone_country_code', 'p.phone_number')
            ->where('b.id', $id)
            ->first();

        return $this->ok($this->mapBill($row), 'Payment recorded successfully');
    }

    private function sendOtpEmail(string $email, string $otpCode, string $purpose, ?string $userId = null): void
    {
        $subject = 'Your HMS OTP Code';
        $body = implode("\n", [
            'Hello,',
            '',
            'Your one-time verification code is: '.$otpCode,
            'Purpose: '.$purpose,
            'This code expires in 10 minutes.',
            '',
            'If you did not request this, please ignore this email.',
            '',
            'Regards,',
            config('app.name', 'HMS'),
        ]);

        Mail::raw($body, function ($message) use ($email, $subject): void {
            $message->to($email)->subject($subject);
        });
    }
}
