<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function upload(Request $request)
    {
        $destinationPath = public_path('uploads');
        $canWriteDisk = is_dir($destinationPath) ? is_writable($destinationPath) : @mkdir($destinationPath, 0777, true);

        $uploadedUrls = [];
        $uploadedFilenames = [];

        // 1. Check for array of files: files, files[], or file
        $fileInputs = [];
        if ($request->hasFile('files')) {
            $f = $request->file('files');
            $fileInputs = is_array($f) ? $f : [$f];
        } elseif ($request->hasFile('file')) {
            $f = $request->file('file');
            $fileInputs = is_array($f) ? $f : [$f];
        }

        foreach ($fileInputs as $file) {
            if ($file && $file->isValid()) {
                $ext = $file->getClientOriginalExtension() ?: 'jpg';
                $cleanOriginal = preg_replace('/[^a-zA-Z0-9_-]/', '', pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));
                $filename = 'up_' . time() . '_' . substr(bin2hex(random_bytes(4)), 0, 8) . ($cleanOriginal ? '_' . substr($cleanOriginal, 0, 20) : '') . '.' . strtolower($ext);

                $savedOnDisk = false;
                if ($canWriteDisk) {
                    try {
                        $file->move($destinationPath, $filename);
                        $uploadedUrls[] = '/uploads/' . $filename;
                        $uploadedFilenames[] = $filename;
                        $savedOnDisk = true;
                    } catch (\Throwable $e) {
                        $savedOnDisk = false;
                    }
                }

                if (!$savedOnDisk) {
                    $mime = $file->getMimeType() ?: 'image/jpeg';
                    $dataUrl = 'data:' . $mime . ';base64,' . base64_encode(file_get_contents($file->getRealPath()));
                    $uploadedUrls[] = $dataUrl;
                    $uploadedFilenames[] = $filename;
                }
            }
        }

        // 2. Handle base64 upload if no multipart files
        if (empty($uploadedUrls) && ($request->has('image') || $request->has('images'))) {
            $rawImages = $request->input('images') ?? [$request->input('image')];
            if (!is_array($rawImages)) {
                $rawImages = [$rawImages];
            }

            foreach ($rawImages as $imageData) {
                if (is_string($imageData) && preg_match('/^data:image\/(\w+);base64,/', $imageData, $type)) {
                    $typeExt = strtolower($type[1]);
                    $pureBase64 = substr($imageData, strpos($imageData, ',') + 1);
                    $filename = 'b64_' . time() . '_' . substr(bin2hex(random_bytes(4)), 0, 8) . '.' . ($typeExt === 'jpeg' ? 'jpg' : $typeExt);

                    $savedOnDisk = false;
                    if ($canWriteDisk) {
                        $decoded = base64_decode($pureBase64);
                        if ($decoded !== false && @file_put_contents($destinationPath . '/' . $filename, $decoded)) {
                            $uploadedUrls[] = '/uploads/' . $filename;
                            $uploadedFilenames[] = $filename;
                            $savedOnDisk = true;
                        }
                    }

                    if (!$savedOnDisk) {
                        // Store the base64 URL directly in DB
                        $uploadedUrls[] = $imageData;
                        $uploadedFilenames[] = $filename;
                    }
                }
            }
        }

        if (!empty($uploadedUrls)) {
            return response()->json([
                'success' => true,
                'url' => $uploadedUrls[0],
                'urls' => $uploadedUrls,
                'filename' => $uploadedFilenames[0],
                'filenames' => $uploadedFilenames,
            ]);
        }

        return response()->json([
            'success' => false,
            'error' => 'No valid image file or data received',
        ], 400);
    }
}
