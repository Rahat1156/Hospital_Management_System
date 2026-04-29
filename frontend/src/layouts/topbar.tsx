'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, CheckCircle2, Home, LogOut, Menu, Search, Settings, ShieldCheck, User as UserIcon, X } from 'lucide-react';
import { BrandLink } from '@/components/shared/brand-mark';
import { useAuthStore, roleDashboardPath } from '@/lib/auth-store';
import { alertAPI, authAPI } from '@/lib/mock-api';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn, formatRelative } from '@/lib/utils';
import { roleLabels } from '@/lib/navigation';
import type { InAppNotification } from '@/types';

interface TopbarProps {
  onMobileMenuOpen: () => void;
}

export function Topbar({ onMobileMenuOpen }: TopbarProps) {
  const router = useRouter();
  const { user, tenant, clearSession } = useAuthStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuPosition, setMenuPosition] = useState<React.CSSProperties>({});
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const notifButtonRef = useRef<HTMLButtonElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);

    function closeMenus(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setNotifOpen(false);
        setProfileOpen(false);
      }
    }

    window.addEventListener('keydown', closeMenus);
    return () => window.removeEventListener('keydown', closeMenus);
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    const currentUserId = user.id;

    let cancelled = false;
    async function loadNotifications() {
      try {
        const res = await alertAPI.getNotifications({ user_id: currentUserId });
        if (!cancelled) setNotifications(res.data);
      } catch {
        if (!cancelled) setNotifications([]);
      }
    }

    void loadNotifications();
    const timer = window.setInterval(loadNotifications, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [user?.id]);

  useEffect(() => {
    function repositionOpenMenu() {
      if (notifOpen) updateMenuPosition(notifButtonRef, 360);
      if (profileOpen) updateMenuPosition(profileButtonRef, 288);
    }

    repositionOpenMenu();
    window.addEventListener('resize', repositionOpenMenu);
    window.addEventListener('scroll', repositionOpenMenu, true);

    return () => {
      window.removeEventListener('resize', repositionOpenMenu);
      window.removeEventListener('scroll', repositionOpenMenu, true);
    };
  }, [notifOpen, profileOpen]);

  function updateMenuPosition(ref: React.RefObject<HTMLButtonElement>, width: number) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;

    const safeMargin = 12;

    if (window.innerWidth < 640) {
      setMenuPosition({
        left: safeMargin,
        right: safeMargin,
        top: 64,
        width: 'auto',
      });
      return;
    }

    const menuWidth = Math.min(width, window.innerWidth - safeMargin * 2);
    const preferredLeft = rect.right - menuWidth;
    const maxLeft = window.innerWidth - menuWidth - safeMargin;
    const clampedLeft = Math.min(Math.max(preferredLeft, safeMargin), maxLeft);

    setMenuPosition({
      top: rect.bottom + 8,
      left: clampedLeft,
      width: menuWidth,
    });
  }

  function openNotifications() {
    updateMenuPosition(notifButtonRef, 360);
    setNotifOpen((open) => !open);
    setProfileOpen(false);
  }

  function openProfile() {
    updateMenuPosition(profileButtonRef, 288);
    setProfileOpen((open) => !open);
    setNotifOpen(false);
  }

  if (!user) return null;

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const settingsHref = user.role === 'hospital_admin' ? '/admin/settings' : '/profile?section=settings';
  const alertsHref = user.role === 'hospital_admin' ? '/admin/alerts' : roleDashboardPath(user.role);

  async function handleLogout() {
    await authAPI.logout();
    clearSession();
    router.replace('/login');
  }

  function goToProfile() {
    setProfileOpen(false);
    router.push('/profile');
  }

  function goToEditProfile() {
    setProfileOpen(false);
    router.push('/profile?section=edit');
  }

  function goToSettings() {
    setProfileOpen(false);
    router.push(settingsHref);
  }

  async function handleNotificationClick(notification: InAppNotification) {
    if (!user) return;

    if (!notification.is_read) {
      setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n)));
      try {
        await alertAPI.markNotificationRead(notification.id, { user_id: user.id });
      } catch {
        // Keep optimistic UI update to avoid counter flicker on transient network errors.
      }
    }

    setNotifOpen(false);
    if (notification.action_url) {
      router.push(notification.action_url);
    }
  }

  return (
    <header className="sticky top-0 z-[100] flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur-md lg:px-6">
      {/* Mobile menu button */}
      <button
        onClick={onMobileMenuOpen}
        type="button"
        aria-label="Open navigation"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-secondary lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Hospital name (mobile only) */}
      <div className="flex-1 truncate lg:hidden">
        <BrandLink href="/" compact className="inline-flex" />
      </div>

      {/* Search */}
      <div className="hidden min-w-0 flex-1 max-w-2xl lg:block">
        <div className="flex h-9 items-center gap-2 rounded-md border border-input bg-secondary/50 px-3 text-sm transition-colors focus-within:border-primary focus-within:bg-background focus-within:ring-2 focus-within:ring-ring/30">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search patients, MRN, appointments..."
            className="h-full w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <kbd className="hidden shrink-0 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground xl:inline-block">
            Ctrl K
          </kbd>
        </div>
      </div>

      {/* Right cluster */}
      <div className="ml-auto flex shrink-0 items-center gap-1.5">
        <Link
          href="/"
          className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-secondary"
        >
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">Home</span>
        </Link>

        {/* Notifications */}
        <div className="relative">
          <button
            ref={notifButtonRef}
            onClick={openNotifications}
            type="button"
            aria-label="Open notifications"
            className="relative inline-flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-md px-2 hover:bg-secondary"
          >
            <Bell className="h-[18px] w-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute right-0 top-0 z-10 flex h-4 min-w-4 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground ring-2 ring-background">
                {unreadCount}
              </span>
            )}
            {unreadCount === 0 && (
              <span className="hidden items-center gap-1 text-[11px] font-medium text-muted-foreground sm:inline-flex">
                <CheckCircle2 className="h-3.5 w-3.5 text-healthy" />
                Open
              </span>
            )}
          </button>
          {mounted && notifOpen && createPortal(
            <>
              <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setNotifOpen(false)} />
              <div
                className="fixed max-h-[calc(100vh-5rem)] overflow-hidden rounded-xl border border-border bg-card shadow-2xl ring-1 ring-primary/5"
                style={{ ...menuPosition, zIndex: 9999 }}
              >
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <div className="text-sm font-semibold">Notifications</div>
                  <button onClick={() => setNotifOpen(false)} type="button" aria-label="Close notifications">
                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </button>
                </div>
                <div className="max-h-[min(400px,calc(100vh-10rem))] overflow-y-auto scrollbar-slim">
                  {notifications.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => void handleNotificationClick(n)}
                      className={cn(
                        'flex w-full gap-3 border-b border-border px-4 py-3 text-left hover:bg-secondary/50',
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
                        {n.metadata?.type === 'emergency' && (
                          <div className="mt-0.5 text-[11px] font-medium text-critical">
                            Emergency SOS{n.patient_name ? ` · ${n.patient_name}` : ''}{n.patient_mrn ? ` (${n.patient_mrn})` : ''}
                          </div>
                        )}
                        <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.message}</div>
                        <div className="mt-1 text-[10px] text-muted-foreground">
                          {formatRelative(n.created_at)}
                        </div>
                      </div>
                    </button>
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
            onClick={openProfile}
            type="button"
            aria-label="Open profile menu"
            className="flex items-center gap-2 rounded-md p-1 hover:bg-secondary"
          >
            <Avatar src={user.profile_photo_url} name={user.full_name} size="sm" />
            <div className="hidden text-left lg:block">
              <div className="text-xs font-semibold leading-tight">{user.full_name}</div>
              <div className="text-[10px] text-muted-foreground">{roleLabels[user.role]}</div>
            </div>
          </button>
          {mounted && profileOpen && createPortal(
            <>
              <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setProfileOpen(false)} />
              <div
                className="fixed max-h-[calc(100vh-5rem)] overflow-y-auto rounded-xl border border-border bg-card shadow-2xl ring-1 ring-primary/5"
                style={{ ...menuPosition, zIndex: 9999 }}
              >
                <div className="border-b border-border p-4">
                  <div className="flex items-start gap-3">
                    <Avatar src={user.profile_photo_url} name={user.full_name} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{user.full_name}</div>
                      <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <Badge variant="secondary" className="text-[10px]">{roleLabels[user.role]}</Badge>
                        {user.two_factor_enabled && (
                          <Badge variant="healthy" className="text-[10px]">
                            <ShieldCheck className="h-3 w-3" /> 2FA
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-secondary/50 p-2 text-xs">
                    <div>
                      <div className="font-semibold text-foreground">{user.status}</div>
                      <div className="text-muted-foreground">Account</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 font-semibold text-healthy">
                        <CheckCircle2 className="h-3 w-3" /> Verified
                      </div>
                      <div className="text-muted-foreground">Email/phone</div>
                    </div>
                  </div>
                </div>
                <div className="p-1">
                  <button
                    onClick={goToProfile}
                    type="button"
                    className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-secondary"
                  >
                    <UserIcon className="h-4 w-4" /> Profile
                  </button>
                  <button
                    onClick={goToEditProfile}
                    type="button"
                    className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-secondary"
                  >
                    <UserIcon className="h-4 w-4" /> Edit profile
                  </button>
                  <button
                    onClick={goToSettings}
                    type="button"
                    className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-secondary"
                  >
                    <Settings className="h-4 w-4" /> Settings
                  </button>
                  <div className="my-1 border-t border-border" />
                  <button
                    onClick={handleLogout}
                    type="button"
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
