<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leaders', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->string('role');
            $table->string('badge')->nullable();
            $table->string('tenure')->nullable();
            $table->text('photo')->nullable();
            $table->text('message')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->string('created_by')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leaders');
    }
};
