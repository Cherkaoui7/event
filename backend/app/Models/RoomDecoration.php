<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RoomDecoration extends Model
{
    protected $fillable = ['room_id', 'decoration_id', 'quantity', 'line_total'];

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function decoration(): BelongsTo
    {
        return $this->belongsTo(Decoration::class);
    }
}
