<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\GalleryItem;

class GalleryController extends Controller
{
    public function index()
    {
        $items = GalleryItem::active()->ordered()->get();

        return response()->json([
            'success' => true,
            'items' => $items,
        ]);
    }

    public function adminIndex()
    {
        $items = GalleryItem::ordered()->get();

        return response()->json([
            'success' => true,
            'items' => $items,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'image' => 'required|string',
        ]);

        $id = $request->id ?: 'gal-' . time();
        $order = $request->has('order') ? (int)$request->order : (GalleryItem::max('order') + 1);
        $createdBy = $request->created_by ?: (auth()->user()?->email ?? env('ADMIN_EMAIL', 'admin@actcharitabletrust.org'));

        $item = GalleryItem::create([
            'id' => $id,
            'title' => $request->title,
            'caption' => $request->caption ?? '',
            'image' => $request->image,
            'grid_span' => $request->grid_span,
            'order' => $order,
            'is_active' => $request->has('is_active') ? (bool)$request->is_active : true,
            'created_by' => $createdBy,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Gallery item added successfully!',
            'item' => $item,
        ]);
    }

    public function update(Request $request, $id)
    {
        $item = GalleryItem::findOrFail($id);

        $data = $request->only([
            'title',
            'caption',
            'image',
            'grid_span',
            'order',
            'is_active',
        ]);

        $item->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Gallery item updated successfully!',
            'item' => $item,
        ]);
    }

    public function destroy($id)
    {
        $item = GalleryItem::find($id);
        if ($item) {
            $item->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Gallery item deleted successfully!',
        ]);
    }
}
