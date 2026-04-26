<?php
namespace App\Services;

use App\Models\Event;

class EventPricingService
{
    private static array $decoPrices = [
        'zellige'              => 15000,
        'traditionnel_marocain'=> 20000,
        'moderne'              => 12000,
    ];

    private static array $lightPrices = [
        'tamise'               => 2000,
        'spots'                => 3500,
        'lustres_traditionnels'=> 5000,
    ];

    private static array $layoutPrices = [
        'classique_rond'       => 1200,
        'rectangulaire'        => 1000,
        'u_shape'              => 2000,
        'cocktail'             => 800,
    ];

    public static function calculate(Event $event): void
    {
        $total = 0;

        $room = $event->room;
        if ($room) {
            $total += self::$decoPrices[$room->decoration_style]  ?? 0;
            $total += self::$lightPrices[$room->lighting_style]   ?? 0;
            $total += self::$layoutPrices[$room->table_layout]    ?? 0;

            foreach ($room->roomDecorations()->with('decoration')->get() as $rd) {
                $total += $rd->line_total;
            }
        }

        foreach ($event->eventCaterings as $catering) {
            $total += $catering->line_total;
        }

        $event->update(['total_price' => $total]);
    }

    public static function getPrices(): array
    {
        return [
            'decoration'  => self::$decoPrices,
            'lighting'    => self::$lightPrices,
            'table_layout'=> self::$layoutPrices,
        ];
    }
}
