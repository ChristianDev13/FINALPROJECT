<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_creates_a_hashed_user_and_returns_a_token(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Taylor Example',
            'email' => 'TAYLOR@example.com',
            'password' => 'correct-horse-battery',
            'password_confirmation' => 'correct-horse-battery',
        ]);

        $response->assertCreated()
            ->assertJsonPath('user.email', 'taylor@example.com')
            ->assertJsonStructure(['user' => ['id', 'name', 'email'], 'token']);

        $user = User::where('email', 'taylor@example.com')->firstOrFail();
        $this->assertTrue(Hash::check('correct-horse-battery', $user->password));
        $this->assertDatabaseCount('personal_access_tokens', 1);
    }

    public function test_registration_rejects_duplicate_emails_and_unconfirmed_passwords(): void
    {
        User::factory()->create(['email' => 'taylor@example.com']);

        $this->postJson('/api/register', [
            'name' => 'Taylor Example',
            'email' => 'TAYLOR@example.com',
            'password' => 'correct-horse-battery',
            'password_confirmation' => 'different-password',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_login_issues_a_token_for_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'taylor@example.com',
            'password' => 'correct-horse-battery',
        ]);

        $this->postJson('/api/login', [
            'email' => 'TAYLOR@example.com',
            'password' => 'correct-horse-battery',
        ])->assertOk()
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonStructure(['user', 'token']);
    }

    public function test_login_rejects_invalid_credentials(): void
    {
        $this->postJson('/api/login', [
            'email' => 'missing@example.com',
            'password' => 'incorrect-password',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    public function test_token_can_read_the_current_user_and_log_out(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('frontend')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('user.id', $user->id);

        $this->withToken($token)
            ->postJson('/api/logout')
            ->assertOk();

        $this->assertDatabaseCount('personal_access_tokens', 0);
        $this->app['auth']->forgetGuards();

        $this->withToken($token)
            ->getJson('/api/user')
            ->assertUnauthorized();
    }

    public function test_authenticated_endpoints_reject_requests_without_a_token(): void
    {
        $this->getJson('/api/user')->assertUnauthorized();
        $this->postJson('/api/logout')->assertUnauthorized();
    }
}
