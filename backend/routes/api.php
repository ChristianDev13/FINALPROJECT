<?php

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;

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

Route::middleware('throttle:6,1')->group(function () {
    Route::post('/register', function () {
        $registration = request();
        $registration->merge([
            'email' => strtolower($registration->input('email', '')),
        ]);

        $validated = $registration->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'max:255', 'confirmed'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
        ]);

        return response()->json([
            'user' => $user,
            'token' => $user->createToken('frontend')->plainTextToken,
        ], 201);
    });

    Route::post('/login', function () {
        $validated = request()->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string', 'max:255'],
        ]);

        $user = User::where('email', strtolower($validated['email']))->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials do not match our records.'],
            ]);
        }

        return response()->json([
            'user' => $user,
            'token' => $user->createToken('frontend')->plainTextToken,
        ]);
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', fn () => response()->json(['user' => request()->user()]));

    Route::post('/logout', function () {
        request()->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    });
});
