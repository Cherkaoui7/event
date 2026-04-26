<?php
namespace Database\Seeders;

use App\Models\CateringItem;
use App\Models\Pack;
use Illuminate\Database\Seeder;

class PackSeeder extends Seeder
{
    public function run(): void
    {
        // Pack Mariage Économique
        $eco = Pack::create([
            'name'             => 'Mariage économique',
            'description'      => 'Mariage sobre et élégant : décoration zellige, tables rondes, couscous royal et pâtisseries.',
            'event_type'       => 'mariage',
            'base_price'       => 25000.00,
            'decoration_style' => 'zellige',
            'lighting_style'   => 'tamise',
            'table_layout'     => 'classique_rond',
        ]);
        $couscous    = CateringItem::where('name', 'Couscous royal')->first();
        $patisseries = CateringItem::where('name', 'Pâtisseries marocaines assorties')->first();
        if ($couscous)    $eco->packCaterings()->create(['catering_item_id' => $couscous->id,    'quantity_per_guest' => 1]);
        if ($patisseries) $eco->packCaterings()->create(['catering_item_id' => $patisseries->id, 'quantity_per_guest' => 1]);

        // Pack Mariage Luxe
        $luxe = Pack::create([
            'name'             => 'Mariage luxe',
            'description'      => 'Mariage somptueux : décoration marocaine traditionnelle, lustres fer forgé, disposition en U, traiteur complet.',
            'event_type'       => 'mariage',
            'base_price'       => 50000.00,
            'decoration_style' => 'traditionnel_marocain',
            'lighting_style'   => 'lustres_traditionnels',
            'table_layout'     => 'u_shape',
        ]);
        $tajine  = CateringItem::where('name', 'Tajine de poulet aux olives')->first();
        $pastilla= CateringItem::where('name', 'Pastilla au poulet')->first();
        $mechoui = CateringItem::where('name', 'Méchoui traditionnel')->first();
        $the     = CateringItem::where('name', 'Thé à la menthe & douceurs')->first();
        if ($tajine)  $luxe->packCaterings()->create(['catering_item_id' => $tajine->id,  'quantity_per_guest' => 0.8]);
        if ($pastilla)$luxe->packCaterings()->create(['catering_item_id' => $pastilla->id,'quantity_per_guest' => 0.5]);
        if ($mechoui) $luxe->packCaterings()->create(['catering_item_id' => $mechoui->id, 'quantity_per_guest' => 0.7]);
        if ($the)     $luxe->packCaterings()->create(['catering_item_id' => $the->id,     'quantity_per_guest' => 1]);

        // Pack Anniversaire
        Pack::create([
            'name'             => 'Anniversaire festif',
            'description'      => 'Fête d\'anniversaire colorée et moderne avec traiteur léger.',
            'event_type'       => 'anniversaire',
            'base_price'       => 15000.00,
            'decoration_style' => 'moderne',
            'lighting_style'   => 'spots',
            'table_layout'     => 'cocktail',
        ]);
    }
}
