import type { ReactNode } from 'react';
import { Activity, ShieldCheck, Zap } from 'lucide-react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[1fr_1.1fr]">
      {/* Left: brand panel (hidden on mobile) */}
      <aside className="relative hidden lg:flex bg-auth-gradient overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-[32rem] w-[32rem] rounded-full bg-primary/40 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20">
              <Activity className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight">HMS</div>
              <div className="text-xs text-white/70 -mt-0.5">Hospital Management</div>
            </div>
          </div>

          {/* Middle content */}
          <div className="max-w-md space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur ring-1 ring-white/15">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Bangladesh Healthcare Platform
              </div>
              <h1 className="mt-5 text-4xl font-bold tracking-tight leading-tight">
                The complete platform for modern hospitals.
              </h1>
              <p className="mt-4 text-white/75 leading-relaxed">
                Patient records, appointments, prescriptions, lab results, pharmacy,
                billing, and real-time alerts — all in one secure, multi-tenant system.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="space-y-4">
              {[
                { icon: Zap, title: 'HAS Alert Engine', desc: 'Real-time critical alerts via SMS, email & WhatsApp' },
                { icon: ShieldCheck, title: 'HIPAA-Ready Security', desc: 'AES-256 encryption, RBAC, full audit trail' },
                { icon: Activity, title: '13 Integrated Modules', desc: 'From SOS emergency to analytics dashboards' },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-3 opacity-0 animate-fade-up" style={{ animationDelay: `${150 + i * 100}ms` }}>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
                    <f.icon className="h-4 w-4 text-accent" strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{f.title}</div>
                    <div className="text-xs text-white/60 mt-0.5">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-white/60">
            <div>© 2026 HMS Platform</div>
            <div className="flex items-center gap-4">
              <span>v1.0</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Right: form panel */}
      <main className="relative flex min-h-screen items-center justify-center bg-medical-pattern p-6 sm:p-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
