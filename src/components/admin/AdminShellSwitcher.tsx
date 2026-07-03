'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import AdminBaseThemeFrame from '@/components/admin/AdminBaseThemeFrame';
import { AdminShell } from '@/components/admin/AdminShell';

const CLEAN_ADMIN_PATHS = new Set(['/admin/login', '/admin/first-admin']);

export function AdminShellSwitcher({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '';

  if (CLEAN_ADMIN_PATHS.has(pathname) || pathname.startsWith('/admin/observatory')) {
    return <>{children}</>;
  }

  return (
    <div id="shell-fabrick" className="fabrick-shell" data-admin-shell="fabrick">
      <AdminBaseThemeFrame>
        <AdminShell>{children}</AdminShell>
      </AdminBaseThemeFrame>
    </div>
  );
}
