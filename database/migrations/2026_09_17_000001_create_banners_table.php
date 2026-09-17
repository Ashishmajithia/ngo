<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('banners', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('title');
            $table->string('eyebrow')->nullable();
            $table->text('copy')->nullable();
            $table->text('image');
            $table->string('cta_text')->nullable()->default('Explore Our Programs');
            $table->string('cta_link')->nullable()->default('#programs');
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->string('created_by')->nullable()->default('admin@actcharitabletrust.org');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('banners');
    }
};
