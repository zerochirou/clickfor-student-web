"use client";

import * as React from "react";
import { Suspense } from "react";
import { NavMain } from "@/features/workspace/components/sidebar/nav-main";
import { NavProjects } from "@/features/workspace/components/sidebar/nav-projects";
import { NavUser } from "@/features/workspace/components/sidebar/nav-user";
import { HeaderSidebar } from "@/features/workspace/components/sidebar/header-sidebar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { sidebarLinks } from "../../constants/sidebar-links";
import { Subject } from "@/types/subject";


export function AppSidebar({ subjects }: {subjects: Subject[]}) {
  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <HeaderSidebar />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarLinks} />
        <NavProjects subjects={subjects} />
      </SidebarContent>
      <SidebarFooter>
        <Suspense
          fallback={
            <>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    size="lg"
                    className="animate-pulse bg-muted/50"
                  />
                </SidebarMenuItem>
              </SidebarMenu>
            </>
          }
        >
          <NavUser />
        </Suspense>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
