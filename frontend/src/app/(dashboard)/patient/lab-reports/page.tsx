'use client';

import { Download, Eye, FlaskConical } from 'lucide-react';
import { PageHeader, SectionCard, KPICard } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { downloadDocument, viewDocument } from '@/lib/document-utils';
import { MOCK_LAB_TESTS } from '@/lib/mock-data';
import { formatDateTime } from '@/lib/utils';
import type { LabTest } from '@/types';

const patientId = 'patient-001';

export default function PatientLabReportsPage() {
  const reports = MOCK_LAB_TESTS.filter((test) => test.patient_id === patientId);

  function toResultLines(report: LabTest): string {
    if (!report.results || report.results.length === 0) {
      return 'No test parameters entered.';
    }

    return report.results
      .map((result, index) => (
        `${index + 1}. ${result.parameter_name}: ${result.value} ${result.unit} (${result.flag})`
      ))
      .join('\n');
  }

  function viewReportDocument(report: LabTest) {
    viewDocument({
      title: `Lab Report ${report.test_number}`,
      fileName: `lab-report-${report.test_number}`,
      fields: [
        { label: 'Report Number', value: report.test_number },
        { label: 'Patient', value: `${report.patient_name} (${report.patient_mrn})` },
        { label: 'Test Name', value: report.test_name },
        { label: 'Doctor', value: report.ordered_by_doctor_name },
        { label: 'Ordered At', value: formatDateTime(report.ordered_at) },
        { label: 'Status', value: report.status.replace(/_/g, ' ') },
        { label: 'Overall Flag', value: report.overall_flag },
        { label: 'Results', value: toResultLines(report) },
      ],
    });
  }

  function downloadReportDocument(report: LabTest) {
    downloadDocument({
      title: `Lab Report ${report.test_number}`,
      fileName: `lab-report-${report.test_number}`,
      fields: [
        { label: 'Report Number', value: report.test_number },
        { label: 'Patient', value: `${report.patient_name} (${report.patient_mrn})` },
        { label: 'Test Name', value: report.test_name },
        { label: 'Doctor', value: report.ordered_by_doctor_name },
        { label: 'Ordered At', value: formatDateTime(report.ordered_at) },
        { label: 'Status', value: report.status.replace(/_/g, ' ') },
        { label: 'Overall Flag', value: report.overall_flag },
        { label: 'Results', value: toResultLines(report) },
      ],
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Lab Reports" description="Investigation status, reported results, and critical flags." />

      <div className="grid gap-4 sm:grid-cols-3">
        <KPICard label="Reports" value={reports.length} icon={FlaskConical} />
        <KPICard label="Reported" value={reports.filter((report) => report.status === 'reported').length} icon={FlaskConical} accentColor="healthy" />
        <KPICard label="Critical" value={reports.filter((report) => report.overall_flag === 'critical').length} icon={FlaskConical} accentColor="critical" />
      </div>

      <SectionCard title="My Test Reports" description="SRS Module 5">
        <div className="divide-y divide-border">
          {reports.map((report) => (
            <div key={report.id} className="px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{report.test_name}</div>
                  <div className="text-sm text-muted-foreground">Ordered by {report.ordered_by_doctor_name}</div>
                  <div className="text-xs text-muted-foreground">{formatDateTime(report.ordered_at)}</div>
                </div>
                <div className="flex gap-2">
                  <Badge variant={report.overall_flag === 'critical' ? 'critical' : report.overall_flag === 'borderline' ? 'borderline' : 'healthy'}>
                    {report.overall_flag}
                  </Badge>
                  <Badge variant={report.status === 'reported' ? 'healthy' : 'accent'} className="capitalize">{report.status.replace(/_/g, ' ')}</Badge>
                  <Button type="button" size="sm" variant="outline" onClick={() => viewReportDocument(report)}>
                    <Eye className="h-4 w-4" /> View
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => downloadReportDocument(report)}>
                    <Download className="h-4 w-4" /> Download
                  </Button>
                </div>
              </div>
              {report.results && (
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {report.results.map((result) => (
                    <div key={result.parameter_id} className="rounded-lg bg-secondary/30 px-3 py-2 text-sm">
                      <div className="font-medium">{result.parameter_name}</div>
                      <div className="text-xs text-muted-foreground">{result.value} {result.unit} ({result.flag})</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
