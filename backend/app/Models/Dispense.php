<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Dispense extends Model
{
    public $timestamps = false;

    protected $primaryKey = 'dispense_id';

    protected $fillable = ['rx_id', 'medicine_id', 'quantity', 'dispensed_by', 'dispensed_at'];

    protected function casts(): array
    {
        return ['dispensed_at' => 'datetime'];
    }

    public function prescription(): BelongsTo
    {
        return $this->belongsTo(Prescription::class, 'rx_id', 'rx_id');
    }

    public function medicine(): BelongsTo
    {
        return $this->belongsTo(Medicine::class, 'medicine_id', 'medicine_id');
    }

    public function dispenser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dispensed_by', 'user_id');
    }
}
