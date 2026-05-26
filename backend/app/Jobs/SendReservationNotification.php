<?php

namespace App\Jobs;

use App\Models\Reservation;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;

class SendReservationNotification implements ShouldQueue
{
    use Dispatchable, Queueable;

    public function __construct(
        public Reservation $reservation
    )
    {
    }

    public function handle(): void
    {
        $product = $this->reservation->product;
        $farmer = $product->user;
        $buyer = $this->reservation->buyer;

        if (!$farmer->expo_push_token) {
            return;
        }

        $message = sprintf(
            '%s quiere reservar %d %s de %s',
            $buyer->name,
            $this->reservation->quantity,
            $product->unit,
            $product->name
        );

        Http::post('https://exp.host/--/api/v2/push/send', [
            'to' => $farmer->expo_push_token,
            'title' => 'Nueva reserva recibida',
            'body' => $message,
            'data' => [
                'reservation_id' => $this->reservation->id,
            ],
        ]);
    }
}
