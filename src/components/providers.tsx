"use client";

import { I18nProvider } from "@/lib/i18n-provider";

// Root providers — intentionally minimal.
//
// NOTE: `next-themes` ThemeProvider was removed because it injects a
// pre-hydration <script> that modifies <html>'s class BEFORE React hydrates.
// That DOM mutation causes React 19's useId to generate different IDs on the
// server vs. client for every Radix UI component (Sheet, Select, Dialog, etc.),
// producing "aria-controls" hydration mismatches. Since the app uses a fixed
// light theme (no dark-mode toggle), ThemeProvider is not needed.
//
// NOTE: `next-auth` SessionProvider was removed because no client component
// uses the `useSession()` hook. The `signIn`/`signOut` functions from
// `next-auth/react` work without it (they POST directly to the auth endpoints).
export function Providers({ children }: { children: React.ReactNode }) {
  return <I18nProvider>{children}</I18nProvider>;
}
