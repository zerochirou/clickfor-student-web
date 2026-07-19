import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WorkspaceFrame } from "@/features/workspace";
import { getSession } from "@/lib/auth-get-session";
import { getCookieHeader } from "@/lib/get-cookie";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { Subject } from "@/types/subject";
import { Response } from "@/types/response";
import { Task } from "@/types/task";

export default async function WorkspaceLayout({ children }: { children: ReactNode }) {
  const { data, error } = await getSession();
  if (error || !data) {
    redirect('/login');
  }
  const cookieHeader = await getCookieHeader();
  const loadSubjects = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_HYPER_API_ENDPOINT}/subject`,
      {
        credentials: "include",
        headers: {
          cookie: cookieHeader,
        },
      },
    );
     const data: Response<Subject[]> = await response.json();
    return data;
  };
  const loadTask = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_HYPER_API_ENDPOINT}/task`,
      {
        credentials: "include",
        headers: {
          cookie: cookieHeader,
        },
      },
    );
    const data: Response<Task[]> = await response.json();
    return data;
  };

  const [subjects, tasks] = await Promise.all([loadSubjects(), loadTask()]);
  return (
    <TooltipProvider>
      <WorkspaceFrame subjects={subjects.data} tasks={tasks.data}>
        <Toaster />
        {children}
      </WorkspaceFrame>
    </TooltipProvider>
  );
}
