<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Admission extends Model
{
    public $timestamps = false;

    protected $primaryKey = 'admission_id';

    protected $fillable = ['patient_id', 'bed_id', 'admit_date', 'discharge_date'];

    protected function casts(): array
    {
        return [
            'admit_date' => 'datetime',
            'discharge_date' => 'datetime',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'patient_id', 'patient_id');
    }

    public function bed(): BelongsTo
    {
        return $this->belongsTo(Bed::class, 'bed_id', 'bed_id');
    }
}
