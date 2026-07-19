"use client";

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

// --- Import Shadcn UI Components ---
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { CircleCheck, GitMerge, HardDrive, HardDriveUpload, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EditorProps {
  onSave?: (data: Block[]) => Promise<void>;
  onFetchLatest?: () => Promise<string | null>; // API ambil data server
  initialContent?: string;
  documentId: string;
  isPending?: boolean;
}

export default function Editor({
  onSave,
  onFetchLatest,
  initialContent,
  documentId,
  isPending,
}: EditorProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [hasUnsavedUI, setHasUnsavedUI] = useState(false);

  // State Konflik
  const [conflictData, setConflictData] = useState<string | null>(null);

  const hasUnsavedChanges = useRef(false);
  const storageKey = `editor_draft_${documentId}`;

  const editor = useCreateBlockNote({
    dictionary: {
      ...en,
      placeholders: {
        ...en.placeholders,
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
    if (editor) editor.focus();
  }, [editor]);

  const { resolvedTheme } = useTheme();
  const currentTheme =
    resolvedTheme === "light" || resolvedTheme === "dark"
      ? resolvedTheme
      : "dark";

  // --- 1. Fungsi Cek Perbedaan ---
  const checkServerDifference = async () => {
    if (!onFetchLatest) return false;
    try {
      const rawLatest = await onFetchLatest();
      const serverString =
        typeof rawLatest === "string"
          ? rawLatest
          : JSON.stringify(rawLatest || []);
      const localString = JSON.stringify(editor.document);

      const normServer = JSON.stringify(
        JSON.parse(serverString === "null" ? "[]" : serverString),
      );
      const normLocal = JSON.stringify(
        JSON.parse(localString === "null" ? "[]" : localString),
      );

      if (normServer !== normLocal) {
        setConflictData(serverString); // Set data konflik
        return true;
      }
      return false;
    } catch (error) {
      console.error("Gagal mengecek server:", error);
      return false;
    }
  };

  // --- 2. Background Routine (Cek & Auto-Save tiap 10 detik) ---
  useEffect(() => {
    const performRoutine = async () => {
      // Abaikan jika sedang offline atau sudah dalam mode konflik
      if (!navigator.onLine || conflictData) return;

      const hasDiff = await checkServerDifference();

      // Jika tidak ada perbedaan DAN ada editan lokal, langsung simpan
      if (!hasDiff && hasUnsavedChanges.current) {
        setIsSyncing(true);
        try {
          if (onSave) {
            await onSave(editor.document);
          }
          hasUnsavedChanges.current = false;
          setHasUnsavedUI(false);
          setLastSynced(new Date());
        } catch (error) {
          console.error("Gagal auto-save:", error);
        } finally {
          setIsSyncing(false);
        }
      }
    };

    const syncInterval = setInterval(performRoutine, 5000);

    const handleBeforeUnload = () => {
      if (hasUnsavedChanges.current && !conflictData && onSave) {
        onSave(editor.document);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [conflictData]); // Hanya re-run effect jika status konflik berubah

  // --- 3. Handler Dialog: Ganti dengan Versi Server ---
  const handleUseServerVersion = () => {
    if (!conflictData) return;
    try {
      const parsedServerData = JSON.parse(conflictData);
      editor.replaceBlocks(editor.document, parsedServerData);

      localStorage.setItem(storageKey, conflictData);
      hasUnsavedChanges.current = false;
      setHasUnsavedUI(false);
      setConflictData(null);
    } catch (error) {
      console.error("Gagal parse data server", error);
    }
  };

  // --- 4. Handler Dialog: Paksa Simpan Versi Saya ---
  const handleForceOverwrite = async () => {
    if (!conflictData) return;
    setIsSyncing(true);
    try {
      // By-pass cek konflik, langsung timpa server
      if (onSave) {
        await onSave(editor.document);
      }
      localStorage.setItem(storageKey, JSON.stringify(editor.document));
      hasUnsavedChanges.current = false;
      setHasUnsavedUI(false);
      setLastSynced(new Date());
      setConflictData(null); // Tutup peringatan
    } catch (error) {
      console.error("Gagal memaksa simpan ke server", error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="relative">
      {/* --- HEADER: TOMBOL SHADCN & STATUS --- */}
      <div className="flex items-center justify-between text-xs text-muted-foreground font-medium mx-auto max-w-3xl mb-4">
        {/* Tombol hanya aktif (bisa diklik) ketika ada perbedaan */}
        <AlertDialog>
          {conflictData && (
            <AlertDialogTrigger
              render={
                <Button
                  variant={conflictData ? "destructive" : "outline"}
                  disabled={!conflictData}
                  size="sm"
                  className={conflictData ? "animate-pulse" : "opacity-50"}
                >
                  <GitMerge />
                  resolve the conflict
                </Button>
              }
            />
          )}

          <AlertDialogContent className={"w-auto"}>
            <AlertDialogHeader>
              <AlertDialogTitle>Perbedaan Data Ditemukan</AlertDialogTitle>
              <AlertDialogDescription>
                Data yang ada di layar Anda saat ini <b>berbeda</b> dengan data
                terbaru di server (kemungkinan telah diedit di perangkat lain).
                <br />
                <br />
                Silakan pilih versi mana yang ingin dipertahankan. Tindakan ini
                tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={handleUseServerVersion}
                variant={"default"}
              >
                <HardDrive /> Use Server Version
              </AlertDialogCancel>
              {/* Tombol Action diberi style destructive bawaan shadcn untuk peringatan ekstra */}
              <AlertDialogAction
                onClick={handleForceOverwrite}
                variant={"outline"}
              >
                <HardDriveUpload /> Force Save My Version
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Status Sinkronisasi Teks */}
        <div className="flex items-center">
          {conflictData ? (
            <Badge variant={'destructive'} className="animate-pulse flex items-center gap-1 text-destructive">
              <Spinner /> Waiting for the decision 
            </Badge>
          ) : isPending || isSyncing ? (
            <Badge className="animate-pulse flex items-center gap-1">
              <Spinner /> Synchronizing
            </Badge>
          ) : hasUnsavedUI ? (
            <Badge variant={"secondary"} className="animate-pulse">
              <Pencil />There are local changes
            </Badge>
          ) : lastSynced ? (
            <Badge variant={"secondary"}>
              <HardDriveUpload />
              Saved on {format(lastSynced, "HH:mm")}
            </Badge>
          ) : (
            <Badge variant={"outline"}><CircleCheck />There has been no change</Badge>
          )}
        </div>
      </div>

      {/* --- EDITOR VIEW --- */}
      <BlockNoteView
        theme={currentTheme}
        slashMenu={false}
        editor={editor}
        onChange={() => {
          if (conflictData) return; // Nonaktifkan auto-save lokal kalau sedang konflik

          const currentData = editor.document;
          localStorage.setItem(storageKey, JSON.stringify(currentData));
          hasUnsavedChanges.current = true;

          if (!hasUnsavedUI) {
            setHasUnsavedUI(true);
          }
        }}
      >
        <SuggestionMenuController
          triggerCharacter={"/"}
          getItems={async (query) =>
            filterSuggestionItems(getDefaultReactSlashMenuItems(editor), query)
          }
          suggestionMenuComponent={CustomSlashMenu}
        />
      </BlockNoteView>
    </div>
  );
}
