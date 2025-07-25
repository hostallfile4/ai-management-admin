<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ClientProviderOverride;

class ClientProviderOverrideController extends Controller
{
    public function index()
    {
        return ClientProviderOverride::all();
    }

    public function update(Request $request, $id)
    {
        $override = ClientProviderOverride::findOrFail($id);
        $override->update($request->all());
        return $override;
    }
} 