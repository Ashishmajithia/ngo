<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Leader extends Model
{
    protected $table = 'leaders';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'name',
        'role',
        'badge',
        'tenure',
        'photo',
        'message',
        'phone',
        'email',
        'order',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'order' => 'integer',
        'is_active' => 'boolean',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order', 'asc')->orderBy('created_at', 'asc');
    }
}
