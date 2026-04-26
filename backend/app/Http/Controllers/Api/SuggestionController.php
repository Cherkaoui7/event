<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CateringItem;
use App\Services\EventPricingService;
use Illuminate\Http\Request;

class SuggestionController extends Controller
{
    public function suggest(Request $request)
    {
        $request->validate([
            'event_type'  => 'required|string',
            'budget'      => 'required|numeric|min:1000',
            'guest_count' => 'integer|min:1',
        ]);

        $budget  = $request->budget;
        $guests  = $request->guest_count ?? 100;
        $allPlats = CateringItem::where('active', true)->get();

        if ($budget < 20000) {
            $suggestion = [
                'decoration_style' => 'zellige',
                'lighting_style'   => 'tamise',
                'table_layout'     => 'classique_rond',
                'plats'            => $this->platsByCategory($allPlats, ['entrée', 'plat'], $guests),
            ];
        } elseif ($budget < 40000) {
            $suggestion = [
                'decoration_style' => 'moderne',
                'lighting_style'   => 'spots',
                'table_layout'     => 'rectangulaire',
                'plats'            => $this->platsByCategory($allPlats, ['entrée', 'plat', 'dessert'], $guests),
            ];
        } else {
            $suggestion = [
                'decoration_style' => 'traditionnel_marocain',
                'lighting_style'   => 'lustres_traditionnels',
                'table_layout'     => 'u_shape',
                'plats'            => $this->platsByCategory($allPlats, ['entrée', 'plat', 'dessert'], $guests, true),
            ];
        }

        $prices    = EventPricingService::getPrices();
        $estimated = ($prices['decoration'][$suggestion['decoration_style']] ?? 0)
                   + ($prices['lighting'][$suggestion['lighting_style']] ?? 0)
                   + ($prices['table_layout'][$suggestion['table_layout']] ?? 0);

        foreach ($suggestion['plats'] as $plat) {
            $item = CateringItem::find($plat['id']);
            if ($item) $estimated += $item->price_per_person * $plat['quantity'];
        }

        return response()->json([
            'suggestion'      => $suggestion,
            'estimated_price' => $estimated,
        ]);
    }

    private function platsByCategory($allPlats, array $categories, int $guests, bool $luxe = false): array
    {
        $result = [];
        foreach ($categories as $cat) {
            $item = $allPlats->where('category', $cat)->first();
            if ($item) {
                $result[] = [
                    'id'       => $item->id,
                    'name'     => $item->name,
                    'quantity' => $luxe ? (int)($guests * 0.8) : $guests,
                ];
            }
        }
        return $result;
    }
}
