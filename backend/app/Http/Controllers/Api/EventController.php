<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EventController extends Controller
{
    public function index()
    {
        $events = Auth::user()->events()->latest()->get();
        return response()->json($events);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title'       => 'required|string|max:255',
            'event_type'  => 'required|string|max:100',
            'guest_count' => 'integer|min:1',
            'budget'      => 'numeric|nullable',
        ]);

        $event = Auth::user()->events()->create([
            'title'       => $request->title,
            'event_type'  => $request->event_type,
            'guest_count' => $request->guest_count ?? 0,
            'budget'      => $request->budget,
            'status'      => 'draft',
            'total_price' => 0,
        ]);

        return response()->json($event, 201);
    }

    public function show($id)
    {
        $event = Auth::user()->events()
            ->with(['room', 'eventCaterings.cateringItem'])
            ->findOrFail($id);
        return response()->json($event);
    }

    public function update(Request $request, $id)
    {
        $event = Auth::user()->events()->findOrFail($id);

        $request->validate([
            'title'       => 'sometimes|string|max:255',
            'event_type'  => 'sometimes|string|max:100',
            'guest_count' => 'sometimes|integer|min:1',
            'budget'      => 'sometimes|numeric|nullable',
            'status'      => 'sometimes|in:draft,confirmed,cancelled',
        ]);

        $event->update($request->only(['title', 'event_type', 'guest_count', 'budget', 'status']));
        return response()->json($event);
    }

    public function destroy($id)
    {
        $event = Auth::user()->events()->findOrFail($id);
        $event->delete();
        return response()->json(['message' => 'Événement supprimé.']);
    }
}
