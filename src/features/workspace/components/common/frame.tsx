import { AppSidebar } from "@/features/workspace/components/sidebar/app-sidebar";
import { BreadcrumbDynamic } from "./breadcrumb-dynamic";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Subject } from "@/types/subject";
import { ThemeToggle } from "@/components/common/theme-toggle/theme-toggle";
import { Task } from "@/types/task";

export function WorkspaceFrame({
  children,
  subjects,
  tasks,
}: {
  children: React.ReactNode;
  subjects: Subject[];
  tasks: Task[];
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar subjects={subjects} tasks={tasks} />
      <SidebarInset>
        <header className="md:flex hidden p-2  shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="pr-4 flex items-center gap-2">
            <SidebarTrigger
              className={
                "relative flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
              }
            />
            <ThemeToggle />
          </div>
          <BreadcrumbDynamic />
        </header>
        <div className="flex flex-1 flex-col gap-4 md:p-4 p-2 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
