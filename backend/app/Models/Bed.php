<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Bed extends Model
{
    public $timestamps = false;

    protected $primaryKey = 'bed_id';

    protected $fillable = ['ward_id', 'bed_number', 'status'];

    public function ward(): BelongsTo
    {
        return $this->belongsTo(Ward::class, 'ward_id', 'ward_id');
    }

    public function admissions(): HasMany
    {
        return $this->hasMany(Admission::class, 'bed_id', 'bed_id');
    }
}
