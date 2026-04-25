<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::query()->with(['tenant', 'role'])->where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages(['email' => ['Invalid email or password.']]);
        }

        return response()->json([
            'data' => [
                'user' => $user,
                'tenant' => $user->tenant,
                'access_token' => 'local-dev-token-'.$user->user_id,
                'refresh_token' => 'local-dev-refresh-'.$user->user_id,
                'expires_at' => now()->addMinutes(30)->toISOString(),
            ],
            'message' => 'Login successful',
        ]);
    }

    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'full_name' => ['required', 'string'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        $tenant = Tenant::query()->firstOrCreate(
            ['subdomain' => 'main'],
            ['name' => 'Main Hospital', 'plan' => 'standard', 'status' => 'active'],
        );
        $role = Role::query()->firstOrCreate(['role_name' => 'patient']);

        $user = User::query()->create([
            'tenant_id' => $tenant->tenant_id,
            'role_id' => $role->role_id,
            'name' => $data['full_name'],
            'email' => $data['email'],
            'phone' => data_get($request->input('phone'), 'number'),
            'status' => 'active',
            'password' => $data['password'],
        ]);

        return response()->json([
            'data' => ['user_id' => (string) $user->user_id, 'otp_sent_to' => $user->phone ?? $user->email],
            'message' => 'Registration successful',
        ], 201);
    }

    public function me(): JsonResponse
    {
        $user = User::query()->with(['tenant', 'role'])->first();

        return response()->json([
            'data' => [
                'user' => $user,
                'tenant' => $user?->tenant,
                'access_token' => 'local-dev-token',
                'refresh_token' => 'local-dev-refresh',
                'expires_at' => now()->addMinutes(30)->toISOString(),
            ],
        ]);
    }

    public function logout(): JsonResponse
    {
        return response()->json(['data' => ['success' => true]]);
    }
}
