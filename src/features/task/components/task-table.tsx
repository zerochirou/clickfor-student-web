"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { Task } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TaskCard } from "./task-card";

export function TaskTable({
  tasks,
  subjectId,
  topicId,
}: {
  tasks: Task[];
  subjectId: string;
  topicId: string;
}) {
  const [status, setStatus] = useState("open");

  const openCount = tasks.filter((task) => task.status === "open").length;
  const closedCount = tasks.filter((task) => task.status === "closed").length;

  const getTabClass = (tabStatus: string) =>
    `flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
      status === tabStatus ? "text-primary" : "text-muted-foreground"
    }`;

  const filteredTasks =
    status === "all" ? tasks : tasks.filter((task) => task.status === status);

  return (
    <div>
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setStatus("all")} className={getTabClass("all")}>
            All
            <Badge variant={status === "all" ? "default" : "outline"}>
              {tasks.length}
            </Badge>
          </button>
  
          <span className="w-[1px] h-4 bg-border" />
  
          <button
            onClick={() => setStatus("open")}
            className={getTabClass("open")}
          >
            Open
            <Badge variant={status === "open" ? "default" : "outline"}>
              {openCount}
            </Badge>
          </button>
  
          <button
            onClick={() => setStatus("closed")}
            className={getTabClass("closed")}
          >
            Closed
            <Badge variant={status === "closed" ? "default" : "outline"}>
              {closedCount}
            </Badge>
          </button>
        </div>

        {/* Tombol New Task dibungkus Link (Sesuaikan href dengan route Anda) */}
        <Link href={`/workspace/subjects/${subjectId}/topics/${topicId}/tasks/create`} className="justify-end">
          <Button variant={'outline'}>
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </Link>
      </div>

      {/* TASK LIST & EMPTY STATE */}
      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg border-dashed bg-muted/20">
          <p className="text-muted-foreground">
            No tasks found for this status.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredTasks.map((item) => (
            <TaskCard key={item.id} task={item} />
          ))}
        </div>
      )}
    </div>
  );
}
