<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function users()
    {
        return response()->json(
            User::select('id', 'name', 'email', 'role', 'created_at')
                ->latest()
                ->paginate(50)
        );
    }

    public function events()
    {
        return response()->json(
            Event::with('user:id,name,email')
                ->latest()
                ->paginate(50)
        );
    }

    public function stats()
    {
        // ── KPI cards ──
        $totalUsers = User::count();
        $totalEvents = Event::count();
        $totalRevenue = Event::sum('total_price');
        $avgGuests = round(Event::avg('guest_count'));
        $adminCount = User::where('role', 'admin')->count();
        $clientCount = User::where('role', 'client')->count();

        // ── Events by type (pie chart) ──
        $eventsByType = Event::select('event_type', DB::raw('count(*) as count'))
            ->groupBy('event_type')
            ->get();

        // ── Events by status (pie chart) ──
        $eventsByStatus = Event::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        // ── Monthly registrations (bar chart – last 6 months) ──
        $monthlyUsers = User::select(
            DB::raw("strftime('%Y-%m', created_at) as month"),
            DB::raw('count(*) as count')
        )
            ->where('created_at', '>=', now()->subMonths(6)->startOfMonth())
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // ── Monthly revenue (area chart – last 6 months) ──
        $monthlyRevenue = Event::select(
            DB::raw("strftime('%Y-%m', created_at) as month"),
            DB::raw('sum(total_price) as revenue'),
            DB::raw('count(*) as events')
        )
            ->where('created_at', '>=', now()->subMonths(6)->startOfMonth())
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // ── Top 5 clients by revenue ──
        $topClients = Event::select(
            'user_id',
            DB::raw('sum(total_price) as total_revenue'),
            DB::raw('count(*) as event_count')
        )
            ->groupBy('user_id')
            ->orderByDesc('total_revenue')
            ->limit(5)
            ->with('user:id,name')
            ->get()
            ->map(fn ($e) => [
            'name' => $e->user->name ?? 'Inconnu',
            'total_revenue' => $e->total_revenue,
            'event_count' => $e->event_count,
        ]);

        // ── Budget vs Actual (scatter-style data) ──
        $budgetVsActual = Event::select('title', 'budget', 'total_price')
            ->whereNotNull('budget')
            ->get();

        return response()->json([
            'kpis' => [
                'totalUsers' => $totalUsers,
                'totalEvents' => $totalEvents,
                'totalRevenue' => $totalRevenue,
                'avgGuests' => $avgGuests,
                'adminCount' => $adminCount,
                'clientCount' => $clientCount,
            ],
            'eventsByType' => $eventsByType,
            'eventsByStatus' => $eventsByStatus,
            'monthlyUsers' => $monthlyUsers,
            'monthlyRevenue' => $monthlyRevenue,
            'topClients' => $topClients,
            'budgetVsActual' => $budgetVsActual,
        ]);
    }
}
