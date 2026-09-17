<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('blogs', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('title');
            $table->string('slug')->index();
            $table->text('excerpt')->nullable();
            $table->longText('content')->nullable();
            $table->text('cover_image')->nullable();
            $table->json('images')->nullable();
            $table->string('author')->default('ACT Trust Team');
            $table->string('category')->default('Education');
            $table->boolean('published')->default(true);
            $table->string('date')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blogs');
    }
};
