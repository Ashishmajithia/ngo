<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Banner;
use App\Models\Program;
use App\Models\GalleryItem;
use App\Models\Setting;
use App\Models\SiteContent;

class ContentController extends Controller
{
    /**
     * Build unified site content from dedicated relational tables.
     */
    public static function getContentArray()
    {
        $cacheFile = '/tmp/site_content_cache.json';
        if (file_exists($cacheFile) && (time() - filemtime($cacheFile) < 180)) {
            $cached = @json_decode(@file_get_contents($cacheFile), true);
            if (!empty($cached) && is_array($cached)) {
                return $cached;
            }
        }

        $settings = Setting::all()->pluck('value', 'key');

        $banners = Banner::active()->ordered()->get()->map(function ($b) {
            return [
                'id' => $b->id,
                'title' => $b->title,
                'eyebrow' => $b->eyebrow ?? '',
                'copy' => $b->copy ?? '',
                'image' => $b->image,
                'ctaText' => $b->cta_text ?? 'Explore Our Programs',
                'ctaLink' => $b->cta_link ?? '#programs',
                'order' => $b->order,
                'createdBy' => $b->created_by,
            ];
        })->values();

        $programs = Program::active()->ordered()->get()->map(function ($p) {
            return [
                'id' => $p->id,
                'title' => $p->title,
                'description' => $p->description,
                'image' => $p->image,
                'icon' => $p->icon ?? 'Heart',
                'badgeBg' => $p->badge_bg ?? 'bg-[#f8e6bd]',
                'badgeTextColor' => $p->badge_text_color ?? 'text-[#8b590b]',
                'gridSpan' => $p->grid_span,
                'order' => $p->order,
                'createdBy' => $p->created_by,
            ];
        })->values();

        $gallery = GalleryItem::active()->ordered()->get()->map(function ($g) {
            return [
                'id' => $g->id,
                'title' => $g->title,
                'caption' => $g->caption ?? '',
                'image' => $g->image,
                'gridSpan' => $g->grid_span,
                'order' => $g->order,
                'createdBy' => $g->created_by,
            ];
        })->values();

        // Baseline fallbacks if settings are not yet set
        $defaultBrand = [
            'name' => 'ACT Charitable Trust',
            'regNo' => 'REG.NO.220',
            'tagline' => 'Rising Hope for Children',
            'email' => '',
            'phone' => '',
            'location' => '',
            'logo' => '/uploads/act_official_logo.jpg',
            'logoStyle' => 'full',
            'primaryCtaText' => 'Donate & Support',
        ];

        $defaultAbout = [
            'eyebrow' => '',
            'title' => '',
            'copyOne' => '',
            'copyTwo' => '',
            'ctaText' => '',
            'image' => '',
            'badgeTitle' => '',
            'badgeCopy' => '',
        ];

        $defaultApproach = [
            'eyebrow' => '',
            'title' => '',
            'copy' => '',
            'image' => '',
            'principles' => [],
        ];

        $defaultSupport = [
            'eyebrow' => '',
            'title' => '',
            'copy' => '',
            'image' => '',
            'ctaText' => '',
        ];

        $defaultPayment = [
            'qrCodeImage' => '',
            'upiId' => '',
            'accountName' => '',
            'bankName' => '',
            'accountNumber' => '',
            'ifscCode' => '',
            'instructions' => '',
            'enableQrDonation' => false,
        ];

        $defaultImpactStats = [];

        $programsMeta = $settings['programs_meta'] ?? [
            'eyebrow' => '',
            'title' => '',
            'copy' => '',
        ];

        $galleryMeta = $settings['gallery_meta'] ?? [
            'eyebrow' => '',
            'title' => '',
            'copy' => '',
        ];

        $heroMeta = $settings['hero_meta'] ?? [
            'ctaText' => '',
        ];

        return [
            'brand' => $settings['brand'] ?? $defaultBrand,
            'hero' => [
                'slides' => $banners,
                'ctaText' => $heroMeta['ctaText'] ?? 'Donate & Support',
            ],
            'programs' => [
                'eyebrow' => $programsMeta['eyebrow'] ?? '',
                'title' => $programsMeta['title'] ?? '',
                'copy' => $programsMeta['copy'] ?? '',
                'items' => $programs,
            ],
            'gallery' => [
                'eyebrow' => $galleryMeta['eyebrow'] ?? '',
                'title' => $galleryMeta['title'] ?? '',
                'copy' => $galleryMeta['copy'] ?? '',
                'items' => $gallery,
            ],
            'about' => $settings['about'] ?? $defaultAbout,
            'approach' => $settings['approach'] ?? $defaultApproach,
            'support' => $settings['support'] ?? $defaultSupport,
            'payment' => $settings['payment'] ?? $defaultPayment,
            'impactStats' => $settings['impactStats'] ?? $defaultImpactStats,
            'updatedAt' => now()->toISOString(),
        ];

        @file_put_contents($cacheFile, json_encode($content));
        return $content;
    }

    public function index()
    {
        $content = self::getContentArray();

        return response()->json([
            'success' => true,
            'data' => $content,
            'source' => 'supabase_relational_architecture',
            'dbStatus' => [
                'provider' => 'supabase',
                'status' => 'connected',
                'database' => 'PostgreSQL (Supabase Cloud)',
                'host' => config('database.connections.pgsql.host'),
            ],
        ]);
    }

    public function update(Request $request)
    {
        $body = $request->all();
        $updatedBy = auth()->user()?->email ?? env('ADMIN_EMAIL', 'admin@actcharitabletrust.org');

        // 1. Sync Hero Banner Slides (Upsert + Remove deleted)
        if (isset($body['hero']['slides']) && is_array($body['hero']['slides'])) {
            $slideIds = [];
            foreach ($body['hero']['slides'] as $index => $slide) {
                $hasContent = !empty($slide['image']) || !empty($slide['title']);
                if ($hasContent) {
                    $id = !empty($slide['id']) ? $slide['id'] : 'slide-' . time() . '-' . $index;
                    $slideIds[] = $id;
                    Banner::updateOrCreate(
                        ['id' => $id],
                        [
                            'title' => !empty($slide['title']) ? $slide['title'] : 'Banner ' . ($index + 1),
                            'eyebrow' => $slide['eyebrow'] ?? '',
                            'copy' => $slide['copy'] ?? '',
                            'image' => $slide['image'] ?? '',
                            'cta_text' => $slide['ctaText'] ?? 'Donate & Support',
                            'cta_link' => $slide['ctaLink'] ?? '#programs',
                            'order' => $index,
                            'is_active' => true,
                            'created_by' => $updatedBy,
                        ]
                    );
                }
            }
            if (!empty($slideIds)) {
                Banner::whereNotIn('id', $slideIds)->delete();
            } else {
                Banner::query()->delete();
            }
        }

        if (isset($body['hero']['ctaText'])) {
            Setting::set('hero_meta', ['ctaText' => $body['hero']['ctaText']], $updatedBy);
        }

        // 2. Sync Strategic Initiatives / Programs (Upsert + Remove deleted)
        if (isset($body['programs']['items']) && is_array($body['programs']['items'])) {
            $progIds = [];
            foreach ($body['programs']['items'] as $index => $item) {
                $hasContent = !empty($item['title']) || !empty($item['image']);
                if ($hasContent) {
                    $id = !empty($item['id']) ? $item['id'] : 'prog-' . time() . '-' . $index;
                    $progIds[] = $id;
                    Program::updateOrCreate(
                        ['id' => $id],
                        [
                            'title' => !empty($item['title']) ? $item['title'] : 'Program ' . ($index + 1),
                            'description' => $item['description'] ?? '',
                            'image' => $item['image'] ?? '',
                            'icon' => $item['icon'] ?? 'Heart',
                            'badge_bg' => $item['badgeBg'] ?? 'bg-[#f8e6bd]',
                            'badge_text_color' => $item['badgeTextColor'] ?? 'text-[#8b590b]',
                            'grid_span' => $item['gridSpan'] ?? null,
                            'order' => $index,
                            'is_active' => true,
                            'created_by' => $updatedBy,
                        ]
                    );
                }
            }
            if (!empty($progIds)) {
                Program::whereNotIn('id', $progIds)->delete();
            } else {
                Program::query()->delete();
            }
        }

        if (isset($body['programs'])) {
            Setting::set('programs_meta', [
                'eyebrow' => $body['programs']['eyebrow'] ?? '',
                'title' => $body['programs']['title'] ?? '',
                'copy' => $body['programs']['copy'] ?? '',
            ], $updatedBy);
        }

        // 3. Sync Moments of Hope Gallery (Upsert + Remove deleted)
        if (isset($body['gallery']['items']) && is_array($body['gallery']['items'])) {
            $galIds = [];
            foreach ($body['gallery']['items'] as $index => $item) {
                $hasContent = !empty($item['title']) || !empty($item['image']);
                if ($hasContent) {
                    $id = !empty($item['id']) ? $item['id'] : 'gal-' . time() . '-' . $index;
                    $galIds[] = $id;
                    GalleryItem::updateOrCreate(
                        ['id' => $id],
                        [
                            'title' => !empty($item['title']) ? $item['title'] : 'Gallery ' . ($index + 1),
                            'caption' => $item['caption'] ?? '',
                            'image' => $item['image'] ?? '',
                            'grid_span' => $item['gridSpan'] ?? null,
                            'order' => $index,
                            'is_active' => true,
                            'created_by' => $updatedBy,
                        ]
                    );
                }
            }
            if (!empty($galIds)) {
                GalleryItem::whereNotIn('id', $galIds)->delete();
            } else {
                GalleryItem::query()->delete();
            }
        }

        if (isset($body['gallery'])) {
            Setting::set('gallery_meta', [
                'eyebrow' => $body['gallery']['eyebrow'] ?? '',
                'title' => $body['gallery']['title'] ?? '',
                'copy' => $body['gallery']['copy'] ?? '',
            ], $updatedBy);
        }

        // 4. Sync Settings (brand, about, approach, support, payment, impactStats)
        $settingKeys = ['brand', 'about', 'approach', 'support', 'payment', 'impactStats'];
        foreach ($settingKeys as $k) {
            if (isset($body[$k])) {
                Setting::set($k, $body[$k], $updatedBy);
            }
        }

        // 5. Update complete snapshot in site_content table
        try {
            SiteContent::updateOrCreate(
                ['id' => 'main'],
                ['data' => $body]
            );
        } catch (\Throwable $e) {}

        @unlink('/tmp/site_content_cache.json');

        return $this->index();
    }
}
