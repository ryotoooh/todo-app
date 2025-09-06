<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Todo extends Model
{
    protected $fillable = [
        'id',
        // 'user_id',
        'title',
        'description',
        'is_done',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'is_done' => 'boolean',
    ];
}
