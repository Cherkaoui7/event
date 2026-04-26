<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CateringItem;
use App\Services\EventPricingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CateringController extends Controller
{
    public function index()
    {
        return response()->json(CateringItem::where('active', true)->get());
    }

    public function store(Request $request, $eventId)
    {
        $event = Auth::user()->events()->findOrFail($eventId);

        $request->validate([
            'catering_item_id' => 'required|exists:catering_items,id',
            'quantity'         => 'integer|min:1',
        ]);

        $quantity     = $request->quantity ?? $event->guest_count;
        $item         = CateringItem::findOrFail($request->catering_item_id);
        $lineTotal    = $item->price_per_person * $quantity;

        $existing = $event->eventCaterings()->where('catering_item_id', $item->id)->first();
        if ($existing) {
            $existing->quantity   += $quantity;
            $existing->line_total  = $existing->quantity * $item->price_per_person;
            $existing->save();
        } else {
            $event->eventCaterings()->create([
                'catering_item_id' => $item->id,
                'quantity'         => $quantity,
                'line_total'       => $lineTotal,
            ]);
        }

        EventPricingService::calculate($event->fresh());

        return response()->json($event->fresh()->load('eventCaterings.cateringItem'));
    }

    public function update(Request $request, $eventId, $cateringItemId)
    {
        $event        = Auth::user()->events()->findOrFail($eventId);
        $ec           = $event->eventCaterings()->where('catering_item_id', $cateringItemId)->firstOrFail();
        $request->validate(['quantity' => 'required|integer|min:1']);

        $ec->quantity   = $request->quantity;
        $ec->line_total = $ec->quantity * $ec->cateringItem->price_per_person;
        $ec->save();

        EventPricingService::calculate($event->fresh());

        return response()->json($event->fresh()->load('eventCaterings.cateringItem'));
    }

    public function destroy($eventId, $cateringItemId)
    {
        $event = Auth::user()->events()->findOrFail($eventId);
        $event->eventCaterings()->where('catering_item_id', $cateringItemId)->firstOrFail()->delete();

        EventPricingService::calculate($event->fresh());

        return response()->json(['message' => 'Plat retiré.']);
    }
}
