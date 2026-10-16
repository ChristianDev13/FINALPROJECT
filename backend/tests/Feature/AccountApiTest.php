<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AccountApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_update_account_preferences_and_password(): void
    {
        $user = User::factory()->create([
            'name' => 'Taylor Example',
            'email' => 'taylor@example.com',
            'password' => 'old-password-123',
        ]);
        $this->actingAs($user, 'sanctum');

        $this->patchJson('/api/account', [
            'name' => 'Taylor Updated',
            'email' => 'TAYLOR@example.com',
        ])->assertOk()
            ->assertJsonPath('user.name', 'Taylor Updated')
            ->assertJsonPath('user.email', 'taylor@example.com');

        $this->patchJson('/api/account/preferences', [
            'preferences' => ['profile_public' => false, 'show_email' => true],
        ])->assertOk()
            ->assertJsonPath('preferences.profile_public', false)
            ->assertJsonPath('preferences.show_email', true);

        $this->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('user.preferences.profile_public', false)
            ->assertJsonPath('user.preferences.show_email', true);

        $this->putJson('/api/account/password', [
            'current_password' => 'old-password-123',
            'password' => 'new-password-456',
            'password_confirmation' => 'new-password-456',
        ])->assertOk();

        $this->assertTrue(Hash::check('new-password-456', $user->fresh()->password));
    }

    public function test_template_selection_history_can_be_selected_again_and_deleted(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum');

        $this->getJson('/api/template-history')->assertOk()->assertJsonCount(0, 'history');

        $this->postJson('/api/template-history', ['template_slug' => 'minimal'])
            ->assertOk()
            ->assertJsonPath('history.0.template_slug', 'minimal')
            ->assertJsonPath('history.0.is_current', true);

        $this->postJson('/api/template-history', ['template_slug' => 'creative'])
            ->assertOk()
            ->assertJsonPath('history.0.template_slug', 'creative')
            ->assertJsonPath('history.0.is_current', true)
            ->assertJsonPath('history.1.template_slug', 'minimal')
            ->assertJsonPath('history.1.is_current', false);

        $selectionId = $this->getJson('/api/template-history')->json('history.0.id');
        $this->deleteJson("/api/template-history/{$selectionId}")->assertOk();
        $this->getJson('/api/template-history')
            ->assertOk()
            ->assertJsonCount(1, 'history')
            ->assertJsonPath('history.0.template_slug', 'minimal')
            ->assertJsonPath('history.0.is_current', true);

        $this->assertDatabaseHas('profiles', [
            'user_id' => $user->id,
            'template_slug' => 'minimal',
        ]);
    }

    public function test_saved_portfolios_are_persisted_per_user_and_can_be_removed(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum');
        $portfolioData = ['name' => 'Taylor', 'headline' => 'Designer'];

        $this->putJson('/api/my-portfolios/minimal', ['data' => $portfolioData])
            ->assertOk()
            ->assertJsonPath('portfolio.template_slug', 'minimal');

        $portfolio = $this->getJson('/api/my-portfolios')
            ->assertOk()
            ->assertJsonCount(1, 'portfolios')
            ->json('portfolios.0');

        $this->assertSame($portfolioData, json_decode($portfolio['data'], true));
        $this->deleteJson("/api/my-portfolios/{$portfolio['id']}")->assertOk();
        $this->getJson('/api/my-portfolios')->assertOk()->assertJsonCount(0, 'portfolios');
    }
}
