<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\SiteContent;
use App\Models\Blog;
use App\Models\Donation;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Default Master Administrator
        User::updateOrCreate(
            ['email' => 'admin@actcharitabletrust.org'],
            [
                'name' => 'Trust Administrator',
                'password' => Hash::make('ActTrust@2026!'),
            ]
        );

        // Also allow admin@act.org shortcut
        User::updateOrCreate(
            ['email' => 'admin@act.org'],
            [
                'name' => 'Trust Administrator',
                'password' => Hash::make('ActTrust@2026!'),
            ]
        );

        // 2. Load Seed Data from JSON
        $dataPath = database_path('data.json');
        if (file_exists($dataPath)) {
            $json = json_decode(file_get_contents($dataPath), true);

            // Seed Site Content
            if (!empty($json['content'])) {
                SiteContent::updateOrCreate(
                    ['id' => 'main'],
                    ['data' => $json['content']]
                );
            }

            // Seed Blogs
            if (!empty($json['blogs']) && is_array($json['blogs'])) {
                foreach ($json['blogs'] as $b) {
                    Blog::updateOrCreate(
                        ['id' => $b['id']],
                        [
                            'title' => $b['title'],
                            'slug' => $b['slug'] ?? \Illuminate\Support\Str::slug($b['title']),
                            'excerpt' => $b['excerpt'] ?? '',
                            'content' => $b['content'] ?? '',
                            'cover_image' => $b['coverImage'] ?? '',
                            'images' => $b['images'] ?? [],
                            'author' => $b['author'] ?? 'ACT Trust Team',
                            'category' => $b['category'] ?? 'Education',
                            'published' => $b['published'] ?? true,
                            'date' => $b['date'] ?? now()->format('F d, Y'),
                        ]
                    );
                }
            }

            // Seed Donations if present
            if (!empty($json['donations']) && is_array($json['donations'])) {
                foreach ($json['donations'] as $d) {
                    Donation::updateOrCreate(
                        ['id' => $d['id']],
                        [
                            'amount' => (string)($d['amount'] ?? '1000'),
                            'frequency' => $d['frequency'] ?? 'One-time',
                            'name' => $d['name'] ?? 'Anonymous',
                            'email' => $d['email'] ?? 'donor@example.com',
                            'phone' => $d['phone'] ?? '',
                            'utr' => $d['utr'] ?? '',
                            'payment_method' => $d['paymentMethod'] ?? 'UPI QR',
                            'status' => $d['status'] ?? 'verified',
                        ]
                    );
                }
            }
        }
    }
}
