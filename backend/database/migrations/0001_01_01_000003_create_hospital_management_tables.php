<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->id('patient_id');
            $table->foreignId('tenant_id')->constrained('tenants', 'tenant_id')->cascadeOnUpdate()->cascadeOnDelete();
            $table->string('mrn')->unique();
            $table->string('name');
            $table->date('dob')->nullable();
            $table->string('nid')->nullable()->unique();
            $table->string('gender')->nullable();
            $table->string('blood_group')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
        });

        Schema::create('guardians', function (Blueprint $table) {
            $table->id('guardian_id');
            $table->foreignId('patient_id')->constrained('patients', 'patient_id')->cascadeOnUpdate()->cascadeOnDelete();
            $table->string('name');
            $table->string('phone')->nullable();
        });

        Schema::create('appointments', function (Blueprint $table) {
            $table->id('appt_id');
            $table->foreignId('tenant_id')->constrained('tenants', 'tenant_id')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('patient_id')->constrained('patients', 'patient_id')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('doctor_id')->constrained('users', 'user_id')->cascadeOnUpdate()->restrictOnDelete();
            $table->timestamp('slot_datetime');
            $table->string('status')->default('scheduled');
        });

        Schema::create('medicines', function (Blueprint $table) {
            $table->id('medicine_id');
            $table->string('name');
            $table->string('generic_name')->nullable();
            $table->integer('stock')->default(0);
        });

        Schema::create('prescriptions', function (Blueprint $table) {
            $table->id('rx_id');
            $table->foreignId('appt_id')->nullable()->constrained('appointments', 'appt_id')->cascadeOnUpdate()->nullOnDelete();
            $table->foreignId('patient_id')->constrained('patients', 'patient_id')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('doctor_id')->constrained('users', 'user_id')->cascadeOnUpdate()->restrictOnDelete();
            $table->text('diagnosis')->nullable();
            $table->timestamp('signed_at')->nullable();
        });

        Schema::create('prescription_items', function (Blueprint $table) {
            $table->id('item_id');
            $table->foreignId('rx_id')->constrained('prescriptions', 'rx_id')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('medicine_id')->constrained('medicines', 'medicine_id')->cascadeOnUpdate()->restrictOnDelete();
            $table->string('dosage')->nullable();
            $table->string('frequency')->nullable();
            $table->string('duration')->nullable();
        });

        Schema::create('inventory', function (Blueprint $table) {
            $table->id('inventory_id');
            $table->foreignId('medicine_id')->constrained('medicines', 'medicine_id')->cascadeOnUpdate()->cascadeOnDelete();
            $table->integer('quantity')->default(0);
            $table->date('expiry_date')->nullable();
        });

        Schema::create('dispenses', function (Blueprint $table) {
            $table->id('dispense_id');
            $table->foreignId('rx_id')->constrained('prescriptions', 'rx_id')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('medicine_id')->constrained('medicines', 'medicine_id')->cascadeOnUpdate()->restrictOnDelete();
            $table->integer('quantity');
            $table->foreignId('dispensed_by')->constrained('users', 'user_id')->cascadeOnUpdate()->restrictOnDelete();
            $table->timestamp('dispensed_at')->nullable();
        });

        Schema::create('wards', function (Blueprint $table) {
            $table->id('ward_id');
            $table->foreignId('tenant_id')->constrained('tenants', 'tenant_id')->cascadeOnUpdate()->cascadeOnDelete();
            $table->string('name');
        });

        Schema::create('beds', function (Blueprint $table) {
            $table->id('bed_id');
            $table->foreignId('ward_id')->constrained('wards', 'ward_id')->cascadeOnUpdate()->cascadeOnDelete();
            $table->string('bed_number');
            $table->string('status')->default('available');
        });

        Schema::create('admissions', function (Blueprint $table) {
            $table->id('admission_id');
            $table->foreignId('patient_id')->constrained('patients', 'patient_id')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('bed_id')->constrained('beds', 'bed_id')->cascadeOnUpdate()->restrictOnDelete();
            $table->timestamp('admit_date');
            $table->timestamp('discharge_date')->nullable();
        });

        Schema::create('lab_tests', function (Blueprint $table) {
            $table->id('lab_id');
            $table->foreignId('patient_id')->constrained('patients', 'patient_id')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('technician_id')->nullable()->constrained('users', 'user_id')->cascadeOnUpdate()->nullOnDelete();
            $table->string('test_type');
        });

        Schema::create('lab_results', function (Blueprint $table) {
            $table->id('result_id');
            $table->foreignId('lab_id')->constrained('lab_tests', 'lab_id')->cascadeOnUpdate()->cascadeOnDelete();
            $table->string('result_value')->nullable();
            $table->string('flag')->nullable();
            $table->string('report_url')->nullable();
        });

        Schema::create('bills', function (Blueprint $table) {
            $table->id('bill_id');
            $table->foreignId('tenant_id')->constrained('tenants', 'tenant_id')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('patient_id')->constrained('patients', 'patient_id')->cascadeOnUpdate()->cascadeOnDelete();
            $table->decimal('total', 12, 2)->default(0);
            $table->string('status')->default('unpaid');
        });

        Schema::create('bill_items', function (Blueprint $table) {
            $table->id('item_id');
            $table->foreignId('bill_id')->constrained('bills', 'bill_id')->cascadeOnUpdate()->cascadeOnDelete();
            $table->string('description');
            $table->decimal('amount', 12, 2);
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id('payment_id');
            $table->foreignId('bill_id')->constrained('bills', 'bill_id')->cascadeOnUpdate()->cascadeOnDelete();
            $table->decimal('amount', 12, 2);
            $table->string('method');
            $table->timestamp('paid_at')->nullable();
        });

        Schema::create('emergency_requests', function (Blueprint $table) {
            $table->id('emergency_id');
            $table->foreignId('patient_id')->constrained('patients', 'patient_id')->cascadeOnUpdate()->cascadeOnDelete();
            $table->string('status')->default('open');
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('ambulances', function (Blueprint $table) {
            $table->id('ambulance_id');
            $table->string('status')->default('available');
        });

        Schema::create('alerts', function (Blueprint $table) {
            $table->id('alert_id');
            $table->foreignId('tenant_id')->constrained('tenants', 'tenant_id')->cascadeOnUpdate()->cascadeOnDelete();
            $table->string('trigger_type');
            $table->foreignId('recipient_id')->nullable()->constrained('users', 'user_id')->cascadeOnUpdate()->nullOnDelete();
            $table->string('status')->default('pending');
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('ack_at')->nullable();
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id('log_id');
            $table->foreignId('tenant_id')->nullable()->constrained('tenants', 'tenant_id')->cascadeOnUpdate()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users', 'user_id')->cascadeOnUpdate()->nullOnDelete();
            $table->string('action');
            $table->unsignedBigInteger('record_id')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('alerts');
        Schema::dropIfExists('ambulances');
        Schema::dropIfExists('emergency_requests');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('bill_items');
        Schema::dropIfExists('bills');
        Schema::dropIfExists('lab_results');
        Schema::dropIfExists('lab_tests');
        Schema::dropIfExists('admissions');
        Schema::dropIfExists('beds');
        Schema::dropIfExists('wards');
        Schema::dropIfExists('dispenses');
        Schema::dropIfExists('inventory');
        Schema::dropIfExists('prescription_items');
        Schema::dropIfExists('prescriptions');
        Schema::dropIfExists('medicines');
        Schema::dropIfExists('appointments');
        Schema::dropIfExists('guardians');
        Schema::dropIfExists('patients');
    }
};
