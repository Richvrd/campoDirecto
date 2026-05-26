<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_list_categories()
    {
        Category::create(['name' => 'Verduras', 'icon' => 'leaf']);
        Category::create(['name' => 'Frutas', 'icon' => 'fruit']);

        $user = User::factory()->unlocked()->create(['role' => 'comprador']);

        $response = $this->actingAs($user)->getJson('/api/categories');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    public function test_categories_include_product_count()
    {
        $category = Category::create(['name' => 'Verduras', 'icon' => 'leaf']);

        $user = User::factory()->unlocked()->create(['role' => 'comprador']);

        $response = $this->actingAs($user)->getJson('/api/categories');

        $response->assertStatus(200)
            ->assertJsonStructure(['success', 'data' => [['id', 'name', 'icon', 'products_count']]]);
    }
}
