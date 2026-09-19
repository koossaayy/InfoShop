<?php

namespace App\Traits;

use Illuminate\Support\Facades\Auth;

trait Userstamps
{
    protected static function bootUserstamps()
    {
        static::creating(function ($model) {
            // Stamp the authenticated user. Outside an HTTP request (console,
            // seeders, queued jobs) there is none, so keep any value already set
            // instead of overwriting it with null.
            if (Auth::check()) {
                $model->created_by = Auth::id();
            }
        });
    }
}
