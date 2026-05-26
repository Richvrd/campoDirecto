<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Verduras', 'icon' => 'leaf'],
            ['name' => 'Frutas', 'icon' => 'fruit'],
            ['name' => 'Lácteos', 'icon' => 'milk'],
            ['name' => 'Huevos', 'icon' => 'egg'],
            ['name' => 'Cereales', 'icon' => 'wheat'],
            ['name' => 'Legumbres', 'icon' => 'bean'],
            ['name' => 'Hierbas', 'icon' => 'herb'],
            ['name' => 'Otros', 'icon' => 'box'],
        ];

        foreach ($categories as $category) {
            \App\Models\Category::updateOrCreate(['name' => $category['name']], $category);
        }
    }
}
