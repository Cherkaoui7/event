<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\EventPricingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RoomController extends Controller
{
    public function show($eventId)
    {
        $event = Auth::user()->events()->findOrFail($eventId);
        $room  = $event->room;

        if (!$room) {
            return response()->json([
                'table_layout'     => null,
                'decoration_style' => null,
                'lighting_style'   => null,
                'custom_options'   => null,
            ]);
        }

        return response()->json($room);
    }

    public function store(Request $request, $eventId)
    {
        $event = Auth::user()->events()->findOrFail($eventId);

        $validated = $request->validate([
            'table_layout'     => 'nullable|string',
            'decoration_style' => 'nullable|string',
            'lighting_style'   => 'nullable|string',
            'custom_options'   => 'nullable|array',
        ]);

        $room = $event->room;
        if ($room) {
            $room->update($validated);
        } else {
            $room = $event->room()->create($validated);
        }

        EventPricingService::calculate($event->fresh());

        return response()->json($room);
    }
}
