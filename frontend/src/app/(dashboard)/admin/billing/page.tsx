'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Download, FileText, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { PageHeader, SectionCard, EmptyState, KPICard } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StripePayModal } from '@/components/stripe/pay-modal';
import { billingAPI } from '@/lib/mock-api';
import { downloadReceipt } from '@/lib/receipt-utils';
import { formatBDT, formatDate } from '@/lib/utils';
import type { Bill, BillStatus } from '@/types';

export default function BillingPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | BillStatus>('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [payingBill, setPayingBill] = useState<Bill | null>(null);

  useEffect(() => {
    billingAPI.list().then((r) => setBills(r.data));
  }, []);

  function handlePaid(updatedBill: Bill) {
    setBills(prev => prev.map(b => b.id === updatedBill.id ? updatedBill : b));
  }

  const filtered = bills.filter((b) => {
    const q = search.toLowerCase();
    const matchQuery =
      !q ||
      b.patient_name.toLowerCase().includes(q) ||
      b.patient_mrn.toLowerCase().includes(q) ||
      b.bill_number.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchQuery && matchStatus;
  });

  const totalRevenue = bills.reduce((s, b) => s + b.amount_paid_bdt, 0);
  const totalOutstanding = bills.reduce((s, b) => s + b.amount_outstanding_bdt, 0);
  const paidCount = bills.filter((b) => b.status === 'paid').length;
  const pendingCount = bills.filter((b) => b.status === 'pending' || b.status === 'partial').length;

  const statuses: Array<{ value: 'all' | BillStatus; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'partial', label: 'Partial' },
    { value: 'paid', label: 'Paid' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing & Finance"
        description="Invoice management and Stripe payment collection"
        actions={
          <Button variant="outline" size="sm" onClick={() => {
            const paid = bills.filter(b => b.status === 'paid');
            if (paid.length > 0) downloadReceipt(paid[0]);
          }}>
            Export Latest Receipt
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="Total Collected" value={formatBDT(totalRevenue)} icon={CreditCard} accentColor="healthy" />
        <KPICard label="Outstanding" value={formatBDT(totalOutstanding)} icon={FileText} accentColor="critical" />
        <KPICard label="Paid Invoices" value={paidCount} icon={CreditCard} accentColor="accent" />
        <KPICard label="Pending / Partial" value={pendingCount} icon={FileText} accentColor="borderline" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Input
            leftIcon={<Search className="h-4 w-4" />}
            placeholder="Search by patient, MRN, or invoice#..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button
            key={s.value}
            onClick={() => setStatusFilter(s.value)}
            className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === s.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background hover:bg-secondary'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <SectionCard title="Invoices" description={`Showing ${filtered.length} of ${bills.length}`}>
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={FileText} title="No invoices found" description="Try adjusting your search or filter." />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((bill) => (
              <div key={bill.id}>
                <div
                  className="flex cursor-pointer items-center gap-3 px-5 py-4 hover:bg-secondary/30"
                  onClick={() => setExpandedId(expandedId === bill.id ? null : bill.id)}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <code className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary">
                        {bill.bill_number}
                      </code>
                      <span className="font-medium">{bill.patient_name}</span>
                      <span className="font-mono text-xs text-muted-foreground">{bill.patient_mrn}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span>{formatDate(bill.bill_date)}</span>
                      <span>{bill.line_items.length} line item{bill.line_items.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  <div className="hidden text-right sm:block">
                    <div className="font-semibold tabular-nums">{formatBDT(bill.total_amount_bdt)}</div>
                    {bill.amount_outstanding_bdt > 0 && (
                      <div className="text-xs text-critical">
                        Due: {formatBDT(bill.amount_outstanding_bdt)}
                      </div>
                    )}
                  </div>

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
                    className="shrink-0"
                  >
                    {bill.status}
                  </Badge>

                  {expandedId === bill.id ? (
                    <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                </div>

                {expandedId === bill.id && (
                  <div className="border-t border-border bg-secondary/10 px-5 py-4">
                    <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Line Items
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-muted-foreground">
                          <th className="pb-2 font-medium">Description</th>
                          <th className="pb-2 font-medium text-right">Qty</th>
                          <th className="pb-2 font-medium text-right">Unit</th>
                          <th className="pb-2 font-medium text-right">Discount</th>
                          <th className="pb-2 font-medium text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {bill.line_items.map((item) => (
                          <tr key={item.id}>
                            <td className="py-2">
                              <div className="font-medium">{item.description}</div>
                              <Badge variant="outline" className="mt-0.5 text-[10px] capitalize">
                                {item.category.replace('_', ' ')}
                              </Badge>
                            </td>
                            <td className="py-2 text-right tabular-nums">{item.quantity}</td>
                            <td className="py-2 text-right tabular-nums">{formatBDT(item.unit_price_bdt)}</td>
                            <td className="py-2 text-right tabular-nums text-critical">
                              {item.discount_bdt > 0 ? `−${formatBDT(item.discount_bdt)}` : '—'}
                            </td>
                            <td className="py-2 text-right font-medium tabular-nums">{formatBDT(item.total_bdt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="mt-4 flex flex-col items-end gap-1 border-t border-border pt-4 text-sm">
                      <div className="flex gap-8">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="tabular-nums">{formatBDT(bill.subtotal_bdt)}</span>
                      </div>
                      {bill.total_discount_bdt > 0 && (
                        <div className="flex gap-8">
                          <span className="text-muted-foreground">Discount</span>
                          <span className="tabular-nums text-critical">−{formatBDT(bill.total_discount_bdt)}</span>
                        </div>
                      )}
                      <div className="flex gap-8 text-base font-semibold">
                        <span>Total</span>
                        <span className="tabular-nums">{formatBDT(bill.total_amount_bdt)}</span>
                      </div>
                      <div className="flex gap-8 text-healthy">
                        <span>Paid</span>
                        <span className="tabular-nums">{formatBDT(bill.amount_paid_bdt)}</span>
                      </div>
                      {bill.amount_outstanding_bdt > 0 && (
                        <div className="flex gap-8 font-semibold text-critical">
                          <span>Outstanding</span>
                          <span className="tabular-nums">{formatBDT(bill.amount_outstanding_bdt)}</span>
                        </div>
                      )}
                    </div>

                    {bill.discount_reason && (
                      <div className="mt-3 rounded-md bg-borderline/10 px-3 py-2 text-xs text-muted-foreground">
                        Discount note: {bill.discount_reason}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="mt-4 flex flex-wrap gap-3 border-t border-border pt-4">
                      {(bill.status === 'pending' || bill.status === 'partial') && (
                        <Button
                          size="sm"
                          className="gap-2"
                          onClick={(e) => { e.stopPropagation(); setPayingBill(bill); }}
                        >
                          <CreditCard className="h-4 w-4" />
                          Pay via Stripe
                        </Button>
                      )}
                      {(bill.status === 'paid' || bill.status === 'partial') && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={(e) => { e.stopPropagation(); downloadReceipt(bill); }}
                        >
                          <Download className="h-4 w-4" />
                          Download Receipt
                        </Button>
                      )}
                    </div>
                  </div>
                )}
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
