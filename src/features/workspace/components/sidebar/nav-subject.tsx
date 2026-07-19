"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  MoreHorizontalIcon,
  FolderIcon,
  Trash2Icon,
  Table2,
} from "lucide-react";
import { Subject } from "@/types/subject";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteSubjectAction } from "@/features/subject/api/delete-subject-action";
import { toast } from "sonner";

export function NavSubjects({ subjects }: { subjects: Subject[] }) {
  const { isMobile } = useSidebar();
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const handleDelete = async (id: string) => {
    startTransition(async () => {
      const { success } = await deleteSubjectAction(id);
      if (success) {
        toast.success("Subject deleted successfully");
        router.refresh();
      } else {
        toast.error("Failed to delete subject");
      }
    });
  };
  
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Subjects</SidebarGroupLabel>
      <SidebarMenu>
        {subjects.map((item) => (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton render={<a href={`/workspace/subjects/${item.id}`} />}>
              <Table2 />
              <span>{item.name}</span>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuAction
                    showOnHover
                    className="aria-expanded:bg-muted"
                  />
                }
              >
                <MoreHorizontalIcon />
                <span className="sr-only">More</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-fit"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem onClick={() => router.push(`/workspace/subjects/${item.id}`)}>
                  <FolderIcon />
                  <span>View Project</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => handleDelete(item.id)}>
                  <Trash2Icon />
                  <span>Delete Project</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70" onClick={() => router.push(`/workspace/subjects`)}>
            <MoreHorizontalIcon className="text-sidebar-foreground/70" />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
