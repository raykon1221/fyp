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
  useSidebar,
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

function CustomSidebarTrigger() {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      onClick={toggleSidebar}
      className="flex items-center justify-center h-10 w-10 rounded-lg text-slate-900 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
    >
      <Menu className="h-6 w-6" />
    </button>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props} collapsible="icon" className="border-r border-slate-800 bg-custom-sidebar">
      <SidebarHeader className="p-5">

        <div className="flex items-center justify-left group-data-[collapsible=icon]:justify-left">
          <CustomSidebarTrigger />
        </div>
        {/* <CustomSidebarTrigger /> */}
      </SidebarHeader>
      <SidebarContent className="px-6">
        <SidebarMenu className="space-y-4">
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={item.isActive}
                tooltip={item.title}
                className="w-full h-12 rounded-lg justify-start group-data-[collapsible=icon]:justify-center data-[active=true]:bg-gradient-to-r data-[active=true]:from-purple-500 data-[active=true]:to-pink-500 hover:bg-slate-800"
              >
                <a
                  href={item.url}
                  className="flex items-center gap-3"
                  onClick={(e) => {
                    // Prevent sidebar expansion when clicking menu items
                    e.stopPropagation()
                  }}
                >
                  <item.icon className="w-6 h-6 shrink-0" />
                  <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
