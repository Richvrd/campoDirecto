<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Product;
use App\Jobs\SendReservationNotification;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReservationController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $user = $request->user();
        $reservations = Reservation::with(['product.user.location', 'product.category', 'buyer']);

        if ($user->role === 'agricultor') {
            $reservations->whereHas('product', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        } else {
            $reservations->where('buyer_id', $user->id);
        }

        $reservations = $reservations->paginate(20);

        return $this->success($reservations);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:500',
        ]);

        $product = Product::find($validated['product_id']);

        if (!$product) {
            return $this->error('Producto no encontrado', 404);
        }

        if ($product->status !== 'disponible') {
            return $this->error('El producto no está disponible', 400);
        }

        if ($product->stock < $validated['quantity']) {
            return $this->error('Stock insuficiente', 400);
        }

        DB::beginTransaction();
        try {
            $reservation = Reservation::create([
                'buyer_id' => $request->user()->id,
                'product_id' => $validated['product_id'],
                'quantity' => $validated['quantity'],
                'notes' => $validated['notes'] ?? null,
                'status' => 'pendiente',
            ]);

            $product->decrement('stock', $validated['quantity']);

            DB::commit();

            SendReservationNotification::dispatch($reservation);

            return $this->success($reservation->load('buyer', 'product.user'), 'Reserva creada exitosamente', 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error('Error al crear la reserva: ' . $e->getMessage(), 500);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        $reservation = Reservation::with(['product.user'])->find($id);

        if (!$reservation) {
            return $this->error('Reserva no encontrada', 404);
        }

        $product = $reservation->product;

        if ($product->user_id !== $request->user()->id) {
            return $this->error('No tienes permiso para actualizar esta reserva', 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:pendiente,confirmada,rechazada,completada',
        ]);

        $oldStatus = $reservation->status;
        $newStatus = $validated['status'];

        if ($oldStatus === 'completada') {
            return $this->error('La reserva ya está completada', 400);
        }

        if ($newStatus === 'completada' && $oldStatus === 'rechazada') {
            return $this->error('No se puede completar una reserva rechazada', 400);
        }

        if ($newStatus === 'rechazada') {
            $product->increment('stock', $reservation->quantity);
        }

        $reservation->update($validated);

        return $this->success($reservation, 'Estado de reserva actualizado exitosamente');
    }
}
