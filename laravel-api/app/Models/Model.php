<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model as EloquentModel;

class Model extends EloquentModel
{
    use HasFactory;
    protected $fillable = ['provider_id', 'name', 'enabled', 'fallback_rank', 'max_tokens', 'type'];

    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }
} 