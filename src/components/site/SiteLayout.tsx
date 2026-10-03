import type { ReactNode } from 'react';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';
import { OceanLayer } from './OceanLayer';
import { ScrollTop } from './ScrollTop';

export const SiteLayout = ({ children }: { children: ReactNode }) => (
  <div className="h-page min-h-screen flex flex-col">
    <OceanLayer />
    <SiteHeader />
    <div className="flex-1">{children}</div>
    <SiteFooter />
    <ScrollTop />
  </div>
);
