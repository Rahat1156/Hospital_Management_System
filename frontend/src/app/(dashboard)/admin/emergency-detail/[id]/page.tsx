'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle, Ambulance, ArrowLeft, Calendar, Clock, FileText, MapPin, Phone, User,
  Heart, Droplet, Activity, AlertCircle,
} from 'lucide-react';
import { PageHeader, SectionCard } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { emergencyAPI, patientAPI } from '@/lib/mock-api';
import { formatDateTime, formatRelative, formatTime, cn } from '@/lib/utils';
import type { EmergencyRequest, Patient } from '@/types';

interface PageProps {
  params: {
    id: string;
  };
}

export default function EmergencyDetailPage({ params }: PageProps) {
  const [emergency, setEmergency] = useState<EmergencyRequest | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const emergencyRes = await emergencyAPI.get(params.id);
      const emr = emergencyRes.data;

      if (!emr) {
        setError('Emergency request not found');
        setLoading(false);
        return;
      }

      setEmergency(emr);

      if (emr.patient?.id) {
        setPatient({
          id: emr.patient.id,
          tenant_id: emr.tenant_id,
          mrn: emr.patient.mrn ?? emr.patient_mrn,
          user_id: emr.patient.user_id,
          full_name: emr.patient.full_name ?? emr.patient_name,
          gender: emr.patient.gender,
          date_of_birth: emr.patient.date_of_birth,
          blood_group: emr.patient.blood_group,
          phone_country_code: emr.patient.phone?.country_code ?? emr.patient_phone.country_code,
          phone_number: emr.patient.phone?.number ?? emr.patient_phone.number,
          email: emr.patient.email,
          medical_history: emr.patient.medical_history,
          address: emr.patient.address,
        } as Patient);
      } else if (emr.patient_id) {
        try {
          const patientRes = await patientAPI.get(emr.patient_id);
          setPatient(patientRes.data);
        } catch (err) {
          console.error('Failed to load patient:', err);
        }
      }
    } catch (err) {
      console.error('Failed to load emergency:', err);
      setError('Failed to load emergency details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Emergency Details" />
        <SectionCard>
          <div className="p-12 text-center text-muted-foreground">
            <div className="animate-spin h-8 w-8 mx-auto mb-4">
              <AlertCircle className="h-8 w-8" />
            </div>
            Loading emergency details...
          </div>
        </SectionCard>
      </div>
    );
  }

  if (error || !emergency) {
    return (
      <div className="space-y-6">
        <PageHeader title="Emergency Details" />
        <SectionCard>
          <div className="p-12 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-critical mb-3" />
            <p className="text-muted-foreground">{error || 'Emergency not found'}</p>
            <Button asChild className="mt-4" variant="outline">
              <Link href="/admin/emergency">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to emergencies
              </Link>
            </Button>
          </div>
        </SectionCard>
      </div>
    );
  }

  const timeline = [
    { label: 'SOS Received', time: emergency.sos_received_at, done: true },
    { label: 'Dispatcher Assigned', time: emergency.dispatcher_assigned_at, done: !!emergency.dispatcher_assigned_at },
    { label: 'Ambulance Assigned', time: emergency.ambulance_assigned_at, done: !!emergency.ambulance_assigned_at },
    { label: 'En Route', time: emergency.ambulance_dispatched_at, done: !!emergency.ambulance_dispatched_at },
    { label: 'At Location', time: emergency.arrived_at_patient_at, done: !!emergency.arrived_at_patient_at },
    { label: 'Transporting', time: emergency.left_patient_location_at, done: !!emergency.left_patient_location_at },
    { label: 'Arrived at ER', time: emergency.arrived_at_er_at, done: !!emergency.arrived_at_er_at },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Emergency Details"
        description={emergency.request_number}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/emergency">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to all emergencies
            </Link>
          </Button>
        }
      />

      {/* Critical Alert Banner */}
      <div className="flex items-center gap-3 rounded-xl border-2 border-critical/40 bg-critical/5 px-4 py-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-critical pulse-critical">
          <AlertTriangle className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-critical">Active Emergency</div>
          <div className="text-xs text-muted-foreground">
            {emergency.status.replace(/_/g, ' ').toUpperCase()} - Priority: {emergency.priority.toUpperCase()}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Patient Information */}
        <div className="lg:col-span-1 space-y-4">
          <SectionCard title="Patient Information" description="Emergency requester">
            <div className="p-4 space-y-4">
              {/* Avatar and Name */}
              <div className="text-center">
                <Avatar name={patient?.full_name ?? emergency.patient_name} size="lg" className="mx-auto mb-3" />
                <div className="font-semibold text-lg">{patient?.full_name ?? emergency.patient_name}</div>
                {(patient?.mrn || emergency.patient_mrn) && (
                  <div className="text-xs font-mono text-muted-foreground mt-1">{patient?.mrn ?? emergency.patient_mrn}</div>
                )}
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                {/* Contact */}
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">Contact</div>
                    <div className="text-sm font-medium">
                      {patient?.phone ? `${patient.phone.country_code} ${patient.phone.number}` : `${emergency.patient_phone.country_code} ${emergency.patient_phone.number}`}
                    </div>
                  </div>
                </div>

                {/* Location */}
                {emergency.pickup_location?.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">Location</div>
                      <div className="text-sm font-medium break-words">
                        {emergency.pickup_location.address}
                      </div>
                    </div>
                  </div>
                )}

                {/* From Patient Profile */}
                {patient && (
                  <>
                    <div className="border-t border-border pt-3 mt-3">
                      <div className="text-xs font-semibold uppercase text-muted-foreground mb-3">
                        Profile Information
                      </div>
                      <div className="space-y-2 text-sm">
                        {patient.gender && (
                          <div>
                            <span className="text-muted-foreground">Gender:</span>
                            <span className="ml-2 font-medium capitalize">{patient.gender}</span>
                          </div>
                        )}
                        {patient.date_of_birth && (
                          <div>
                            <span className="text-muted-foreground">DOB:</span>
                            <span className="ml-2 font-medium">{formatDateTime(patient.date_of_birth)}</span>
                          </div>
                        )}
                        {patient.blood_group && (
                          <div className="flex items-center gap-2">
                            <Droplet className="h-3.5 w-3.5 text-red-500" />
                            <span className="font-semibold">{patient.blood_group}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Medical History */}
                    {patient.medical_history && (
                      <div className="border-t border-border pt-3 mt-3">
                        <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                          Medical Alert
                        </div>
                        {patient.medical_history.allergies?.length > 0 && (
                          <div className="mb-2">
                            <div className="text-xs text-muted-foreground">⚠️ Allergies</div>
                            <div className="text-xs font-medium text-critical">
                              {patient.medical_history.allergies.join(', ')}
                            </div>
                          </div>
                        )}
                        {patient.medical_history.chronic_conditions?.length > 0 && (
                          <div>
                            <div className="text-xs text-muted-foreground">Chronic Conditions</div>
                            <div className="text-xs font-medium">
                              {patient.medical_history.chronic_conditions.join(', ')}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Emergency Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Chief Complaint */}
          <SectionCard title="Chief Complaint & Status">
            <div className="p-4">
              <div className="rounded-lg border border-border bg-secondary/20 px-4 py-3 mb-4">
                <div className="text-sm font-medium">{emergency.chief_complaint}</div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-muted-foreground">Current Status</span>
                <Badge
                  className={cn(
                    emergency.status === 'sos_received' && 'bg-red-500/20 text-red-700',
                    ['dispatcher_assigned', 'ambulance_assigned'].includes(emergency.status) && 'bg-orange-500/20 text-orange-700',
                    ['en_route_to_patient', 'at_patient_location', 'transporting'].includes(emergency.status) && 'bg-blue-500/20 text-blue-700',
                    ['arrived_at_er', 'handed_over'].includes(emergency.status) && 'bg-green-500/20 text-green-700',
                  )}
                >
                  {emergency.status.replace(/_/g, ' ').toUpperCase()}
                </Badge>
              </div>

              {emergency.priority && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Priority</span>
                  <Badge
                    variant={emergency.priority === 'critical' ? 'critical' : 'warning'}
                  >
                    {emergency.priority.toUpperCase()}
                  </Badge>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Reported Vitals */}
          {emergency.reported_vitals && Object.keys(emergency.reported_vitals).length > 0 && (
            <SectionCard title="Reported Vitals">
              <div className="p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {emergency.reported_vitals.consciousness && (
                    <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                      <Activity className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <div className="text-xs text-muted-foreground">Consciousness</div>
                        <div className="font-medium capitalize text-sm">{emergency.reported_vitals.consciousness}</div>
                      </div>
                    </div>
                  )}
                  {emergency.reported_vitals.breathing && (
                    <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                      <Heart className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <div className="text-xs text-muted-foreground">Breathing</div>
                        <div className="font-medium capitalize text-sm">{emergency.reported_vitals.breathing}</div>
                      </div>
                    </div>
                  )}
                  {emergency.reported_vitals.bleeding && (
                    <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                      <Droplet className={cn('h-4 w-4 flex-shrink-0',
                        emergency.reported_vitals.bleeding === 'severe' ? 'text-critical' : 'text-orange-500'
                      )} />
                      <div>
                        <div className="text-xs text-muted-foreground">Bleeding</div>
                        <div className={cn('font-medium capitalize text-sm',
                          emergency.reported_vitals.bleeding === 'severe' && 'text-critical'
                        )}>
                          {emergency.reported_vitals.bleeding}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>
          )}

          {/* Timeline */}
          <SectionCard title="Response Timeline">
            <div className="p-4">
              <div className="space-y-3">
                {timeline.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className={cn(
                        'mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center',
                        step.done
                          ? 'border-green-500 bg-green-500/20'
                          : 'border-border bg-secondary',
                      )}
                    >
                      {step.done && (
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                      )}
                    </div>
                    <div>
                      <div className={cn('text-sm font-medium', step.done ? 'text-foreground' : 'text-muted-foreground')}>
                        {step.label}
                      </div>
                      {step.time && (
                        <div className="text-xs text-muted-foreground">{formatDateTime(step.time)}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* Ambulance Assignment */}
          {emergency.ambulance_number && (
            <SectionCard title="Ambulance Assignment">
              <div className="p-4 flex items-center gap-3">
                <Ambulance className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div>
                  <div className="font-semibold">{emergency.ambulance_number}</div>
                  {emergency.ambulance_assigned_at && (
                    <div className="text-xs text-muted-foreground">
                      Assigned {formatRelative(emergency.ambulance_assigned_at)}
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>
          )}

          {/* Destination Hospital */}
          {emergency.destination_hospital_name && (
            <SectionCard title="Destination Hospital">
              <div className="p-4">
                <div className="font-semibold">{emergency.destination_hospital_name}</div>
                {emergency.er_pre_notification_sent && (
                  <div className="mt-2 rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-700">
                    ✓ ER pre-notification sent
                    {emergency.er_pre_notification_sent_at && (
                      <span className="ml-2 text-xs opacity-70">
                        at {formatDateTime(emergency.er_pre_notification_sent_at)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}
