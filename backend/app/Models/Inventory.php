<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Inventory extends Model
{
    public $timestamps = false;

    protected $table = 'inventory';
    protected $primaryKey = 'inventory_id';

    protected $fillable = ['medicine_id', 'quantity', 'expiry_date'];

    protected function casts(): array
    {
        return ['expiry_date' => 'date'];
    }

    public function medicine(): BelongsTo
    {
        return $this->belongsTo(Medicine::class, 'medicine_id', 'medicine_id');
    }
}
