<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PrescriptionItem extends Model
{
    public $timestamps = false;

    protected $primaryKey = 'item_id';

    protected $fillable = ['rx_id', 'medicine_id', 'dosage', 'frequency', 'duration'];

    public function prescription(): BelongsTo
    {
        return $this->belongsTo(Prescription::class, 'rx_id', 'rx_id');
    }

    public function medicine(): BelongsTo
    {
        return $this->belongsTo(Medicine::class, 'medicine_id', 'medicine_id');
    }
}
