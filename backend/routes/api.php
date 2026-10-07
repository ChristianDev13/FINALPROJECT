<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json([
    'status' => 'ok',
    'service' => 'ptech-portfolio-api',
]));

Route::get('/templates', function () {
    return response()->json(
        DB::table('templates')
            ->orderBy('name')
            ->get(['slug', 'name', 'description']),
    );
});
