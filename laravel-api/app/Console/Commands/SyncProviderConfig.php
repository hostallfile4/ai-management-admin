<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Symfony\Component\Yaml\Yaml;
use App\Models\Provider;
use App\Models\Model as AiModel;

class SyncProviderConfig extends Command
{
    protected $signature = 'sync:provider-config';
    protected $description = 'Sync provider config from YAML to DB';

    public function handle()
    {
        $yamlPath = base_path('config/providers');
        $files = glob($yamlPath . '/*.yaml');
        foreach ($files as $file) {
            $data = Yaml::parseFile($file);
            $provider = Provider::updateOrCreate(
                ['name' => $data['provider']],
                [
                    'enabled' => $data['enabled'] ?? true,
                    'fallback_rank' => $data['fallback_rank'] ?? 1,
                ]
            );
            foreach ($data['models'] as $modelData) {
                AiModel::updateOrCreate(
                    ['name' => $modelData['name'], 'provider_id' => $provider->id],
                    [
                        'enabled' => $modelData['enabled'] ?? true,
                        'fallback_rank' => $modelData['fallback_rank'] ?? 1,
                        'max_tokens' => $modelData['max_tokens'] ?? 2048,
                    ]
                );
            }
        }
        $this->info('✅ Provider & Model sync complete.');
    }
} 