<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function upload(Request $request)
    {
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $filename = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '', $file->getClientOriginalName());
            $destinationPath = public_path('uploads');

            if (!file_exists($destinationPath)) {
                mkdir($destinationPath, 0777, true);
            }

            $file->move($destinationPath, $filename);

            return response()->json([
                'success' => true,
                'url' => '/uploads/' . $filename,
                'filename' => $filename,
            ]);
        }

        // Handle base64 upload
        if ($request->has('image')) {
            $imageData = $request->input('image');
            if (preg_match('/^data:image\/(\w+);base64,/', $imageData, $type)) {
                $imageData = substr($imageData, strpos($imageData, ',') + 1);
                $type = strtolower($type[1]); // jpg, png, gif, webp

                $imageData = base64_decode($imageData);
                if ($imageData === false) {
                    return response()->json(['success' => false, 'error' => 'base64_decode failed'], 400);
                }

                $filename = 'img_' . time() . '_' . substr(bin2hex(random_bytes(4)), 0, 6) . '.' . $type;
                $destinationPath = public_path('uploads');

                if (!file_exists($destinationPath)) {
                    mkdir($destinationPath, 0777, true);
                }

                file_put_contents($destinationPath . '/' . $filename, $imageData);

                return response()->json([
                    'success' => true,
                    'url' => '/uploads/' . $filename,
                    'filename' => $filename,
                ]);
            }
        }

        return response()->json([
            'success' => false,
            'error' => 'No file or image uploaded',
        ], 400);
    }
}
