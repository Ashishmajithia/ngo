<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('donations', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('amount');
            $table->string('frequency')->default('One-time');
            $table->string('name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('utr')->nullable();
            $table->string('payment_method')->default('UPI / QR');
            $table->string('status')->default('pending'); // pending, verified, rejected
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('donations');
    }
};
