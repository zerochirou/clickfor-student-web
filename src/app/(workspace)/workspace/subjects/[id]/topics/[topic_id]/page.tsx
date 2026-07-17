import { Button } from "@/components/ui/button";
import { SubjectProvider } from "@/features/subject/lib/subject-provider";
import { TaskTable } from "@/features/task/components/task-table";
import { TopicFrame } from "@/features/topic/components/topic-frame";
import { TopicHeader } from "@/features/topic/components/topic-header";
import { TopicNoteEditor } from "@/features/topic/components/topic-note-editor";
import { TopicTabs } from "@/features/topic/components/topic-tabs";
import { getCookieHeader } from "@/lib/get-cookie";
import { Response } from "@/types/response";
import { Subject } from "@/types/subject";
import { Task } from "@/types/task";
import { Topic } from "@/types/topic";
import { ArrowLeft, CircleCheck, Info } from "lucide-react";
import Link from "next/link";

export default async function TopicPage({
  params,
}: {
  params: Promise<{ topic_id: string; id: string }>;
}) {
  const { topic_id, id } = await params;
  const loadTopicById = async (id: string) => {
    const cookieHeader = await getCookieHeader();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_HYPER_API_ENDPOINT}/topic/${id}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          cookie: cookieHeader,
        },
      },
    );
    const data: Response<Topic> = await response.json();
    return data;
  };
  const loadSubjectById = async (id: string) => {
    const cookieHeader = await getCookieHeader();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_HYPER_API_ENDPOINT}/subject/${id}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          cookie: cookieHeader,
        },
      },
    );
    const data: Response<Subject> = await response.json();
    return data;
  };
  const loadTasks = async (id: string) => {
    const cookieHeader = await getCookieHeader();
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_HYPER_API_ENDPOINT}/task/topic/${id}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          cookie: cookieHeader,
        },
      },
    );
    const data: Response<Task[]> = await response.json();
    return data;
  };

  const [topic, subject, tasks] = await Promise.all([
    loadTopicById(topic_id),
    loadSubjectById(id),
    loadTasks(topic_id),
  ]);

  return (
    <TopicFrame>
      <SubjectProvider initialData={subject.data}>
        <div className="flex items-center justify-between mb-4">
          <Link href={`/workspace/subjects/${id}`}>
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </Link>
        </div>
        <TopicHeader data={topic.data} />
        <TopicTabs
          components={[
            {
              title: (
                <span className="flex items-center gap-2">
                  <Info />
                  Details
                </span>
              ),
              content: (
                <TopicNoteEditor
                  id={topic_id}
                  initialContent={topic.data.content!}
                />
              ),
            },
            {
              title: (
                <span className="flex items-center gap-2">
                  <CircleCheck />
                  Task
                </span>
              ),
              content: (
                <TaskTable
                  tasks={tasks.data}
                  topicId={topic_id}
                  subjectId={id}
                />
              ),
            },
          ]}
        />
      </SubjectProvider>
    </TopicFrame>
  );
}
