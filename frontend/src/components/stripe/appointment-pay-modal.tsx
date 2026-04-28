'use client';

import { useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  CreditCard,
  Download,
  Lock,
  Stethoscope,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { appointmentAPI } from '@/lib/mock-api';
import { downloadAppointmentReceipt } from '@/lib/receipt-utils';
import type { Appointment } from '@/types';

function fmt(n: number) {
  return `৳${n.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('en-BD', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function formatCardNumber(raw: string) {
  return raw.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}
function formatExpiry(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

// ── Confirmation screen ───────────────────────────────────────────────────────
interface ConfirmProps {
  appointment: Appointment;
  piId: string;
  feeBdt: number;
  amountUsdCents: number;
  paidAt: string;
  onClose: () => void;
}

function ConfirmationScreen({ appointment: a, piId, feeBdt, amountUsdCents, paidAt, onClose }: ConfirmProps) {
  function download() {
    downloadAppointmentReceipt({ appointment: a, paymentIntentId: piId, feeBdt, amountUsdCents, paidAt });
  }

  return (
    <div className="space-y-5">
      {/* Success banner */}
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-gradient-to-b from-green-50 to-emerald-50 px-6 py-8 text-center dark:from-green-950 dark:to-emerald-950">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <CheckCircle className="h-9 w-9 text-green-600" />
        </div>
        <div>
          <div className="text-xl font-bold text-green-800 dark:text-green-200">Payment Confirmed!</div>
          <div className="mt-1 text-sm text-green-700 dark:text-green-300">
            Your appointment fee has been paid successfully.
          </div>
        </div>
        <div className="text-3xl font-bold text-green-700 dark:text-green-300">{fmt(feeBdt)}</div>
      </div>

      {/* Appointment summary */}
      <div className="divide-y divide-border rounded-xl border border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Stethoscope className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold">{a.doctor_name}</div>
            <div className="text-xs text-muted-foreground">{a.doctor_specialty}</div>
          </div>
          <Badge variant="healthy" className="shrink-0">Paid</Badge>
        </div>

        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="text-sm font-medium">{fmtDate(a.scheduled_at)}</div>
            <div className="text-xs text-muted-foreground capitalize">
              {a.appointment_type.replace(/_/g, ' ')} · {a.appointment_number}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-0 divide-x divide-border">
          <div className="px-4 py-3">
            <div className="text-xs text-muted-foreground">Transaction ID</div>
            <div className="mt-0.5 break-all font-mono text-xs">{piId}</div>
          </div>
          <div className="px-4 py-3">
            <div className="text-xs text-muted-foreground">Paid at</div>
            <div className="mt-0.5 text-xs">{new Date(paidAt).toLocaleTimeString('en-BD', { hour12: true })}</div>
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="text-xs text-muted-foreground">Charged via Stripe (USD equiv.)</div>
          <div className="mt-0.5 text-xs font-medium">${(amountUsdCents / 100).toFixed(2)} USD</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onClose}>
          Back to Appointments
        </Button>
        <Button className="flex-1 gap-2" onClick={download}>
          <Download className="h-4 w-4" /> Download Receipt
        </Button>
      </div>
    </div>
  );
}

// ── Custom card form ──────────────────────────────────────────────────────────
interface CardFormProps {
  feeBdt: number;
  onSuccess: (piId: string, amountUsdCents: number) => void;
  onError: (msg: string) => void;
  appointmentId: string;
}

function CardForm({ feeBdt, onSuccess, onError, appointmentId }: CardFormProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [busy, setBusy] = useState(false);

  const inputCls = 'h-11 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring';

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    const rawNumber = cardNumber.replace(/\s/g, '');
    if (rawNumber.length < 13) { onError('Please enter a valid card number.'); return; }

    const [expM, expY] = expiry.split('/');
    const expMonth = parseInt(expM ?? '', 10);
    const expYear  = parseInt(expY ?? '', 10);
    if (!expMonth || expMonth < 1 || expMonth > 12 || !expYear || expYear < 1) {
      onError('Please enter a valid expiry date (MM/YY).'); return;
    }
    if (cvc.replace(/\D/g, '').length < 3) { onError('Please enter a valid CVC.'); return; }

    setBusy(true);
    try {
      const fullYear = expYear < 100 ? 2000 + expYear : expYear;
      const res = await appointmentAPI.payDirect(appointmentId, {
        card_number: rawNumber,
        exp_month: expMonth,
        exp_year: fullYear,
        cvc: cvc.replace(/\D/g, ''),
        card_name: cardName.trim() || undefined,
      });
      onSuccess(res.data.payment_intent_id, res.data.amount_usd_cents);
    } catch (err: unknown) {
      const e = err as { message?: string };
      onError(e?.message ?? 'Payment failed. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* Amount summary */}
      <div className="rounded-xl border border-border bg-secondary/30 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Consultation fee</span>
          <span className="text-lg font-bold">{fmt(feeBdt)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>Charged via Stripe sandbox (USD equiv.)</span>
          <span>${(Math.max(feeBdt / 110, 0.5)).toFixed(2)}</span>
        </div>
      </div>

      {/* Card fields */}
      <div className="space-y-3 rounded-xl border border-border p-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Card Number</label>
          <input
            className={inputCls}
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            inputMode="numeric"
            autoComplete="cc-number"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Expiry (MM/YY)</label>
            <input
              className={inputCls}
              placeholder="MM/YY"
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              inputMode="numeric"
              autoComplete="cc-exp"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">CVC</label>
            <input
              className={inputCls}
              placeholder="123"
              value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
              inputMode="numeric"
              autoComplete="cc-csc"
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Cardholder Name (optional)</label>
          <input
            className={inputCls}
            placeholder="Name on card"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            autoComplete="cc-name"
          />
        </div>
      </div>


      <Button type="submit" disabled={busy} className="h-11 w-full gap-2 text-base">
        <Lock className="h-4 w-4" />
        {busy ? 'Processing payment…' : `Pay ${fmt(feeBdt)}`}
      </Button>
    </form>
  );
}

// ── Public modal ──────────────────────────────────────────────────────────────
export interface AppointmentPayModalProps {
  appointment: Appointment;
  onClose: () => void;
  onPaid: (updated: Appointment) => void;
}

type Phase = 'form' | 'success' | 'error';

export function AppointmentPayModal({ appointment, onClose, onPaid }: AppointmentPayModalProps) {
  const [phase, setPhase] = useState<Phase>('form');
  const [piId, setPiId] = useState('');
  const [amountUsdCents, setAmountUsdCents] = useState(0);
  const [paidAt, setPaidAt] = useState('');
  const [paidAppointment, setPaidAppointment] = useState<Appointment | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSuccess(resolvedPiId: string, usdCents: number) {
    const now = new Date().toISOString();
    setPiId(resolvedPiId);
    setAmountUsdCents(usdCents);
    setPaidAt(now);
    const updated: Appointment = { ...appointment, payment_status: 'paid' };
    setPaidAppointment(updated);
    onPaid(updated);
    setPhase('success');
  }

  function handleError(msg: string) {
    setErrorMsg(msg);
    setPhase('error');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="w-full max-w-md rounded-t-2xl border border-border bg-background shadow-2xl sm:rounded-2xl">

        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <CreditCard className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="font-semibold leading-tight">
                {phase === 'success' ? 'Payment Complete' : 'Pay Appointment Fee'}
              </div>
              <div className="text-xs text-muted-foreground">{appointment.appointment_number}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal body */}
        <div className="max-h-[80vh] overflow-y-auto px-5 py-5">

          {phase === 'form' && (
            <CardForm
              feeBdt={appointment.fee_bdt}
              appointmentId={appointment.id}
              onSuccess={handleSuccess}
              onError={handleError}
            />
          )}

          {phase === 'error' && (
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="text-sm">{errorMsg}</div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
                <Button className="flex-1" onClick={() => setPhase('form')}>Try Again</Button>
              </div>
            </div>
          )}

          {phase === 'success' && paidAppointment && (
            <ConfirmationScreen
              appointment={paidAppointment}
              piId={piId}
              feeBdt={appointment.fee_bdt}
              amountUsdCents={amountUsdCents}
              paidAt={paidAt}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}
