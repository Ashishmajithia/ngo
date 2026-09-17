<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('programs', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('title');
            $table->text('description');
            $table->text('image')->nullable();
            $table->string('icon')->nullable()->default('Heart');
            $table->string('badge_bg')->nullable()->default('bg-[#f8e6bd]');
            $table->string('badge_text_color')->nullable()->default('text-[#8b590b]');
            $table->string('grid_span')->nullable();
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->string('created_by')->nullable()->default('admin@actcharitabletrust.org');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('programs');
    }
};
