"use client";

import type React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  User,
  Building2,
  RotateCcw,
  Star,
  BarChart3,
  Menu,
} from "lucide-react";

const navigationItems = [
  {
    title: "Profile",
    icon: User,
    url: "#",
    isActive: true,
  },
  {
    title: "Organization",
    icon: Building2,
    url: "#",
  },
  {
    title: "Refresh",
    icon: RotateCcw,
    url: "#",
  },
  {
    title: "Favorites",
    icon: Star,
    url: "#",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    url: "#",
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props} className="border-r border-slate-800">
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-center">
          <Menu className="w-6 h-6 text-slate-400" />
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarMenu className="space-y-2">
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={item.isActive}
                className="w-12 h-12 rounded-xl justify-center data-[active=true]:bg-gradient-to-r data-[active=true]:from-purple-500 data-[active=true]:to-pink-500 hover:bg-slate-800"
                tooltip={item.title}
              >
                <a href={item.url}>
                  <item.icon className="w-5 h-5" />
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
