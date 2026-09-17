<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Setting;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::all()->pluck('value', 'key');

        return response()->json([
            'success' => true,
            'settings' => $settings,
        ]);
    }

    public function show($key)
    {
        $val = Setting::get($key);

        return response()->json([
            'success' => true,
            'key' => $key,
            'value' => $val,
        ]);
    }

    public function update(Request $request)
    {
        $key = $request->input('key');
        $value = $request->input('value');
        $updatedBy = auth()->user()?->email ?? env('ADMIN_EMAIL', 'admin@actcharitabletrust.org');

        if (!$key || !isset($value)) {
            return response()->json(['success' => false, 'error' => 'Key and Value are required'], 400);
        }

        $setting = Setting::set($key, $value, $updatedBy);

        return response()->json([
            'success' => true,
            'message' => "Setting '{$key}' updated successfully!",
            'setting' => $setting,
        ]);
    }
}
