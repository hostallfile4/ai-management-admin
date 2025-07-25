<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Provider extends Model
{
    use HasFactory;
    protected $fillable = ['name', 'enabled', 'fallback_rank'];

    public function models()
    {
        return $this->hasMany(Model::class);
    }
} 