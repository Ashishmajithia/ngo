<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Donation;

class DonationController extends Controller
{
    public function index()
    {
        $donations = Donation::orderBy('created_at', 'desc')->get();

        $formatted = $donations->map(function ($d) {
            return [
                'id' => $d->id,
                'amount' => $d->amount,
                'frequency' => $d->frequency ?? 'One-time',
                'name' => $d->name,
                'email' => $d->email,
                'phone' => $d->phone ?? '',
                'utr' => $d->utr ?? '',
                'paymentMethod' => $d->payment_method ?? 'UPI QR',
                'status' => $d->status ?? 'pending',
                'createdAt' => $d->created_at->toISOString(),
            ];
        });

        return response()->json([
            'success' => true,
            'donations' => $formatted,
            'source' => 'laravel_eloquent_db',
            'dbStatus' => [
                'provider' => 'supabase',
                'status' => 'connected',
                'database' => 'PostgreSQL (Supabase Cloud)',
                'host' => config('database.connections.pgsql.host'),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $id = $request->id ?: 'don-' . time() . '-' . substr(bin2hex(random_bytes(4)), 0, 5);

        $donation = Donation::create([
            'id' => $id,
            'amount' => (string)($request->amount ?: '0'),
            'frequency' => $request->frequency ?: 'One-time',
            'name' => $request->name ?: 'Anonymous Donor',
            'email' => $request->email ?: 'donor@example.com',
            'phone' => $request->phone ?: '',
            'utr' => $request->utr ?: '',
            'payment_method' => $request->paymentMethod ?: 'UPI QR',
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Donation recorded successfully in Laravel database!',
            'donation' => $donation,
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required',
        ]);

        $donation = Donation::findOrFail($id);
        $donation->status = $request->status;
        $donation->save();

        return response()->json([
            'success' => true,
            'message' => "Donation status updated to {$request->status}",
            'donation' => $donation,
        ]);
    }
}
