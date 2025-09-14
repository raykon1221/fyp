"use client";

import type React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  User,
  Building2,
  RotateCcw,
  Star,
  BarChart3,
  Menu,
  CircleGauge,
  SquareChartGantt,
  GalleryVerticalEnd,
  Ticket,
  Tag,
} from "lucide-react";
import { usePathname } from "next/navigation";

const navigationItems = [
  { title: "Dashboard", icon: CircleGauge, url: "/dashboard" },
  { title: "On-chain Activity", icon: SquareChartGantt, url: "/onchain" },
  { title: "Your NFTs", icon: GalleryVerticalEnd, url: "/nfts" },
  { title: "Your POAPs", icon: Ticket, url: "/poaps" },
  { title: "ENS Check", icon: Tag, url: "/ens" },
];

function CustomSidebarTrigger() {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      onClick={toggleSidebar}
      className="flex items-center justify-center h-10 w-10 rounded-lg text-slate-900 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
    >
      <Menu className="h-6 w-6" />
    </button>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname(); // 👈 get current URL path

  return (
    <Sidebar
      {...props}
      collapsible="icon"
      className="border-r border-slate-200 bg-custom-sidebar"
    >
      <SidebarHeader className="p-5">
        <div className="flex items-center justify-left group-data-[collapsible=icon]:justify-left">
          <CustomSidebarTrigger />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4">
        <SidebarMenu className="space-y-5">
          {navigationItems.map((item) => {
            const isActive = pathname === item.url; // 👈 check match
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.title}
                  className="w-full h-12 px-4 rounded-md text-base font-medium justify-start
                             group-data-[collapsible=icon]:justify-center
                             transition-all duration-300
                             data-[active=true]:bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600
                             hover:from-cyan-500 hover:via-indigo-600 hover:to-purple-700
                             data-[active=true]:text-white shadow-lg"
                >
                  <a
                    href={item.url}
                    className="flex items-center gap-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <item.icon className="w-6 h-6 shrink-0" />
                    <span className="group-data-[collapsible=icon]:hidden">
                      {item.title}
                    </span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
