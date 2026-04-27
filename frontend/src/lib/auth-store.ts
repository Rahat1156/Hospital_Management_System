'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthSession, Tenant, User, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setSession: (session: AuthSession) => void;
  updateUser: (patch: Partial<User>) => void;
  clearSession: () => void;
  setHasHydrated: (value: boolean) => void;
  hasRole: (...roles: UserRole[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tenant: null,
      accessToken: null,
      isAuthenticated: false,
      hasHydrated: false,
      setSession: (session) =>
        set({
          user: session.user,
          tenant: session.tenant ?? null,
          accessToken: session.access_token,
          isAuthenticated: true,
        }),
      updateUser: (patch) =>
        set((state) => {
          if (!state.user) return state;
          return {
            user: {
              ...state.user,
              ...patch,
              updated_at: new Date().toISOString(),
            },
          };
        }),
      clearSession: () =>
        set({ user: null, tenant: null, accessToken: null, isAuthenticated: false }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
      hasRole: (...roles) => {
        const user = get().user;
        return user ? roles.includes(user.role) : false;
      },
    }),
    {
      name: 'hms-auth',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

/**
 * Maps user role → default dashboard route.
 */

// checking and not checking

export function roleDashboardPath(role: UserRole): string {
  const routes: Record<UserRole, string> = {
    super_admin: '/super-admin',
    hospital_admin: '/admin',
    doctor: '/doctor',
    nurse: '/nurse',
    lab_technician: '/lab',
    pharmacist: '/pharmacy',
    receptionist: '/reception',
    patient: '/patient',
  };
  return routes[role];
}
