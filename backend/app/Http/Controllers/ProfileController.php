<?php

namespace App\Http\Controllers;

use App\Models\Location;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    use ApiResponse;

    public function show(Request $request)
    {
        $user = $request->user()->load('location');

        return $this->success($user);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'phone' => 'nullable|string|max:20',
            'avatar_url' => 'nullable|string',
            'expo_push_token' => 'nullable|string|max:200',
            'commune' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        $user = $request->user();
        $user->update($validated);

        if ($request->hasAny(['commune', 'latitude', 'longitude'])) {
            Location::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'commune' => $validated['commune'] ?? $user->location?->commune,
                    'latitude' => $validated['latitude'] ?? $user->location?->latitude,
                    'longitude' => $validated['longitude'] ?? $user->location?->longitude,
                ]
            );
        }

        return $this->success($user->load('location'), 'Perfil actualizado exitosamente');
    }
}
