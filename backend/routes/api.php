<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CateringController;
use App\Http\Controllers\Api\DecorationController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\PackController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\SuggestionController;

// ───── Routes publiques ─────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/suggestions', [SuggestionController::class, 'suggest']); // simulation publique

// ───── Routes protégées (client connecté) ─────
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Événements
    Route::apiResource('events', EventController::class);

    // Salle
    Route::get('/events/{event}/room', [RoomController::class, 'show']);
    Route::post('/events/{event}/room', [RoomController::class, 'store']);

    // Traiteur
    Route::get('/catering', [CateringController::class, 'index']);
    Route::post('/events/{event}/catering', [CateringController::class, 'store']);
    Route::put('/events/{event}/catering/{cateringItem}', [CateringController::class, 'update']);
    Route::delete('/events/{event}/catering/{cateringItem}', [CateringController::class, 'destroy']);

    // Décorations catalogue
    Route::get('/decorations', [DecorationController::class, 'index']);

    // Packs
    Route::get('/packs', [PackController::class, 'index']);
    Route::get('/packs/{pack}', [PackController::class, 'show']);
    Route::post('/events/{event}/apply-pack', [PackController::class, 'apply']);
});

// ───── Routes protégées admin ─────
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/users', [AdminController::class, 'users']);
    Route::get('/events', [AdminController::class, 'events']);
    Route::get('/stats', [AdminController::class, 'stats']);
});
