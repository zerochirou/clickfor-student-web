import { Button } from "@/components/ui/button";
import { FrameTask } from "@/features/task/components/frame-task";
import { TaskCard } from "@/features/task/components/task-card";
import { getCookieHeader } from "@/lib/get-cookie";
import { Response } from "@/types/response";
import { Task } from "@/types/task";
import { ChevronLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function TaskCreatePage({
  params,
}: {
  params: Promise<{ id: string; topic_id: string; task_id: string }>;
}) {
  const { task_id, id } = await params;
  const loadTasks = async (id: string) => {
    const cookieHeader = await getCookieHeader();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_HYPER_API_ENDPOINT}/task/${id}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          cookie: cookieHeader,
        },
      },
    );
    const data: Response<Task> = await response.json();
    return data;
  };

  const task = await loadTasks(task_id);
  if (!task.data || !task.success) {
    redirect("/workspace")
  }
  return (
    // <FrameTask>
    <div className="mx-auto max-w-3xl w-full">
      <Link href={`/workspace`}>
        <Button variant={'ghost'} className="mb-4">
          <ChevronLeft /> Back to Workspace
        </Button>
      </Link>
      <TaskCard task={task.data} />
    </div>
    // </FrameTask>
  );
}
