<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_creates_a_hashed_user_then_the_user_can_log_in(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Taylor Example',
            'email' => 'TAYLOR@example.com',
            'password' => 'correct-horse-battery',
            'password_confirmation' => 'correct-horse-battery',
        ]);

        $response->assertCreated()
            ->assertJsonPath('user.email', 'taylor@example.com')
            ->assertJsonStructure(['user' => ['id', 'name', 'email']])
            ->assertJsonMissingPath('token');

        $user = User::where('email', 'taylor@example.com')->firstOrFail();
        $this->assertTrue(Hash::check('correct-horse-battery', $user->password));
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'email' => 'taylor@example.com',
        ]);
        $this->assertDatabaseCount('personal_access_tokens', 0);

        $this->postJson('/api/login', [
            'email' => 'TAYLOR@example.com',
            'password' => 'correct-horse-battery',
        ])->assertOk()
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonStructure(['user', 'token']);

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

    public function test_password_reset_email_can_reset_password_and_revoke_existing_tokens(): void
    {
        Notification::fake();
        $user = User::factory()->create([
            'email' => 'taylor@example.com',
            'password' => 'old-password-value',
        ]);
        $user->createToken('frontend');

        $this->postJson('/api/forgot-password', [
            'email' => 'TAYLOR@example.com',
        ])->assertOk()
            ->assertExactJson([
                'message' => 'If an account exists for that email, a reset link will be sent. Check your inbox or try again later.',
            ]);

        $resetToken = null;
        Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $notification) use ($user, &$resetToken) {
            $resetToken = $notification->token;
            $resetUrl = $notification->toMail($user)->actionUrl;
            $query = [];
            parse_str((string) parse_url($resetUrl, PHP_URL_QUERY), $query);

            $this->assertSame('http', parse_url($resetUrl, PHP_URL_SCHEME));
            $this->assertSame('localhost', parse_url($resetUrl, PHP_URL_HOST));
            $this->assertSame('/reset-password', parse_url($resetUrl, PHP_URL_PATH));
            $this->assertSame($notification->token, $query['token'] ?? null);
            $this->assertSame($user->email, $query['email'] ?? null);
            return true;
        });

        $this->assertDatabaseHas('password_reset_tokens', ['email' => 'taylor@example.com']);

        $this->postJson('/api/reset-password', [
            'email' => 'TAYLOR@example.com',
            'token' => $resetToken,
            'password' => 'new-password-value',
            'password_confirmation' => 'new-password-value',
        ])->assertOk()
            ->assertExactJson([
                'message' => 'Your password has been reset. You can now log in with your new password.',
            ]);

        $this->assertTrue(Hash::check('new-password-value', $user->fresh()->password));
        $this->assertDatabaseMissing('password_reset_tokens', ['email' => 'taylor@example.com']);
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_password_reset_request_does_not_reveal_unknown_email_addresses(): void
    {
        Notification::fake();

        $this->postJson('/api/forgot-password', [
            'email' => 'missing@example.com',
        ])->assertOk()
            ->assertExactJson([
                'message' => 'If an account exists for that email, a reset link will be sent. Check your inbox or try again later.',
            ]);

        Notification::assertNothingSent();
    }

    public function test_password_reset_rejects_invalid_tokens_and_unconfirmed_passwords(): void
    {
        $user = User::factory()->create(['email' => 'taylor@example.com']);

        $this->postJson('/api/reset-password', [
            'email' => 'taylor@example.com',
            'token' => 'invalid-token',
            'password' => 'new-password-value',
            'password_confirmation' => 'different-password-value',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['password']);

        $this->postJson('/api/reset-password', [
            'email' => 'taylor@example.com',
            'token' => 'invalid-token',
            'password' => 'new-password-value',
            'password_confirmation' => 'new-password-value',
        ])->assertUnprocessable()
            ->assertJsonPath('message', 'This password reset link is invalid or expired. Request a new one and try again.');

        $this->assertTrue(Hash::check('password', $user->fresh()->password));
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
