'use client';

import type { ReactNode } from 'react';
import { Header } from './Header';
import { SidebarNav } from './SidebarNav';
import { Logo } from '@/components/ui/Logo';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarRail,
} from '@/components/ui/sidebar';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        <SidebarHeader className="p-4">
          <Logo iconOnly={false} />
        </SidebarHeader>
        <SidebarContent className="p-2 flex flex-col">
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter className="p-2">
          {/* Footer content if any */}
        </SidebarFooter>
      </Sidebar>
      <SidebarRail/>
      <SidebarInset>
        <Header />
        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
