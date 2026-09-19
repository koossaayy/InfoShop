<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\Telegram\TelegramMessage;
use App\Models\Setting;
use Illuminate\Support\Facades\Auth;

class SaleDeleted extends Notification
{
    use Queueable;

    public $sale;
    protected $botToken;
    /**
     * Create a new notification instance.
     */
    public function __construct($sale, $botToken='')
    {
        $this->botToken = $botToken;
        $this->sale = $sale;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'telegram'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject(__('Sale Deleted - #:invoice_number', ['invoice_number' => $this->sale['invoice_number']]))
            ->greeting(__('A sale has been deleted.'))
            ->line(__('#:invoice_number By :name', ['invoice_number' => $this->sale['invoice_number'], 'name' => Auth::user()->name]))
            ->line(__('Amount: :total_amount', ['total_amount' => $this->sale['total_amount']]))
            ->line(__('Deleted at: :format', ['format' => \Carbon\Carbon::parse($this->sale['deleted_at'])->format('Y-m-d h:i A')]));
    }

    public function toDatabase($notifiable)
    {
        return [
            'sale_id' => $this->sale['id'],
            'amount' => $this->sale['total_amount'],
            'message' => __('A sale has been deleted.'),
            'url' => url('/sales'),
        ];
    }

    public function toTelegram($notifiable)
    {
        // Create the Telegram message
        return TelegramMessage::create()
            ->content(
                __('A sale has been deleted.
Invoice Number: #:invoice_number
Deleted By: :name
Amount: :total_amount
Deleted at: :format
', ['invoice_number' => $this->sale['invoice_number'], 'name' => Auth::user()->name, 'total_amount' => $this->sale['total_amount'], 'format' => \Carbon\Carbon::parse($this->sale['deleted_at'])->format('Y-m-d h:i A')])
            )
            ->token($this->botToken);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
