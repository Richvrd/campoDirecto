<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReservationTest extends TestCase
{
    use RefreshDatabase;

    private User $farmer;
    private User $buyer;
    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $category = Category::create(['name' => 'Frutas', 'icon' => 'fruit']);
        $this->farmer = User::factory()->unlocked()->create(['role' => 'agricultor']);
        $this->buyer = User::factory()->unlocked()->create(['role' => 'comprador']);

        $this->product = Product::factory()->create([
            'user_id' => $this->farmer->id,
            'category_id' => $category->id,
            'stock' => 10,
            'status' => 'disponible',
        ]);
    }

    public function test_buyer_can_create_reservation()
    {
        $response = $this->actingAs($this->buyer)->postJson('/api/reservations', [
            'product_id' => $this->product->id,
            'quantity' => 2,
        ]);

        $response->assertStatus(201)
            ->assertJson(['success' => true]);
    }

    public function test_reservation_decrements_stock()
    {
        $this->actingAs($this->buyer)->postJson('/api/reservations', [
            'product_id' => $this->product->id,
            'quantity' => 3,
        ]);

        $this->assertEquals(7, $this->product->fresh()->stock);
    }

    public function test_cannot_reserve_unavailable_product()
    {
        $this->product->update(['status' => 'agotado']);

        $response = $this->actingAs($this->buyer)->postJson('/api/reservations', [
            'product_id' => $this->product->id,
            'quantity' => 1,
        ]);

        $response->assertStatus(400);
    }

    public function test_cannot_reserve_more_than_stock()
    {
        $response = $this->actingAs($this->buyer)->postJson('/api/reservations', [
            'product_id' => $this->product->id,
            'quantity' => 100,
        ]);

        $response->assertStatus(400);
    }

    public function test_farmer_can_update_reservation_status()
    {
        $reservation = $this->buyer->reservationsAsBuyer()->create([
            'product_id' => $this->product->id,
            'quantity' => 2,
            'status' => 'pendiente',
        ]);

        $response = $this->actingAs($this->farmer)
            ->putJson("/api/reservations/{$reservation->id}/status", [
                'status' => 'confirmada',
            ]);

        $response->assertStatus(200);
    }

    public function test_rejected_reservation_restores_stock()
    {
        $this->product->decrement('stock', 2);

        $reservation = $this->buyer->reservationsAsBuyer()->create([
            'product_id' => $this->product->id,
            'quantity' => 2,
            'status' => 'pendiente',
        ]);

        $this->actingAs($this->farmer)
            ->putJson("/api/reservations/{$reservation->id}/status", [
                'status' => 'rechazada',
            ]);

        $this->assertEquals(10, $this->product->fresh()->stock);
    }

    public function test_buyer_lists_own_reservations()
    {
        $this->buyer->reservationsAsBuyer()->create([
            'product_id' => $this->product->id,
            'quantity' => 1,
            'status' => 'pendiente',
        ]);

        $response = $this->actingAs($this->buyer)->getJson('/api/reservations');

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_farmer_lists_incoming_reservations()
    {
        $this->buyer->reservationsAsBuyer()->create([
            'product_id' => $this->product->id,
            'quantity' => 1,
            'status' => 'pendiente',
        ]);

        $response = $this->actingAs($this->farmer)->getJson('/api/reservations');

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_buyer_cannot_update_status()
    {
        $reservation = $this->buyer->reservationsAsBuyer()->create([
            'product_id' => $this->product->id,
            'quantity' => 1,
            'status' => 'pendiente',
        ]);

        $response = $this->actingAs($this->buyer)
            ->putJson("/api/reservations/{$reservation->id}/status", [
                'status' => 'confirmada',
            ]);

        $response->assertStatus(403);
    }
}
