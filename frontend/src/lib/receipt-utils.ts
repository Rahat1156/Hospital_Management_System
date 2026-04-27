import { jsPDF } from 'jspdf';
import type { Appointment, Bill } from '@/types';

function formatBDT(amount: number): string {
  return `BDT ${amount.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-BD', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

export function downloadReceipt(bill: Bill, paymentIntentId?: string): void {
  if (typeof window === 'undefined') return;

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const now = new Date().toLocaleString('en-BD', { hour12: true });

  let y = 0;

  // ── Header bar ──────────────────────────────────────────
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, W, 72, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('HMS Hospital', 40, 32);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Payment Receipt', 40, 50);
  doc.text(`Generated: ${now}`, 40, 62);

  // PAID stamp
  if (bill.status === 'paid') {
    doc.setTextColor(74, 222, 128);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.text('✓ PAID', W - 40, 44, { align: 'right' });
  }

  y = 96;

  // ── Invoice meta ─────────────────────────────────────────
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Invoice Details', 40, y);
  y += 16;

  const meta: [string, string][] = [
    ['Invoice Number', bill.bill_number],
    ['Bill Date', formatDate(bill.bill_date)],
    ['Patient Name', bill.patient_name],
    ['Patient MRN', bill.patient_mrn],
    ['Patient Phone', bill.patient_phone || '—'],
    ['Status', bill.status.toUpperCase()],
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);

  meta.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label + ':', 40, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 200, y);
    y += 14;
  });

  y += 10;

  // ── Divider ──────────────────────────────────────────────
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(40, y, W - 40, y);
  y += 16;

  // ── Line items table ──────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Line Items', 40, y);
  y += 14;

  // Table header
  doc.setFillColor(241, 245, 249);
  doc.rect(40, y, W - 80, 18, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('DESCRIPTION', 48, y + 12);
  doc.text('QTY', W - 220, y + 12, { align: 'right' });
  doc.text('UNIT PRICE', W - 160, y + 12, { align: 'right' });
  doc.text('DISCOUNT', W - 90, y + 12, { align: 'right' });
  doc.text('TOTAL', W - 44, y + 12, { align: 'right' });
  y += 20;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(17, 24, 39);

  bill.line_items.forEach((item, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(249, 250, 251);
      doc.rect(40, y - 3, W - 80, 18, 'F');
    }
    const desc = doc.splitTextToSize(item.description, 220);
    doc.text(desc, 48, y + 8);
    doc.text(String(item.quantity), W - 220, y + 8, { align: 'right' });
    doc.text(formatBDT(item.unit_price_bdt), W - 160, y + 8, { align: 'right' });
    doc.text(item.discount_bdt > 0 ? `−${formatBDT(item.discount_bdt)}` : '—', W - 90, y + 8, { align: 'right' });
    doc.text(formatBDT(item.total_bdt), W - 44, y + 8, { align: 'right' });
    y += 18;
  });

  y += 8;
  doc.setDrawColor(226, 232, 240);
  doc.line(40, y, W - 40, y);
  y += 14;

  // ── Totals block ──────────────────────────────────────────
  const totals: [string, string, boolean, string?][] = [
    ['Subtotal', formatBDT(bill.subtotal_bdt), false],
    ...(bill.total_discount_bdt > 0
      ? [['Discount', `−${formatBDT(bill.total_discount_bdt)}`, false, '#ef4444'] as [string, string, boolean, string]]
      : []),
    ['Total Amount', formatBDT(bill.total_amount_bdt), true],
    ['Amount Paid', formatBDT(bill.amount_paid_bdt), false, '#16a34a'],
    ...(bill.amount_outstanding_bdt > 0
      ? [['Outstanding', formatBDT(bill.amount_outstanding_bdt), false, '#dc2626'] as [string, string, boolean, string]]
      : []),
  ];

  totals.forEach(([label, value, bold, color]) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(bold ? 11 : 10);
    const [r, g, b] = color
      ? color === '#16a34a' ? [22, 163, 74] : color === '#dc2626' ? [220, 38, 38] : [239, 68, 68]
      : [15, 23, 42];
    doc.setTextColor(r, g, b);
    doc.text(label, W - 200, y);
    doc.text(value, W - 44, y, { align: 'right' });
    y += bold ? 18 : 14;
  });

  y += 12;

  // ── Payment info ──────────────────────────────────────────
  if (paymentIntentId || (bill.payments && bill.payments.length > 0)) {
    const lastPayment = bill.payments?.[bill.payments.length - 1];
    const txnId = paymentIntentId || lastPayment?.transaction_id || '—';

    doc.setDrawColor(226, 232, 240);
    doc.line(40, y, W - 40, y);
    y += 14;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('Payment Information', 40, y);
    y += 14;

    const payInfo: [string, string][] = [
      ['Method', 'Stripe Card (Sandbox)'],
      ['Transaction ID', txnId],
      ['Currency', 'USD (BDT equivalent)'],
      ['Paid At', lastPayment?.paid_at ? formatDate(lastPayment.paid_at) : formatDate(new Date().toISOString())],
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    payInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label + ':', 40, y);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 200, y);
      y += 13;
    });
  }

  // ── Footer ────────────────────────────────────────────────
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFillColor(241, 245, 249);
  doc.rect(0, pageH - 36, W, 36, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('This is a computer-generated receipt and does not require a signature.', W / 2, pageH - 18, { align: 'center' });
  doc.text('HMS Hospital Management System — Powered by Stripe', W / 2, pageH - 8, { align: 'center' });

  doc.save(`receipt-${bill.bill_number}.pdf`);
}

export interface AppointmentReceiptData {
  appointment: Appointment;
  paymentIntentId: string;
  feeBdt: number;
  amountUsdCents: number;
  paidAt: string;
}

export function downloadAppointmentReceipt(data: AppointmentReceiptData): void {
  if (typeof window === 'undefined') return;
  const { appointment: a, paymentIntentId, feeBdt, amountUsdCents, paidAt } = data;

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const now = new Date().toLocaleString('en-BD', { hour12: true });

  let y = 0;

  // ── Header bar ──────────────────────────────────────────
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, W, 72, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('HMS Hospital', 40, 32);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Appointment Payment Receipt', 40, 50);
  doc.text(`Generated: ${now}`, 40, 62);

  // PAID stamp
  doc.setTextColor(74, 222, 128);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text('✓ PAID', W - 40, 44, { align: 'right' });

  y = 96;

  // ── Appointment details ───────────────────────────────────
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Appointment Details', 40, y);
  y += 16;

  const rows: [string, string][] = [
    ['Appointment No.', a.appointment_number],
    ['Patient Name', a.patient_name],
    ['Patient MRN', a.patient_mrn],
    ['Doctor', a.doctor_name],
    ['Specialty', a.doctor_specialty || '—'],
    ['Type', a.appointment_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())],
    ['Date & Time', new Date(a.scheduled_at).toLocaleString('en-BD', { dateStyle: 'long', timeStyle: 'short', hour12: true })],
    ['Reason', a.reason || '—'],
    ['Status', a.status.replace(/_/g, ' ').toUpperCase()],
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  rows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label + ':', 40, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 210, y);
    y += 14;
  });

  y += 10;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(40, y, W - 40, y);
  y += 16;

  // ── Fee summary ───────────────────────────────────────────
  doc.setFillColor(241, 245, 249);
  doc.rect(40, y, W - 80, 58, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Consultation Fee', 56, y + 18);
  doc.setFontSize(20);
  doc.setTextColor(22, 163, 74);
  doc.text(formatBDT(feeBdt), W - 56, y + 18, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Charged in USD: $${(amountUsdCents / 100).toFixed(2)} (1 USD ≈ 110 BDT)`, 56, y + 38);
  doc.text('PAID IN FULL', W - 56, y + 38, { align: 'right' });
  y += 74;

  // ── Payment info ──────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Payment Information', 40, y);
  y += 14;

  const payRows: [string, string][] = [
    ['Method', 'Online — Stripe Card (Sandbox)'],
    ['Transaction ID', paymentIntentId],
    ['Currency', 'USD (BDT equivalent)'],
    ['Paid At', new Date(paidAt).toLocaleString('en-BD', { dateStyle: 'long', timeStyle: 'short', hour12: true })],
  ];

  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  payRows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label + ':', 40, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 210, y);
    y += 13;
  });

  // ── Footer ─────────────────────────────────────────────────
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFillColor(241, 245, 249);
  doc.rect(0, pageH - 36, W, 36, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('This is a computer-generated receipt and does not require a signature.', W / 2, pageH - 18, { align: 'center' });
  doc.text('HMS Hospital Management System — Powered by Stripe', W / 2, pageH - 8, { align: 'center' });

  doc.save(`appointment-receipt-${a.appointment_number}.pdf`);
}
