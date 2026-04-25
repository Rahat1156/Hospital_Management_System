<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ErdResourceController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::post('auth/login', [AuthController::class, 'login']);
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::get('auth/me', [AuthController::class, 'me']);
    Route::post('auth/logout', [AuthController::class, 'logout']);

    Route::get('schema/tables', [ErdResourceController::class, 'tables']);
    Route::get('{resource}', [ErdResourceController::class, 'index']);
    Route::post('{resource}', [ErdResourceController::class, 'store']);
    Route::get('{resource}/{id}', [ErdResourceController::class, 'show']);
    Route::put('{resource}/{id}', [ErdResourceController::class, 'update']);
    Route::patch('{resource}/{id}', [ErdResourceController::class, 'update']);
    Route::delete('{resource}/{id}', [ErdResourceController::class, 'destroy']);
});
