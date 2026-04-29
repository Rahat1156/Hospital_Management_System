<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class HmsDemoSeeder extends Seeder
{
    public function run(): void
    {
        $tenantId = 'tenant-001';

        DB::table('tenants')->updateOrInsert(
            ['id' => $tenantId],
            [
                'subdomain' => 'demo',
                'plan' => 'business',
                'status' => 'active',
                'branding' => json_encode([
                    'hospital_name' => 'Demo Medical Center',
                    'display_name' => 'Demo Medical',
                    'tagline' => 'Compassionate care, advanced medicine',
                    'primary_color' => '#0b4f6c',
                    'support_email' => 'support@demo.hms.com.bd',
                    'support_phone' => '+880 9612 345 678',
                ]),
                'address' => json_encode([
                    'line1' => 'Plot 42, Road 27',
                    'line2' => 'Dhanmondi',
                    'city' => 'Dhaka',
                    'district' => 'Dhaka',
                    'division' => 'Dhaka',
                    'postal_code' => '1209',
                    'country' => 'Bangladesh',
                ]),
                'limits' => json_encode([
                    'max_patients' => 10000,
                    'max_beds' => null,
                    'max_branches' => 3,
                    'has_telemedicine' => true,
                    'has_emergency_module' => true,
                    'has_pharma_portal' => false,
                    'has_white_label' => false,
                    'has_ai_features' => false,
                    'alert_channels' => ['sms', 'email', 'whatsapp', 'in_app'],
                    'sla_response_hours' => 12,
                ]),
                'usage' => json_encode([
                    'patient_count' => 3247,
                    'bed_count' => 145,
                    'branch_count' => 1,
                    'active_staff_count' => 68,
                ]),
                'subscription_started_at' => '2026-01-15T00:00:00Z',
                'subscription_renews_at' => '2026-05-15T00:00:00Z',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        $users = [
            [
                'role' => 'hospital_admin',
                'email' => 'admin@demo.hms.com.bd',
                'full_name' => 'Md. Masfiqur Rahman Nehal',
                'phone_number' => '1712345001',
                'gender' => 'male',
            ],
            [
                'role' => 'doctor',
                'email' => 'dr.karim@demo.hms.com.bd',
                'full_name' => 'Dr. Karim Hossain',
                'phone_number' => '1712345002',
                'gender' => 'male',
                'doctor_profile' => [
                    'bmdc_number' => 'A-45678',
                    'specialty' => 'Cardiology',
                    'sub_specialty' => 'Interventional Cardiology',
                    'qualifications' => ['MBBS', 'FCPS (Cardiology)', 'MD'],
                    'years_of_experience' => 15,
                    'consultation_fee_bdt' => 1500,
                    'languages' => ['Bangla', 'English'],
                ],
            ],
            [
                'role' => 'doctor',
                'email' => 'dr.nasrin@demo.hms.com.bd',
                'full_name' => 'Dr. Nasrin Akter',
                'phone_number' => '1712345003',
                'gender' => 'female',
                'doctor_profile' => [
                    'bmdc_number' => 'A-45912',
                    'specialty' => 'Pediatrics',
                    'qualifications' => ['MBBS', 'DCH', 'FCPS (Pediatrics)'],
                    'years_of_experience' => 10,
                    'consultation_fee_bdt' => 1200,
                    'languages' => ['Bangla', 'English'],
                ],
            ],
            [
                'role' => 'nurse',
                'email' => 'sister.rumana@demo.hms.com.bd',
                'full_name' => 'Rumana Begum',
                'phone_number' => '1712345004',
                'gender' => 'female',
                'nurse_profile' => ['license_number' => 'NRS-2020-3456', 'ward_assigned' => 'ICU Ward 2', 'shift' => 'morning'],
            ],
            [
                'role' => 'lab_technician',
                'email' => 'lab.tanvir@demo.hms.com.bd',
                'full_name' => 'Tanvir Islaam',
                'phone_number' => '1712345005',
                'gender' => 'male',
                'lab_tech_profile' => ['license_number' => 'LAB-2019-8765', 'specializations' => ['Hematology', 'Biochemistry']],
            ],
            [
                'role' => 'pharmacist',
                'email' => 'pharm.sadia@demo.hms.com.bd',
                'full_name' => 'Sadia Rahman',
                'phone_number' => '1712345006',
                'gender' => 'female',
                'pharmacist_profile' => ['license_number' => 'PHR-2018-5432'],
            ],
            [
                'role' => 'receptionist',
                'email' => 'reception@demo.hms.com.bd',
                'full_name' => 'Fahmida Sultana',
                'phone_number' => '1712345007',
                'gender' => 'female',
            ],
            [
                'role' => 'patient',
                'email' => 'rahim.patient@gmail.com',
                'full_name' => 'Md. Rahim Uddin',
                'phone_number' => '1812345008',
                'gender' => 'male',
                'date_of_birth' => '1985-03-22',
            ],
            [
                'role' => 'super_admin',
                'email' => 'super@hms.com.bd',
                'full_name' => 'Platform Super Admin',
                'phone_number' => '1712345000',
                'gender' => 'male',
                'tenant_id' => null,
            ],
        ];

        $userIds = [];
        foreach ($users as $record) {
            $email = $record['email'];
            $existing = User::where('email', $email)->first();
            $payload = [
                'tenant_id' => $record['tenant_id'] ?? $tenantId,
                'role' => $record['role'],
                'name' => $record['full_name'],
                'full_name' => $record['full_name'],
                'email' => $email,
                'phone_country_code' => '+880',
                'phone_number' => $record['phone_number'],
                'gender' => $record['gender'],
                'date_of_birth' => $record['date_of_birth'] ?? null,
                'status' => 'active',
                'email_verified' => true,
                'phone_verified' => true,
                'two_factor_enabled' => $record['role'] === 'hospital_admin' || $record['role'] === 'super_admin',
                'failed_login_attempts' => 0,
                'password' => Hash::make('Demo@2026'),
                'doctor_profile' => isset($record['doctor_profile']) ? json_encode($record['doctor_profile']) : null,
                'nurse_profile' => isset($record['nurse_profile']) ? json_encode($record['nurse_profile']) : null,
                'lab_tech_profile' => isset($record['lab_tech_profile']) ? json_encode($record['lab_tech_profile']) : null,
                'pharmacist_profile' => isset($record['pharmacist_profile']) ? json_encode($record['pharmacist_profile']) : null,
                'created_at' => now(),
                'updated_at' => now(),
            ];

            if ($existing) {
                $existing->update($payload);
                $userIds[$record['role']] = $existing->id;
                if ($record['role'] === 'patient') {
                    $userIds['patient_user'] = $existing->id;
                }
            } else {
                $user = User::create($payload);
                $userIds[$record['role']] = $user->id;
                if ($record['role'] === 'patient') {
                    $userIds['patient_user'] = $user->id;
                }
            }
        }

        DB::table('patients')->updateOrInsert(
            ['id' => 'patient-001'],
            [
                'tenant_id' => $tenantId,
                'user_id' => $userIds['patient_user'] ?? null,
                'mrn' => 'HAX-10024',
                'full_name' => 'Md. Rahim Uddin',
                'date_of_birth' => '1985-03-22',
                'gender' => 'male',
                'marital_status' => 'married',
                'nid_number' => '1990123456789',
                'blood_group' => 'B+',
                'phone_country_code' => '+880',
                'phone_number' => '1812345008',
                'email' => 'rahim.patient@gmail.com',
                'address' => json_encode([
                    'line1' => 'House 23, Road 5',
                    'line2' => 'Mohammadpur',
                    'city' => 'Dhaka',
                    'district' => 'Dhaka',
                    'division' => 'Dhaka',
                    'postal_code' => '1207',
                    'country' => 'Bangladesh',
                ]),
                'occupation' => 'Software Engineer',
                'emergency_contacts' => json_encode([
                    ['name' => 'Ayesha Uddin', 'relationship' => 'Wife', 'phone' => ['country_code' => '+880', 'number' => '1812345009']],
                ]),
                'medical_history' => json_encode([
                    'allergies' => ['Penicillin'],
                    'chronic_conditions' => ['Hypertension'],
                    'current_medications' => ['Amlodipine 5mg'],
                    'past_surgeries' => [],
                    'family_history' => ['Diabetes (father)', 'Hypertension (mother)'],
                ]),
                'patient_type' => 'self_registered',
                'age_years' => 41,
                'last_visit_date' => '2026-04-10T00:00:00Z',
                'total_visits' => 7,
                'outstanding_balance_bdt' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        DB::table('patients')->updateOrInsert(
            ['id' => 'patient-002'],
            [
                'tenant_id' => $tenantId,
                'mrn' => 'HAX-10087',
                'full_name' => 'Fatema Begum',
                'date_of_birth' => '1962-08-14',
                'gender' => 'female',
                'marital_status' => 'widowed',
                'nid_number' => '1967123456789',
                'blood_group' => 'A+',
                'phone_country_code' => '+880',
                'phone_number' => '1912345010',
                'address' => json_encode([
                    'line1' => 'Flat 3B, Lalmatia',
                    'city' => 'Dhaka',
                    'district' => 'Dhaka',
                    'division' => 'Dhaka',
                    'postal_code' => '1207',
                    'country' => 'Bangladesh',
                ]),
                'emergency_contacts' => json_encode([
                    ['name' => 'Sohel Rana', 'relationship' => 'Son', 'phone' => ['country_code' => '+880', 'number' => '1912345011']],
                ]),
                'medical_history' => json_encode([
                    'allergies' => [],
                    'chronic_conditions' => ['Type 2 Diabetes', 'Hypertension', 'Osteoarthritis'],
                    'current_medications' => ['Metformin 1000mg', 'Losartan 50mg'],
                    'past_surgeries' => [['procedure' => 'Cataract surgery (right eye)', 'date' => '2022-06-15']],
                    'family_history' => [],
                ]),
                'patient_type' => 'walk_in',
                'age_years' => 63,
                'last_visit_date' => '2026-04-18T00:00:00Z',
                'total_visits' => 23,
                'outstanding_balance_bdt' => 3500,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        DB::table('appointments')->updateOrInsert(
            ['id' => 'appt-001'],
            [
                'tenant_id' => $tenantId,
                'appointment_number' => 'APT-2026-0142',
                'patient_id' => 'patient-001',
                'doctor_id' => $userIds['doctor'] ?? 1,
                'department' => 'Cardiology',
                'appointment_type' => 'follow_up',
                'status' => 'confirmed',
                'source' => 'online_patient',
                'scheduled_at' => now()->addHour(),
                'duration_minutes' => 30,
                'reason' => 'Follow-up for hypertension management',
                'fee_bdt' => 1500,
                'payment_status' => 'paid',
                'reminder_24h_sent' => true,
                'reminder_2h_sent' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        DB::table('appointments')->updateOrInsert(
            ['id' => 'appt-002'],
            [
                'tenant_id' => $tenantId,
                'appointment_number' => 'APT-2026-0143',
                'patient_id' => 'patient-002',
                'doctor_id' => $userIds['doctor'] ?? 1,
                'department' => 'Cardiology',
                'appointment_type' => 'consultation',
                'status' => 'checked_in',
                'source' => 'walk_in',
                'scheduled_at' => now()->addHours(2),
                'duration_minutes' => 30,
                'checked_in_at' => now(),
                'reason' => 'Chest discomfort for 3 days',
                'fee_bdt' => 1500,
                'payment_status' => 'paid',
                'reminder_24h_sent' => true,
                'reminder_2h_sent' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        DB::table('prescriptions')->updateOrInsert(
            ['id' => 'rx-001'],
            [
                'tenant_id' => $tenantId,
                'prescription_number' => 'RX-2026-0547',
                'appointment_id' => 'appt-001',
                'patient_id' => 'patient-001',
                'doctor_id' => $userIds['doctor'] ?? 1,
                'diagnosis' => 'Essential Hypertension',
                'diagnosis_icd10' => 'I10',
                'chief_complaint' => 'Routine check-up',
                'vital_signs' => json_encode(['blood_pressure' => '138/88', 'pulse' => 76, 'temperature' => 98.4]),
                'medicines' => json_encode([
                    ['medicine_id' => 'med-aml', 'generic_name' => 'Amlodipine', 'brand_name' => 'Amdocal', 'strength' => '5mg', 'dosage' => '1 tablet', 'frequency' => 'once_daily', 'route' => 'oral', 'duration_days' => 30, 'quantity' => 30],
                    ['medicine_id' => 'med-ato', 'generic_name' => 'Atorvastatin', 'brand_name' => 'Atova', 'strength' => '10mg', 'dosage' => '1 tablet', 'frequency' => 'at_bedtime', 'route' => 'oral', 'duration_days' => 30, 'quantity' => 30],
                ]),
                'advice' => 'Maintain low-salt diet. Walk 30 min daily.',
                'follow_up_date' => now()->addMonth(),
                'follow_up_reminder_set' => true,
                'status' => 'dispensed_full',
                'signed_at' => now(),
                'acknowledged_warnings' => json_encode([]),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        DB::table('lab_tests')->updateOrInsert(
            ['id' => 'lab-001'],
            [
                'tenant_id' => $tenantId,
                'test_number' => 'LAB-2026-0891',
                'patient_id' => 'patient-002',
                'ordered_by_doctor_id' => $userIds['doctor'] ?? 1,
                'entered_by_technician_id' => $userIds['lab_technician'] ?? null,
                'catalog_item_id' => 'cat-cbc',
                'test_name' => 'Complete Blood Count',
                'test_code' => 'CBC',
                'category' => 'Hematology',
                'priority' => 'routine',
                'status' => 'reported',
                'ordered_at' => now()->subDay(),
                'sample_collected_at' => now()->subDay()->addHour(),
                'result_entered_at' => now()->subDay()->addHours(3),
                'verified_at' => now()->subDay()->addHours(4),
                'reported_at' => now()->subDay()->addHours(5),
                'results' => json_encode([
                    ['parameter_id' => 'p-hgb', 'parameter_name' => 'Hemoglobin', 'value' => 9.2, 'unit' => 'g/dL', 'flag' => 'critical', 'reference_range_display' => '12.0 - 15.5'],
                ]),
                'overall_flag' => 'critical',
                'clinical_notes' => 'Low hemoglobin suggests anemia',
                'price_bdt' => 800,
                'payment_status' => 'paid',
                'critical_alert_triggered' => true,
                'critical_alert_sent_at' => now()->subDay()->addHours(3)->addSeconds(30),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        DB::table('medicine_inventories')->updateOrInsert(
            ['id' => 'inv-001'],
            [
                'tenant_id' => $tenantId,
                'medicine_id' => 'med-amox',
                'generic_name' => 'Amoxicillin',
                'brand_name' => 'Amoxil',
                'strength' => '500mg',
                'manufacturer' => 'Square Pharma',
                'batch_number' => 'B-2025-8821',
                'manufacture_date' => '2025-11-01',
                'expiry_date' => '2027-10-31',
                'current_stock' => 45,
                'min_threshold' => 100,
                'max_threshold' => 1000,
                'unit_cost_bdt' => 8,
                'selling_price_bdt' => 12,
                'is_expired' => false,
                'is_low_stock' => true,
                'is_out_of_stock' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        DB::table('pharmacy_orders')->updateOrInsert(
            ['id' => 'po-001'],
            [
                'tenant_id' => $tenantId,
                'order_number' => 'PO-2026-0321',
                'prescription_id' => 'rx-001',
                'patient_id' => 'patient-001',
                'status' => 'dispensed',
                'total_amount_bdt' => 360,
                'items' => json_encode([
                    ['prescribed_medicine_id' => 'pm-1', 'medicine_id' => 'med-aml', 'medicine_name' => 'Amlodipine 5mg', 'prescribed_quantity' => 30, 'dispensed_quantity' => 30, 'unit_price_bdt' => 7, 'total_price_bdt' => 210],
                ]),
                'dispensed_by' => $userIds['pharmacist'] ?? null,
                'dispensed_at' => now(),
                'payment_status' => 'paid',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        DB::table('wards')->updateOrInsert(
            ['id' => 'ward-001'],
            [
                'tenant_id' => $tenantId,
                'name' => 'General Ward A',
                'ward_type' => 'general',
                'floor' => '2nd Floor',
                'total_beds' => 24,
                'available_beds' => 6,
                'occupied_beds' => 16,
                'reserved_beds' => 2,
                'maintenance_beds' => 0,
                'occupancy_rate' => 66.7,
                'capacity_threshold' => 90,
                'threshold_alert_sent' => false,
                'daily_rate_bdt' => 1500,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        DB::table('beds')->updateOrInsert(
            ['id' => 'bed-A-1'],
            [
                'tenant_id' => $tenantId,
                'ward_id' => 'ward-001',
                'bed_number' => 'A-001',
                'status' => 'occupied',
                'has_oxygen' => true,
                'has_ventilator' => false,
                'has_monitor' => false,
                'daily_rate_bdt' => 1500,
                'current_patient_id' => 'patient-001',
                'admission_date' => now()->subDay(),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        DB::table('bills')->updateOrInsert(
            ['id' => 'bill-001'],
            [
                'tenant_id' => $tenantId,
                'bill_number' => 'INV-2026-1287',
                'patient_id' => 'patient-002',
                'status' => 'partial',
                'bill_date' => now()->subDay(),
                'line_items' => json_encode([
                    ['id' => 'li-1', 'category' => 'consultation', 'description' => 'Cardiology Consultation', 'quantity' => 1, 'unit_price_bdt' => 1500, 'subtotal_bdt' => 1500, 'tax_bdt' => 0, 'discount_bdt' => 0, 'total_bdt' => 1500],
                    ['id' => 'li-2', 'category' => 'lab_test', 'description' => 'Complete Blood Count', 'quantity' => 1, 'unit_price_bdt' => 800, 'subtotal_bdt' => 800, 'tax_bdt' => 0, 'discount_bdt' => 0, 'total_bdt' => 800],
                ]),
                'subtotal_bdt' => 2300,
                'total_tax_bdt' => 0,
                'total_discount_bdt' => 0,
                'total_amount_bdt' => 2300,
                'amount_paid_bdt' => 0,
                'amount_outstanding_bdt' => 2300,
                'payments' => json_encode([]),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        DB::table('alerts')->updateOrInsert(
            ['id' => 'alert-001'],
            [
                'tenant_id' => $tenantId,
                'trigger_type' => 'critical_lab_result',
                'severity' => 'critical',
                'status' => 'delivered',
                'title' => 'Critical Lab Result - Low Hemoglobin',
                'message' => 'Patient Fatema Begum has critically low Hemoglobin: 9.2 g/dL.',
                'patient_id' => 'patient-002',
                'reference_type' => 'lab_test',
                'reference_id' => 'lab-001',
                'recipients' => json_encode([
                    ['user_id' => (string) ($userIds['doctor'] ?? ''), 'user_name' => 'Dr. Karim Hossain', 'role' => 'doctor', 'contact' => '+880 1712-345002', 'acknowledged' => true],
                ]),
                'channels' => json_encode(['sms', 'email', 'in_app']),
                'dispatch_attempts' => json_encode([
                    ['channel' => 'sms', 'gateway' => 'ssl_wireless', 'status' => 'success', 'attempted_at' => now()->subDay()->toIso8601String(), 'retry_count' => 0],
                ]),
                'triggered_at' => now()->subDay(),
                'first_delivered_at' => now()->subDay()->addSeconds(10),
                'acknowledged_at' => null,
                'escalated' => false,
                'action_url' => '/doctor/lab-tests/lab-001',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        DB::table('notifications')->updateOrInsert(
            ['id' => 'notif-alert-001'],
            [
                'alert_id' => 'alert-001',
                'user_id' => $userIds['doctor'] ?? null,
                'title' => 'Critical Lab Result - Low Hemoglobin',
                'message' => 'Patient Fatema Begum has critically low Hemoglobin: 9.2 g/dL.',
                'severity' => 'critical',
                'is_read' => false,
                'action_url' => '/doctor/lab-tests/lab-001',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        DB::table('emergency_requests')->updateOrInsert(
            ['id' => 'emr-001'],
            [
                'tenant_id' => $tenantId,
                'request_number' => 'EMR-2026-0018',
                'patient_name' => 'Unknown',
                'patient_phone_country_code' => '+880',
                'patient_phone_number' => '1712345099',
                'requester_name' => 'Roadside caller',
                'requester_relationship' => 'stranger',
                'pickup_location' => json_encode(['latitude' => 23.8103, 'longitude' => 90.4125, 'updated_at' => now()->toIso8601String(), 'address' => 'Dhanmondi 27, Dhaka']),
                'destination_hospital_id' => $tenantId,
                'destination_hospital_name' => 'Demo Medical Center',
                'status' => 'en_route_to_patient',
                'priority' => 'high',
                'chief_complaint' => 'Motor vehicle accident, conscious but bleeding from leg',
                'reported_vitals' => json_encode(['consciousness' => 'alert', 'breathing' => 'normal', 'bleeding' => 'severe']),
                'dispatcher_id' => $userIds['hospital_admin'] ?? null,
                'dispatcher_name' => 'Md. Masfiqur Rahman Nehal',
                'ambulance_id' => 'amb-001',
                'ambulance_number' => 'DHK-AMB-001',
                'sos_received_at' => now()->subMinutes(15),
                'dispatcher_assigned_at' => now()->subMinutes(14),
                'ambulance_assigned_at' => now()->subMinutes(13),
                'ambulance_dispatched_at' => now()->subMinutes(12),
                'estimated_arrival_time' => now()->addMinutes(15),
                'er_pre_notification_sent' => true,
                'er_pre_notification_sent_at' => now()->subMinutes(11),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        DB::table('health_timeline_events')->updateOrInsert(
            ['id' => 't-1'],
            [
                'patient_id' => 'patient-001',
                'event_type' => 'appointment',
                'event_date' => now()->subDays(7),
                'title' => 'Cardiology Follow-up',
                'description' => 'Routine check-up. BP 138/88.',
                'doctor_name' => 'Dr. Karim Hossain',
                'department' => 'Cardiology',
                'reference_id' => 'appt-001',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        DB::table('doctor_performances')->updateOrInsert(
            ['tenant_id' => $tenantId, 'doctor_id' => $userIds['doctor'] ?? 1],
            [
                'patients_seen' => 287,
                'revenue_generated_bdt' => 430500,
                'avg_appointment_minutes' => 28,
                'patient_satisfaction_score' => 4.8,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        $series = [
            'revenue_trend' => [
                ['Mon', 245000], ['Tue', 268000], ['Wed', 284500], ['Thu', 312000], ['Fri', 298000], ['Sat', 254000], ['Sun', 198000],
            ],
            'patient_visits_trend' => [
                ['Week 1', 820], ['Week 2', 912], ['Week 3', 875], ['Week 4', 968],
            ],
            'department_revenue' => [
                ['Cardiology', 1420000], ['Pediatrics', 890000], ['Gynecology', 760000], ['Orthopedics', 680000],
            ],
        ];

        foreach ($series as $key => $points) {
            foreach ($points as [$label, $value]) {
                DB::table('analytics_series')->updateOrInsert(
                    ['tenant_id' => $tenantId, 'series_key' => $key, 'label' => $label],
                    ['value' => $value, 'created_at' => now(), 'updated_at' => now()]
                );
            }
        }
    }
}

