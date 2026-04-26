<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CateringItem extends Model
{
    protected $fillable = ['name', 'description', 'price_per_person', 'category', 'image_url', 'active'];

    public function eventCaterings(): HasMany
    {
        return $this->hasMany(EventCatering::class);
    }
}
