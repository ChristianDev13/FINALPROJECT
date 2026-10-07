<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('templates', function (Blueprint $table) {
            $table->string('slug')->primary();
            $table->string('name');
            $table->text('description');
            $table->timestamps();
        });

        DB::table('templates')->insert([
            [
                'slug' => 'minimal',
                'name' => 'Minimal',
                'description' => 'A clean, simple design that puts your profile and work first.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'slug' => 'creative',
                'name' => 'Creative',
                'description' => 'A colorful canvas for creativity, projects, and personality.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'slug' => 'professional',
                'name' => 'Professional',
                'description' => 'A polished layout for experience, achievements, and career.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        Schema::create('profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('template_slug')->default('minimal');
            $table->string('headline', 160)->nullable();
            $table->text('bio')->nullable();
            $table->string('location', 120)->nullable();
            $table->text('avatar_url')->nullable();
            $table->text('website_url')->nullable();
            $table->boolean('is_published')->default(false);
            $table->timestamps();
        });

        Schema::create('portfolio_projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('profile_id')->constrained()->cascadeOnDelete();
            $table->string('title', 160);
            $table->text('description')->nullable();
            $table->text('project_url')->nullable();
            $table->text('cover_image_url')->nullable();
            $table->unsignedSmallInteger('position')->default(0);
            $table->timestamps();

            $table->index(['profile_id', 'position']);
        });

        Schema::create('skills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('profile_id')->constrained()->cascadeOnDelete();
            $table->string('name', 80);
            $table->unsignedSmallInteger('position')->default(0);
            $table->timestamps();

            $table->index(['profile_id', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('skills');
        Schema::dropIfExists('portfolio_projects');
        Schema::dropIfExists('profiles');
        Schema::dropIfExists('templates');
    }
};
