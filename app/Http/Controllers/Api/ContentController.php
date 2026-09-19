<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Banner;
use App\Models\Program;
use App\Models\GalleryItem;
use App\Models\Leader;
use App\Models\Setting;
use App\Models\SiteContent;

class ContentController extends Controller
{

    public static function getContentArray()
    {
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

        $defaultFieldCenters = [
            [
                'id' => 'center-1',
                'name' => 'Delhi NCR Main Care & Education Center',
                'city' => 'New Delhi',
                'state' => 'Delhi NCR',
                'childrenCount' => '450+ Children',
                'programs' => ['Primary Education', 'Daily Nutrition Meal', 'Health Screening'],
                'coordinator' => 'Anjali Sharma',
                'phone' => '+91 98765 43210',
                'address' => 'Plot 14, Sector 7, Dwarka / South Delhi Border',
                'image' => 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=800&auto=format&fit=crop',
                'mapX' => 42,
                'mapY' => 34,
                'isActive' => true,
            ],
            [
                'id' => 'center-2',
                'name' => 'Mewat Rural Child Learning Unit',
                'city' => 'Nuh / Mewat',
                'state' => 'Haryana',
                'childrenCount' => '320+ Children',
                'programs' => ['Bridge Schooling', 'Girl Child Literacy', 'Clean Water Access'],
                'coordinator' => 'Mohd. Imran',
                'phone' => '+91 98123 45678',
                'address' => 'Near Govt High School, Taoru Road, Nuh',
                'image' => 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800&auto=format&fit=crop',
                'mapX' => 38,
                'mapY' => 40,
                'isActive' => true,
            ],
            [
                'id' => 'center-3',
                'name' => 'Jaipur Community Learning Hub',
                'city' => 'Jaipur',
                'state' => 'Rajasthan',
                'childrenCount' => '280+ Children',
                'programs' => ['Remedial Tutoring', 'Nutrition Supplement', 'Art & Sports'],
                'coordinator' => 'Pooja Verma',
                'phone' => '+91 94140 12345',
                'address' => 'Basti Colony, Sanganer, Jaipur',
                'image' => 'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=800&auto=format&fit=crop',
                'mapX' => 28,
                'mapY' => 44,
                'isActive' => true,
            ],
            [
                'id' => 'center-4',
                'name' => 'Lucknow Rural Health & Education Wing',
                'city' => 'Lucknow',
                'state' => 'Uttar Pradesh',
                'childrenCount' => '210+ Children',
                'programs' => ['Health Camps', 'Vocational Training', 'Midday Snacks'],
                'coordinator' => 'Rajesh Kumar',
                'phone' => '+91 94500 67890',
                'address' => 'Village Malihabad Rural Outreach, Lucknow',
                'image' => 'https://images.unsplash.com/photo-1524069290683-0457abfe42c3?q=80&w=800&auto=format&fit=crop',
                'mapX' => 55,
                'mapY' => 42,
                'isActive' => true,
            ],
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

        $about = $settings['about'] ?? $defaultAbout;
        $support = $settings['support'] ?? $defaultSupport;
        $fieldCenters = $settings['fieldCenters'] ?? $defaultFieldCenters;

        $leaders = Leader::active()->ordered()->get()->map(function ($l) {
            return [
                'id' => $l->id,
                'name' => $l->name,
                'role' => $l->role,
                'badge' => $l->badge ?? '',
                'tenure' => $l->tenure ?? '',
                'photo' => $l->photo ?? '',
                'message' => $l->message ?? '',
                'phone' => $l->phone ?? '',
                'email' => $l->email ?? '',
                'order' => $l->order,
                'createdBy' => $l->created_by,
            ];
        })->values();

        $leadershipSettings = $settings['leadership'] ?? [];
        $leadershipData = [
            'isEnabled' => isset($leadershipSettings['isEnabled']) ? (bool)$leadershipSettings['isEnabled'] : false,
            'eyebrow' => $leadershipSettings['eyebrow'] ?? '',
            'title' => $leadershipSettings['title'] ?? '',
            'subtitle' => $leadershipSettings['subtitle'] ?? '',
            'leaders' => $leaders,
        ];

        $content = [
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
            'about' => $about,
            'leadership' => $leadershipData,
            'approach' => $settings['approach'] ?? $defaultApproach,
            'support' => $support,
            'payment' => $settings['payment'] ?? $defaultPayment,
            'impactStats' => $settings['impactStats'] ?? $defaultImpactStats,
            'fieldCenters' => $fieldCenters,
            'updatedAt' => now()->toISOString(),
        ];

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
        ])->header('Cache-Control', 'no-cache, no-store, must-revalidate');
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
                    $img = $slide['image'] ?? '';
                    Banner::updateOrCreate(
                        ['id' => $id],
                        [
                            'title' => !empty($slide['title']) ? $slide['title'] : 'Banner ' . ($index + 1),
                            'eyebrow' => $slide['eyebrow'] ?? '',
                            'copy' => $slide['copy'] ?? '',
                            'image' => $img,
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
                    $progImg = $item['image'] ?? '';
                    Program::updateOrCreate(
                        ['id' => $id],
                        [
                            'title' => !empty($item['title']) ? $item['title'] : 'Program ' . ($index + 1),
                            'description' => $item['description'] ?? '',
                            'image' => $progImg,
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
                    $galImg = $item['image'] ?? '';
                    GalleryItem::updateOrCreate(
                        ['id' => $id],
                        [
                            'title' => !empty($item['title']) ? $item['title'] : 'Gallery ' . ($index + 1),
                            'caption' => $item['caption'] ?? '',
                            'image' => $galImg,
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

        // 3.5. Sync Leaders (Leadership & Trustees Relational Table)
        if (isset($body['leadership']['leaders']) && is_array($body['leadership']['leaders'])) {
            $leaderIds = [];
            foreach ($body['leadership']['leaders'] as $index => $item) {
                $hasContent = !empty($item['name']) || !empty($item['role']) || !empty($item['photo']);
                if ($hasContent) {
                    $id = !empty($item['id']) ? $item['id'] : 'leader-' . time() . '-' . $index;
                    $leaderIds[] = $id;
                    $photo = $item['photo'] ?? '';
                    Leader::updateOrCreate(
                        ['id' => $id],
                        [
                            'name' => !empty($item['name']) ? $item['name'] : 'Leader ' . ($index + 1),
                            'role' => $item['role'] ?? '',
                            'badge' => $item['badge'] ?? null,
                            'tenure' => $item['tenure'] ?? null,
                            'photo' => $photo,
                            'message' => $item['message'] ?? null,
                            'phone' => $item['phone'] ?? null,
                            'email' => $item['email'] ?? null,
                            'order' => $index,
                            'is_active' => true,
                            'created_by' => $updatedBy,
                        ]
                    );
                }
            }
            if (!empty($leaderIds)) {
                Leader::whereNotIn('id', $leaderIds)->delete();
            } else {
                Leader::query()->delete();
            }
        }

        if (isset($body['leadership'])) {
            Setting::set('leadership', [
                'isEnabled' => (bool)($body['leadership']['isEnabled'] ?? false),
                'eyebrow' => $body['leadership']['eyebrow'] ?? '',
                'title' => $body['leadership']['title'] ?? '',
                'subtitle' => $body['leadership']['subtitle'] ?? '',
            ], $updatedBy);
        }

        // 4. Sync Settings (brand, about, approach, support, payment, impactStats, fieldCenters)
        $settingKeys = ['brand', 'about', 'approach', 'support', 'payment', 'impactStats', 'fieldCenters'];
        foreach ($settingKeys as $k) {
            if (isset($body[$k])) {
                Setting::set($k, $body[$k], $updatedBy);
            }
        }

        // 5. Update complete snapshot in site_content table
        try {
            $existing = SiteContent::find('main');
            $merged = ($existing && is_array($existing->data)) ? array_merge($existing->data, $body) : $body;
            SiteContent::updateOrCreate(
                ['id' => 'main'],
                ['data' => $merged]
            );
        } catch (\Throwable $e) {}

        @unlink('/tmp/site_content_cache.json');

        return $this->index();
    }
}
