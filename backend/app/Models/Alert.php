<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Alert extends Model
{
    public $timestamps = false;

    protected $primaryKey = 'alert_id';

    protected $fillable = ['tenant_id', 'trigger_type', 'recipient_id', 'status', 'sent_at', 'ack_at'];

    protected function casts(): array
    {
        return [
            'sent_at' => 'datetime',
            'ack_at' => 'datetime',
        ];
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class, 'tenant_id', 'tenant_id');
    }

    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_id', 'user_id');
    }
}
