'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle, CreditCard, Download, Lock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { billingAPI } from '@/lib/mock-api';
import { downloadReceipt } from '@/lib/receipt-utils';
import type { Bill } from '@/types';

function formatCardNumber(raw: string) {
  return raw.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}
function formatExpiry(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

// ── Custom card form ──────────────────────────────────────────────────────────
interface CardFormProps {
  amountBdt: number;
  billId: string;
  onSuccess: (updatedBill: Bill, piId: string, usdCents: number) => void;
  onError: (msg: string) => void;
}

function CardForm({ amountBdt, billId, onSuccess, onError }: CardFormProps) {
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
      const res = await billingAPI.payDirect(billId, {
        card_number: rawNumber,
        exp_month: expMonth,
        exp_year: fullYear,
        cvc: cvc.replace(/\D/g, ''),
        card_name: cardName.trim() || undefined,
      });
      onSuccess(res.data.bill, res.data.payment_intent_id, res.data.amount_usd_cents);
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
          <span className="text-sm text-muted-foreground">Amount due</span>
          <span className="text-lg font-bold">৳{amountBdt.toLocaleString('en-BD', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>Charged via Stripe sandbox (USD equiv.)</span>
          <span>${(Math.max(amountBdt / 110, 0.5)).toFixed(2)}</span>
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

      {/* Sandbox hint */}
      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <div>
          <strong>Test mode.</strong> Use card{' '}
          <code className="font-mono font-semibold">4242 4242 4242 4242</code>
          {' '}· any future date · any 3-digit CVC.
        </div>
      </div>

      <Button type="submit" disabled={busy} className="h-11 w-full gap-2 text-base">
        <Lock className="h-4 w-4" />
        {busy ? 'Processing payment…' : `Pay ৳${amountBdt.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`}
      </Button>
    </form>
  );
}

// ── Public modal component ────────────────────────────────────────────────────
interface StripePayModalProps {
  bill: Bill;
  onClose: () => void;
  onPaid: (updatedBill: Bill) => void;
}

type Phase = 'form' | 'success' | 'error';

export function StripePayModal({ bill, onClose, onPaid }: StripePayModalProps) {
  const [phase, setPhase] = useState<Phase>('form');
  const [piId, setPiId] = useState('');
  const [amountUsdCents, setAmountUsdCents] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [paidBill, setPaidBill] = useState<Bill | null>(null);

  const amountBdt = bill.total_amount - (bill.paid_amount ?? 0);

  function handleSuccess(updatedBill: Bill, resolvedPiId: string, usdCents: number) {
    setPiId(resolvedPiId);
    setAmountUsdCents(usdCents);
    setPaidBill(updatedBill);
    onPaid(updatedBill);
    setPhase('success');
  }

  function handleDownload() {
    if (paidBill) downloadReceipt(paidBill, piId);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-background shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <CreditCard className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="font-semibold">{phase === 'success' ? 'Payment Complete' : 'Pay Invoice'}</div>
              <div className="text-xs text-muted-foreground">
                {bill.bill_number} · {bill.patient_name}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[80vh] overflow-y-auto px-6 py-5">

          {phase === 'form' && (
            <CardForm
              amountBdt={amountBdt}
              billId={bill.id}
              onSuccess={handleSuccess}
              onError={(msg) => { setErrorMsg(msg); setPhase('error'); }}
            />
          )}

          {phase === 'error' && (
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="text-sm">{errorMsg}</div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={onClose}>Close</Button>
                <Button className="flex-1" onClick={() => setPhase('form')}>Try Again</Button>
              </div>
            </div>
          )}

          {phase === 'success' && paidBill && (
            <div className="space-y-5">
              {/* Success banner */}
              <div className="flex flex-col items-center gap-3 rounded-2xl bg-gradient-to-b from-green-50 to-emerald-50 px-6 py-8 text-center dark:from-green-950 dark:to-emerald-950">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <CheckCircle className="h-9 w-9 text-green-600" />
                </div>
                <div>
                  <div className="text-xl font-bold text-green-800 dark:text-green-200">Payment Confirmed!</div>
                  <div className="mt-1 text-sm text-green-700 dark:text-green-300">
                    Invoice {bill.bill_number} has been paid successfully.
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                  ৳{amountBdt.toLocaleString('en-BD', { minimumFractionDigits: 2 })}
                </div>
              </div>

              {/* Summary */}
              <div className="divide-y divide-border rounded-xl border border-border text-sm">
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-muted-foreground">Invoice</span>
                  <span className="font-medium">{bill.bill_number}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-muted-foreground">Patient</span>
                  <span className="font-medium">{bill.patient_name}</span>
                </div>
                <div className="px-4 py-3">
                  <div className="text-xs text-muted-foreground">Transaction ID</div>
                  <div className="mt-0.5 break-all font-mono text-xs">{piId}</div>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-muted-foreground">USD charged</span>
                  <span className="font-medium">${(amountUsdCents / 100).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={onClose}>Close</Button>
                <Button className="flex-1 gap-2" onClick={handleDownload}>
                  <Download className="h-4 w-4" /> Download Receipt
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
