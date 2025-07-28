'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Waypoints, MapPin, FileText as FileTextIconLucide, Settings, LogOut, Users, FileSearch, MessageSquare, TrendingUp, FileSignature, Package, Warehouse, Briefcase, ChevronDown, ChevronRight, SlidersHorizontal, ListChecks, AreaChart, Ship, Plane, Truck, Anchor, ArrowDownCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from '@/components/ui/dropdown-menu';

interface NestedLinkItem {
  label: string;
  href?: string;
  disabled?: boolean;
}

interface AccordionSubMenuItem {
  label: string;
  icon: React.ElementType;
  href?: string;
  isAccordion?: boolean;
  accordionKey?: 'glSetup' | 'glTransaction';
  nestedItems?: NestedLinkItem[];
  disabled?: boolean;
}

interface NavItem {
  href?: string;
  label:string;
  icon: React.ElementType;
  adminOnly?: boolean;
  isDropdown?: boolean;
  subItems?: AccordionSubMenuItem[];
  isAccordion?: boolean;
  accordionKey?: string;
  nestedItems?: NestedLinkItem[];
}

const initialNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/import-export', label: 'Import/Export', icon: Package },
  { href: '/dashboard/logistics-depot', label: 'Logistics & Depot', icon: Warehouse },
  { href: '/dashboard/route-optimization', label: 'Route Optimization', icon: Waypoints },
  {
    label: 'Sea Export',
    icon: Ship,
    isAccordion: true,
    accordionKey: 'seaExportAccordion',
    nestedItems: [
      { label: 'SE Job', href: '/dashboard/sea-export/se-job' },
      { label: 'CRO', href: '/dashboard/sea-export/cro' },
      { label: 'SE/BL', href: '/dashboard/sea-export/se-bl' },
      { label: 'SE Invoice', href: '/dashboard/sea-export/se-invoice' },
      { label: 'SE Receipt', href: '/dashboard/sea-export/se-receipt' },
    ]
  },
  {
    label: 'Sea Import',
    icon: Anchor,
    isAccordion: true,
    accordionKey: 'seaImportAccordion',
    nestedItems: [
      { label: 'SI Job', href: '/dashboard/sea-import/si-job' },
      { label: 'SI/BL', href: '/dashboard/sea-import/si-bl' },
      { label: 'SI Invoice', href: '/dashboard/sea-import/si-invoice' },
      { label: 'SI Receipt', href: '/dashboard/sea-import/si-receipt' },
    ]
  },
  {
    label: 'Air Export',
    icon: Plane,
    isAccordion: true,
    accordionKey: 'airExportAccordion',
    nestedItems: [
        { label: 'AE Job', href: '/dashboard/air-export/ae-job' },
        { label: 'AE Invoice', href: '/dashboard/air-export/ae-invoice' },
        { label: 'AE Receipt', href: '/dashboard/air-export/ae-receipt' },
    ]
  },
  {
    label: 'Air Import',
    icon: ArrowDownCircle,
    isAccordion: true,
    accordionKey: 'airImportAccordion',
    nestedItems: [
        { href: '/dashboard/air-import/ai-job', label: 'AI Jobs' },
        { href: '/dashboard/air-import/ai-invoice', label: 'AI Invoice' },
        { href: '/dashboard/air-import/ai-receipt', label: 'AI Receipt' },
    ]
  },
  { href: '/dashboard/logistics', label: 'Logistics', icon: Truck }, // General logistics
  { href: '/dashboard/container-tracking', label: 'Container Tracking', icon: MapPin },
  { href: '/dashboard/document-generation', label: 'Document Generation', icon: FileTextIconLucide },
  { href: '/dashboard/document-analysis', label: 'Document Chat', icon: FileSearch },
  { href: '/dashboard/logistics-chat', label: 'Logistics Chat', icon: MessageSquare },
  { href: '/dashboard/shipment-risk', label: 'Shipment Risk', icon: TrendingUp },
  { href: '/dashboard/contract-review', label: 'Contract Review', icon: FileSignature },
  {
    label: 'GL',
    icon: Briefcase,
    isDropdown: true,
    subItems: [
      {
        label: 'Setup',
        icon: SlidersHorizontal,
        isAccordion: true,
        accordionKey: 'glSetup',
        nestedItems: [
          { label: 'Chart of Accounts', href: '/dashboard/gl/setup/chart-of-accounts' },
          { label: 'Voucher Properties', href: '/dashboard/gl/setup/voucher-properties' },
          { label: 'Opening Balance', disabled: true },
          { label: 'Account Integration', disabled: true },
        ],
      },
      {
        label: 'Transaction',
        icon: ListChecks,
        isAccordion: true,
        accordionKey: 'glTransaction',
        nestedItems: [
          { label: 'Voucher', disabled: true },
          { label: 'Invoice', disabled: true },
          { label: 'Bills', disabled: true },
          { label: 'Receipt', disabled: true },
          { label: 'Payment', disabled: true },
          { label: 'Bank Reconciliation', disabled: true },
          { label: 'Cheque Book Stock', disabled: true },
          { label: 'Budget', disabled: true },
          { label: 'Cash Denomination Recording', disabled: true },
        ],
      },
      { label: 'Reports', icon: FileTextIconLucide, href: '/dashboard/gl/reports', disabled: true },
      { label: 'Analytics Dashboard', icon: AreaChart, href: '/dashboard/gl/analytics', disabled: true },
    ],
  },
  { href: '/dashboard/user-management', label: 'User Management', icon: Users, adminOnly: true },
];

const bottomNavItems: NavItem[] = [
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { state: sidebarState } = useSidebar();

  const [accordionsOpen, setAccordionsOpen] = useState<Record<string, boolean>>({
    seaExportAccordion: false,
    seaImportAccordion: false,
    airExportAccordion: false,
    airImportAccordion: false,
  });

  const [glAccordionsOpen, setGlAccordionsOpen] = useState<Record<string, boolean>>({
    glSetup: false,
    glTransaction: false,
  });

  const toggleAccordion = (key: string) => {
    setAccordionsOpen(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleGlAccordion = (key: string) => {
    setGlAccordionsOpen(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    const isSeaExportRouteActive = initialNavItems
      .find(item => item.accordionKey === 'seaExportAccordion')
      ?.nestedItems?.some(sub => pathname === sub.href || (sub.href && sub.href !== '/dashboard' && pathname.startsWith(sub.href)));

    if (isSeaExportRouteActive) {
      setAccordionsOpen(prev => ({ ...prev, seaExportAccordion: true }));
    }

    const isSeaImportRouteActive = initialNavItems
      .find(item => item.accordionKey === 'seaImportAccordion')
      ?.nestedItems?.some(sub => sub.href && (sub.href && sub.href !== '/dashboard' && pathname.startsWith(sub.href)));

    if (isSeaImportRouteActive) {
      setAccordionsOpen(prev => ({ ...prev, seaImportAccordion: true }));
    }

    const isAirExportRouteActive = initialNavItems
      .find(item => item.accordionKey === 'airExportAccordion')
      ?.nestedItems?.some(sub => sub.href && (sub.href && sub.href !== '/dashboard' && pathname.startsWith(sub.href)));
    
    if (isAirExportRouteActive) {
      setAccordionsOpen(prev => ({ ...prev, airExportAccordion: true }));
    }

    const isAirImportRouteActive = initialNavItems
      .find(item => item.accordionKey === 'airImportAccordion')
      ?.nestedItems?.some(sub => sub.href && (sub.href && sub.href !== '/dashboard' && pathname.startsWith(sub.href)));

    if (isAirImportRouteActive) {
      setAccordionsOpen(prev => ({ ...prev, airImportAccordion: true }));
    }

  }, [pathname]);


  const renderNestedItems = (items: NestedLinkItem[], parentAccordionKey: string, isTopLevelAccordion: boolean) => {
    const currentAccordionState = isTopLevelAccordion ? accordionsOpen : glAccordionsOpen;
    if (!currentAccordionState[parentAccordionKey] || sidebarState === 'collapsed') {
      return null;
    }
    return (
      <ul className={cn(
        "ml-3.5 mt-1 mb-1 space-y-1 border-l border-sidebar-border/70 pl-2.5 pr-1",
        "group-data-[collapsible=icon]:hidden"
      )}>
        {items.map(nestedItem => {
          const isNestedActive = nestedItem.href ? (pathname === nestedItem.href || (nestedItem.href !== '/dashboard' && pathname.startsWith(nestedItem.href))) : false;
          return (
            <li key={nestedItem.label}>
              {nestedItem.href ? (
                <Link href={nestedItem.href} passHref legacyBehavior>
                  <SidebarMenuButton
                    asChild
                    isActive={isNestedActive}
                    tooltip={nestedItem.label}
                    size="sm"
                    className={cn(
                      "w-full justify-start h-auto py-1.5 px-2 text-xs",
                      nestedItem.disabled && "opacity-70 cursor-not-allowed"
                    )}
                    disabled={nestedItem.disabled}
                  >
                    <a>{nestedItem.label}</a>
                  </SidebarMenuButton>
                </Link>
              ) : (
                 <SidebarMenuButton
                    isActive={false} // Non-link items are never "active" in the same way
                    tooltip={nestedItem.label}
                    size="sm"
                    className={cn(
                      "w-full justify-start h-auto py-1.5 px-2 text-xs",
                      nestedItem.disabled && "opacity-70 cursor-not-allowed"
                    )}
                    disabled={nestedItem.disabled}
                  >
                    <span>{nestedItem.label}</span>
                  </SidebarMenuButton>
              )}
            </li>
          );
        })}
      </ul>
    );
  };


  return (
    <>
      <SidebarMenu className="flex-grow">
        {initialNavItems.map((item) => {
          if (item.adminOnly && user?.role !== 'Admin') {
            return null;
          }

          if (item.isAccordion && item.accordionKey && item.nestedItems) {
            const isActive = item.nestedItems.some(sub => sub.href && (pathname === sub.href || pathname.startsWith(sub.href)));
            const isOpen = accordionsOpen[item.accordionKey];
            return (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  onClick={() => toggleAccordion(item.accordionKey as string)}
                  isActive={isActive && !isOpen}
                  tooltip={item.label}
                  className="w-full justify-start group"
                  aria-expanded={isOpen}
                >
                  <item.icon className="h-5 w-5" />
                  <span className={cn(sidebarState === 'collapsed' && "hidden", "flex-grow")}>{item.label}</span>
                  {sidebarState !== 'collapsed' && (
                    isOpen ? <ChevronDown className="h-4 w-4 ml-auto" /> : <ChevronRight className="h-4 w-4 ml-auto" />
                  )}
                </SidebarMenuButton>
                {sidebarState !== 'collapsed' && isOpen && renderNestedItems(item.nestedItems, item.accordionKey, true)}
              </SidebarMenuItem>
            );
          }

          if (item.isDropdown && item.subItems) {
            return (
              <SidebarMenuItem key={item.label}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.label}
                      className="w-full justify-start group"
                      aria-label={item.label}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className={cn(sidebarState === 'collapsed' && "hidden", "flex-grow")}>{item.label}</span>
                       <ChevronDown
                        className={cn(
                          sidebarState === 'collapsed' && "hidden",
                          "h-4 w-4 ml-auto transition-transform duration-200",
                          "group-data-[state=open]:rotate-180"
                        )}
                      />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuContent
                      side="right"
                      align="start"
                      sideOffset={sidebarState === 'collapsed' ? 12 : 8}
                      className="bg-sidebar border-sidebar-border text-sidebar-foreground w-60 space-y-1 py-1"
                    >
                      {item.subItems.map((glSubItem) => {
                        const IconComponent = glSubItem.icon;
                        if (glSubItem.isAccordion && glSubItem.accordionKey && glSubItem.nestedItems) {
                          const isGlAccordionOpen = glAccordionsOpen[glSubItem.accordionKey];
                          return (
                            <React.Fragment key={glSubItem.label}>
                              <DropdownMenuItem
                                onClick={() => toggleGlAccordion(glSubItem.accordionKey as string)}
                                onSelect={(e) => e.preventDefault()}
                                className={cn(
                                  "cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:bg-sidebar-accent focus:text-sidebar-accent-foreground flex items-center py-1.5 px-2 h-auto text-sm",
                                   isGlAccordionOpen && "bg-sidebar-accent/30" // More subtle highlight for open accordion header
                                )}
                                aria-expanded={isGlAccordionOpen}
                              >
                                <IconComponent className="mr-2 h-4 w-4 shrink-0" />
                                <span className="flex-grow">{glSubItem.label}</span>
                                <ChevronDown
                                  className={cn(
                                    "h-4 w-4 shrink-0 transition-transform duration-200",
                                    isGlAccordionOpen && "rotate-180"
                                  )}
                                />
                              </DropdownMenuItem>
                              {isGlAccordionOpen && (
                                <div className="ml-2 pl-2 border-l border-sidebar-border/70 space-y-0.5 py-1">
                                  {glSubItem.nestedItems.map((nested) => (
                                    <DropdownMenuItem key={nested.label} asChild className={cn("py-1.5 px-2 h-auto text-xs hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground focus:bg-sidebar-accent/80 focus:text-sidebar-accent-foreground ml-2", nested.disabled && "opacity-70 cursor-not-allowed")} disabled={nested.disabled}>
                                      {nested.href ? (
                                        <Link href={nested.href} passHref legacyBehavior>
                                          <a className="w-full block">
                                            {nested.label}
                                          </a>
                                        </Link>
                                      ) : (
                                        <span className="w-full block">{nested.label}</span>
                                      )}
                                    </DropdownMenuItem>
                                  ))}
                                </div>
                              )}
                            </React.Fragment>
                          );
                        } else if (glSubItem.href) {
                          return (
                            <DropdownMenuItem key={glSubItem.label} asChild className={cn("hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:bg-sidebar-accent focus:text-sidebar-accent-foreground py-1.5 px-2 h-auto text-sm", glSubItem.disabled && "opacity-70 cursor-not-allowed")} disabled={glSubItem.disabled}>
                              <Link href={glSubItem.href} passHref legacyBehavior>
                                <a className="flex items-center w-full">
                                  <IconComponent className="mr-2 h-4 w-4 shrink-0" />
                                  <span className="w-full">{glSubItem.label}</span>
                                </a>
                              </Link>
                            </DropdownMenuItem>
                          );
                        }
                        return null;
                      })}
                    </DropdownMenuContent>
                  </DropdownMenuPortal>
                </DropdownMenu>
              </SidebarMenuItem>
            );
          }

          if (item.href) {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref legacyBehavior>
                  <SidebarMenuButton
                    isActive={isActive}
                    tooltip={item.label}
                    className="w-full justify-start"
                  >
                    <item.icon className="h-5 w-5" />
                    <span className={cn(sidebarState === 'collapsed' && "hidden")}>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          }
          return null;
        })}
      </SidebarMenu>

      <SidebarMenu className="mt-auto">
        {bottomNavItems.map((item) => {
            if (!item.href) return null;
            const isActive = pathname === item.href;
            return (
                <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref legacyBehavior>
                    <SidebarMenuButton
                    isActive={isActive}
                    tooltip={item.label}
                    className="w-full justify-start"
                    >
                    <item.icon className="h-5 w-5" />
                    <span className={cn(sidebarState === 'collapsed' && "hidden")}>{item.label}</span>
                    </SidebarMenuButton>
                </Link>
                </SidebarMenuItem>
            );
        })}
        <SidebarMenuItem>
            <SidebarMenuButton
            onClick={logout}
            tooltip="Logout"
            className="w-full justify-start text-red-500 hover:bg-red-100 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-900/50 dark:hover:text-red-300"
            >
            <LogOut className="h-5 w-5" />
            <span className={cn(sidebarState === 'collapsed' && "hidden")}>Logout</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
}
