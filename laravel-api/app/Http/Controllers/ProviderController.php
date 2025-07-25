<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Provider;
use App\Models\Model as AiModel;
use Illuminate\Support\Facades\Artisan;

class ProviderController extends Controller
{
    public function index()
    {
        return Provider::with('models')->get();
    }

    public function update(Request $request, $id)
    {
        $provider = Provider::findOrFail($id);
        $provider->update($request->all());
        return $provider;
    }

    public function updateModel(Request $request, $id)
    {
        $model = AiModel::findOrFail($id);
        $model->update($request->all());
        return $model;
    }

    public function syncProviders()
    {
        Artisan::call('sync:provider-config');
        return response()->json(['status' => 'success', 'message' => 'Sync complete!']);
    }
} 