"use client";

import { Editor } from "@/components/common/block-note/editor-dynamic";
import { patchTopicNoteAction } from "@/features/task/api/patch-topic-note-action";
import { Block } from "@blocknote/core";
import { useTransition } from "react";
import { toast } from "sonner";

export function TopicNoteEditor({
  id,
  initialContent,
}: {
  id: string;
  initialContent: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleSave = async (content: Block[]) => {
    startTransition(async () => {
      const { success } = await patchTopicNoteAction(id, content);
      if (!success) {
        toast.error("Gagal menyimpan catatan ke server")
      }
    });
  };
  return (
    <div>
      
    <Editor
      isPending={isPending}
      initialContent={initialContent}
      documentId={id}
      onSave={async (data) => {
        await handleSave(data);
      }}
    />
    </div>
  );
}
