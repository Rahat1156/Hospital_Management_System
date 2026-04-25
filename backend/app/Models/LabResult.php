<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LabResult extends Model
{
    public $timestamps = false;

    protected $primaryKey = 'result_id';

    protected $fillable = ['lab_id', 'result_value', 'flag', 'report_url'];

    public function labTest(): BelongsTo
    {
        return $this->belongsTo(LabTest::class, 'lab_id', 'lab_id');
    }
}
