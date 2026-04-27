<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (config('database.default') === 'sqlite') {
            $db = \DB::connection()->getPdo();
            $db->exec('PRAGMA journal_mode=WAL;');
            $db->exec('PRAGMA cache_size = -64000;'); // 64MB cache
            $db->exec('PRAGMA synchronous = NORMAL;');
        }
    }
}
