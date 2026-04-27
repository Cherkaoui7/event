<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventCatering extends Model
{
    protected $table = 'event_catering';

    protected $fillable = ['event_id', 'catering_item_id', 'quantity', 'line_total'];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function cateringItem(): BelongsTo
    {
        return $this->belongsTo(CateringItem::class);
    }
}
