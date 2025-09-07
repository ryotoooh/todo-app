<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('todo');
});
Route::view('/react', 'layouts.app.simple');

// Auth::routes();

// Route::get('/home', [App\Http\Controllers\HomeController::class, 'index'])->name('home');
