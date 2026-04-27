<?php

use App\Http\Controllers\Api\HmsApiController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/login', [HmsApiController::class, 'login']);
    Route::post('/register', [HmsApiController::class, 'register']);
    Route::post('/verify-otp', [HmsApiController::class, 'verifyOtp']);
    Route::post('/resend-otp', [HmsApiController::class, 'resendOtp']);
    Route::post('/request-password-reset', [HmsApiController::class, 'requestPasswordReset']);
    Route::get('/setup-2fa', [HmsApiController::class, 'setup2FA']);
    Route::post('/logout', [HmsApiController::class, 'logout']);
    Route::get('/me', [HmsApiController::class, 'currentUser']);
});

Route::get('/tenant/current', [HmsApiController::class, 'currentTenant']);

Route::prefix('dashboard')->group(function () {
    Route::get('/kpis', [HmsApiController::class, 'dashboardKpis']);
    Route::get('/revenue-trend', fn () => app(HmsApiController::class)->chartSeries('revenue_trend'));
    Route::get('/patient-visits-trend', fn () => app(HmsApiController::class)->chartSeries('patient_visits_trend'));
    Route::get('/department-revenue', fn () => app(HmsApiController::class)->chartSeries('department_revenue'));
    Route::get('/doctor-performance', [HmsApiController::class, 'doctorPerformance']);
});

Route::post('/patients', [HmsApiController::class, 'registerWalkIn']);
Route::get('/patients', [HmsApiController::class, 'listPatients']);
Route::get('/patients/search', [HmsApiController::class, 'listPatients']);
Route::get('/patients/mrn/{mrn}', [HmsApiController::class, 'getPatientByMrn']);
Route::get('/patients/{id}', [HmsApiController::class, 'getPatient']);
Route::get('/patients/{id}/health-timeline', [HmsApiController::class, 'patientTimeline']);

Route::post('/appointments', [HmsApiController::class, 'createAppointment']);
Route::get('/appointments', [HmsApiController::class, 'listAppointments']);
Route::get('/appointments/today', [HmsApiController::class, 'getTodayAppointments']);
Route::get('/appointments/{id}', [HmsApiController::class, 'getAppointment']);
Route::post('/appointments/{id}/payment-intent', [HmsApiController::class, 'appointmentPaymentIntent']);
Route::post('/appointments/{id}/mark-paid', [HmsApiController::class, 'markAppointmentPaid']);
Route::post('/appointments/{id}/pay-direct', [HmsApiController::class, 'appointmentPayDirect']);

Route::get('/prescriptions', [HmsApiController::class, 'listPrescriptions']);
Route::get('/prescriptions/{id}', [HmsApiController::class, 'getPrescription']);

Route::get('/lab-tests', [HmsApiController::class, 'listLabTests']);
Route::get('/lab-tests/{id}', [HmsApiController::class, 'getLabTest']);

Route::get('/pharmacy/orders', [HmsApiController::class, 'listPharmacyOrders']);
Route::get('/pharmacy/inventory', [HmsApiController::class, 'listInventory']);
Route::get('/pharmacy/inventory/low-stock', [HmsApiController::class, 'listLowStockInventory']);

Route::get('/wards', [HmsApiController::class, 'listWards']);
Route::get('/beds', [HmsApiController::class, 'listBeds']);

Route::get('/bills', [HmsApiController::class, 'listBills']);
Route::get('/bills/{id}', [HmsApiController::class, 'getBill']);
Route::post('/billing/{id}/payment-intent', [HmsApiController::class, 'createPaymentIntent']);
Route::post('/billing/{id}/mark-paid', [HmsApiController::class, 'markBillPaid']);
Route::post('/billing/{id}/pay-direct', [HmsApiController::class, 'billPayDirect']);

Route::get('/alerts', [HmsApiController::class, 'listAlerts']);
Route::get('/alerts/active', [HmsApiController::class, 'activeAlerts']);
Route::get('/alerts/notifications', [HmsApiController::class, 'notifications']);
Route::post('/alerts/{id}/acknowledge', [HmsApiController::class, 'acknowledgeAlert']);

Route::get('/emergencies/active', [HmsApiController::class, 'activeEmergencies']);
Route::post('/emergencies/trigger-sos', [HmsApiController::class, 'triggerSos']);

Route::get('/users', [HmsApiController::class, 'listUsers']);
Route::get('/users/doctors', [HmsApiController::class, 'listDoctors']);
