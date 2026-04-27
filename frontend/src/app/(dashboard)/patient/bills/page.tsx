'use client';

import { CreditCard, Download, Eye } from 'lucide-react';
import { PageHeader, SectionCard, KPICard } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { downloadDocument, viewDocument } from '@/lib/document-utils';
import { MOCK_BILLS } from '@/lib/mock-data';
import { formatBDT, formatDate } from '@/lib/utils';
import type { Bill } from '@/types';

const patientId = 'patient-001';

export default function PatientBillsPage() {
  const bills = MOCK_BILLS.filter((bill) => bill.patient_id === patientId);
  const due = bills.reduce((sum, bill) => sum + bill.amount_outstanding_bdt, 0);

  function formatLineItems(bill: Bill): string {
    if (bill.line_items.length === 0) {
      return 'No invoice line items.';
    }

    return bill.line_items
      .map((item, index) => (
        `${index + 1}. ${item.description} - ${item.quantity} x ${formatBDT(item.unit_price_bdt)} = ${formatBDT(item.total_bdt)}`
      ))
      .join('\n');
  }

  function viewBillDocument(bill: Bill) {
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

  function downloadBillDocument(bill: Bill) {
    downloadDocument({
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
      <PageHeader title="Bills & Payments" description="Invoices, payment status, and outstanding balance." />

      <div className="grid gap-4 sm:grid-cols-3">
        <KPICard label="Bills" value={bills.length} icon={CreditCard} />
        <KPICard label="Outstanding" value={formatBDT(due)} icon={CreditCard} accentColor={due > 0 ? 'critical' : 'healthy'} />
        <KPICard label="Paid" value={formatBDT(bills.reduce((sum, bill) => sum + bill.amount_paid_bdt, 0))} icon={CreditCard} accentColor="healthy" />
      </div>

      <SectionCard title="Invoice History" description="SRS Module 10">
        <div className="divide-y divide-border">
          {bills.length === 0 ? (
            <div className="px-5 py-8 text-sm text-muted-foreground">No bills are linked to this demo patient yet.</div>
          ) : bills.map((bill) => (
            <div key={bill.id} className="px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <code className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">{bill.bill_number}</code>
                  <div className="mt-1 text-sm text-muted-foreground">{formatDate(bill.bill_date)}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatBDT(bill.total_amount_bdt)}</div>
                  <div className="text-xs text-critical">Due {formatBDT(bill.amount_outstanding_bdt)}</div>
                </div>
                <Badge variant={bill.status === 'paid' ? 'healthy' : bill.status === 'partial' ? 'warning' : 'secondary'}>{bill.status}</Badge>
                <Button type="button" size="sm" variant="outline" onClick={() => viewBillDocument(bill)}>
                  <Eye className="h-4 w-4" /> View
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => downloadBillDocument(bill)}>
                  <Download className="h-4 w-4" /> Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
