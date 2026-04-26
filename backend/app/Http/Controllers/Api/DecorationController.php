<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Decoration;

class DecorationController extends Controller
{
    public function index()
    {
        return response()->json(Decoration::where('active', true)->get());
    }
}
