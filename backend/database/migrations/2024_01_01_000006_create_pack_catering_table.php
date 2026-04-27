<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pack_catering', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pack_id')->constrained()->onDelete('cascade');
            $table->foreignId('catering_item_id')->constrained()->onDelete('cascade');
            $table->decimal('quantity_per_guest', 5, 2)->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pack_catering');
    }
};
