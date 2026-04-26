<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PackCatering extends Model
{
    protected $table = 'pack_catering';

    protected $fillable = ['pack_id', 'catering_item_id', 'quantity_per_guest'];

    public function pack(): BelongsTo
    {
        return $this->belongsTo(Pack::class);
    }

    public function cateringItem(): BelongsTo
    {
        return $this->belongsTo(CateringItem::class);
    }
}
