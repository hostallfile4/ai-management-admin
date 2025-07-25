<?php

namespace App\Services;

use App\Models\Model;

class ProviderService
{
    public function getBestModel($type = 'text')
    {
        return Model::where('enabled', true)
            ->where('type', $type)
            ->orderBy('fallback_rank')
            ->first();
    }

    public function runWithFallback($type, $payload)
    {
        $models = Model::where('enabled', true)
            ->where('type', $type)
            ->orderBy('fallback_rank')
            ->get();

        foreach ($models as $model) {
            try {
                // এখানে provider-specific API call
                return $this->callProvider($model, $payload);
            } catch (\Exception $e) {
                continue;
            }
        }
        throw new \Exception("No working provider found for $type");
    }

    private function callProvider($model, $payload)
    {
        // এখানে provider-specific API call logic
        return "[Mocked] Called {$model->name} with payload: " . json_encode($payload);
    }
} 