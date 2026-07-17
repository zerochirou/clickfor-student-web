import { CreateTaskForm, FrameTask } from "@/features/workspace";

export default async function CreateTaskPage({
  params,
}: {
  params: Promise<{ id: string; topic_id: string }>;
}) {
  const { id, topic_id } = await params;
  return (
    <FrameTask>
      <CreateTaskForm id={id} topic_id={topic_id} />
    </FrameTask>
  );
}
