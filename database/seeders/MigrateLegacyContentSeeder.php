<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Banner;
use App\Models\Program;
use App\Models\GalleryItem;
use App\Models\Setting;

class MigrateLegacyContentSeeder extends Seeder
{
    public function run(): void
    {
        $legacy = DB::table('site_content')->where('id', 'main')->first();
        if (!$legacy || empty($legacy->data)) {
            $this->command->info('No legacy site_content data found.');
            return;
        }

        $decoded = json_decode($legacy->data, true);
        $content = $decoded['content'] ?? $decoded;

        // 1. Migrate Banners (Hero slides)
        if (!empty($content['hero']['slides'])) {
            foreach ($content['hero']['slides'] as $index => $slide) {
                Banner::updateOrCreate(
                    ['id' => $slide['id'] ?? ('banner-' . ($index + 1))],
                    [
                        'title' => $slide['title'] ?? 'Building Hope Together',
                        'eyebrow' => $slide['eyebrow'] ?? '',
                        'copy' => $slide['copy'] ?? '',
                        'image' => $slide['image'] ?? '',
                        'cta_text' => $content['hero']['ctaText'] ?? 'Explore Our Programs',
                        'cta_link' => '#programs',
                        'order' => $index,
                        'is_active' => true,
                        'created_by' => 'admin@actcharitabletrust.org',
                    ]
                );
            }
            $this->command->info('Migrated ' . count($content['hero']['slides']) . ' banners.');
        }

        // 2. Migrate Programs
        if (!empty($content['programs']['items'])) {
            foreach ($content['programs']['items'] as $index => $prog) {
                Program::updateOrCreate(
                    ['id' => $prog['id'] ?? ('prog-' . ($index + 1))],
                    [
                        'title' => $prog['title'] ?? '',
                        'description' => $prog['description'] ?? '',
                        'image' => $prog['image'] ?? '',
                        'icon' => $prog['icon'] ?? 'Heart',
                        'badge_bg' => $prog['badgeBg'] ?? 'bg-[#f8e6bd]',
                        'badge_text_color' => $prog['badgeTextColor'] ?? 'text-[#8b590b]',
                        'grid_span' => $prog['gridSpan'] ?? null,
                        'order' => $index,
                        'is_active' => true,
                        'created_by' => 'admin@actcharitabletrust.org',
                    ]
                );
            }
            $this->command->info('Migrated ' . count($content['programs']['items']) . ' programs.');
        }

        // 3. Migrate Gallery Items
        if (!empty($content['gallery']['items'])) {
            foreach ($content['gallery']['items'] as $index => $item) {
                GalleryItem::updateOrCreate(
                    ['id' => $item['id'] ?? ('gal-' . ($index + 1))],
                    [
                        'title' => $item['title'] ?? '',
                        'caption' => $item['caption'] ?? '',
                        'image' => $item['image'] ?? '',
                        'grid_span' => $item['gridSpan'] ?? null,
                        'order' => $index,
                        'is_active' => true,
                        'created_by' => 'admin@actcharitabletrust.org',
                    ]
                );
            }
            $this->command->info('Migrated ' . count($content['gallery']['items']) . ' gallery items.');
        }

        // 4. Migrate Settings
        $settingKeys = ['brand', 'about', 'approach', 'support', 'payment', 'impactStats'];
        foreach ($settingKeys as $k) {
            if (isset($content[$k])) {
                Setting::set($k, $content[$k], 'admin@actcharitabletrust.org');
            }
        }
        $this->command->info('Migrated settings (brand, payment, etc.).');
    }
}
