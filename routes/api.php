<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TransactionController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', [UserController::class, 'show']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/user', [UserController::class, 'update']);
    Route::delete('/user', [UserController::class, 'delete']);
    Route::get('/user', [UserController::class, 'me']);

    Route::post('/transactions/transfer', [TransactionController::class, 'transfer']);
    Route::post('/transactions/deposit', [TransactionController::class, 'deposit']);
    Route::get('/transactions/history', [TransactionController::class, 'history']);
    Route::post('/transactions/{transaction}/reverse', [TransactionController::class, 'reverse']);
});