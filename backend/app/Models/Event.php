<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Event extends Model
{
    protected $fillable = [
        'user_id', 'title', 'event_type', 'status',
        'guest_count', 'budget', 'total_price'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function room(): HasOne
    {
        return $this->hasOne(Room::class);
    }

    public function eventCaterings(): HasMany
    {
        return $this->hasMany(EventCatering::class);
    }
}
