<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->string('father_name')->nullable()->after('full_name');
            $table->string('mother_name')->nullable()->after('father_name');
            $table->string('religion', 64)->nullable()->after('mother_name');
        });
    }

    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropColumn(['father_name', 'mother_name', 'religion']);
        });
    }
};
