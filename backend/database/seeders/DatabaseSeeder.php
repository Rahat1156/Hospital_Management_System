<?php

namespace Database\Seeders;

use App\Models\Alert;
use App\Models\Ambulance;
use App\Models\Appointment;
use App\Models\AuditLog;
use App\Models\Bed;
use App\Models\Bill;
use App\Models\BillItem;
use App\Models\EmergencyRequest;
use App\Models\Guardian;
use App\Models\Inventory;
use App\Models\LabResult;
use App\Models\LabTest;
use App\Models\Medicine;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\Prescription;
use App\Models\PrescriptionItem;
use App\Models\Role;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Ward;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $tenant = Tenant::query()->firstOrCreate(
            ['subdomain' => 'main'],
            ['name' => 'Main Hospital', 'plan' => 'standard', 'status' => 'active'],
        );

        $roles = collect(['super_admin', 'hospital_admin', 'doctor', 'nurse', 'patient', 'receptionist', 'pharmacist', 'lab_technician'])
            ->mapWithKeys(fn (string $roleName): array => [
                $roleName => Role::query()->firstOrCreate(['role_name' => $roleName]),
            ]);

        collect([
            ['role' => 'hospital_admin', 'name' => 'Hospital Admin', 'email' => 'admin@demo.hms.com.bd', 'phone' => '1712345001'],
            ['role' => 'doctor', 'name' => 'Dr. Karim Ahmed', 'email' => 'dr.karim@demo.hms.com.bd', 'phone' => '1712345002'],
            ['role' => 'doctor', 'name' => 'Dr. Nasrin Sultana', 'email' => 'dr.nasrin@demo.hms.com.bd', 'phone' => '1712345003'],
            ['role' => 'nurse', 'name' => 'Sister Rumana', 'email' => 'sister.rumana@demo.hms.com.bd', 'phone' => '1712345004'],
            ['role' => 'lab_technician', 'name' => 'Tanvir Hasan', 'email' => 'lab.tanvir@demo.hms.com.bd', 'phone' => '1712345005'],
            ['role' => 'pharmacist', 'name' => 'Sadia Rahman', 'email' => 'pharm.sadia@demo.hms.com.bd', 'phone' => '1712345006'],
            ['role' => 'receptionist', 'name' => 'Reception Desk', 'email' => 'reception@demo.hms.com.bd', 'phone' => '1712345007'],
            ['role' => 'patient', 'name' => 'Md. Rahim Uddin', 'email' => 'rahim.patient@gmail.com', 'phone' => '1712345008'],
            ['role' => 'super_admin', 'name' => 'Platform Super Admin', 'email' => 'super@hms.com.bd', 'phone' => '1712345009'],
        ])->each(function (array $user) use ($tenant, $roles): void {
            User::query()->updateOrCreate(
                ['email' => $user['email']],
                [
                    'tenant_id' => $user['role'] === 'super_admin' ? null : $tenant->tenant_id,
                    'role_id' => $roles[$user['role']]->role_id,
                    'name' => $user['name'],
                    'phone' => $user['phone'],
                    'status' => 'active',
                    'password' => 'Demo@2026',
                ],
            );
        });

        User::query()->updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'tenant_id' => $tenant->tenant_id,
                'role_id' => $roles['hospital_admin']->role_id,
                'name' => 'Hospital Admin',
                'phone' => '01700000000',
                'status' => 'active',
                'password' => 'password',
            ],
        );

        $doctor = User::query()->where('email', 'dr.karim@demo.hms.com.bd')->firstOrFail();
        $labTech = User::query()->where('email', 'lab.tanvir@demo.hms.com.bd')->firstOrFail();
        $pharmacist = User::query()->where('email', 'pharm.sadia@demo.hms.com.bd')->firstOrFail();

        $patients = collect([
            ['mrn' => 'HMS-100001', 'name' => 'Md. Rahim Uddin', 'dob' => '1988-05-10', 'gender' => 'male', 'blood_group' => 'B+', 'phone' => '1711111111', 'email' => 'rahim.patient@gmail.com'],
            ['mrn' => 'HMS-100002', 'name' => 'Nusrat Jahan', 'dob' => '1993-09-18', 'gender' => 'female', 'blood_group' => 'O+', 'phone' => '1722222222', 'email' => 'nusrat@example.com'],
            ['mrn' => 'HMS-100003', 'name' => 'Arif Hossain', 'dob' => '1979-02-04', 'gender' => 'male', 'blood_group' => 'A+', 'phone' => '1733333333', 'email' => 'arif@example.com'],
        ])->map(fn (array $patient): Patient => Patient::query()->updateOrCreate(
            ['mrn' => $patient['mrn']],
            ['tenant_id' => $tenant->tenant_id, ...$patient],
        ));

        $patients->each(fn (Patient $patient): Guardian => Guardian::query()->updateOrCreate(
            ['patient_id' => $patient->patient_id],
            ['name' => $patient->name.' Guardian', 'phone' => $patient->phone],
        ));

        $ward = Ward::query()->updateOrCreate(
            ['tenant_id' => $tenant->tenant_id, 'name' => 'General Ward A'],
            ['name' => 'General Ward A'],
        );
        $icu = Ward::query()->updateOrCreate(
            ['tenant_id' => $tenant->tenant_id, 'name' => 'ICU'],
            ['name' => 'ICU'],
        );

        $bedA = Bed::query()->updateOrCreate(['ward_id' => $ward->ward_id, 'bed_number' => 'A-101'], ['status' => 'occupied']);
        Bed::query()->updateOrCreate(['ward_id' => $ward->ward_id, 'bed_number' => 'A-102'], ['status' => 'available']);
        Bed::query()->updateOrCreate(['ward_id' => $icu->ward_id, 'bed_number' => 'ICU-01'], ['status' => 'reserved']);

        $firstPatient = $patients->first();
        $secondPatient = $patients->skip(1)->first();

        $appointment = Appointment::query()->updateOrCreate(
            ['tenant_id' => $tenant->tenant_id, 'patient_id' => $firstPatient->patient_id, 'doctor_id' => $doctor->user_id],
            ['slot_datetime' => now()->addHours(2), 'status' => 'scheduled'],
        );
        Appointment::query()->updateOrCreate(
            ['tenant_id' => $tenant->tenant_id, 'patient_id' => $secondPatient->patient_id, 'doctor_id' => $doctor->user_id],
            ['slot_datetime' => now()->addDay(), 'status' => 'confirmed'],
        );

        $paracetamol = Medicine::query()->updateOrCreate(
            ['name' => 'Napa 500mg'],
            ['generic_name' => 'Paracetamol', 'stock' => 120],
        );
        $amoxicillin = Medicine::query()->updateOrCreate(
            ['name' => 'DP 500mg'],
            ['generic_name' => 'Amoxicillin', 'stock' => 45],
        );
        Inventory::query()->updateOrCreate(['medicine_id' => $paracetamol->medicine_id], ['quantity' => 120, 'expiry_date' => now()->addMonths(10)->toDateString()]);
        Inventory::query()->updateOrCreate(['medicine_id' => $amoxicillin->medicine_id], ['quantity' => 45, 'expiry_date' => now()->addMonths(8)->toDateString()]);

        $prescription = Prescription::query()->updateOrCreate(
            ['appt_id' => $appointment->appt_id],
            [
                'patient_id' => $firstPatient->patient_id,
                'doctor_id' => $doctor->user_id,
                'diagnosis' => 'Seasonal fever',
                'signed_at' => now(),
            ],
        );
        PrescriptionItem::query()->updateOrCreate(
            ['rx_id' => $prescription->rx_id, 'medicine_id' => $paracetamol->medicine_id],
            ['dosage' => '1 tablet', 'frequency' => 'thrice_daily', 'duration' => '5 days'],
        );

        $labTest = LabTest::query()->updateOrCreate(
            ['patient_id' => $firstPatient->patient_id, 'test_type' => 'CBC'],
            ['technician_id' => $labTech->user_id],
        );
        LabResult::query()->updateOrCreate(
            ['lab_id' => $labTest->lab_id],
            ['result_value' => 'WBC normal', 'flag' => 'normal', 'report_url' => null],
        );

        $bill = Bill::query()->updateOrCreate(
            ['tenant_id' => $tenant->tenant_id, 'patient_id' => $firstPatient->patient_id],
            ['total' => 1800, 'status' => 'partial'],
        );
        BillItem::query()->updateOrCreate(
            ['bill_id' => $bill->bill_id, 'description' => 'Consultation and lab charge'],
            ['amount' => 1800],
        );
        Payment::query()->updateOrCreate(
            ['bill_id' => $bill->bill_id, 'method' => 'cash'],
            ['amount' => 1000, 'paid_at' => now()],
        );

        EmergencyRequest::query()->updateOrCreate(
            ['patient_id' => $secondPatient->patient_id],
            ['status' => 'open'],
        );
        Ambulance::query()->updateOrCreate(['ambulance_id' => 1], ['status' => 'available']);
        Alert::query()->updateOrCreate(
            ['tenant_id' => $tenant->tenant_id, 'recipient_id' => $doctor->user_id, 'trigger_type' => 'lab_result_ready'],
            ['status' => 'pending', 'sent_at' => now()],
        );
        AuditLog::query()->create([
            'tenant_id' => $tenant->tenant_id,
            'user_id' => $pharmacist->user_id,
            'action' => 'seed.demo_data_created',
            'record_id' => $firstPatient->patient_id,
            'ip_address' => '127.0.0.1',
        ]);
    }
}
