<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->json('preferences')->nullable();
        });

        Schema::create('template_selections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('template_slug');
            $table->foreign('template_slug')->references('slug')->on('templates')->cascadeOnDelete();
            $table->timestamp('selected_at');
            $table->boolean('is_current')->default(false);
            $table->timestamps();

            $table->index(['user_id', 'selected_at']);
            $table->index(['user_id', 'is_current']);
        });

        Schema::create('saved_portfolios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('template_slug');
            $table->foreign('template_slug')->references('slug')->on('templates')->cascadeOnDelete();
            $table->json('data');
            $table->timestamps();

            $table->unique(['user_id', 'template_slug']);
            $table->index(['user_id', 'updated_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('saved_portfolios');
        Schema::dropIfExists('template_selections');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('preferences');
        });
    }
};
