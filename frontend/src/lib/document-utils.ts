import { jsPDF } from 'jspdf';

export interface DocumentField {
  label: string;
  value: string;
}

export interface DocumentPayload {
  title: string;
  fileName?: string;
  fields: DocumentField[];
}

function normalizeFileName(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || 'document';
}

function ensurePageSpace(doc: jsPDF, y: number, neededHeight: number): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginBottom = 40;
  if (y + neededHeight <= pageHeight - marginBottom) {
    return y;
  }

  doc.addPage();
  return 44;
}

function buildDocumentPdf(payload: DocumentPayload): jsPDF {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - 80;
  const generatedAt = new Date().toLocaleString('en-BD', { hour12: true });

  let y = 46;

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(payload.title, 40, y);

  y += 18;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated at ${generatedAt}`, 40, y);

  y += 14;
  doc.setDrawColor(226, 232, 240);
  doc.line(40, y, pageWidth - 40, y);
  y += 16;

  payload.fields.forEach((field) => {
    const value = field.value?.trim() ? field.value : '-';
    const valueLines = doc.splitTextToSize(value, contentWidth);
    const blockHeight = 14 + valueLines.length * 14 + 12;

    y = ensurePageSpace(doc, y, blockHeight);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(field.label.toUpperCase(), 40, y);

    y += 13;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(17, 24, 39);
    doc.text(valueLines, 40, y);

    y += valueLines.length * 14 + 6;
    doc.setDrawColor(241, 245, 249);
    doc.line(40, y, pageWidth - 40, y);
    y += 12;
  });

  return doc;
}

export function viewDocument(payload: DocumentPayload): void {
  if (typeof window === 'undefined') return;
  const doc = buildDocumentPdf(payload);
  const previewUrl = doc.output('bloburl');
  window.open(previewUrl, '_blank', 'noopener,noreferrer');
}

export function downloadDocument(payload: DocumentPayload): void {
  if (typeof window === 'undefined') return;
  const name = normalizeFileName(payload.fileName || payload.title);
  const doc = buildDocumentPdf(payload);
  doc.save(`${name}.pdf`);
}
