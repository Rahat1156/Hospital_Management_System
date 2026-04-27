'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Bell,
  CalendarClock,
  CheckCircle2,
  KeyRound,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader, SectionCard } from '@/components/shared';
import { useAuthStore, roleDashboardPath } from '@/lib/auth-store';
import { roleLabels } from '@/lib/navigation';
import { formatDate } from '@/lib/utils';

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const { user, tenant, updateUser } = useAuthStore();
  const section = searchParams.get('section');
  const isEditMode = section === 'edit';

  if (!user) return null;

  const roleProfile = getRoleProfile(user);
  const [fullName, setFullName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phoneCode, setPhoneCode] = useState('+880');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [saveOk, setSaveOk] = useState(true);

  useEffect(() => {
    setFullName(user.full_name ?? '');
    setDisplayName(user.display_name ?? '');
    setPhoneCode(user.phone?.country_code ?? '+880');
    setPhoneNumber(user.phone?.number ?? '');
    setProfilePhotoUrl(user.profile_photo_url ?? '');
  }, [user]);

  function handleProfileUpdate(event: React.FormEvent) {
    event.preventDefault();

    if (!fullName.trim()) {
      setSaveOk(false);
      setSaveMessage('Full name is required.');
      return;
    }

    if (!phoneCode.trim() || !phoneNumber.trim()) {
      setSaveOk(false);
      setSaveMessage('Phone country code and number are required.');
      return;
    }

    updateUser({
      full_name: fullName.trim(),
      display_name: displayName.trim() || undefined,
      phone: {
        country_code: phoneCode.trim(),
        number: phoneNumber.trim(),
      },
      profile_photo_url: profilePhotoUrl.trim() || undefined,
    });

    setSaveOk(true);
    setSaveMessage('Profile updated successfully.');
  }

  function handlePhotoFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setSaveOk(false);
      setSaveMessage('Please select an image file.');
      event.target.value = '';
      return;
    }

    const maxSizeBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setSaveOk(false);
      setSaveMessage('Image size must be 2MB or less.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const value = typeof reader.result === 'string' ? reader.result : '';
      if (!value) {
        setSaveOk(false);
        setSaveMessage('Failed to read selected image. Please try again.');
        return;
      }

      setProfilePhotoUrl(value);
      setSaveOk(true);
      setSaveMessage('Photo selected. Click Update profile to save changes.');
    };
    reader.onerror = () => {
      setSaveOk(false);
      setSaveMessage('Failed to read selected image. Please try again.');
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditMode ? 'Edit Profile' : section === 'settings' ? 'Profile Settings' : 'My Profile'}
        description={
          isEditMode
            ? 'Update your account details and save changes'
            : 'Your account, role, contact and security information'
        }
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href={roleDashboardPath(user.role)}>Back to dashboard</Link>
          </Button>
        }
      />

      {isEditMode && (
        <SectionCard title="Edit & Update Profile" description="Change profile details used across the HMS workspace">
          <form onSubmit={handleProfileUpdate} className="space-y-4 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input
                  id="full_name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_name">Display name</Label>
                <Input
                  id="display_name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter display name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile_photo_url">Profile photo URL</Label>
                <Input
                  id="profile_photo_url"
                  value={profilePhotoUrl}
                  onChange={(e) => setProfilePhotoUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="profile_photo_file">Profile picture from device</Label>
                <div className="flex flex-col gap-3 rounded-lg border border-border bg-secondary/30 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar src={profilePhotoUrl || undefined} name={fullName || user.full_name} size="md" />
                    <p className="text-xs text-muted-foreground">
                      Select JPG, PNG, or WEBP. Max size 2MB.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="profile_photo_file"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoFileChange}
                      className="block w-full text-xs text-muted-foreground file:mr-2 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary-foreground hover:file:bg-primary/90 sm:w-auto"
                    />
                    {profilePhotoUrl && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setProfilePhotoUrl('')}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_code">Phone country code</Label>
                <Input
                  id="phone_code"
                  value={phoneCode}
                  onChange={(e) => setPhoneCode(e.target.value)}
                  placeholder="+880"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone number</Label>
                <Input
                  id="phone_number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="1712345678"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
              <Button type="submit" size="sm">Update profile</Button>
              <Button type="button" variant="outline" size="sm" asChild>
                <Link href="/profile">Cancel</Link>
              </Button>
              {saveMessage && (
                <span className={saveOk ? 'text-sm text-healthy' : 'text-sm text-destructive'}>
                  {saveMessage}
                </span>
              )}
            </div>
          </form>
        </SectionCard>
      )}

      <Card className="overflow-hidden">
        <div className="bg-auth-gradient p-5 text-white sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar src={user.profile_photo_url} name={user.full_name} size="xl" className="ring-4 ring-white/20" />
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-2xl font-black">{user.full_name}</h2>
              <p className="mt-1 text-sm text-white/75">{roleLabels[user.role]} at {tenant?.branding.display_name ?? 'HMS Platform'}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="secondary">{user.status}</Badge>
                <Badge variant={user.email_verified ? 'healthy' : 'warning'}>
                  {user.email_verified ? 'Email verified' : 'Email pending'}
                </Badge>
                <Badge variant={user.phone_verified ? 'healthy' : 'warning'}>
                  {user.phone_verified ? 'Phone verified' : 'Phone pending'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <SectionCard title="Profile Information" description="Visible account details for your hospital workspace">
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <InfoTile icon={UserRound} label="Full name" value={user.full_name} />
            <InfoTile icon={Mail} label="Email" value={user.email} />
            <InfoTile icon={Phone} label="Phone" value={`${user.phone.country_code} ${user.phone.number}`} />
            <InfoTile icon={ShieldCheck} label="Role" value={roleLabels[user.role]} />
            <InfoTile icon={CalendarClock} label="Last login" value={user.last_login_at ? formatDate(user.last_login_at) : 'Not available'} />
            <InfoTile icon={CheckCircle2} label="Account status" value={user.status.replace('_', ' ')} />
          </div>
        </SectionCard>

        <SectionCard title="Security & Settings" description="Frontend-ready controls for backend integration">
          <div className="space-y-4 p-5">
            <div className="rounded-xl border border-border bg-secondary/40 p-4">
              <div className="flex items-start gap-3">
                <KeyRound className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <div className="font-semibold">Two-factor authentication</div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {user.two_factor_enabled
                      ? '2FA is enabled for this account.'
                      : '2FA is ready to connect with OTP/email/SMS backend verification.'}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-secondary/40 p-4">
              <div className="flex items-start gap-3">
                <Bell className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <div className="font-semibold">Notification channels</div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    In-app alerts are active. SMS, email and payment notifications can be wired to Laravel services.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {roleProfile && (
        <SectionCard title="Role Details" description="Professional information for your assigned system role">
          <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {roleProfile.map((item) => (
              <div key={item.label} className="rounded-xl border border-border bg-card p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{item.label}</div>
                <div className="mt-2 text-sm font-semibold">{item.value}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

function InfoTile({ icon: Icon, label, value }: { icon: typeof UserRound; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="mt-1 truncate text-sm font-semibold">{value}</div>
      </div>
    </div>
  );
}

function getRoleProfile(user: NonNullable<ReturnType<typeof useAuthStore.getState>['user']>) {
  if (user.doctor_profile) {
    return [
      { label: 'Specialty', value: user.doctor_profile.specialty },
      { label: 'BMDC number', value: user.doctor_profile.bmdc_number },
      { label: 'Experience', value: `${user.doctor_profile.years_of_experience} years` },
      { label: 'Consultation fee', value: `BDT ${user.doctor_profile.consultation_fee_bdt}` },
      { label: 'Qualifications', value: user.doctor_profile.qualifications.join(', ') },
      { label: 'Languages', value: user.doctor_profile.languages.join(', ') },
    ];
  }

  if (user.nurse_profile) {
    return [
      { label: 'License number', value: user.nurse_profile.license_number },
      { label: 'Ward assigned', value: user.nurse_profile.ward_assigned ?? 'Not assigned' },
      { label: 'Shift', value: user.nurse_profile.shift },
    ];
  }

  if (user.lab_tech_profile) {
    return [
      { label: 'License number', value: user.lab_tech_profile.license_number ?? 'Not provided' },
      { label: 'Specializations', value: user.lab_tech_profile.specializations.join(', ') },
    ];
  }

  if (user.pharmacist_profile) {
    return [
      { label: 'License number', value: user.pharmacist_profile.license_number },
      { label: 'Pharmacy ID', value: user.pharmacist_profile.pharmacy_id ?? 'Default pharmacy' },
    ];
  }

  return null;
}
