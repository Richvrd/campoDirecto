<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\User;
use App\Models\Location;
use App\Models\Product;
use App\Models\Reservation;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
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
            Category::updateOrCreate(['name' => $category['name']], $category);
        }

        $agricultor = User::factory()->create([
            'name' => 'Juan Pérez',
            'email' => 'juan@agricultor.cl',
            'role' => 'agricultor',
            'phone' => '+56912345678',
        ]);

        Location::create([
            'user_id' => $agricultor->id,
            'commune' => 'Talca',
            'region' => 'Región del Maule',
            'latitude' => -33.431793,
            'longitude' => -70.652166,
        ]);

        $comprador = User::factory()->create([
            'name' => 'María González',
            'email' => 'maria@comprador.cl',
            'role' => 'comprador',
            'phone' => '+56987654321',
        ]);

        Location::create([
            'user_id' => $comprador->id,
            'commune' => 'San Clemente',
            'region' => 'Región del Maule',
            'latitude' => -33.822560,
            'longitude' => -70.728743,
        ]);

        $category = Category::where('name', 'Verduras')->first();

        Product::create([
            'user_id' => $agricultor->id,
            'category_id' => $category->id,
            'name' => 'Tomates frescos',
            'description' => 'Tomates cultivados orgánicamente sin pesticidas. Ideal para ensaladas.',
            'price' => 1500,
            'unit' => 'kg',
            'stock' => 50,
            'status' => 'disponible',
        ]);

        Product::create([
            'user_id' => $agricultor->id,
            'category_id' => $category->id,
            'name' => 'Lechuga romana',
            'description' => 'Lechuga fresca de la región, ideal para degustar.',
            'price' => 800,
            'unit' => 'unidad',
            'stock' => 100,
            'status' => 'disponible',
        ]);

        Product::create([
            'user_id' => $agricultor->id,
            'category_id' => $category->id,
            'name' => 'Zanahorias',
            'description' => 'Zanahorias dulces y crujientes, perfectas para cocinar.',
            'price' => 1200,
            'unit' => 'kg',
            'stock' => 30,
            'status' => 'disponible',
        ]);

        Product::create([
            'user_id' => $agricultor->id,
            'category_id' => $category->id,
            'name' => 'Pepinos',
            'description' => 'Pepinos frescos de cultivo local, sin conservantes.',
            'price' => 1000,
            'unit' => 'kg',
            'stock' => 25,
            'status' => 'disponible',
        ]);

        Product::create([
            'user_id' => $agricultor->id,
            'category_id' => $category->id,
            'name' => 'Ajos',
            'description' => 'Ajos de cultivo propio, perfectos para condimentar.',
            'price' => 2000,
            'unit' => 'kg',
            'stock' => 15,
            'status' => 'disponible',
        ]);

        Reservation::create([
            'buyer_id' => $comprador->id,
            'product_id' => 1,
            'quantity' => 2,
            'status' => 'pendiente',
            'notes' => 'Entrega en Talca el próximo martes',
        ]);
    }
}
