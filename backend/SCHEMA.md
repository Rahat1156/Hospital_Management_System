# Hospital Management Backend Schema

This Laravel backend follows the ERD from `Hospital management ERD.pdf` and uses PostgreSQL through `DB_CONNECTION=pgsql`.

## Core

- `tenants`: `tenant_id`, `name`, `subdomain`, `plan`, `status`, `created_at`
- `roles`: `role_id`, `role_name`
- `users`: `user_id`, `tenant_id`, `role_id`, `name`, `email`, `phone`, `status`, Laravel auth columns

## Patient And Care Flow

- `patients`: `patient_id`, `tenant_id`, `mrn`, `name`, `dob`, `nid`, `gender`, `blood_group`, `phone`, `email`
- `guardians`: `guardian_id`, `patient_id`, `name`, `phone`
- `appointments`: `appt_id`, `tenant_id`, `patient_id`, `doctor_id`, `slot_datetime`, `status`
- `prescriptions`: `rx_id`, `appt_id`, `patient_id`, `doctor_id`, `diagnosis`, `signed_at`
- `prescription_items`: `item_id`, `rx_id`, `medicine_id`, `dosage`, `frequency`, `duration`

## Pharmacy

- `medicines`: `medicine_id`, `name`, `generic_name`, `stock`
- `inventory`: `inventory_id`, `medicine_id`, `quantity`, `expiry_date`
- `dispenses`: `dispense_id`, `rx_id`, `medicine_id`, `quantity`, `dispensed_by`, `dispensed_at`

## Ward And Admissions

- `wards`: `ward_id`, `tenant_id`, `name`
- `beds`: `bed_id`, `ward_id`, `bed_number`, `status`
- `admissions`: `admission_id`, `patient_id`, `bed_id`, `admit_date`, `discharge_date`

## Lab

- `lab_tests`: `lab_id`, `patient_id`, `technician_id`, `test_type`
- `lab_results`: `result_id`, `lab_id`, `result_value`, `flag`, `report_url`

## Billing

- `bills`: `bill_id`, `tenant_id`, `patient_id`, `total`, `status`
- `bill_items`: `item_id`, `bill_id`, `description`, `amount`
- `payments`: `payment_id`, `bill_id`, `amount`, `method`, `paid_at`

## Operations

- `emergency_requests`: `emergency_id`, `patient_id`, `status`, `created_at`
- `ambulances`: `ambulance_id`, `status`
- `alerts`: `alert_id`, `tenant_id`, `trigger_type`, `recipient_id`, `status`, `sent_at`, `ack_at`
- `audit_logs`: `log_id`, `tenant_id`, `user_id`, `action`, `record_id`, `ip_address`, `created_at`

Run migrations later from the backend folder:

```bash
php artisan migrate
```
