<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Prescription extends Model
{
    public $timestamps = false;

    protected $primaryKey = 'rx_id';

    protected $fillable = ['appt_id', 'patient_id', 'doctor_id', 'diagnosis', 'signed_at'];

    protected function casts(): array
    {
        return ['signed_at' => 'datetime'];
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class, 'appt_id', 'appt_id');
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'patient_id', 'patient_id');
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id', 'user_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(PrescriptionItem::class, 'rx_id', 'rx_id');
    }

    public function dispenses(): HasMany
    {
        return $this->hasMany(Dispense::class, 'rx_id', 'rx_id');
    }
}
