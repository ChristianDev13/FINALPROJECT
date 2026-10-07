<?php

namespace Tests\Feature;

use Tests\TestCase;

class ApiHealthTest extends TestCase
{
    public function test_api_health_endpoint_returns_json_status(): void
    {
        $this->getJson('/api/health')
            ->assertOk()
            ->assertExactJson([
                'status' => 'ok',
                'service' => 'ptech-portfolio-api',
            ]);
    }

    public function test_templates_endpoint_returns_available_templates(): void
    {
        $this->artisan('migrate:fresh');

        $this->getJson('/api/templates')
            ->assertOk()
            ->assertJsonCount(3)
            ->assertJsonFragment([
                'slug' => 'minimal',
                'name' => 'Minimal',
            ]);
    }
}
