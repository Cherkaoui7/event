<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Decoration extends Model
{
    protected $fillable = ['name', 'type', 'price', 'image_url', 'active'];

    public function roomDecorations(): HasMany
    {
        return $this->hasMany(RoomDecoration::class);
    }
}
