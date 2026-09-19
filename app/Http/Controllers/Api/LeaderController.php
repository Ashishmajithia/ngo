<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Leader;

class LeaderController extends Controller
{
    public function index()
    {
        $leaders = Leader::active()->ordered()->get();

        return response()->json([
            'success' => true,
            'leaders' => $leaders,
        ])->header('Cache-Control', 'no-cache, no-store, must-revalidate');
    }

    public function adminIndex()
    {
        $leaders = Leader::ordered()->get();

        return response()->json([
            'success' => true,
            'leaders' => $leaders,
        ])->header('Cache-Control', 'no-cache, no-store, must-revalidate');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'role' => 'required|string',
        ]);

        $id = $request->id ?: 'leader-' . time();
        $order = $request->has('order') ? (int)$request->order : (Leader::max('order') + 1);
        $createdBy = $request->created_by ?: (auth()->user()?->email ?? env('ADMIN_EMAIL', 'admin@actcharitabletrust.org'));

        // Keep 100% original full HD photo without lossy downscaling
        $photo = !empty($request->photo) ? $request->photo : '';

        $leader = Leader::create([
            'id' => $id,
            'name' => $request->name,
            'role' => $request->role,
            'badge' => $request->badge ?? null,
            'tenure' => $request->tenure ?? null,
            'photo' => $photo,
            'message' => $request->message ?? null,
            'phone' => $request->phone ?? null,
            'email' => $request->email ?? null,
            'order' => $order,
            'is_active' => $request->has('is_active') ? (bool)$request->is_active : true,
            'created_by' => $createdBy,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Leader added successfully!',
            'leader' => $leader,
        ]);
    }

    public function update(Request $request, $id)
    {
        $leader = Leader::findOrFail($id);

        $data = $request->only([
            'name',
            'role',
            'badge',
            'tenure',
            'photo',
            'message',
            'phone',
            'email',
            'order',
            'is_active',
        ]);

        $leader->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Leader updated successfully!',
            'leader' => $leader,
        ]);
    }

    public function destroy($id)
    {
        $leader = Leader::find($id);
        if ($leader) {
            $leader->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Leader deleted successfully!',
        ]);
    }

    public function reorder(Request $request)
    {
        $items = $request->input('order', []);
        if (is_array($items)) {
            foreach ($items as $idx => $leaderId) {
                Leader::where('id', $leaderId)->update(['order' => $idx]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Leaders reordered successfully!',
        ]);
    }
}
