import { AppSidebar } from "@/features/workspace/components/sidebar/app-sidebar"
import { BreadcrumbDynamic } from "./breadcrumb-dynamic"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Subject } from "@/types/subject"

export function WorkspaceFrame({ children, subjects }: { children: React.ReactNode, subjects: Subject[] }) {
  return (
    <SidebarProvider>
      <AppSidebar subjects={subjects}/>
      <SidebarInset>
        <header className="md:flex hidden px-4 h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <BreadcrumbDynamic />
        </header>
        <div className="flex flex-1 flex-col gap-4 md:p-4 p-2 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
