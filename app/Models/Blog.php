<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Blog extends Model
{
    protected $table = 'blogs';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'title',
        'slug',
        'excerpt',
        'content',
        'cover_image',
        'images',
        'author',
        'category',
        'published',
        'date',
        'created_by',
    ];

    protected $casts = [
        'images' => 'array',
        'published' => 'boolean',
    ];
}
