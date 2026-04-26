<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\User;

class AdminController extends Controller
{
    public function users()
    {
        return response()->json(
            User::select('id', 'name', 'email', 'role', 'created_at')->get()
        );
    }

    public function events()
    {
        return response()->json(
            Event::with('user:id,name,email')->latest()->get()
        );
    }
}
