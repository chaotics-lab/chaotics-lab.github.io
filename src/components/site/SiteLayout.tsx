import type { ReactNode } from 'react';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';

export const SiteLayout = ({ children }: { children: ReactNode }) => (
  <div className="h-page min-h-screen flex flex-col">
    <SiteHeader />
    <div className="flex-1">{children}</div>
    <SiteFooter />
  </div>
);
