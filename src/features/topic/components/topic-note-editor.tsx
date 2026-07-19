"use client";

import { Editor } from "@/components/common/block-note/editor-dynamic";
import { patchTopicNoteAction } from "@/features/task/api/patch-topic-note-action";
import { Block } from "@blocknote/core";
import { useTransition } from "react";
import { toast } from "sonner";
import { getTopicNoteAction } from "../api/get-topic-note-action";

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
        toast.error("Gagal menyimpan catatan ke server");
      }
    });
  };

  const handleFetchLatest = async () => {
    const result = await getTopicNoteAction(id);
    console.log(result);
    return result || null;
  };

  return (
    <div>
      <Editor
        isPending={isPending}
        initialContent={initialContent}
        documentId={id}
        onFetchLatest={handleFetchLatest}
        onSave={async (data) => {
          await handleSave(data);
        }}
      />
    </div>
  );
}
