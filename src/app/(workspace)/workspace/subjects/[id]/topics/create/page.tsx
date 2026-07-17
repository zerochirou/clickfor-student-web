import { CreateTopicForm, FrameTopic } from "@/features/workspace";

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
