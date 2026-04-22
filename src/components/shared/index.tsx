import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

/* ============================================================================
   KPICard — Stat tile with trend indicator
   ============================================================================ */
interface KPICardProps {
  label: string;
  value: string | number;
  deltaPercent?: number;
  icon?: LucideIcon;
  accentColor?: 'primary' | 'accent' | 'critical' | 'healthy' | 'borderline';
  helper?: string;
}

export function KPICard({
  label, value, deltaPercent, icon: Icon, accentColor = 'primary', helper,
}: KPICardProps) {
  const isPositive = (deltaPercent ?? 0) >= 0;
  const accentClasses = {
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent',
    critical: 'bg-critical/10 text-critical',
    healthy: 'bg-healthy/10 text-healthy',
    borderline: 'bg-borderline/10 text-borderline',
  };

  return (
    <Card className="relative overflow-hidden p-5 transition-all hover:shadow-elevated">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </div>
          <div className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</div>
          {deltaPercent !== undefined && (
            <div
              className={cn(
                'mt-2 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium',
                isPositive
                  ? 'bg-healthy/10 text-healthy'
                  : 'bg-destructive/10 text-destructive',
              )}
            >
              {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(deltaPercent).toFixed(1)}%
              <span className="text-muted-foreground font-normal">vs last period</span>
            </div>
          )}
          {helper && <div className="mt-2 text-xs text-muted-foreground">{helper}</div>}
        </div>
        {Icon && (
          <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', accentClasses[accentColor])}>
            <Icon className="h-5 w-5" strokeWidth={2.25} />
          </div>
        )}
      </div>
    </Card>
  );
}

/* ============================================================================
   PageHeader — Section title with optional actions
   ============================================================================ */
interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ============================================================================
   EmptyState
   ============================================================================ */
interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/20 px-6 py-12 text-center">
      {Icon && (
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      <div className="font-semibold text-foreground">{title}</div>
      {description && <div className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ============================================================================
   SectionCard — titled container
   ============================================================================ */
interface SectionCardProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function SectionCard({ title, description, action, children, className }: SectionCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="font-semibold text-foreground">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      <div>{children}</div>
    </Card>
  );
}
