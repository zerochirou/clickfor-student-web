"use client"

import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import {
  getDefaultReactSlashMenuItems,
  SuggestionMenuController,
  useCreateBlockNote,
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { format } from "date-fns";
import { Block, filterSuggestionItems } from "@blocknote/core";
import { en } from "@blocknote/core/locales";
import { CustomSlashMenu } from "./editor-menu-custom";

interface EditorProps {
  onSave?: (data: Block[]) => Promise<void>;
  initialContent?: string;
  documentId: string;
  isPending?: boolean;
}

export default function Editor({
  onSave,
  initialContent,
  documentId,
  isPending,
}: EditorProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [hasUnsavedUI, setHasUnsavedUI] = useState(false);

  const hasUnsavedChanges = useRef(false);
  const storageKey = `editor_draft_${documentId}`;

  const editor = useCreateBlockNote({
    dictionary: {
      ...en, // Gunakan bahasa bawaan (Inggris) sebagai kerangka dasar
      placeholders: {
        ...en.placeholders, // 1. Mengganti teks "Type '/' for commands"

        default: "Ketik '/' untuk menu, atau paste link",
      },
    },
    tables: {
      splitCells: true,
      cellBackgroundColor: true,
      cellTextColor: true,
      headers: true,
    },
    initialContent:
      typeof window !== "undefined"
        ? JSON.parse(
            localStorage.getItem(storageKey) || initialContent || "null",
          )
        : undefined,
  });
  useEffect(() => {
    if (editor) {
      editor.focus();
    }
  }, [editor]);
  const { resolvedTheme } = useTheme();
  const currentTheme =
    resolvedTheme === "light" || resolvedTheme === "dark"
      ? resolvedTheme
      : "dark";

  const syncToServer = async () => {
    if (!hasUnsavedChanges.current) return; // Jangan kirim kalau tidak ada perubahan

    setIsSyncing(true);
    try {
      const dataToSave = editor.document;

      if (onSave) {
        await onSave(dataToSave);
      } else {
        console.warn("No onSave handler provided");
      }

      hasUnsavedChanges.current = false; // Reset tanda
      setLastSynced(new Date()); // Opsional: Hapus draft lokal jika kamu ingin membersihkan memori
      // localStorage.removeItem(storageKey);

      hasUnsavedChanges.current = false; // Reset ref untuk background
      setHasUnsavedUI(false); // Reset state untuk hilangkan teks di UI
      setLastSynced(new Date());
    } catch (error) {
      console.error("Gagal sync ke server, data tetap aman di lokal", error);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const syncInterval = setInterval(() => {
      // Cek apakah browser sedang terhubung ke internet
      if (navigator.onLine) {
        syncToServer();
      }
    }, 10000); // 10000 ms = 10 detik
    // Sync terakhir saat user menutup tab/pindah halaman

    const handleBeforeUnload = () => {
      if (hasUnsavedChanges.current) {
        syncToServer();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }); // }, []);
  return (
    <>
           {" "}
      <div className="flex justify-end text-xs text-muted-foreground font-medium mx-auto max-w-3xl">
               {" "}
        {isPending || isSyncing ? (
          <span className="animate-pulse flex items-center gap-1">
                        Synchronize <Spinner />         {" "}
          </span>
        ) : hasUnsavedUI ? (
          <span className="animate-pulse">Ada perubahan lokal</span>
        ) : lastSynced ? (
          <span className="">Saved on {format(lastSynced, "HH:mm")}</span>
        ) : (
          <span>Belum ada perubahan</span>
        )}
             {" "}
      </div>
           {" "}
      <BlockNoteView
        theme={currentTheme} // sideMenu={false}
        slashMenu={false}
        editor={editor}
        onChange={() => {
          const currentData = editor.document;
          localStorage.setItem(storageKey, JSON.stringify(currentData));
          hasUnsavedChanges.current = true;

          if (!hasUnsavedUI) {
            setHasUnsavedUI(true);
          }
        }}
      >
               {" "}
        <SuggestionMenuController
          triggerCharacter={"/"} // Fungsi ini menentukan item apa saja yang muncul (opsional jika ingin default)
          getItems={async (query) =>
            filterSuggestionItems(getDefaultReactSlashMenuItems(editor), query)
          } // Masukkan UI custom shadcn di sini
          suggestionMenuComponent={CustomSlashMenu}
        />
             {" "}
      </BlockNoteView>
         {" "}
    </>
  );
}
