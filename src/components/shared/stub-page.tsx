'use client';

import { PageHeader } from '@/components/shared';
import { Card } from '@/components/ui/card';
import { Construction } from 'lucide-react';

interface StubPageProps {
  title: string;
  description?: string;
  module?: string;
}

export function StubPage({ title, description, module }: StubPageProps) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <Card className="flex flex-col items-center justify-center p-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
          <Construction className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold">Module coming next</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          This page is scaffolded and ready to be built. The types, mock data, and mock API for{' '}
          <span className="font-medium text-foreground">{module ?? title}</span> are already in place.
        </p>
        <div className="mt-6 flex items-center gap-2 rounded-md border border-dashed border-border bg-secondary/40 px-4 py-2 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-accent" />
          Ask Claude to build this module next
        </div>
      </Card>
    </div>
  );
}
