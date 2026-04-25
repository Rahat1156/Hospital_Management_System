<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Admission;
use App\Models\Alert;
use App\Models\Ambulance;
use App\Models\Appointment;
use App\Models\AuditLog;
use App\Models\Bed;
use App\Models\Bill;
use App\Models\BillItem;
use App\Models\Dispense;
use App\Models\EmergencyRequest;
use App\Models\Guardian;
use App\Models\Inventory;
use App\Models\LabResult;
use App\Models\LabTest;
use App\Models\Medicine;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\Prescription;
use App\Models\PrescriptionItem;
use App\Models\Role;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Ward;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class ErdResourceController extends Controller
{
    /** @var array<string, class-string<Model>> */
    private array $models = [
        'tenants' => Tenant::class,
        'roles' => Role::class,
        'users' => User::class,
        'patients' => Patient::class,
        'guardians' => Guardian::class,
        'appointments' => Appointment::class,
        'medicines' => Medicine::class,
        'prescriptions' => Prescription::class,
        'prescription-items' => PrescriptionItem::class,
        'inventory' => Inventory::class,
        'dispenses' => Dispense::class,
        'wards' => Ward::class,
        'beds' => Bed::class,
        'admissions' => Admission::class,
        'lab-tests' => LabTest::class,
        'lab-results' => LabResult::class,
        'bills' => Bill::class,
        'bill-items' => BillItem::class,
        'payments' => Payment::class,
        'emergency-requests' => EmergencyRequest::class,
        'ambulances' => Ambulance::class,
        'alerts' => Alert::class,
        'audit-logs' => AuditLog::class,
    ];

    public function tables(): JsonResponse
    {
        return response()->json([
            'data' => collect($this->models)->map(fn (string $model, string $resource): array => [
                'resource' => $resource,
                'table' => (new $model())->getTable(),
                'primary_key' => (new $model())->getKeyName(),
                'columns' => Schema::getColumnListing((new $model())->getTable()),
            ])->values(),
        ]);
    }

    public function index(Request $request, string $resource): JsonResponse
    {
        $model = $this->model($resource);
        $instance = new $model();
        $query = $model::query();

        foreach ($request->query() as $column => $value) {
            if ($value !== null && $value !== '' && Schema::hasColumn($instance->getTable(), $column)) {
                $query->where($column, $value);
            }
        }

        $data = $query->orderBy($instance->getKeyName())->get();

        return response()->json(['data' => $data]);
    }

    public function store(Request $request, string $resource): JsonResponse
    {
        $model = $this->model($resource);
        $record = $model::query()->create($request->all());

        return response()->json(['data' => $record, 'message' => Str::headline($resource).' created'], 201);
    }

    public function show(string $resource, string $id): JsonResponse
    {
        $model = $this->model($resource);

        return response()->json(['data' => $model::query()->findOrFail($id)]);
    }

    public function update(Request $request, string $resource, string $id): JsonResponse
    {
        $model = $this->model($resource);
        $record = $model::query()->findOrFail($id);
        $record->fill($request->all());
        $record->save();

        return response()->json(['data' => $record, 'message' => Str::headline($resource).' updated']);
    }

    public function destroy(string $resource, string $id): JsonResponse
    {
        $model = $this->model($resource);
        $model::query()->findOrFail($id)->delete();

        return response()->json(['data' => ['success' => true]]);
    }

    /** @return class-string<Model> */
    private function model(string $resource): string
    {
        abort_unless(isset($this->models[$resource]), 404, "Unknown API resource [$resource].");

        return $this->models[$resource];
    }
}
