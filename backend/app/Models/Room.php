<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    protected $fillable = [
        'event_id', 'table_layout', 'decoration_style',
        'lighting_style', 'custom_options'
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function roomDecorations(): HasMany
    {
        return $this->hasMany(RoomDecoration::class);
    }
}
