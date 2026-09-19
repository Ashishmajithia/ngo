<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Extra performance indexes for donations (fast receipt & donor lookup)
        Schema::table('donations', function (Blueprint $table) {
            if (!Schema::hasIndex('donations', 'idx_donations_utr')) {
                $table->index('utr', 'idx_donations_utr');
            }
            if (!Schema::hasIndex('donations', 'idx_donations_email')) {
                $table->index('email', 'idx_donations_email');
            }
        });

        // 2. Extra performance indexes for blogs (fast category filtering)
        Schema::table('blogs', function (Blueprint $table) {
            if (!Schema::hasIndex('blogs', 'idx_blogs_published_category')) {
                $table->index(['published', 'category'], 'idx_blogs_published_category');
            }
        });
    }

    public function down(): void
    {
        Schema::table('donations', function (Blueprint $table) {
            $table->dropIndex('idx_donations_utr');
            $table->dropIndex('idx_donations_email');
        });

        Schema::table('blogs', function (Blueprint $table) {
            $table->dropIndex('idx_blogs_published_category');
        });
    }
};
