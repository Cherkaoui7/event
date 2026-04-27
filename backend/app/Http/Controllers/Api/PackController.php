<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pack;
use App\Services\EventPricingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PackController extends Controller
{
    public function index()
    {
        return response()->json(Pack::with('packCaterings.cateringItem')->where('active', true)->get());
    }

    public function show($id)
    {
        return response()->json(Pack::with('packCaterings.cateringItem')->findOrFail($id));
    }

    public function apply(Request $request, $eventId)
    {
        $event = Auth::user()->events()->findOrFail($eventId);
        $request->validate(['pack_id' => 'required|exists:packs,id']);
        $pack = Pack::with('packCaterings.cateringItem')->findOrFail($request->pack_id);

        // Appliquer les styles à la salle
        $room = $event->room ?? $event->room()->create([]);
        $room->update([
            'table_layout' => $pack->table_layout,
            'decoration_style' => $pack->decoration_style,
            'lighting_style' => $pack->lighting_style,
        ]);

        // Supprimer plats existants et appliquer ceux du pack
        $event->eventCaterings()->delete();
        $guestCount = max($event->guest_count, 1);

        foreach ($pack->packCaterings as $pc) {
            $quantity = (int) ($guestCount * $pc->quantity_per_guest);
            $event->eventCaterings()->create([
                'catering_item_id' => $pc->catering_item_id,
                'quantity' => $quantity,
                'line_total' => $quantity * $pc->cateringItem->price_per_person,
            ]);
        }

        EventPricingService::calculate($event->fresh());

        return response()->json($event->fresh()->load(['room', 'eventCaterings.cateringItem']));
    }
}
