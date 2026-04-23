'use client';

import { Suspense, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authAPI } from '@/lib/mock-api';
import { cn } from '@/lib/utils';

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading verification form...</div>}>
      <VerifyOtpForm />
    </Suspense>
  );
}

function VerifyOtpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const phone = params.get('phone') || '';
  const purpose = (params.get('purpose') || 'registration') as 'registration' | 'password_reset' | 'two_factor' | 'phone_verification';

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mrn, setMrn] = useState('');
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
    const timer = setInterval(() => setCountdown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const code = digits.join('');
    if (code.length !== 6) {
      setError('Please enter the full 6-digit code');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.verifyOtp({ identifier: phone, otp_code: code, purpose });
      if (res.data.mrn) {
        setMrn(res.data.mrn);
        setTimeout(() => router.push('/login'), 3500);
      } else {
        router.push('/login');
      }
    } catch (err) {
      setError((err as { message?: string })?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setCountdown(60);
    setError('');
    // In production: call resend OTP endpoint
  }

  if (mrn) {
    return (
      <div className="space-y-6 text-center opacity-0 animate-fade-up">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-healthy/10">
          <ShieldCheck className="h-8 w-8 text-healthy" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Registration complete!</h2>
          <p className="text-sm text-muted-foreground">Your Medical Record Number has been issued.</p>
        </div>
        <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-6">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Your MRN</div>
          <div className="mt-1 font-mono text-3xl font-bold text-primary">{mrn}</div>
          <div className="mt-2 text-xs text-muted-foreground">
            Save this number. You&apos;ll need it for all future visits.
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Redirecting to login…</p>
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
        <h2 className="text-3xl font-bold tracking-tight">Verify your phone</h2>
        <p className="text-sm text-muted-foreground">
          We&apos;ve sent a 6-digit code to <span className="font-medium text-foreground">{phone || 'your phone'}</span>
        </p>
        <p className="text-xs text-accent font-medium">For demo, use code: 123456</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-2 justify-between" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={cn(
                'h-14 w-12 rounded-md border border-input bg-background text-center text-xl font-bold font-mono shadow-sm',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary',
                'transition-all',
                d && 'border-primary bg-primary/5',
              )}
            />
          ))}
        </div>

        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Verify code
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          Didn&apos;t receive the code?{' '}
          {countdown > 0 ? (
            <span>Resend in {countdown}s</span>
          ) : (
            <button type="button" onClick={handleResend} className="font-medium text-primary hover:underline">
              Resend
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
