<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProviderController;

Route::get('/providers', [ProviderController::class, 'index']);
Route::put('/providers/{id}', [ProviderController::class, 'update']);
Route::put('/models/{id}', [ProviderController::class, 'updateModel']);
Route::post('/sync/providers', [ProviderController::class, 'syncProviders']); 