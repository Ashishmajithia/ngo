<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Program;

class ProgramController extends Controller
{
    public function index()
    {
        $programs = Program::active()->ordered()->get();

        return response()->json([
            'success' => true,
            'programs' => $programs,
        ])->header('Cache-Control', 'no-cache, no-store, must-revalidate');
    }

    public function adminIndex()
    {
        $programs = Program::ordered()->get();

        return response()->json([
            'success' => true,
            'programs' => $programs,
        ])->header('Cache-Control', 'no-cache, no-store, must-revalidate');
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
        ]);

        $id = $request->id ?: 'prog-' . time();
        $order = $request->has('order') ? (int)$request->order : (Program::max('order') + 1);
        $createdBy = $request->created_by ?: (auth()->user()?->email ?? env('ADMIN_EMAIL', 'admin@actcharitabletrust.org'));

        $image = !empty($request->image) ? UploadController::optimizeImage($request->image, 800, 600, 75) : '';

        $program = Program::create([
            'id' => $id,
            'title' => $request->title,
            'description' => $request->description,
            'image' => $image,
            'icon' => $request->icon ?? 'Heart',
            'badge_bg' => $request->badge_bg ?? 'bg-[#f8e6bd]',
            'badge_text_color' => $request->badge_text_color ?? 'text-[#8b590b]',
            'grid_span' => $request->grid_span,
            'order' => $order,
            'is_active' => $request->has('is_active') ? (bool)$request->is_active : true,
            'created_by' => $createdBy,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Program created successfully!',
            'program' => $program,
        ]);
    }

    public function update(Request $request, $id)
    {
        $program = Program::findOrFail($id);

        $data = $request->only([
            'title',
            'description',
            'image',
            'icon',
            'badge_bg',
            'badge_text_color',
            'grid_span',
            'order',
            'is_active',
        ]);

        if (!empty($data['image'])) {
            $data['image'] = UploadController::optimizeImage($data['image'], 800, 600, 75);
        }

        $program->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Program updated successfully!',
            'program' => $program,
        ]);
    }

    public function destroy($id)
    {
        $program = Program::find($id);
        if ($program) {
            $program->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Program deleted successfully!',
        ]);
    }
}
