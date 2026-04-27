<?php

namespace Database\Seeders;

use App\Models\CateringItem;
use Illuminate\Database\Seeder;

class CateringItemSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            ['name' => 'Pastilla au poulet',             'category' => 'entrée',  'price_per_person' => 130.00, 'description' => 'Feuilleté sucré-salé traditionnel marocain'],
            ['name' => 'Couscous royal',                 'category' => 'plat',    'price_per_person' => 180.00, 'description' => 'Couscous avec merguez, agneau et légumes'],
            ['name' => 'Tajine de poulet aux olives',    'category' => 'plat',    'price_per_person' => 150.00, 'description' => 'Tajine mijoté aux olives et citron confit'],
            ['name' => 'Méchoui traditionnel',           'category' => 'plat',    'price_per_person' => 250.00, 'description' => 'Agneau entier rôti à la braise'],
            ['name' => 'Pâtisseries marocaines assorties', 'category' => 'dessert', 'price_per_person' => 80.00,  'description' => 'Cornes de gazelle, briouates, chebakia'],
            ['name' => 'Thé à la menthe & douceurs',     'category' => 'dessert', 'price_per_person' => 40.00,  'description' => 'Service thé traditionnel avec fruits secs'],
        ];

        foreach ($items as $item) {
            CateringItem::create($item);
        }
    }
}
