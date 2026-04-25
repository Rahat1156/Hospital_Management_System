<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tenant extends Model
{
    public const UPDATED_AT = null;

    protected $primaryKey = 'tenant_id';

    protected $fillable = ['name', 'subdomain', 'plan', 'status'];

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'tenant_id', 'tenant_id');
    }

    public function patients(): HasMany
    {
        return $this->hasMany(Patient::class, 'tenant_id', 'tenant_id');
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'tenant_id', 'tenant_id');
    }

    public function wards(): HasMany
    {
        return $this->hasMany(Ward::class, 'tenant_id', 'tenant_id');
    }

    public function bills(): HasMany
    {
        return $this->hasMany(Bill::class, 'tenant_id', 'tenant_id');
    }

    public function alerts(): HasMany
    {
        return $this->hasMany(Alert::class, 'tenant_id', 'tenant_id');
    }
}
