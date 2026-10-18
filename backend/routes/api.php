<?php

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;

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

        return response()->json(['user' => $user], 201);
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

    Route::post('/forgot-password', function () {
        $validated = request()->validate([
            'email' => ['required', 'string', 'email', 'max:255'],
        ]);

        try {
            Password::sendResetLink([
                'email' => strtolower($validated['email']),
            ]);
        } catch (TransportExceptionInterface $exception) {
            Log::error('Password reset email could not be sent.', [
                'exception' => $exception,
            ]);
        }

        return response()->json([
            'message' => 'If an account exists for that email, a reset link will be sent. Check your inbox or try again later.',
        ]);
    });

    Route::post('/reset-password', function () {
        $validated = request()->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'password' => ['required', 'string', 'min:8', 'max:255', 'confirmed'],
        ]);

        $status = Password::reset(
            [
                ...$validated,
                'email' => strtolower($validated['email']),
            ],
            function (User $user, string $password): void {
                $user->forceFill([
                    'password' => $password,
                    'remember_token' => Str::random(60),
                    'password_changed_at' => now(),
                ])->save();

                $user->tokens()->delete();
            },
        );

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json([
                'message' => 'This password reset link is invalid or expired. Request a new one and try again.',
            ], 422);
        }

        return response()->json([
            'message' => 'Your password has been reset. You can now log in with your new password.',
        ]);
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', fn () => response()->json(['user' => request()->user()]));

    Route::patch('/account', function () {
        $user = request()->user();
        $accountRequest = request();
        $accountRequest->merge([
            'email' => strtolower($accountRequest->input('email', '')),
        ]);

        $validated = $accountRequest->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,'.$user->id],
        ]);

        $user->fill([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ])->save();

        return response()->json(['user' => $user->fresh()]);
    });

    Route::put('/account/password', function () {
        $validated = request()->validate([
            'current_password' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string', 'min:8', 'max:255', 'confirmed'],
        ]);

        $user = request()->user();
        if (! Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $user->password = $validated['password'];
        $user->password_changed_at = now();
        $user->save();

        return response()->json(['message' => 'Password updated successfully.']);
    });

    Route::patch('/account/preferences', function () {
        $validated = request()->validate([
            'preferences' => ['required', 'array'],
            'preferences.show_email' => ['required', 'boolean'],
            'preferences.profile_public' => ['required', 'boolean'],
        ]);

        $user = request()->user();
        $user->preferences = $validated['preferences'];
        $user->save();

        return response()->json(['preferences' => $user->fresh()->preferences]);
    });

    Route::get('/template-history', function () {
        return response()->json([
            'history' => DB::table('template_selections')
                ->join('templates', 'templates.slug', '=', 'template_selections.template_slug')
                ->where('template_selections.user_id', request()->user()->id)
                ->orderByDesc('template_selections.selected_at')
                ->orderByDesc('template_selections.id')
                ->get([
                    'template_selections.id',
                    'template_selections.template_slug',
                    'templates.name as template_name',
                    'template_selections.selected_at',
                    'template_selections.is_current',
                ])
                ->map(static function ($selection) {
                    $selection->is_current = (bool) $selection->is_current;

                    return $selection;
                }),
        ]);
    });

    Route::post('/template-history', function () {
        $validated = request()->validate([
            'template_slug' => ['present', 'nullable', 'string', 'exists:templates,slug'],
        ]);
        $user = request()->user();

        $history = DB::transaction(function () use ($validated, $user) {
            DB::table('template_selections')
                ->where('user_id', $user->id)
                ->where('is_current', true)
                ->update(['is_current' => false, 'updated_at' => now()]);

            if ($validated['template_slug'] !== null) {
                DB::table('template_selections')->insert([
                    'user_id' => $user->id,
                    'template_slug' => $validated['template_slug'],
                    'selected_at' => now(),
                    'is_current' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                DB::table('profiles')->upsert(
                    [[
                        'user_id' => $user->id,
                        'template_slug' => $validated['template_slug'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]],
                    ['user_id'],
                    ['template_slug', 'updated_at'],
                );
            }

            return DB::table('template_selections')
                ->join('templates', 'templates.slug', '=', 'template_selections.template_slug')
                ->where('template_selections.user_id', $user->id)
                ->orderByDesc('template_selections.selected_at')
                ->orderByDesc('template_selections.id')
                ->get([
                    'template_selections.id',
                    'template_selections.template_slug',
                    'templates.name as template_name',
                    'template_selections.selected_at',
                    'template_selections.is_current',
                ])
                ->map(static function ($selection) {
                    $selection->is_current = (bool) $selection->is_current;

                    return $selection;
                });
        });

        return response()->json(['history' => $history]);
    });

    Route::delete('/template-history/{selection}', function (int $selection) {
        $user = request()->user();
        DB::transaction(function () use ($selection, $user) {
            $record = DB::table('template_selections')
                ->where('id', $selection)
                ->where('user_id', $user->id)
                ->first();

            abort_unless($record, 404);

            DB::table('template_selections')->where('id', $record->id)->delete();

            if ($record->is_current) {
                $next = DB::table('template_selections')
                    ->where('user_id', $user->id)
                    ->orderByDesc('selected_at')
                    ->orderByDesc('id')
                    ->first();

                if ($next) {
                    DB::table('template_selections')
                        ->where('id', $next->id)
                        ->update(['is_current' => true, 'updated_at' => now()]);

                    DB::table('profiles')->upsert(
                        [[
                            'user_id' => $user->id,
                            'template_slug' => $next->template_slug,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]],
                        ['user_id'],
                        ['template_slug', 'updated_at'],
                    );
                }
            }
        });

        return response()->json(['message' => 'Template history removed.']);
    });

    Route::get('/my-portfolios', function () {
        return response()->json([
            'portfolios' => DB::table('saved_portfolios')
                ->join('templates', 'templates.slug', '=', 'saved_portfolios.template_slug')
                ->where('saved_portfolios.user_id', request()->user()->id)
                ->orderByDesc('saved_portfolios.updated_at')
                ->get([
                    'saved_portfolios.id',
                    'saved_portfolios.template_slug',
                    'templates.name as template_name',
                    'saved_portfolios.data',
                    'saved_portfolios.created_at',
                    'saved_portfolios.updated_at',
                ]),
        ]);
    });

    Route::put('/my-portfolios/{templateSlug}', function (string $templateSlug) {
        abort_unless(DB::table('templates')->where('slug', $templateSlug)->exists(), 404);

        $validated = request()->validate([
            'data' => ['required', 'array'],
        ]);
        $user = request()->user();
        $now = now();

        DB::table('saved_portfolios')->upsert(
            [[
                'user_id' => $user->id,
                'template_slug' => $templateSlug,
                'data' => json_encode($validated['data'], JSON_THROW_ON_ERROR),
                'created_at' => $now,
                'updated_at' => $now,
            ]],
            ['user_id', 'template_slug'],
            ['data', 'updated_at'],
        );

        $portfolio = DB::table('saved_portfolios')
            ->where('user_id', $user->id)
            ->where('template_slug', $templateSlug)
            ->first();

        return response()->json(['portfolio' => $portfolio]);
    });

    Route::delete('/my-portfolios/{portfolio}', function (int $portfolio) {
        $deleted = DB::table('saved_portfolios')
            ->where('id', $portfolio)
            ->where('user_id', request()->user()->id)
            ->delete();

        abort_unless($deleted, 404);

        return response()->json(['message' => 'Portfolio removed.']);
    });

    Route::post('/logout', function () {
        request()->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    });
});
