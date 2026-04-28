'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Download, Eye } from 'lucide-react';
import { PageHeader, SectionCard, KPICard, EmptyState } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StripePayModal } from '@/components/stripe/pay-modal';
import { billingAPI } from '@/lib/mock-api';
import { downloadReceipt } from '@/lib/receipt-utils';
import { downloadDocument, viewDocument } from '@/lib/document-utils';
import { useAuthStore } from '@/lib/auth-store';
import { formatBDT, formatDate } from '@/lib/utils';
import type { Bill } from '@/types';

function formatLineItems(bill: Bill): string {
  if (bill.line_items.length === 0) return 'No line items.';
  return bill.line_items
    .map((item, i) => `${i + 1}. ${item.description} — ${item.quantity} × ${formatBDT(item.unit_price_bdt)} = ${formatBDT(item.total_bdt)}`)
    .join('\n');
}

export default function PatientBillsPage() {
  const { user } = useAuthStore();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingBill, setPayingBill] = useState<Bill | null>(null);

  useEffect(() => {
    const patientId = user?.id ?? '';
    billingAPI
      .list({ patient_id: patientId })
      .then((r) => setBills(r.data))
      .catch(() => setBills([]))
      .finally(() => setLoading(false));
  }, [user?.id]);

  function handlePaid(updated: Bill) {
    setBills(prev => prev.map(b => b.id === updated.id ? updated : b));
  }

  const due = bills.reduce((sum, b) => sum + b.amount_outstanding_bdt, 0);
  const totalPaid = bills.reduce((sum, b) => sum + b.amount_paid_bdt, 0);

  function handleView(bill: Bill) {
    viewDocument({
      title: `Invoice ${bill.bill_number}`,
      fileName: `invoice-${bill.bill_number}`,
      fields: [
        { label: 'Invoice Number', value: bill.bill_number },
        { label: 'Patient', value: `${bill.patient_name} (${bill.patient_mrn})` },
        { label: 'Bill Date', value: formatDate(bill.bill_date) },
        { label: 'Status', value: bill.status },
        { label: 'Total Amount', value: formatBDT(bill.total_amount_bdt) },
        { label: 'Paid Amount', value: formatBDT(bill.amount_paid_bdt) },
        { label: 'Outstanding', value: formatBDT(bill.amount_outstanding_bdt) },
        { label: 'Line Items', value: formatLineItems(bill) },
      ],
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Bills & Payments" description="Invoices, payment history, and Stripe checkout." />

      <div className="grid gap-4 sm:grid-cols-3">
        <KPICard label="Total Bills" value={bills.length} icon={CreditCard} />
        <KPICard label="Outstanding" value={formatBDT(due)} icon={CreditCard} accentColor={due > 0 ? 'critical' : 'healthy'} />
        <KPICard label="Paid" value={formatBDT(totalPaid)} icon={CreditCard} accentColor="healthy" />
      </div>

      <SectionCard title="Invoice History">
        {loading ? (
          <div className="px-5 py-8 text-sm text-muted-foreground">Loading bills…</div>
        ) : bills.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={CreditCard} title="No bills found" description="No invoices are linked to your account yet." />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {bills.map((bill) => (
              <div key={bill.id} className="px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  {/* Left — invoice info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <code className="rounded bg-primary/10 px-2 py-0.5 text-xs font-mono text-primary">
                        {bill.bill_number}
                      </code>
                      <Badge
                        variant={
                          bill.status === 'paid'
                            ? 'healthy'
                            : bill.status === 'partial'
                            ? 'warning'
                            : bill.status === 'cancelled'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {bill.status}
                      </Badge>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{formatDate(bill.bill_date)}</div>
                    <div className="mt-2 text-sm">
                      <span className="font-semibold">{formatBDT(bill.total_amount_bdt)}</span>
                      {bill.amount_outstanding_bdt > 0 && (
                        <span className="ml-3 text-xs text-critical font-medium">
                          Due: {formatBDT(bill.amount_outstanding_bdt)}
                        </span>
                      )}
                    </div>

                    {/* Line items summary */}
                    {bill.line_items.length > 0 && (
                      <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                        {bill.line_items.slice(0, 3).map((item) => (
                          <li key={item.id}>
                            {item.description} — {formatBDT(item.total_bdt)}
                          </li>
                        ))}
                        {bill.line_items.length > 3 && (
                          <li>+{bill.line_items.length - 3} more item{bill.line_items.length - 3 !== 1 ? 's' : ''}</li>
                        )}
                      </ul>
                    )}
                  </div>

                  {/* Right — actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => handleView(bill)}>
                      <Eye className="h-4 w-4" /> View
                    </Button>

                    {(bill.status === 'paid' || bill.status === 'partial') && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => downloadReceipt(bill)}
                      >
                        <Download className="h-4 w-4" /> Receipt
                      </Button>
                    )}

                    {(bill.status === 'pending' || bill.status === 'partial') && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setPayingBill(bill)}
                      >
                        <CreditCard className="h-4 w-4" /> Pay Now
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {payingBill && (
        <StripePayModal
          bill={payingBill}
          onClose={() => setPayingBill(null)}
          onPaid={(updated) => { handlePaid(updated); setPayingBill(null); }}
        />
      )}
    </div>
  );
}
