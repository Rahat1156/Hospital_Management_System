<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Patient extends Model
{
    public $timestamps = false;

    protected $primaryKey = 'patient_id';

    protected $fillable = [
        'tenant_id',
        'mrn',
        'name',
        'dob',
        'nid',
        'gender',
        'blood_group',
        'phone',
        'email',
    ];

    protected function casts(): array
    {
        return ['dob' => 'date'];
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class, 'tenant_id', 'tenant_id');
    }

    public function guardians(): HasMany
    {
        return $this->hasMany(Guardian::class, 'patient_id', 'patient_id');
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'patient_id', 'patient_id');
    }

    public function prescriptions(): HasMany
    {
        return $this->hasMany(Prescription::class, 'patient_id', 'patient_id');
    }

    public function admissions(): HasMany
    {
        return $this->hasMany(Admission::class, 'patient_id', 'patient_id');
    }

    public function labTests(): HasMany
    {
        return $this->hasMany(LabTest::class, 'patient_id', 'patient_id');
    }

    public function bills(): HasMany
    {
        return $this->hasMany(Bill::class, 'patient_id', 'patient_id');
    }

    public function emergencyRequests(): HasMany
    {
        return $this->hasMany(EmergencyRequest::class, 'patient_id', 'patient_id');
    }
}
