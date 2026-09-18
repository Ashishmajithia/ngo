<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Performance indexes for blogs
        Schema::table('blogs', function (Blueprint $table) {
            $table->index('created_at', 'idx_blogs_created_at');
            $table->index('category', 'idx_blogs_category');
            $table->index(['published', 'created_at'], 'idx_blogs_published_created');
        });

        // 2. Performance indexes for banners
        Schema::table('banners', function (Blueprint $table) {
            $table->index(['is_active', 'order'], 'idx_banners_active_order');
        });

        // 3. Performance indexes for programs
        Schema::table('programs', function (Blueprint $table) {
            $table->index(['is_active', 'order'], 'idx_programs_active_order');
        });

        // 4. Performance indexes for gallery items
        Schema::table('gallery_items', function (Blueprint $table) {
            $table->index(['is_active', 'order'], 'idx_gallery_active_order');
        });
    }

    public function down(): void
    {
        Schema::table('blogs', function (Blueprint $table) {
            $table->dropIndex('idx_blogs_created_at');
            $table->dropIndex('idx_blogs_category');
            $table->dropIndex('idx_blogs_published_created');
        });

        Schema::table('banners', function (Blueprint $table) {
            $table->dropIndex('idx_banners_active_order');
        });

        Schema::table('programs', function (Blueprint $table) {
            $table->dropIndex('idx_programs_active_order');
        });

        Schema::table('gallery_items', function (Blueprint $table) {
            $table->dropIndex('idx_gallery_active_order');
        });
    }
};
