<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LabTest extends Model
{
    public $timestamps = false;

    protected $primaryKey = 'lab_id';

    protected $fillable = ['patient_id', 'technician_id', 'test_type'];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'patient_id', 'patient_id');
    }

    public function technician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'technician_id', 'user_id');
    }

    public function results(): HasMany
    {
        return $this->hasMany(LabResult::class, 'lab_id', 'lab_id');
    }
}
