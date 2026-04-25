<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Medicine extends Model
{
    public $timestamps = false;

    protected $primaryKey = 'medicine_id';

    protected $fillable = ['name', 'generic_name', 'stock'];

    public function prescriptionItems(): HasMany
    {
        return $this->hasMany(PrescriptionItem::class, 'medicine_id', 'medicine_id');
    }

    public function inventoryItems(): HasMany
    {
        return $this->hasMany(Inventory::class, 'medicine_id', 'medicine_id');
    }

    public function dispenses(): HasMany
    {
        return $this->hasMany(Dispense::class, 'medicine_id', 'medicine_id');
    }
}
