'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authAPI } from '@/lib/mock-api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    date_of_birth: '',
    gender: 'male' as 'male' | 'female' | 'other',
    agreed_to_terms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (form.password !== form.password_confirmation) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authAPI.register({
        full_name: form.full_name,
        email: form.email,
        phone: { country_code: '+880', number: form.phone },
        password: form.password,
        password_confirmation: form.password_confirmation,
        date_of_birth: form.date_of_birth,
        gender: form.gender,
        agreed_to_terms: form.agreed_to_terms,
      });
      router.push(`/verify-otp?phone=${encodeURIComponent('+880 ' + form.phone)}&purpose=registration`);
    } catch (err) {
      setError((err as { message?: string })?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 opacity-0 animate-fade-up">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Create your account</h2>
        <p className="text-sm text-muted-foreground">
          Register as a patient. Staff accounts are created by your hospital admin.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full name</Label>
          <Input
            id="full_name"
            required
            leftIcon={<User className="h-4 w-4" />}
            placeholder="Md. Rahim Uddin"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            leftIcon={<Mail className="h-4 w-4" />}
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone number</Label>
          <div className="flex gap-2">
            <div className="flex items-center rounded-md border border-input bg-secondary px-3 text-sm font-medium text-foreground">
              +880
            </div>
            <Input
              id="phone"
              required
              leftIcon={<Phone className="h-4 w-4" />}
              placeholder="1712345678"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="dob">Date of birth</Label>
            <Input
              id="dob"
              type="date"
              required
              value={form.date_of_birth}
              onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <select
              id="gender"
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value as 'male' | 'female' | 'other' })}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            leftIcon={<Lock className="h-4 w-4" />}
            placeholder="Min 8 chars, 1 uppercase, 1 number, 1 special"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password_confirmation">Confirm password</Label>
          <Input
            id="password_confirmation"
            type="password"
            required
            leftIcon={<Lock className="h-4 w-4" />}
            placeholder="Re-enter your password"
            value={form.password_confirmation}
            onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
          />
        </div>

        <label className="flex items-start gap-2.5 text-sm text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
            checked={form.agreed_to_terms}
            onChange={(e) => setForm({ ...form, agreed_to_terms: e.target.checked })}
            required
          />
          <span>
            I agree to the{' '}
            <Link href="#" className="font-medium text-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="#" className="font-medium text-primary hover:underline">
              Privacy Policy
            </Link>
          </span>
        </label>

        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Create account
          {!loading && <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
