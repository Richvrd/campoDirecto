<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_profile()
    {
        $user = User::factory()->unlocked()->create(['role' => 'comprador']);

        $response = $this->actingAs($user)->getJson('/api/profile');

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_user_can_update_profile()
    {
        $user = User::factory()->unlocked()->create(['role' => 'comprador']);

        $response = $this->actingAs($user)->putJson('/api/profile', [
            'name' => 'Nuevo Nombre',
            'phone' => '+56912345678',
            'commune' => 'Talca',
        ]);

        $response->assertStatus(200);
        $this->assertEquals('Nuevo Nombre', $user->fresh()->name);
    }

    public function test_user_can_update_expo_push_token()
    {
        $user = User::factory()->unlocked()->create(['role' => 'comprador']);

        $response = $this->actingAs($user)->putJson('/api/profile', [
            'name' => 'Test User',
            'expo_push_token' => 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
        ]);

        $response->assertStatus(200);
        $this->assertEquals(
            'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
            $user->fresh()->expo_push_token
        );
    }
}
