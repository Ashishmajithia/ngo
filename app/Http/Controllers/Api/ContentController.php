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
    public function index()
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
            'email' => 'hello@actcharitabletrust.org',
            'phone' => '+91 98765 43210',
            'tagline' => 'Together We Rise • Grassroots Empowerment',
            'location' => 'New Delhi & Rural Empowerment Centers, India',
            'logoStyle' => 'icon_text',
            'primaryCtaText' => 'Donate & Support',
        ];

        $defaultAbout = [
            'eyebrow' => 'Who We Are',
            'title' => 'A Legacy of Compassion, Inclusion, and Sustainable Action',
            'copyOne' => 'ACT Charitable Trust was established with a singular vision: to bridge the socio-economic divide through targeted grassroots action.',
            'copyTwo' => 'From rural education initiatives and mobile health clinics to women-led micro-enterprises, every project is driven by empathy and impact.',
            'ctaText' => 'View Our Photo Gallery',
            'image' => 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200&auto=format&fit=crop',
            'badgeTitle' => '100% Transparent',
            'badgeCopy' => 'Over 94% of direct funds go directly to grassroots programs.',
        ];

        $defaultApproach = [
            'eyebrow' => 'Our Principles',
            'title' => 'How We Ensure Ethical & Long-Term Impact',
            'copy' => 'We collaborate with local elders, teachers, and youth leaders to craft tailored interventions that endure.',
            'image' => 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=1000&auto=format&fit=crop',
            'principles' => [
                ['id' => 'p-1', 'title' => 'Listening First', 'description' => 'Every project begins with consultations to understand priority needs.', 'icon' => 'Ear', 'iconBg' => 'bg-[#123f38]', 'iconColor' => 'text-[#fffdf8]'],
                ['id' => 'p-2', 'title' => 'Community Driven', 'description' => 'Local champions lead project execution, fostering ownership.', 'icon' => 'HandHeart', 'iconBg' => 'bg-[#f2ad3b]', 'iconColor' => 'text-[#183a35]'],
                ['id' => 'p-3', 'title' => 'Sustainable Growth', 'description' => 'Focusing on long-term capacity building rather than temporary relief.', 'icon' => 'Sprout', 'iconBg' => 'bg-[#28745e]', 'iconColor' => 'text-[#fffdf8]'],
            ],
        ];

        $defaultSupport = [
            'eyebrow' => 'Make A Difference Today',
            'title' => 'Your Generosity Can Change A Child’s World Forever',
            'copy' => 'Join hands with ACT Charitable Trust today. Every contribution fuels education, healthcare, and meal programs.',
            'image' => 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=1920&auto=format&fit=crop',
            'ctaText' => 'Send Us An Email / Donate Now',
        ];

        $defaultPayment = [
            'qrCodeImage' => 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=actcharitabletrust@upi&pn=ACT%20Charitable%20Trust&cu=INR',
            'upiId' => 'actcharitabletrust@upi',
            'accountName' => 'ACT Charitable Trust',
            'bankName' => 'State Bank of India',
            'accountNumber' => '98765432101234',
            'ifscCode' => 'SBIN0001234',
            'instructions' => 'Scan this QR code using any UPI app (Google Pay, PhonePe, Paytm, BHIM) to contribute directly.',
            'enableQrDonation' => true,
        ];

        $defaultImpactStats = [
            ['id' => 'stat-1', 'stat' => '50,000+', 'label' => 'Lives Positively Impacted', 'iconName' => 'Users'],
            ['id' => 'stat-2', 'stat' => '120+', 'label' => 'Village Empowerment Centers', 'iconName' => 'Home'],
            ['id' => 'stat-3', 'stat' => '15,000+', 'label' => 'Children Educated', 'iconName' => 'GraduationCap'],
            ['id' => 'stat-4', 'stat' => '98%', 'label' => 'Direct Impact Rate', 'iconName' => 'CheckCircle2'],
        ];

        $programsMeta = $settings['programs_meta'] ?? [
            'eyebrow' => 'What We Do',
            'title' => 'Comprehensive Programs Designed For Real Change',
            'copy' => 'We focus on four foundational pillars of human development to create lasting generational change.',
        ];

        $galleryMeta = $settings['gallery_meta'] ?? [
            'eyebrow' => 'Moments Of Hope',
            'title' => 'Witness Our Impact In Action',
            'copy' => 'Real stories, real faces, and vibrant moments of change captured across our centers.',
        ];

        $heroMeta = $settings['hero_meta'] ?? [
            'ctaText' => 'Explore Our Programs',
        ];

        $content = [
            'brand' => $settings['brand'] ?? $defaultBrand,
            'hero' => [
                'slides' => $banners,
                'ctaText' => $heroMeta['ctaText'] ?? 'Explore Our Programs',
            ],
            'programs' => [
                'eyebrow' => $programsMeta['eyebrow'] ?? 'What We Do',
                'title' => $programsMeta['title'] ?? 'Comprehensive Programs Designed For Real Change',
                'copy' => $programsMeta['copy'] ?? 'We focus on four foundational pillars of human development to create lasting generational change.',
                'items' => $programs,
            ],
            'gallery' => [
                'eyebrow' => $galleryMeta['eyebrow'] ?? 'Moments Of Hope',
                'title' => $galleryMeta['title'] ?? 'Witness Our Impact In Action',
                'copy' => $galleryMeta['copy'] ?? 'Real stories, real faces, and vibrant moments of change captured across our centers.',
                'items' => $gallery,
            ],
            'about' => $settings['about'] ?? $defaultAbout,
            'approach' => $settings['approach'] ?? $defaultApproach,
            'support' => $settings['support'] ?? $defaultSupport,
            'payment' => $settings['payment'] ?? $defaultPayment,
            'impactStats' => $settings['impactStats'] ?? $defaultImpactStats,
            'updatedAt' => now()->toISOString(),
        ];

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
                if (!empty($slide['id']) && !empty($slide['title'])) {
                    $slideIds[] = $slide['id'];
                    Banner::updateOrCreate(
                        ['id' => $slide['id']],
                        [
                            'title' => $slide['title'],
                            'eyebrow' => $slide['eyebrow'] ?? '',
                            'copy' => $slide['copy'] ?? '',
                            'image' => $slide['image'] ?? '',
                            'cta_text' => $slide['ctaText'] ?? 'Explore Our Programs',
                            'cta_link' => $slide['ctaLink'] ?? '#programs',
                            'order' => $index,
                            'created_by' => $updatedBy,
                        ]
                    );
                }
            }
            if (!empty($slideIds)) {
                Banner::whereNotIn('id', $slideIds)->delete();
            }
        }

        if (isset($body['hero']['ctaText'])) {
            Setting::set('hero_meta', ['ctaText' => $body['hero']['ctaText']], $updatedBy);
        }

        // 2. Sync Strategic Initiatives / Programs (Upsert + Remove deleted)
        if (isset($body['programs']['items']) && is_array($body['programs']['items'])) {
            $progIds = [];
            foreach ($body['programs']['items'] as $index => $item) {
                if (!empty($item['id']) && !empty($item['title'])) {
                    $progIds[] = $item['id'];
                    Program::updateOrCreate(
                        ['id' => $item['id']],
                        [
                            'title' => $item['title'],
                            'description' => $item['description'] ?? '',
                            'image' => $item['image'] ?? '',
                            'icon' => $item['icon'] ?? 'Heart',
                            'badge_bg' => $item['badgeBg'] ?? 'bg-[#f8e6bd]',
                            'badge_text_color' => $item['badgeTextColor'] ?? 'text-[#8b590b]',
                            'grid_span' => $item['gridSpan'] ?? null,
                            'order' => $index,
                            'created_by' => $updatedBy,
                        ]
                    );
                }
            }
            if (!empty($progIds)) {
                Program::whereNotIn('id', $progIds)->delete();
            }
        }

        if (isset($body['programs'])) {
            Setting::set('programs_meta', [
                'eyebrow' => $body['programs']['eyebrow'] ?? 'What We Do',
                'title' => $body['programs']['title'] ?? 'Comprehensive Programs Designed For Real Change',
                'copy' => $body['programs']['copy'] ?? 'We focus on four foundational pillars of human development to create lasting generational change.',
            ], $updatedBy);
        }

        // 3. Sync Moments of Hope Gallery (Upsert + Remove deleted)
        if (isset($body['gallery']['items']) && is_array($body['gallery']['items'])) {
            $galIds = [];
            foreach ($body['gallery']['items'] as $index => $item) {
                if (!empty($item['id']) && !empty($item['title'])) {
                    $galIds[] = $item['id'];
                    GalleryItem::updateOrCreate(
                        ['id' => $item['id']],
                        [
                            'title' => $item['title'],
                            'caption' => $item['caption'] ?? '',
                            'image' => $item['image'] ?? '',
                            'grid_span' => $item['gridSpan'] ?? null,
                            'order' => $index,
                            'created_by' => $updatedBy,
                        ]
                    );
                }
            }
            if (!empty($galIds)) {
                GalleryItem::whereNotIn('id', $galIds)->delete();
            }
        }

        if (isset($body['gallery'])) {
            Setting::set('gallery_meta', [
                'eyebrow' => $body['gallery']['eyebrow'] ?? 'Moments Of Hope',
                'title' => $body['gallery']['title'] ?? 'Witness Our Impact In Action',
                'copy' => $body['gallery']['copy'] ?? 'Real stories, real faces, and vibrant moments of change captured across our centers.',
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

        return $this->index();
    }
}
