import type { ReactNode } from 'react';
import { SiteHeader } from './SiteHeader';
import { FontDebug } from './FontDebug';
import { SiteFooter } from './SiteFooter';
import { OceanLayer } from './OceanLayer';
import { OceanFx } from './OceanFx';
import { ScrollTop } from './ScrollTop';

export const SiteLayout = ({ children }: { children: ReactNode }) => (
  <div className="h-page min-h-screen flex flex-col">
    <OceanFx />
    <OceanLayer />
    <SiteHeader />
    <FontDebug />
    <div className="flex-1">{children}</div>
    <SiteFooter />
    <ScrollTop />
  </div>
);
