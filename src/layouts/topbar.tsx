'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { Bell, LogOut, Menu, Search, Settings, User as UserIcon, X } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { authAPI } from '@/lib/mock-api';
import { MOCK_NOTIFICATIONS } from '@/lib/mock-data';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn, formatRelative } from '@/lib/utils';
import { roleLabels } from '@/lib/navigation';

interface TopbarProps {
  onMobileMenuOpen: () => void;
}

interface DropdownPosition {
  top: number;
  left: number;
  width: number;
}

function getDropdownPosition(triggerEl: HTMLElement | null, preferredWidth: number): DropdownPosition {
  const gutter = 8;
  const topGap = 8;
  const viewportWidth = window.innerWidth;
  const width = Math.min(preferredWidth, viewportWidth - gutter * 2);

  if (!triggerEl) {
    return { top: 72, left: gutter, width };
  }

  const rect = triggerEl.getBoundingClientRect();
  let left = rect.right - width;
  if (left < gutter) left = gutter;
  if (left + width > viewportWidth - gutter) {
    left = viewportWidth - width - gutter;
  }

  return {
    top: rect.bottom + topGap,
    left,
    width,
  };
}

export function Topbar({ onMobileMenuOpen }: TopbarProps) {
  const router = useRouter();
  const { user, tenant, clearSession } = useAuthStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [notifPosition, setNotifPosition] = useState<DropdownPosition | null>(null);
  const [profilePosition, setProfilePosition] = useState<DropdownPosition | null>(null);
  const notifButtonRef = useRef<HTMLButtonElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  function updateNotifPosition() {
    setNotifPosition(getDropdownPosition(notifButtonRef.current, 360));
  }

  function updateProfilePosition() {
    setProfilePosition(getDropdownPosition(profileButtonRef.current, 224));
  }

  useEffect(() => {
    if (!notifOpen) return;
    const update = () => updateNotifPosition();
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [notifOpen]);

  useEffect(() => {
    if (!profileOpen) return;
    const update = () => updateProfilePosition();
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [profileOpen]);

  if (!user) return null;

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.is_read).length;
  const alertsHref =
    user.role === 'super_admin' ? '/super-admin/platform-alerts' :
    user.role === 'hospital_admin' ? '/admin/alerts' :
    user.role === 'patient' ? '/patient/notifications' :
    user.role === 'doctor' ? '/doctor/alerts' :
    user.role === 'nurse' ? '/nurse/alerts' :
    user.role === 'receptionist' ? '/reception/notifications' :
    user.role === 'lab_technician' ? '/lab/critical-alerts' :
    user.role === 'pharmacist' ? '/pharmacy/low-stock' :
    '/admin/alerts';

  async function handleLogout() {
    await authAPI.logout();
    clearSession();
    router.replace('/login');
  }

  return (
    <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur-md lg:px-6">
      {/* Mobile menu button */}
      <button
        onClick={onMobileMenuOpen}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-secondary lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Hospital name (mobile only) */}
      <div className="flex-1 truncate text-sm font-semibold lg:hidden">
        {tenant?.branding.display_name ?? 'HMS'}
      </div>

      {/* Search */}
      <div className="hidden flex-1 max-w-md lg:block">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search patients, MRN, appointments..."
            className="h-9 w-full rounded-md border border-input bg-secondary/50 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring/30 transition-colors"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground xl:inline-block">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right cluster */}
      <div className="ml-auto flex items-center gap-1.5">
        {/* Notifications */}
        <div className="relative">
          <button
            ref={notifButtonRef}
            onClick={() => {
              const nextOpen = !notifOpen;
              setNotifOpen(nextOpen);
              setProfileOpen(false);
              if (nextOpen) updateNotifPosition();
            }}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-secondary"
          >
            <Bell className="h-[18px] w-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && mounted && createPortal(
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
              <div
                className="fixed z-[70] overflow-hidden rounded-xl border border-border bg-card shadow-elevated"
                style={
                  notifPosition
                    ? { top: notifPosition.top, left: notifPosition.left, width: notifPosition.width }
                    : { top: 72, left: 8, right: 8 }
                }
              >
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <div className="text-sm font-semibold">Notifications</div>
                  <button onClick={() => setNotifOpen(false)}>
                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </button>
                </div>
                <div className="max-h-[min(400px,calc(100vh-9rem))] overflow-y-auto scrollbar-slim">
                  {MOCK_NOTIFICATIONS.map((n) => (
                    <a
                      key={n.id}
                      href={n.action_url}
                      className={cn(
                        'flex gap-3 border-b border-border px-4 py-3 hover:bg-secondary/50',
                        !n.is_read && 'bg-primary/5',
                      )}
                    >
                      <div
                        className={cn(
                          'mt-1 h-2 w-2 shrink-0 rounded-full',
                          n.severity === 'critical' && 'bg-critical pulse-critical',
                          n.severity === 'high' && 'bg-orange-500',
                          n.severity === 'medium' && 'bg-borderline',
                          n.severity === 'low' && 'bg-accent',
                          n.severity === 'info' && 'bg-blue-500',
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-sm font-medium leading-tight">{n.title}</div>
                          <Badge
                            variant={
                              n.severity === 'critical'
                                ? 'critical'
                                : n.severity === 'high'
                                ? 'warning'
                                : 'secondary'
                            }
                            className="shrink-0 text-[10px]"
                          >
                            {n.severity}
                          </Badge>
                        </div>
                        <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.message}</div>
                        <div className="mt-1 text-[10px] text-muted-foreground">
                          {formatRelative(n.created_at)}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
                <div className="border-t border-border px-4 py-2.5 text-center">
                  <a href={alertsHref} className="text-xs font-medium text-primary hover:underline">
                    View all alerts
                  </a>
                </div>
              </div>
            </>,
            document.body,
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            ref={profileButtonRef}
            onClick={() => {
              const nextOpen = !profileOpen;
              setProfileOpen(nextOpen);
              setNotifOpen(false);
              if (nextOpen) updateProfilePosition();
            }}
            className="flex items-center gap-2 rounded-md p-1 hover:bg-secondary"
          >
            <Avatar src={user.profile_photo_url} name={user.full_name} size="sm" />
            <div className="hidden text-left lg:block">
              <div className="text-xs font-semibold leading-tight">{user.full_name}</div>
              <div className="mt-0.5 flex items-center gap-1.5">
                <Badge variant="outline" className="text-[10px]">{roleLabels[user.role]}</Badge>
              </div>
            </div>
          </button>

          {profileOpen && mounted && createPortal(
            <>
              <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
              <div
                className="fixed z-[70] overflow-hidden rounded-xl border border-border bg-card shadow-elevated"
                style={
                  profilePosition
                    ? { top: profilePosition.top, left: profilePosition.left, width: profilePosition.width }
                    : { top: 72, right: 8, width: 224 }
                }
              >
                <div className="border-b border-border p-3">
                  <div className="text-sm font-semibold">{user.full_name}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </div>
                <div className="p-1">
                  <button className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-secondary">
                    <UserIcon className="h-4 w-4" /> Profile
                  </button>
                  <button className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-secondary">
                    <Settings className="h-4 w-4" /> Settings
                  </button>
                  <div className="my-1 border-t border-border" />
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              </div>
            </>,
            document.body,
          )}
        </div>
      </div>
    </header>
  );
}
