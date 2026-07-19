"use client";

import * as React from "react";
import { Suspense } from "react";
import { NavMain } from "@/features/workspace/components/sidebar/nav-main";
import { NavSubjects } from "@/features/workspace/components/sidebar/nav-subject";
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
import { NavTask } from "./nav-task";
import { Task } from "@/types/task";


export function AppSidebar({ subjects, tasks }: {subjects: Subject[]; tasks: Task[]}) {
  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <HeaderSidebar />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarLinks} />
        <NavSubjects subjects={subjects} />
        <NavTask tasks={tasks} />
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
