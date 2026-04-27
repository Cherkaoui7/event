<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pack extends Model
{
    protected $fillable = [
        'name', 'description', 'event_type', 'base_price',
        'decoration_style', 'lighting_style', 'table_layout', 'active',
    ];

    public function packCaterings(): HasMany
    {
        return $this->hasMany(PackCatering::class);
    }
}
