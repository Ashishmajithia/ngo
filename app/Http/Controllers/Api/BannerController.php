<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Banner;

class BannerController extends Controller
{
    public function index()
    {
        $banners = Banner::active()->ordered()->get();

        return response()->json([
            'success' => true,
            'banners' => $banners,
        ])->header('Cache-Control', 'no-cache, no-store, must-revalidate');
    }

    public function adminIndex()
    {
        $banners = Banner::ordered()->get();

        return response()->json([
            'success' => true,
            'banners' => $banners,
        ])->header('Cache-Control', 'no-cache, no-store, must-revalidate');
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'image' => 'required|string',
        ]);

        $id = $request->id ?: 'banner-' . time();
        $order = $request->has('order') ? (int)$request->order : (Banner::max('order') + 1);
        $createdBy = $request->created_by ?: (auth()->user()?->email ?? env('ADMIN_EMAIL', 'admin@actcharitabletrust.org'));

        $image = UploadController::optimizeImage($request->image, 1280, 850, 75);

        $banner = Banner::create([
            'id' => $id,
            'title' => $request->title,
            'eyebrow' => $request->eyebrow ?? '',
            'copy' => $request->copy ?? '',
            'image' => $image,
            'cta_text' => $request->cta_text ?? 'Explore Our Programs',
            'cta_link' => $request->cta_link ?? '#programs',
            'order' => $order,
            'is_active' => $request->has('is_active') ? (bool)$request->is_active : true,
            'created_by' => $createdBy,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Banner created successfully!',
            'banner' => $banner,
        ]);
    }

    public function update(Request $request, $id)
    {
        $banner = Banner::findOrFail($id);

        $data = $request->only([
            'title',
            'eyebrow',
            'copy',
            'image',
            'cta_text',
            'cta_link',
            'order',
            'is_active',
        ]);

        if (!empty($data['image'])) {
            $data['image'] = UploadController::optimizeImage($data['image'], 1280, 850, 75);
        }

        $banner->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Banner updated successfully!',
            'banner' => $banner,
        ]);
    }

    public function destroy($id)
    {
        $banner = Banner::find($id);
        if ($banner) {
            $banner->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Banner deleted successfully!',
        ]);
    }

    public function reorder(Request $request)
    {
        $items = $request->input('items', []);
        foreach ($items as $index => $item) {
            if (!empty($item['id'])) {
                Banner::where('id', $item['id'])->update(['order' => $index]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Banners reordered successfully!',
        ]);
    }
}
