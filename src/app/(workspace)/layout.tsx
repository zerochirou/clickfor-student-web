import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WorkspaceFrame } from "@/features/workspace";
import { getSession } from "@/lib/auth-get-session";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function WorkspaceLayout({ children }: { children: ReactNode }) {
  const { data, error } = await getSession();
  if (error || !data) {
    redirect('/login');
  }
  return (
    <TooltipProvider>
      <WorkspaceFrame>
        <Toaster />
        {children}
      </WorkspaceFrame>
    </TooltipProvider>
  );
}
