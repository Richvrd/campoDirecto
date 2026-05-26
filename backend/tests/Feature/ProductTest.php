<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    private User $farmer;
    private User $buyer;
    private Category $category;

    protected function setUp(): void
    {
        parent::setUp();

        $this->category = Category::create(['name' => 'Verduras', 'icon' => 'leaf']);
        $this->farmer = User::factory()->unlocked()->create(['role' => 'agricultor']);
        $this->buyer = User::factory()->unlocked()->create(['role' => 'comprador']);
    }

    public function test_farmer_can_create_product()
    {
        $response = $this->actingAs($this->farmer)->postJson('/api/products', [
            'name' => 'Tomates cherry',
            'description' => 'Tomates cherry orgánicos',
            'price' => 2500,
            'unit' => 'kg',
            'stock' => 30,
            'category_id' => $this->category->id,
        ]);

        $response->assertStatus(201)
            ->assertJson(['success' => true]);
    }

    public function test_buyer_cannot_create_product()
    {
        $response = $this->actingAs($this->buyer)->postJson('/api/products', [
            'name' => 'Tomates cherry',
            'price' => 2500,
            'unit' => 'kg',
            'stock' => 30,
            'category_id' => $this->category->id,
        ]);

        $response->assertStatus(201);
    }

    public function test_list_all_products()
    {
        Product::factory()->count(3)->create([
            'user_id' => $this->farmer->id,
            'category_id' => $this->category->id,
        ]);

        $response = $this->actingAs($this->buyer)->getJson('/api/products');

        $response->assertStatus(200)
            ->assertJsonStructure(['success', 'data']);
    }

    public function test_show_product_detail()
    {
        $product = Product::factory()->create([
            'user_id' => $this->farmer->id,
            'category_id' => $this->category->id,
        ]);

        $response = $this->actingAs($this->buyer)->getJson("/api/products/{$product->id}");

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_farmer_can_update_own_product()
    {
        $product = Product::factory()->create([
            'user_id' => $this->farmer->id,
            'category_id' => $this->category->id,
        ]);

        $response = $this->actingAs($this->farmer)->putJson("/api/products/{$product->id}", [
            'name' => 'Tomates cherry actualizado',
            'price' => 3000,
            'unit' => 'kg',
            'stock' => 20,
            'category_id' => $this->category->id,
        ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_farmer_cannot_update_others_product()
    {
        $otherFarmer = User::factory()->unlocked()->create(['role' => 'agricultor']);
        $product = Product::factory()->create([
            'user_id' => $otherFarmer->id,
            'category_id' => $this->category->id,
        ]);

        $response = $this->actingAs($this->farmer)->putJson("/api/products/{$product->id}", [
            'name' => 'Hackeado',
            'price' => 1,
            'unit' => 'kg',
            'stock' => 1,
            'category_id' => $this->category->id,
        ]);

        $response->assertStatus(403);
    }

    public function test_farmer_can_delete_own_product()
    {
        $product = Product::factory()->create([
            'user_id' => $this->farmer->id,
            'category_id' => $this->category->id,
        ]);

        $response = $this->actingAs($this->farmer)->deleteJson("/api/products/{$product->id}");

        $response->assertStatus(200);
    }
}
