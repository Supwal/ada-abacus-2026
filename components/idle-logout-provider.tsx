
'use client';

import { useIdleLogout } from '@/hooks/use-idle-logout';

export function IdleLogoutProvider({ children }: { children: React.ReactNode }) {
  useIdleLogout();
  
  return <>{children}</>;
}
