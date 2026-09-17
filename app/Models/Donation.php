<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Donation extends Model
{
    protected $table = 'donations';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'amount',
        'frequency',
        'name',
        'email',
        'phone',
        'utr',
        'payment_method',
        'screenshot',
        'status',
    ];
}
