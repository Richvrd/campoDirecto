<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register()
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Pedro López',
            'email' => 'pedro@test.cl',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'comprador',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['success', 'data' => ['user', 'token']]);
    }

    public function test_register_validates_required_fields()
    {
        $response = $this->postJson('/api/auth/register', []);

        $response->assertStatus(422);
    }

    public function test_user_can_login()
    {
        $user = User::factory()->unlocked()->create([
            'email' => 'test@test.cl',
            'role' => 'comprador',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@test.cl',
            'password' => 'password',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['success', 'data' => ['user', 'token']]);
    }

    public function test_login_with_invalid_credentials()
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'nobody@test.cl',
            'password' => 'wrong',
        ]);

        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_get_me()
    {
        $user = User::factory()->unlocked()->create(['role' => 'comprador']);

        $response = $this->actingAs($user)->getJson('/api/auth/me');

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_unauthenticated_user_cannot_access_me()
    {
        $response = $this->getJson('/api/auth/me');

        $response->assertStatus(401);
    }

    public function test_user_can_logout()
    {
        $user = User::factory()->unlocked()->create(['role' => 'comprador']);
        $token = $user->createToken('api-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/auth/logout');

        $response->assertStatus(200);
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
