'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, ShieldCheck, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authAPI } from '@/lib/api';

export default function TwoFactorPage() {
  const [setup, setSetup] = useState<{ secret: string; qr_code_url: string; backup_codes: string[] } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    authAPI.setup2FA().then((res) => setSetup(res.data));
  }, []);

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (!setup) {
    return (
      <div className="flex justify-center py-12">
        <div className="flex items-center gap-2 text-muted-foreground">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 opacity-0 animate-fade-up">
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="space-y-2">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">Enable 2FA</h2>
        <p className="text-sm text-muted-foreground">
          Scan the QR code with Google Authenticator, Authy, or any TOTP app.
        </p>
      </div>

      {/* QR Code placeholder */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Smartphone className="h-4 w-4 text-primary" />
          Step 1: Scan with your authenticator app
        </div>
        <div className="flex justify-center">
          <div className="grid grid-cols-8 grid-rows-8 gap-0.5 p-4 bg-white rounded-lg">
            {Array.from({ length: 64 }).map((_, i) => (
              <div
                key={i}
                className={`h-5 w-5 ${Math.random() > 0.5 ? 'bg-foreground' : 'bg-white'}`}
              />
            ))}
          </div>
        </div>
        <div className="text-center text-xs text-muted-foreground">
          Or enter this secret key manually:
        </div>
        <div className="flex items-center gap-2 rounded-md border border-dashed bg-secondary/50 px-3 py-2">
          <code className="flex-1 font-mono text-sm text-foreground">{setup.secret}</code>
          <button
            onClick={() => copy(setup.secret)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
        {copied && <div className="text-xs text-healthy">Copied!</div>}
      </div>

      {/* Backup codes */}
      <div className="rounded-xl border bg-card p-6 space-y-3">
        <div className="text-sm font-medium">Step 2: Save your backup codes</div>
        <p className="text-xs text-muted-foreground">
          Keep these codes safe. You can use them to access your account if you lose your device.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {setup.backup_codes.map((code) => (
            <code key={code} className="rounded border bg-secondary/50 px-2 py-1.5 text-center font-mono text-sm">
              {code}
            </code>
          ))}
        </div>
      </div>

      <Button asChild className="w-full" size="lg">
        <Link href="/login">Done — back to login</Link>
      </Button>
    </div>
  );
}
