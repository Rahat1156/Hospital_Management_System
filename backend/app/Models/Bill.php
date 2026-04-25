<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Bill extends Model
{
    public $timestamps = false;

    protected $primaryKey = 'bill_id';

    protected $fillable = ['tenant_id', 'patient_id', 'total', 'status'];

    protected function casts(): array
    {
        return ['total' => 'decimal:2'];
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class, 'tenant_id', 'tenant_id');
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'patient_id', 'patient_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(BillItem::class, 'bill_id', 'bill_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'bill_id', 'bill_id');
    }
}
