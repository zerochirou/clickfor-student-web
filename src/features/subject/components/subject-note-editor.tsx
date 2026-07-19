"use client";

import { Editor } from "@/components/common/block-note/editor-dynamic";
import { patchSubjectNoteAction } from "../api/patch-subject-note-action";
// Pastikan Anda membuat action ini di backend untuk mengambil string catatan terbaru
import { getSubjectNoteAction } from "../api/get-subject-note-action"; 
import { Block } from "@blocknote/core";
import { useTransition } from "react";
import { toast } from "sonner";

export function SubjectNoteEditor({
  id,
  initialContent,
}: {
  id: string;
  initialContent: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleSave = async (content: Block[]) => {
    startTransition(async () => {
      const { success } = await patchSubjectNoteAction(id, content);
      if (!success) {
        toast.error("Gagal menyimpan catatan ke server");
      }
    });
  };

  const handleFetchLatest = async () => {
    const result = await getSubjectNoteAction(id);
    console.log(result);
    return result || null; 
  };

  return (
    <div className="mx-auto max-w-3xl w-full">
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