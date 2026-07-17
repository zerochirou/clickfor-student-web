import { CreateTopicForm } from "@/features/topic/components/create-form";
import { FrameTopic } from "@/features/topic/components/frame-topic";

export default async function CreateTopicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <FrameTopic>
      <CreateTopicForm id={id} />
    </FrameTopic>
  );
}
