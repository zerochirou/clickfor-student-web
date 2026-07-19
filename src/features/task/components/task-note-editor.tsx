"use client";

import { Editor } from "@/components/common/block-note/editor-dynamic";
import { Block } from "@blocknote/core";
import { useTransition } from "react";
import { toast } from "sonner";
import { getTaskNoteAction } from "../api/get-task-note-action";
import { patchTaskNoteAction } from "../api/patch-task-note-action";

export function TaskNoteEditor({
  id,
  initialContent,
}: {
  id: string;
  initialContent: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleSave = async (content: Block[]) => {
    startTransition(async () => {
      const { success } = await patchTaskNoteAction(id, content);
      if (!success) {
        toast.error("Gagal menyimpan catatan ke server");
      }
    });
  };

  const handleFetchLatest = async () => {
    const result = await getTaskNoteAction(id);
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
